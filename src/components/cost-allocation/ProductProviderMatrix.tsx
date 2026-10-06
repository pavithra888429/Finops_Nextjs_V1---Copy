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
    const clean = id.toLowerCase();
    if (clean === 'unallocated' || clean === 'untagged') return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
    if (clean.includes('agent')) return <Layers className="h-3.5 w-3.5 text-purple-600" />;
    if (clean.includes('db') || clean.includes('sql') || clean.includes('mongo')) return <Monitor className="h-3.5 w-3.5 text-blue-600" />;
    return <Box className="h-3.5 w-3.5 text-slate-600" />;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Product × Provider Cost</h3>
          <p className="mt-0.5 text-xs text-slate-500">Cost breakdown by product and provider (USD)</p>
        </div>
        {(selectedProduct !== 'all' || selectedProvider !== 'all') && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-sans">
            Filtered ({filteredRows.length} {filteredRows.length === 1 ? 'product' : 'products'})
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5">Product</th>

              {/* Gemini Column Header */}
              <th
                className={`py-3 px-4 transition-colors ${
                  selectedProvider === 'gemini' ? 'bg-purple-50 text-purple-900 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-purple-600 text-xs">✦</span>
                  <span>Gemini</span>
                </div>
              </th>

              {/* OpenRouter Column Header */}
              <th
                className={`py-3 px-4 transition-colors ${
                  selectedProvider === 'openrouter' ? 'bg-purple-50 text-purple-900 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="font-sans text-blue-600 text-xs font-bold">&lt;</span>
                  <span>OpenRouter</span>
                </div>
              </th>

              {/* AWS Column Header */}
              <th
                onClick={() => {
                  if (onSelectProductProvider) {
                    onSelectProductProvider('all', 'aws');
                  } else {
                    router.push('/cost-allocation?provider=aws');
                  }
                }}
                className={`py-3 px-4 transition-colors cursor-pointer group hover:bg-slate-100 ${
                  selectedProvider === 'aws' ? 'bg-purple-50 text-purple-900 font-bold' : ''
                }`}
                title="Click to view AWS Cost Explorer dashboard"
              >
                <div className="flex items-center gap-1.5 text-slate-700 group-hover:text-purple-600 transition-colors">
                  <span className="text-amber-600 font-bold text-[9px] tracking-tight">aws</span>
                  <span>AWS</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>

              <th className="py-3 px-4 text-right">Total cost</th>
              <th className="py-3 px-4 text-right">Share of cost</th>
              <th className="py-3 px-5 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No products match the selected filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Product Name (Clickable to detail page) */}
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

                  {/* Gemini Column */}
                  <td
                    className={`py-3 px-4 tabular-nums font-sans ${
                      selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : ''
                    } ${selectedProvider === 'gemini' ? 'bg-purple-50/40' : ''}`}
                  >
                    {row.gemini > 0 ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'gemini');
                        }}
                        className="inline-block px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-xs hover:bg-purple-100 border border-purple-200 cursor-pointer transition-all"
                      >
                        {formatCurrency(row.gemini)}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">{formatCurrency(row.gemini)}</span>
                    )}
                  </td>

                  {/* OpenRouter Column */}
                  <td
                    className={`py-3 px-4 text-xs tabular-nums font-sans ${
                      selectedProvider !== 'all' && selectedProvider !== 'openrouter'
                        ? 'opacity-30'
                        : 'text-slate-700'
                    } ${selectedProvider === 'openrouter' ? 'bg-purple-50/40' : ''}`}
                  >
                    {row.openrouter > 0 ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'openrouter');
                        }}
                        className="hover:text-purple-600 hover:underline cursor-pointer font-medium"
                      >
                        {formatCurrency(row.openrouter)}
                      </button>
                    ) : (
                      <span className="text-slate-400">{formatCurrency(row.openrouter)}</span>
                    )}
                  </td>

                  {/* AWS Column */}
                  <td
                    className={`py-3 px-4 tabular-nums font-sans ${
                      selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : ''
                    } ${selectedProvider === 'aws' ? 'bg-purple-50/40' : ''}`}
                  >
                    {row.id === 'unallocated' ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'aws');
                        }}
                        className="inline-block px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-xs hover:bg-amber-100 border border-amber-200 cursor-pointer transition-all"
                      >
                        {formatCurrency(row.aws)}
                      </button>
                    ) : selectedProvider === 'aws' ? (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'aws');
                        }}
                        className="inline-block px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-xs hover:bg-purple-100 cursor-pointer transition-all"
                      >
                        {formatCurrency(row.aws)}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onSelectProductProvider) onSelectProductProvider(row.id, 'aws');
                        }}
                        className="text-xs text-slate-700 hover:text-purple-600 hover:underline cursor-pointer font-medium"
                      >
                        {formatCurrency(row.aws)}
                      </button>
                    )}
                  </td>

                  {/* Total Cost */}
                  <td className="py-3 px-4 text-right text-xs font-semibold text-slate-900 tabular-nums font-sans">
                    {formatCurrency(calculateRowTotal(row))}
                  </td>

                  {/* Share of organization cost */}
                  <td className="py-3 px-4 text-right text-xs text-slate-500 tabular-nums font-sans">
                    {grandTotal > 0 ? `${((calculateRowTotal(row) / grandTotal) * 100).toFixed(1)}%` : `${row.share}%`}
                  </td>

                  {/* Change */}
                  <td className="py-3 px-5 text-right text-xs text-emerald-600 font-medium font-sans">
                    <span className="inline-flex items-center gap-0.5 justify-end">
                      <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                      <span>+{row.change}%</span>
                    </span>
                  </td>
                </tr>
              ))
            )}

            {/* Total Row */}
            <tr className="bg-slate-50/90 border-t-2 border-slate-200 font-bold text-slate-900">
              <td className="py-3.5 px-5 text-xs font-bold">Total</td>
              <td
                className={`py-3.5 px-4 text-xs font-bold tabular-nums font-sans ${
                  selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : 'text-slate-800'
                }`}
              >
                {formatCurrency(totalGemini)}
              </td>
              <td
                className={`py-3.5 px-4 text-xs font-bold tabular-nums font-sans ${
                  selectedProvider !== 'all' && selectedProvider !== 'openrouter' ? 'opacity-30' : 'text-slate-800'
                }`}
              >
                {formatCurrency(totalOpenrouter)}
              </td>
              <td
                onClick={() => {
                  if (onSelectProductProvider) {
                    onSelectProductProvider('all', 'aws');
                  } else {
                    router.push('/cost-allocation?provider=aws');
                  }
                }}
                className={`py-3.5 px-4 text-xs font-bold tabular-nums font-sans cursor-pointer hover:text-purple-600 transition-colors ${
                  selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : 'text-slate-800'
                }`}
                title="Click to view AWS Cost Explorer dashboard"
              >
                {formatCurrency(totalAws)}
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-bold text-slate-900 tabular-nums font-sans">
                {formatCurrency(grandTotal)}
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-bold text-slate-600 tabular-nums font-sans">
                100%
              </td>
              <td className="py-3.5 px-5 text-right text-xs text-emerald-600 font-semibold font-sans">
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
