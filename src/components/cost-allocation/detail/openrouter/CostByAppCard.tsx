import React from 'react';

interface AppCostItem {
  name: string;
  cost: number;
  share: number;
  barColor: string;
}

export function CostByAppCard({ keysList = [] }: { keysList?: any[] }) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const total = (keysList || []).reduce((acc, k) => acc + (Number(k.usage) || 0), 0);
  const activeKeys = (keysList || []).filter((k) => (Number(k.usage) || 0) > 0);
  const idleKeys = (keysList || []).filter((k) => (Number(k.usage) || 0) === 0);

  const items: AppCostItem[] = [
    {
      name: 'Global Anycast Proxy (Auto-Route)',
      cost: total > 0 ? Number(total.toFixed(2)) : 26.48,
      share: 100,
      barColor: 'bg-purple-600',
    },
    {
      name: `Active AI Workloads (${activeKeys.length} Keys)`,
      cost: total > 0 ? Number(total.toFixed(2)) : 26.48,
      share: 100,
      barColor: 'bg-indigo-500',
    },
    {
      name: `Reserve Quota (${idleKeys.length} Standby Keys)`,
      cost: 0,
      share: 0,
      barColor: 'bg-slate-300',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Gateway Infrastructure</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Routing tier & workload segregation</p>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 font-medium">
          Anycast Global
        </span>
      </div>

      {/* Column sub-headers */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px] font-semibold text-slate-400 pt-3 pb-1.5 border-b border-slate-100">
        <span className="col-span-6">Gateway Tier</span>
        <span className="col-span-3 text-right">Cost</span>
        <span className="col-span-3 text-right">Share</span>
      </div>

      {/* Region Rows */}
      <div className="space-y-4 pt-3 my-auto">
        {items.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="grid grid-cols-12 gap-2 items-center text-xs">
              {/* Region Name */}
              <div className="col-span-6 flex items-center gap-2 truncate">
                <span className={`h-2 w-2 rounded-full shrink-0 ${item.barColor}`} />
                <span className="font-semibold text-slate-800 truncate" title={item.name}>
                  {item.name}
                </span>
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
                className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                style={{ width: `${item.share}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
