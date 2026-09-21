import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface CostByKeyEnvCardProps {
  productName?: string;
  selectedKey?: string;
  keysList?: any[];
  onSelectKey?: (keyName: string) => void;
}

export function CostByKeyEnvCard({
  productName = 'Dragon Suite',
  selectedKey = 'all',
  keysList = [],
  onSelectKey,
}: CostByKeyEnvCardProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const totalKeysSpend = (keysList || []).reduce((sum, k) => sum + (Number(k.usage) || 0), 0);

  const displayItems = (keysList && keysList.length > 0)
    ? keysList.map((k) => {
        const cost = Number(k.usage || 0);
        const share = totalKeysSpend > 0 ? Number(((cost / totalKeysSpend) * 100).toFixed(1)) : 0;
        return {
          name: k.name || 'Unnamed Key',
          label: k.label || '',
          status: cost > 0 ? 'Active' : 'Standby',
          cost: cost,
          limit: k.limit !== null && k.limit !== undefined ? `$${Number(k.limit).toFixed(2)}` : 'Unlimited',
          remaining: k.remaining !== null && k.remaining !== undefined ? `$${Number(k.remaining).toFixed(2)}` : 'N/A',
          share: share,
          createdAt: k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '',
        };
      })
    : [];

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Active API Keys & Credit Quotas</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Discovered via OpenRouter Management Gateway</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
          {displayItems.length} Keys Active
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-2 max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-medium text-slate-400 border-b border-dark-border/40 sticky top-0 bg-dark-card">
              <th className="py-2 pr-2 font-normal">Key Name</th>
              <th className="py-2 px-2 text-right font-normal">Limit</th>
              <th className="py-2 px-2 text-right font-normal">Spend</th>
              <th className="py-2 pl-2 text-right font-normal">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30 text-slate-300">
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                  No active keys ingested yet. Click Sync to fetch live keys.
                </td>
              </tr>
            ) : (
              displayItems.map((item) => {
                const isSelected = selectedKey === item.name;
                return (
                  <tr
                    key={item.name}
                    onClick={() => onSelectKey && onSelectKey(isSelected ? 'all' : item.name)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/15 text-blue-300 font-medium'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <td className="py-2.5 pr-2 font-medium text-white">
                      <div className="truncate max-w-[140px]" title={item.name}>{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{item.label || item.createdAt}</div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-400 text-[11px]">
                      {item.limit}
                    </td>
                    <td className="py-2.5 px-2 text-right text-amber-400 font-medium tabular-nums">
                      {format(item.cost)}
                    </td>
                    <td className="py-2.5 pl-2 text-right text-slate-400 tabular-nums">
                      {item.share}%
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
