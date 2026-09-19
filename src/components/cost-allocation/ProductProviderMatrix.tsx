import React from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Box, Monitor, AlertTriangle, ArrowUp, ArrowUpRight } from 'lucide-react';
import { ProductAllocationRecord } from './costAllocationData';

interface ProductProviderMatrixProps {
  products: ProductAllocationRecord[];
  selectedProduct: string;
  selectedProvider: string;
  searchQuery: string;
  onSelectProductProvider?: (productId: string, providerId: string) => void;
}

export function ProductProviderMatrix({
  products,
  selectedProduct,
  selectedProvider,
  searchQuery,
  onSelectProductProvider,
}: ProductProviderMatrixProps) {
  const router = useRouter();
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Filter rows based on selectedProduct and searchQuery
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

  // Calculate dynamic totals
  const totalGemini = filteredRows.reduce((sum, r) => sum + r.gemini, 0);
  const totalOpenrouter = filteredRows.reduce((sum, r) => sum + r.openrouter, 0);
  const totalAws = filteredRows.reduce((sum, r) => sum + r.aws, 0);

  const calculateRowTotal = (r: ProductAllocationRecord) => {
    if (selectedProvider === 'gemini') return r.gemini;
    if (selectedProvider === 'openrouter') return r.openrouter;
    if (selectedProvider === 'aws') return r.aws;
    return r.total;
  };

  const grandTotal = filteredRows.reduce((sum, r) => sum + calculateRowTotal(r), 0);

  const getProductIcon = (id: string) => {
    if (id === 'dragon') return <Layers className="h-3.5 w-3.5 text-white" />;
    if (id === 'okrian') return <Box className="h-3.5 w-3.5 text-white" />;
    if (id === 'workbench') return <Monitor className="h-3.5 w-3.5 text-white" />;
    return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
  };

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">Product × Provider Cost</h3>
          <p className="mt-0.5 text-xs text-slate-400">Cost breakdown by product and provider (USD)</p>
        </div>
        {(selectedProduct !== 'all' || selectedProvider !== 'all') && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Filtered ({filteredRows.length} {filteredRows.length === 1 ? 'product' : 'products'})
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/40 text-[11px] font-medium text-slate-400">
              <th className="py-3 px-5 font-normal">Product</th>

              {/* Gemini Column Header */}
              <th
                className={`py-3 px-4 font-normal transition-colors ${
                  selectedProvider === 'gemini' ? 'bg-blue-600/15 text-blue-400 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span className="text-blue-400 text-xs">✦</span>
                  <span>Gemini</span>
                </div>
              </th>

              {/* OpenRouter Column Header */}
              <th
                className={`py-3 px-4 font-normal transition-colors ${
                  selectedProvider === 'openrouter' ? 'bg-purple-600/15 text-purple-400 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span className="font-mono text-purple-400 text-xs">&lt;</span>
                  <span>OpenRouter</span>
                </div>
              </th>

              {/* AWS Column Header */}
              <th
                className={`py-3 px-4 font-normal transition-colors ${
                  selectedProvider === 'aws' ? 'bg-amber-600/15 text-amber-400 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span className="text-amber-500 font-bold text-[9px] tracking-tight">aws</span>
                  <span>AWS</span>
                </div>
              </th>

              <th className="py-3 px-4 text-right font-normal">Total cost</th>
              <th className="py-3 px-4 text-right font-normal">Share of organization cost</th>
              <th className="py-3 px-5 text-right font-normal">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40 text-slate-300 font-sans">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No products match the selected filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Product Name (Clickable to detail page) */}
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

                  {/* Gemini Column */}
                  <td
                    className={`py-3 px-4 tabular-nums ${
                      selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : ''
                    } ${selectedProvider === 'gemini' ? 'bg-blue-500/5' : ''}`}
                  >
                    {row.gemini > 0 ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'gemini');
                        }}
                        className="inline-block px-2.5 py-0.5 rounded bg-[#0b3b24] text-[#4ade80] font-medium text-xs hover:ring-1 hover:ring-emerald-400/50 cursor-pointer transition-all"
                      >
                        {formatCurrency(row.gemini)}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">{formatCurrency(row.gemini)}</span>
                    )}
                  </td>

                  {/* OpenRouter Column */}
                  <td
                    className={`py-3 px-4 text-xs tabular-nums ${
                      selectedProvider !== 'all' && selectedProvider !== 'openrouter'
                        ? 'opacity-30'
                        : 'text-slate-300'
                    } ${selectedProvider === 'openrouter' ? 'bg-purple-500/5' : ''}`}
                  >
                    {row.openrouter > 0 ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'openrouter');
                        }}
                        className="hover:text-purple-300 hover:underline cursor-pointer"
                      >
                        {formatCurrency(row.openrouter)}
                      </button>
                    ) : (
                      <span>{formatCurrency(row.openrouter)}</span>
                    )}
                  </td>

                  {/* AWS Column */}
                  <td
                    className={`py-3 px-4 tabular-nums ${
                      selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : ''
                    } ${selectedProvider === 'aws' ? 'bg-amber-500/5' : ''}`}
                  >
                    {row.id === 'unallocated' ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'aws');
                        }}
                        className="inline-block px-2.5 py-0.5 rounded bg-[#452b0f] text-[#fbbf24] font-medium text-xs hover:ring-1 hover:ring-amber-400/50 cursor-pointer transition-all"
                      >
                        {formatCurrency(row.aws)}
                      </button>
                    ) : selectedProvider === 'aws' ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'aws');
                        }}
                        className="inline-block px-2 py-0.5 rounded bg-[#101928] border border-amber-500/30 text-amber-300 font-semibold text-xs hover:border-amber-400 cursor-pointer transition-all"
                      >
                        {formatCurrency(row.aws)}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'aws');
                        }}
                        className="text-xs text-slate-300 hover:text-amber-300 hover:underline cursor-pointer"
                      >
                        {formatCurrency(row.aws)}
                      </button>
                    )}
                  </td>

                  {/* Total Cost */}
                  <td className="py-3 px-4 text-right text-xs font-normal text-slate-200 tabular-nums">
                    {formatCurrency(calculateRowTotal(row))}
                  </td>

                  {/* Share of organization cost */}
                  <td className="py-3 px-4 text-right text-xs text-slate-300 tabular-nums">
                    {grandTotal > 0 ? `${((calculateRowTotal(row) / grandTotal) * 100).toFixed(1)}%` : `${row.share}%`}
                  </td>

                  {/* Change */}
                  <td className="py-3 px-5 text-right text-xs text-emerald-400 font-medium">
                    <span className="inline-flex items-center gap-0.5 justify-end">
                      <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                      <span>+{row.change}%</span>
                    </span>
                  </td>
                </tr>
              ))
            )}

            {/* Total Row */}
            <tr className="bg-dark-surface/50 border-t border-dark-border font-semibold text-white">
              <td className="py-3.5 px-5 text-xs font-bold">Total</td>
              <td
                className={`py-3.5 px-4 text-xs font-semibold tabular-nums ${
                  selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : 'text-slate-200'
                }`}
              >
                {formatCurrency(totalGemini)}
              </td>
              <td
                className={`py-3.5 px-4 text-xs font-semibold tabular-nums ${
                  selectedProvider !== 'all' && selectedProvider !== 'openrouter' ? 'opacity-30' : 'text-slate-200'
                }`}
              >
                {formatCurrency(totalOpenrouter)}
              </td>
              <td
                className={`py-3.5 px-4 text-xs font-semibold tabular-nums ${
                  selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : 'text-slate-200'
                }`}
              >
                {formatCurrency(totalAws)}
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-bold text-white tabular-nums">
                {formatCurrency(grandTotal)}
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-semibold text-slate-200 tabular-nums">
                100%
              </td>
              <td className="py-3.5 px-5 text-right text-xs text-emerald-400 font-semibold">
                <span className="inline-flex items-center gap-0.5 justify-end">
                  <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                  <span>+12.1%</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
