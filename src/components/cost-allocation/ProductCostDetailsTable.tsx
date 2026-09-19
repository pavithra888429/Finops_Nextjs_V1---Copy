import React from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Box, Monitor, AlertTriangle, ArrowUp, ArrowUpRight } from 'lucide-react';
import { ProductAllocationRecord } from './costAllocationData';

interface ProductCostDetailsTableProps {
  products: ProductAllocationRecord[];
  selectedProduct: string;
  selectedProvider: string;
  searchQuery: string;
  onSelectProductProvider?: (productId: string, providerId: string) => void;
}

export function ProductCostDetailsTable({
  products,
  selectedProduct,
  selectedProvider,
  searchQuery,
  onSelectProductProvider,
}: ProductCostDetailsTableProps) {
  const router = useRouter();
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const filteredRows = products.filter((row) => {
    if (selectedProduct !== 'all' && row.id !== selectedProduct) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = row.name.toLowerCase().includes(q);
      const matchService = row.topService.toLowerCase().includes(q);
      const matchProvider = row.topProvider.toLowerCase().includes(q);
      if (!matchName && !matchService && !matchProvider) return false;
    }
    return true;
  });

  const getProductIcon = (id: string) => {
    if (id === 'dragon') return <Layers className="h-3.5 w-3.5 text-white" />;
    if (id === 'okrian') return <Box className="h-3.5 w-3.5 text-white" />;
    if (id === 'workbench') return <Monitor className="h-3.5 w-3.5 text-white" />;
    return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
  };

  const getRowCost = (row: ProductAllocationRecord) => {
    if (selectedProvider === 'gemini') return row.gemini;
    if (selectedProvider === 'openrouter') return row.openrouter;
    if (selectedProvider === 'aws') return row.aws;
    return row.total;
  };

  const grandTotal = filteredRows.reduce((sum, r) => sum + getRowCost(r), 0);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">Product Cost Details</h3>
          <p className="mt-0.5 text-xs text-slate-400">Detailed product cost breakdown and key drivers</p>
        </div>
        {(selectedProduct !== 'all' || selectedProvider !== 'all') && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Filtered ({filteredRows.length} {filteredRows.length === 1 ? 'product' : 'products'})
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/40 text-[11px] font-medium text-slate-400">
              <th className="py-3 px-5 font-normal">Product</th>
              <th className="py-3 px-4 font-normal">Total cost</th>
              <th className="py-3 px-4 font-normal">Daily average</th>
              <th className="py-3 px-4 font-normal">Top provider</th>
              <th className="py-3 px-4 font-normal">Top model or AWS service</th>
              <th className="py-3 px-4 text-right font-normal">Period change</th>
              <th className="py-3 px-5 text-right font-normal">Cost share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40 text-slate-300">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No records match the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const cost = getRowCost(row);
                const share = grandTotal > 0 ? ((cost / grandTotal) * 100).toFixed(1) : row.share;
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Product Name (Clickable to detail analytics) */}
                    <td className="py-3 px-5 text-white">
                      <button
                        onClick={() => {
                          const targetProv = selectedProvider !== 'all' ? selectedProvider : 'aws';
                          if (onSelectProductProvider) {
                            onSelectProductProvider(row.id, targetProv);
                          } else {
                            router.push(`/cost-allocation/detail?product=${row.id}&provider=${targetProv}`);
                          }
                        }}
                        className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <div className={`flex h-5 w-5 items-center justify-center rounded ${row.iconBg}`}>
                          {getProductIcon(row.id)}
                        </div>
                        <span className="text-xs font-medium group-hover:text-blue-400 group-hover:underline transition-colors">
                          {row.name}
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>

                    {/* Total Cost */}
                    <td className="py-3 px-4 text-xs font-normal text-slate-200 tabular-nums">
                      {formatCurrency(cost)}
                    </td>

                    {/* Daily Average */}
                    <td className="py-3 px-4 text-xs text-slate-300 tabular-nums">
                      {formatCurrency(cost / 30)}
                    </td>

                    {/* Top Provider Badge */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#101726] border border-dark-border text-xs">
                        <span className="text-amber-500 font-bold text-[9px] tracking-tight">aws</span>
                        <span className="text-slate-200 font-medium">{row.topProvider}</span>
                      </div>
                    </td>

                    {/* Top Model or AWS Service */}
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {row.topService}
                    </td>

                    {/* Period Change */}
                    <td className="py-3 px-4 text-right text-xs text-emerald-400 font-medium">
                      <span className="inline-flex items-center gap-0.5 justify-end">
                        <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                        <span>+{row.change}%</span>
                      </span>
                    </td>

                    {/* Cost Share */}
                    <td className="py-3 px-5 text-right text-xs text-slate-300 tabular-nums font-normal">
                      {share}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
