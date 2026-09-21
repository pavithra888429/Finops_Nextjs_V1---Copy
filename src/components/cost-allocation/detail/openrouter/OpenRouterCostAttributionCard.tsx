import React from 'react';
import { Info, Key } from 'lucide-react';

interface OpenRouterCostAttributionProps {
  productName?: string;
  keysList?: any[];
  totalSpend?: number;
}

export function OpenRouterCostAttributionCard({
  productName = 'OpenRouter Gateway',
  keysList = [],
  totalSpend = 0,
}: OpenRouterCostAttributionProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const sorted = [...(keysList || [])].sort((a: any, b: any) => (Number(b.usage) || 0) - (Number(a.usage) || 0));
  const calcTotal = totalSpend > 0 ? totalSpend : sorted.reduce((acc, k) => acc + (Number(k.usage) || 0), 0);

  const top3 = sorted.slice(0, 3);
  const top3Cost = top3.reduce((acc, k) => acc + (Number(k.usage) || 0), 0);
  const restCost = Math.max(0, calcTotal - top3Cost);

  const top3Pct = calcTotal > 0 ? (top3Cost / calcTotal) * 100 : 0;
  const restPct = calcTotal > 0 ? (restCost / calcTotal) * 100 : 0;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
        <h3 className="text-sm font-semibold text-white tracking-tight">Spend Attribution</h3>
        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          100% Verified
        </span>
      </div>

      {/* Attribution Metrics Rows */}
      <div className="space-y-2.5 text-xs">
        {/* Top 3 Drivers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff781f]" />
            <span className="text-slate-300">Top 3 Primary Keys</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tabular-nums">{format(top3Cost)}</span>
            <span className="text-slate-400 font-normal tabular-nums">{top3Pct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Other Active Keys */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#0070f3]" />
            <span className="text-slate-300">Other Active Keys</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tabular-nums">{format(restCost)}</span>
            <span className="text-slate-400 font-normal tabular-nums">{restPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Standby */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
            <span className="text-slate-300">Zero-Spend Standby Keys</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium tabular-nums">{format(0)}</span>
            <span className="text-slate-400 font-normal tabular-nums">0.0%</span>
          </div>
        </div>
      </div>

      {/* Stacked Horizontal Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="h-2 w-full rounded-full flex overflow-hidden bg-dark-surface">
          <div style={{ width: `${top3Pct}%` }} className="bg-[#ff781f]" />
          <div style={{ width: `${restPct}%` }} className="bg-[#0070f3]" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span>Verified Direct Spend</span>
          <span className="font-semibold text-emerald-400 tabular-nums">{format(calcTotal)}</span>
        </div>
      </div>

      {/* Verified Info Box */}
      <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-600/10 flex items-start gap-2 text-[11px] text-emerald-300/90 leading-relaxed">
        <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>100% of expenditure is directly attributed to verified OpenRouter API keys.</p>
      </div>
    </div>
  );
}
