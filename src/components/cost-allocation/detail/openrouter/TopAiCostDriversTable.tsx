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
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top OpenRouter Key Drivers</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Ranked by lifetime expenditure across workspace</p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/70 text-slate-600">
          {sortedKeys.length} Keys
        </span>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200">
            <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Key Name</th>
              <th className="py-3 px-3">Masked Label</th>
              <th className="py-3 px-3">Credit Limit</th>
              <th className="py-3 px-3">Remaining</th>
              <th className="py-3 px-4 text-right">Lifetime Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  No key telemetry records ingested yet. Click Sync to fetch live keys.
                </td>
              </tr>
            ) : (
              sortedKeys.map((k: any) => {
                const isDeletedOrInactive = k.isActive === false;
                const isStandby = !isDeletedOrInactive && (Number(k.usage) || 0) === 0;

                return (
                  <tr key={k.keyId || k.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-900 truncate max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            isDeletedOrInactive
                              ? 'bg-slate-400'
                              : isStandby
                              ? 'bg-amber-400'
                              : 'bg-purple-600'
                          }`}
                        />
                        <span className="truncate font-semibold text-slate-800" title={k.name}>
                          {k.name}
                        </span>
                        {isDeletedOrInactive ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium">
                            inactive
                          </span>
                        ) : isStandby ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-medium">
                            standby
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate">
                      {k.label && k.label !== 'Deleted Key' ? (
                        k.label
                      ) : (
                        <span className="text-slate-400 italic font-sans text-[11px]">Historical Key</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {isDeletedOrInactive
                        ? <span className="text-slate-400">—</span>
                        : k.limit !== null && k.limit !== undefined
                        ? `$${Number(k.limit).toFixed(2)}`
                        : 'Unlimited'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                      {isDeletedOrInactive ? (
                        <span className="text-slate-400">—</span>
                      ) : k.remaining !== null && k.remaining !== undefined ? (
                        <span className="text-slate-900 font-medium font-mono">${Number(k.remaining).toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                      {format(Number(k.usage || 0))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
