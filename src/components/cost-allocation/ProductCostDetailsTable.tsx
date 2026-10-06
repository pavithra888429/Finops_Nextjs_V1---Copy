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
    const clean = id.toLowerCase();
    if (clean === 'unallocated' || clean === 'untagged') return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
    if (clean.includes('agent')) return <Layers className="h-3.5 w-3.5 text-purple-600" />;
    if (clean.includes('db') || clean.includes('sql') || clean.includes('mongo')) return <Monitor className="h-3.5 w-3.5 text-blue-600" />;
    return <Box className="h-3.5 w-3.5 text-slate-600" />;
  };

  const getRowCost = (row: ProductAllocationRecord) => {
    if (selectedProvider === 'gemini') return row.gemini;
    if (selectedProvider === 'openrouter') return row.openrouter;
    if (selectedProvider === 'aws') return row.aws;
    return row.total;
  };

  const grandTotal = filteredRows.reduce((sum, r) => sum + getRowCost(r), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Product Cost Details</h3>
          <p className="mt-0.5 text-xs text-slate-500">Detailed product cost breakdown and key drivers</p>
        </div>
        {(selectedProduct !== 'all' || selectedProvider !== 'all') && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-sans">
            Filtered ({filteredRows.length} {filteredRows.length === 1 ? 'product' : 'products'})
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5">Product</th>
              <th className="py-3 px-4">Total cost</th>
              <th className="py-3 px-4">Daily average</th>
              <th className="py-3 px-4">Top provider</th>
              <th className="py-3 px-4">Top model or AWS service</th>
              <th className="py-3 px-4 text-right">Period change</th>
              <th className="py-3 px-5 text-right">Cost share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
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
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Product Name (Clickable to detail analytics) */}
                    <td className="py-3 px-5 text-slate-900">
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
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 border border-slate-200">
                          {getProductIcon(row.id)}
                        </div>
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-purple-600 group-hover:underline transition-colors">
                          {row.name}
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>

                    {/* Total Cost */}
                    <td className="py-3 px-4 text-xs font-bold text-slate-900 tabular-nums font-sans">
                      {formatCurrency(cost)}
                    </td>

                    {/* Daily Average */}
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums font-sans font-medium">
                      {formatCurrency(cost / 30)}
                    </td>

                    {/* Top Provider Badge */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                        <span className="text-amber-600 font-bold text-[9px] tracking-tight">aws</span>
                        <span>{row.topProvider}</span>
                      </div>
                    </td>

                    {/* Top Model or AWS Service */}
                    <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                      {row.topService}
                    </td>

                    {/* Period Change */}
                    <td className="py-3 px-4 text-right text-xs text-emerald-600 font-semibold font-sans">
                      <span className="inline-flex items-center gap-0.5 justify-end">
                        <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                        <span>+{row.change}%</span>
                      </span>
                    </td>

                    {/* Cost Share */}
                    <td className="py-3 px-5 text-right text-xs text-slate-500 tabular-nums font-medium font-sans">
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
