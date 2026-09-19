import React from 'react';
import { BASE_DISTRIBUTION } from './costAllocationData';

interface ProviderDistributionChartProps {
  selectedProduct: string;
  selectedProvider: string;
}

export function ProviderDistributionChart({
  selectedProduct,
  selectedProvider,
}: ProviderDistributionChartProps) {
  // Filter rows by product
  const visibleDistribution = BASE_DISTRIBUTION.filter((item) => {
    if (selectedProduct === 'all') return true;
    return item.id === selectedProduct;
  });

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header & Top Legend */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">Provider Distribution by Product</h3>
          <p className="mt-0.5 text-xs text-slate-400">Share of product cost by provider</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3.5 text-xs font-normal text-slate-300">
          <div
            className={`flex items-center gap-1.5 transition-opacity ${
              selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-[#0070f3]" />
            <span>Gemini</span>
          </div>
          <div
            className={`flex items-center gap-1.5 transition-opacity ${
              selectedProvider !== 'all' && selectedProvider !== 'openrouter' ? 'opacity-30' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-[#7c3aed]" />
            <span>OpenRouter</span>
          </div>
          <div
            className={`flex items-center gap-1.5 transition-opacity ${
              selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-[#ff781f]" />
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
              <span className="col-span-3 text-xs font-normal text-slate-200 truncate">
                {item.product}
              </span>

              {/* Stacked Bar Container */}
              <div className="col-span-9 h-8 w-full flex rounded-md overflow-hidden bg-dark-surface shadow-sm">
                {/* Gemini Segment */}
                <div
                  style={{ width: `${item.gemini}%` }}
                  className={`bg-[#0070f3] flex items-center justify-center text-xs font-semibold text-white select-none transition-all ${
                    selectedProvider !== 'all' && selectedProvider !== 'gemini' ? 'opacity-30' : ''
                  } ${selectedProvider === 'gemini' ? 'ring-2 ring-white/60 z-10' : ''}`}
                  title={`Gemini: ${item.gemini}%`}
                >
                  {item.gemini}%
                </div>

                {/* OpenRouter Segment */}
                <div
                  style={{ width: `${item.openrouter}%` }}
                  className={`bg-[#7c3aed] flex items-center justify-center text-xs font-semibold text-white select-none transition-all ${
                    selectedProvider !== 'all' && selectedProvider !== 'openrouter' ? 'opacity-30' : ''
                  } ${selectedProvider === 'openrouter' ? 'ring-2 ring-white/60 z-10' : ''}`}
                  title={`OpenRouter: ${item.openrouter}%`}
                >
                  {item.openrouter}%
                </div>

                {/* AWS Segment */}
                <div
                  style={{ width: `${item.aws}%` }}
                  className={`bg-[#ff781f] flex items-center justify-center text-xs font-semibold text-white select-none transition-all ${
                    selectedProvider !== 'all' && selectedProvider !== 'aws' ? 'opacity-30' : ''
                  } ${selectedProvider === 'aws' ? 'ring-2 ring-white/60 z-10' : ''}`}
                  title={`AWS: ${item.aws}%`}
                >
                  {item.aws}%
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
