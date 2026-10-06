import React from 'react';
import { BASE_DISTRIBUTION, ProductAllocationRecord, ProviderDistributionItem } from './costAllocationData';

interface ProviderDistributionChartProps {
  selectedProduct: string;
  selectedProvider: string;
  products?: ProductAllocationRecord[];
}

export function ProviderDistributionChart({
  selectedProduct,
  selectedProvider,
  products,
}: ProviderDistributionChartProps) {
  // Derive distribution dynamically from live products if available
  const distributionList: ProviderDistributionItem[] = React.useMemo(() => {
    if (products && products.length > 0) {
      return products
        .filter((p) => p.id !== 'unallocated' && p.id !== 'untagged' && p.total > 0)
        .slice(0, 6)
        .map((p) => {
          const tot = Math.max(0.01, p.total);
          let gPct = Math.round((p.gemini / tot) * 100);
          let oPct = Math.round((p.openrouter / tot) * 100);
          let aPct = 100 - gPct - oPct;
          if (aPct < 0) aPct = 0;
          return {
            id: p.id,
            product: p.name,
            gemini: gPct,
            openrouter: oPct,
            aws: aPct,
          };
        });
    }
    return [];
  }, [products]);

  // Filter rows by product
  const visibleDistribution = distributionList.filter((item) => {
    if (selectedProduct === 'all') return true;
    return item.id === selectedProduct;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header & Top Legend */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Provider Distribution by Product</h3>
          <p className="mt-0.5 text-xs text-slate-500">Share of product cost by provider</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3.5 text-xs font-medium text-slate-600">
          <div
            className={`flex items-center gap-1.5 transition-opacity ${
              selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
            <span>Gemini</span>
          </div>
          <div
            className={`flex items-center gap-1.5 transition-opacity ${
              selectedProvider !== 'all' && selectedProvider !== 'openrouter' ? 'opacity-30' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span>OpenRouter</span>
          </div>
          <div
            className={`flex items-center gap-1.5 transition-opacity ${
              selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>AWS</span>
          </div>
        </div>
      </div>

      {/* Horizontal Stacked Bars */}
      <div className="my-auto py-2 space-y-4 sm:space-y-5">
        {visibleDistribution.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No provider distribution data for unallocated costs.
          </div>
        ) : (
          visibleDistribution.map((item) => (
            <div key={item.product} className="grid grid-cols-12 gap-3 items-center">
              {/* Product Label */}
              <span className="col-span-3 text-xs font-semibold text-slate-800 truncate">
                {item.product}
              </span>

              {/* Stacked Bar Container */}
              <div className="col-span-9 h-7 w-full flex rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                {/* Gemini Segment */}
                <div
                  style={{ width: `${item.gemini}%` }}
                  className={`bg-purple-600 flex items-center justify-center text-xs font-bold text-white font-sans select-none transition-all ${
                    selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : ''
                  } ${selectedProvider === 'gemini' ? 'ring-2 ring-purple-400 z-10' : ''}`}
                  title={`Gemini: ${item.gemini}%`}
                >
                  {item.gemini > 0 ? `${item.gemini}%` : ''}
                </div>

                {/* OpenRouter Segment */}
                <div
                  style={{ width: `${item.openrouter}%` }}
                  className={`bg-blue-600 flex items-center justify-center text-xs font-bold text-white font-sans select-none transition-all ${
                    selectedProvider !== 'all' && selectedProvider !== 'openrouter' ? 'opacity-30' : ''
                  } ${selectedProvider === 'openrouter' ? 'ring-2 ring-blue-400 z-10' : ''}`}
                  title={`OpenRouter: ${item.openrouter}%`}
                >
                  {item.openrouter > 0 ? `${item.openrouter}%` : ''}
                </div>

                {/* AWS Segment */}
                <div
                  style={{ width: `${item.aws}%` }}
                  className={`bg-amber-500 flex items-center justify-center text-xs font-bold text-white font-sans select-none transition-all ${
                    selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : ''
                  } ${selectedProvider === 'aws' ? 'ring-2 ring-amber-300 z-10' : ''}`}
                  title={`AWS: ${item.aws}%`}
                >
                  {item.aws > 0 ? `${item.aws}%` : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  );
}
