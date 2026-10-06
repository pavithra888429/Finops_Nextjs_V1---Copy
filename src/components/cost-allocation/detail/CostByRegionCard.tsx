import React from 'react';

interface RegionCostItem {
  name: string;
  cost: number;
  share: number;
  barColor: string;
}

const REGION_DATA: RegionCostItem[] = [
  { name: 'us-east-1', cost: 4820.20, share: 59.9, barColor: 'bg-purple-600' },
  { name: 'eu-west-1', cost: 1920.00, share: 23.9, barColor: 'bg-indigo-500' },
  { name: 'ap-south-1', cost: 1309.20, share: 16.2, barColor: 'bg-amber-500' },
];

export function CostByRegionCard() {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Cost by AWS Region</h3>
        <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
          View all
        </button>
      </div>

      {/* Column sub-headers */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px] font-semibold text-slate-400 pt-3 pb-1.5 border-b border-slate-100">
        <span className="col-span-6">Region</span>
        <span className="col-span-3 text-right">Cost</span>
        <span className="col-span-3 text-right">Share</span>
      </div>

      {/* Region Rows */}
      <div className="space-y-4 pt-3 my-auto">
        {REGION_DATA.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="grid grid-cols-12 gap-2 items-center text-xs">
              {/* Region Name */}
              <div className="col-span-6 flex items-center gap-2 truncate">
                <span className={`h-2 w-2 rounded-full shrink-0 ${item.barColor}`} />
                <span className="font-semibold text-slate-800 truncate">{item.name}</span>
              </div>

              {/* Cost */}
              <span className="col-span-3 text-right text-slate-900 font-bold tabular-nums">
                {format(item.cost)}
              </span>

              {/* Share */}
              <span className="col-span-3 text-right text-slate-500 tabular-nums font-normal">
                {item.share}%
              </span>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${item.share}%` }}
                className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="h-2" />
    </div>
  );
}
