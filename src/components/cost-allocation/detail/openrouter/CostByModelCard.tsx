import React from 'react';

interface CostByModelCardProps {
  topModels?: any[];
  keysList?: any[];
}

export function CostByModelCard({ topModels = [], keysList = [] }: CostByModelCardProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const colors = ['bg-[#ff781f]', 'bg-[#0070f3]', 'bg-[#8b5cf6]', 'bg-[#00e599]', 'bg-[#ec4899]', 'bg-amber-400'];

  // Prefer keysList if topModels is not supplied or has fewer items
  const source = (keysList && keysList.length > 0) ? keysList : topModels;
  const sorted = [...(source || [])].sort((a: any, b: any) => (Number(b.usage ?? b.cost) || 0) - (Number(a.usage ?? a.cost) || 0));
  const totalSpend = sorted.reduce((acc, k) => acc + (Number(k.usage ?? k.cost) || 0), 0);

  // Render all keys with rank-based colors
  const displayItems = sorted.map((item, idx) => {
    const cost = Number(item.usage ?? item.cost ?? 0);
    const share = totalSpend > 0 ? Number(((cost / totalSpend) * 100).toFixed(1)) : 0;
    return {
      name: item.name || 'Unnamed Key',
      label: item.label || '',
      cost,
      share,
      barColor: colors[idx % colors.length],
    };
  });

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Top Workload Keys by Spend</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Ranked real expenditure across OpenRouter keys</p>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-medium">
          {displayItems.length} Keys
        </span>
      </div>

      {/* Column sub-headers */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px] font-medium text-slate-400 pt-2 pb-1 border-b border-dark-border/40">
        <span className="col-span-6">API Key Workload</span>
        <span className="col-span-3 text-right">Spend</span>
        <span className="col-span-3 text-right">Share</span>
      </div>

      {/* Scrollable Rows - Shows all keys without truncation */}
      <div className="space-y-3 pt-2 max-h-72 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-transparent hover:scrollbar-thumb-slate-600">
        {displayItems.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            No OpenRouter keys ingested yet.
          </div>
        ) : (
          displayItems.map((item) => (
            <div key={item.name} className="space-y-1 group hover:bg-white/[0.02] p-1 rounded transition-colors">
              <div className="grid grid-cols-12 gap-2 items-center text-xs">
                <div className="col-span-6 flex items-center gap-1.5 truncate">
                  <span className={`h-2 w-2 rounded-sm shrink-0 ${item.barColor}`} />
                  <span className="font-medium text-slate-200 truncate group-hover:text-white transition-colors" title={item.name}>
                    {item.name}
                  </span>
                </div>

                <span className="col-span-3 text-right text-white font-medium tabular-nums">
                  {format(item.cost)}
                </span>

                <span className="col-span-3 text-right text-slate-400 tabular-nums font-mono text-[11px]">
                  {item.share}%
                </span>
              </div>

              {/* Proportion Bar */}
              <div className="w-full h-1.5 rounded-full bg-dark-border/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.barColor} transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(item.cost > 0 ? 2 : 0, item.share))}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
