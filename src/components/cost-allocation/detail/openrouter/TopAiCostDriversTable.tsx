import React from 'react';
import { ArrowUp } from 'lucide-react';

interface CostDriverItem {
  resource: string;
  service: string;
  account: string;
  region: string;
  usageType: string;
  cost: number;
  change: number;
}

interface TopAiCostDriversTableProps {
  productName?: string;
  keysList?: any[];
}

export function TopAiCostDriversTable({ productName = 'Dragon Suite', keysList = [] }: TopAiCostDriversTableProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(val);

  const sortedKeys = [...(keysList || [])].sort((a: any, b: any) => (Number(b.usage) || 0) - (Number(a.usage) || 0));

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-dark-border/60 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Top OpenRouter Key Drivers</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Ranked by lifetime expenditure across workspace</p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-300">
          {sortedKeys.length} Keys
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-medium text-slate-400 border-b border-dark-border/40 bg-dark-surface/40">
              <th className="py-2.5 px-4 font-normal">Key Name</th>
              <th className="py-2.5 px-3 font-normal">Masked Label</th>
              <th className="py-2.5 px-3 font-normal">Credit Limit</th>
              <th className="py-2.5 px-3 font-normal">Remaining</th>
              <th className="py-2.5 px-4 text-right font-normal">Lifetime Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30 text-slate-300">
            {sortedKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No key telemetry records ingested yet. Click Sync to fetch live keys.
                </td>
              </tr>
            ) : (
              sortedKeys.slice(0, 8).map((k: any) => (
                <tr key={k.keyId || k.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4 font-medium text-white truncate max-w-[160px]">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate" title={k.name}>{k.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] truncate">
                    {k.label || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    {k.limit !== null && k.limit !== undefined ? `$${Number(k.limit).toFixed(2)}` : 'Unlimited'}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono text-[11px]">
                    {k.remaining !== null && k.remaining !== undefined ? `$${Number(k.remaining).toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-amber-400 tabular-nums">
                    {format(Number(k.usage || 0))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
