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
  const totalAllocated = (keysList || []).reduce((sum, k) => sum + (Number(k.limit) || 0), 0);
  const activeKeysOnlyCount = (keysList || []).filter((k) => k.isActive !== false).length;

  const formatCreatedDate = (dateStr: any) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr).split('T')[0];
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return String(dateStr).split('T')[0] || '—';
    }
  };

  const displayItems = (keysList && keysList.length > 0)
    ? keysList.map((k) => {
        const cost = Number(k.usage || 0);
        const share = totalKeysSpend > 0 ? Number(((cost / totalKeysSpend) * 100).toFixed(1)) : 0;
        const isInactive = k.isActive === false;
        const rawCreated = k.createdAt || k.created_at;
        return {
          name: k.name || 'Unnamed Key',
          label: k.label || '',
          status: isInactive ? 'Inactive' : cost > 0 ? 'Active' : 'Standby',
          cost: cost,
          limit: isInactive ? '—' : k.limit !== null && k.limit !== undefined ? `$${Number(k.limit).toFixed(2)}` : 'Unlimited',
          remaining: isInactive ? '—' : k.remaining !== null && k.remaining !== undefined ? `$${Number(k.remaining).toFixed(2)}` : '—',
          share: share,
          createdDate: formatCreatedDate(rawCreated),
        };
      })
    : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active API Keys & Credit Quotas</h3>
          <p className="text-xs text-slate-500 mt-0.5">Discovered via OpenRouter Management Gateway</p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-sans font-semibold">
          Alloc: {format(totalAllocated)} • {activeKeysOnlyCount} Active Keys ({displayItems.length} Total)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-2 max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 sticky top-0 bg-slate-50 whitespace-nowrap">
              <th className="py-2.5 px-3">Key Name</th>
              <th className="py-2.5 px-2 text-left">Created</th>
              <th className="py-2.5 px-2 text-right">Limit</th>
              <th className="py-2.5 px-2 text-right">Spend</th>
              <th className="py-2.5 pr-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
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
                        ? 'bg-purple-50 text-purple-900 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="truncate max-w-[130px]" title={item.name}>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{item.label}</div>
                    </td>
                    <td className="py-2.5 px-2 text-left text-slate-500 font-sans text-xs whitespace-nowrap">
                      {item.createdDate}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600 text-xs whitespace-nowrap font-sans">
                      {item.limit}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-900 font-bold tabular-nums whitespace-nowrap font-sans">
                      {format(item.cost)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-slate-500 tabular-nums whitespace-nowrap font-sans">
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
