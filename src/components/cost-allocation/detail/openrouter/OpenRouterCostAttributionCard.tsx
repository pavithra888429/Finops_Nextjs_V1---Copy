import React from 'react';
import { Info } from 'lucide-react';

interface OpenRouterCostAttributionProps {
  productName?: string;
  directCost?: number;
  sharedCost?: number;
  unallocatedCost?: number;
  resourceLinkedCost?: number;
}

export function OpenRouterCostAttributionCard({
  productName = 'Dragon Suite',
  directCost = 7340.20,
  sharedCost = 559.20,
  unallocatedCost = 150.00,
  resourceLinkedCost = 86.4,
}: OpenRouterCostAttributionProps) {
  const total = directCost + sharedCost + unallocatedCost;
  const directPct = total > 0 ? (directCost / total) * 100 : 91.2;
  const sharedPct = total > 0 ? (sharedCost / total) * 100 : 6.9;
  const unallocPct = total > 0 ? (unallocatedCost / total) * 100 : 1.9;

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-dark-border/60">
        <h3 className="text-sm font-semibold text-white tracking-tight">Cost Attribution</h3>
        <Info className="h-3.5 w-3.5 text-slate-400" />
      </div>

      {/* Attribution Metrics Rows */}
      <div className="space-y-2 text-xs">
        {/* Direct */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="text-slate-300">Direct {productName} cost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tabular-nums">{format(directCost)}</span>
            <span className="text-slate-400 font-normal tabular-nums">{directPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Shared */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff781f]" />
            <span className="text-slate-300">Shared OpenRouter cost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tabular-nums">{format(sharedCost)}</span>
            <span className="text-slate-400 font-normal tabular-nums">{sharedPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Unallocated */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#0070f3]" />
            <span className="text-slate-300">Unallocated OpenRouter cost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tabular-nums">{format(unallocatedCost)}</span>
            <span className="text-slate-400 font-normal tabular-nums">{unallocPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Stacked Horizontal Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="h-2 w-full rounded-full flex overflow-hidden bg-dark-surface">
          <div style={{ width: `${directPct}%` }} className="bg-[#10b981]" />
          <div style={{ width: `${sharedPct}%` }} className="bg-[#ff781f]" />
          <div style={{ width: `${unallocPct}%` }} className="bg-[#0070f3]" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span>Resource-linked cost</span>
          <span className="font-semibold text-white tabular-nums">{resourceLinkedCost}%</span>
        </div>
      </div>

      {/* Alert Info Box */}
      <div className="p-2.5 rounded-lg border border-blue-500/20 bg-blue-600/10 flex items-start gap-2 text-[11px] text-blue-300/90 leading-relaxed">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p>Some OpenRouter charges are available only at service, account, Region, or usage-type level.</p>
      </div>
    </div>
  );
}
