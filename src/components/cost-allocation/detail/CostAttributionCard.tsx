import React from 'react';
import { Info } from 'lucide-react';

interface CostAttributionCardProps {
  productName?: string;
  directCost?: number;
  sharedCost?: number;
  unallocatedCost?: number;
  resourceLinkedCost?: number;
}

export function CostAttributionCard({
  productName = 'Workbench',
  directCost = 7340.20,
  sharedCost = 559.20,
  unallocatedCost = 150.00,
  resourceLinkedCost = 86.4,
}: CostAttributionCardProps) {
  const total = directCost + sharedCost + unallocatedCost;
  const directPct = total > 0 ? (directCost / total) * 100 : 91.2;
  const sharedPct = total > 0 ? (sharedCost / total) * 100 : 6.9;
  const unallocPct = total > 0 ? (unallocatedCost / total) * 100 : 1.9;

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm h-full space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Cost Attribution</h3>
        <Info className="h-3.5 w-3.5 text-slate-400" />
      </div>

      {/* Attribution Metrics Rows */}
      <div className="space-y-2 text-xs">
        {/* Direct */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-600" />
            <span className="text-slate-700 font-medium">Direct {productName} cost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-bold tabular-nums">{format(directCost)}</span>
            <span className="text-slate-500 font-normal tabular-nums">{directPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Shared */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            <span className="text-slate-700 font-medium">Shared AWS cost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-bold tabular-nums">{format(sharedCost)}</span>
            <span className="text-slate-500 font-normal tabular-nums">{sharedPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Unallocated */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="text-slate-500 font-medium">Unallocated AWS cost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-semibold tabular-nums">{format(unallocatedCost)}</span>
            <span className="text-slate-400 font-normal tabular-nums">{unallocPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Stacked Horizontal Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="h-2 w-full rounded-full flex overflow-hidden bg-slate-100">
          <div style={{ width: `${directPct}%` }} className="bg-purple-600 rounded-l-full" />
          <div style={{ width: `${sharedPct}%` }} className="bg-indigo-400" />
          <div style={{ width: `${unallocPct}%` }} className="bg-slate-300 rounded-r-full" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <span>Resource-linked cost</span>
          <span className="font-bold text-slate-900 tabular-nums">{resourceLinkedCost}%</span>
        </div>
      </div>

      {/* Alert Info Box */}
      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
        <Info className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
        <p>Some AWS charges are available only at service, account, Region, or usage-type level.</p>
      </div>
    </div>
  );
}
