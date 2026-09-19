import React from 'react';

interface RegionCostItem {
  name: string;
  cost: number;
  share: number;
  barColor: string;
}

const REGION_DATA: RegionCostItem[] = [
  { name: 'us-east-1', cost: 4820.20, share: 59.9, barColor: 'bg-[#ff781f]' },
  { name: 'eu-west-1', cost: 1920.00, share: 23.9, barColor: 'bg-[#0070f3]' },
  { name: 'ap-south-1', cost: 1309.20, share: 16.2, barColor: 'bg-[#8b5cf6]' },
];

export function CostByRegionCard() {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
        <h3 className="text-sm font-semibold text-white tracking-tight">Cost by AWS Region</h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View all
        </button>
      </div>

      {/* Column sub-headers */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px] font-medium text-slate-400 pt-2 pb-1 border-b border-dark-border/40">
        <span className="col-span-6">Region</span>
        <span className="col-span-3 text-right">Cost</span>
        <span className="col-span-3 text-right">Share</span>
      </div>

      {/* Region Rows */}
      <div className="space-y-4 pt-3 my-auto">
        {REGION_DATA.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="grid grid-cols-12 gap-2 items-center text-xs">
              {/* Region Name */}
              <div className="col-span-6 flex items-center gap-1.5 truncate">
                <span className={`h-2 w-2 rounded-sm shrink-0 ${item.barColor}`} />
                <span className="font-medium text-slate-200 truncate">{item.name}</span>
              </div>

              {/* Cost */}
              <span className="col-span-3 text-right text-white font-medium tabular-nums">
                {format(item.cost)}
              </span>

              {/* Share */}
              <span className="col-span-3 text-right text-slate-400 tabular-nums font-normal">
                {item.share}%
              </span>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-dark-surface overflow-hidden">
              <div
                style={{ width: `${item.share}%` }}
                className={`h-full rounded-full ${item.barColor}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="h-2" />
    </div>
  );
}
