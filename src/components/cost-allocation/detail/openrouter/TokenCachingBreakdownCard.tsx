import React, { useState } from 'react';

interface TokenCachingBreakdownCardProps {
  keysList?: any[];
}

export function TokenCachingBreakdownCard({ keysList = [] }: TokenCachingBreakdownCardProps) {
  const [activeTab, setActiveTab] = useState<'spend' | 'limits' | 'monthly' | 'weekly'>('spend');

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const sortedBySpend = [...(keysList || [])].sort((a: any, b: any) => (Number(b.usage) || 0) - (Number(a.usage) || 0));
  const sortedByMonthly = [...(keysList || [])].sort((a: any, b: any) => (Number(b.usageMonthly ?? b.usage_monthly) || 0) - (Number(a.usageMonthly ?? a.usage_monthly) || 0));
  const sortedByWeekly = [...(keysList || [])].sort((a: any, b: any) => (Number(b.usageWeekly ?? b.usage_weekly) || 0) - (Number(a.usageWeekly ?? a.usage_weekly) || 0));

  const totalSpend = sortedBySpend.reduce((acc, k) => acc + (Number(k.usage) || 0), 0);

  const getItemsForTab = () => {
    if (activeTab === 'spend') {
      return sortedBySpend.slice(0, 5).map((k) => {
        const cost = Number(k.usage || 0);
        const share = totalSpend > 0 ? Number(((cost / totalSpend) * 100).toFixed(1)) : 0;
        return {
          name: k.name || 'Unnamed Key',
          detail: k.label || 'API Key',
          cost,
          metric: `${share}% of spend`,
        };
      });
    }

    if (activeTab === 'limits') {
      return sortedBySpend.slice(0, 5).map((k) => ({
        name: k.name || 'Unnamed Key',
        detail: k.remaining !== null && k.remaining !== undefined ? `$${Number(k.remaining).toFixed(2)} remaining` : 'No limit set',
        cost: k.limit !== null && k.limit !== undefined ? Number(k.limit) : 0,
        metric: `Limit: $${Number(k.limit || 0).toFixed(2)}`,
      }));
    }

    if (activeTab === 'monthly') {
      return sortedByMonthly.slice(0, 5).map((k) => {
        const mCost = Number(k.usageMonthly ?? k.usage_monthly ?? 0);
        return {
          name: k.name || 'Unnamed Key',
          detail: 'Monthly Active Velocity',
          cost: mCost,
          metric: mCost > 0 ? 'Active this month' : 'No spend this month',
        };
      });
    }

    // weekly
    return sortedByWeekly.slice(0, 5).map((k) => {
      const wCost = Number(k.usageWeekly ?? k.usage_weekly ?? 0);
      return {
        name: k.name || 'Unnamed Key',
        detail: '7-Day Run-Rate',
        cost: wCost,
        metric: wCost > 0 ? 'Active past 7 days' : 'Idle past 7 days',
      };
    });
  };

  const currentItems = getItemsForTab();

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-dark-border/60">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">OpenRouter Usage & Velocity Breakdown</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Real API key velocity & credit limits from OpenRouter</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-300 font-mono">
          {keysList.length} Keys
        </span>
      </div>

      {/* Pill Tabs */}
      <div className="flex items-center gap-1.5 pt-2 pb-1 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('spend')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'spend'
              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30'
              : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          By Lifetime Spend
        </button>
        <button
          onClick={() => setActiveTab('limits')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'limits'
              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30'
              : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          Credit Quotas
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'monthly'
              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30'
              : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          Monthly Velocity
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'weekly'
              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30'
              : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          Weekly Velocity
        </button>
      </div>

      {/* Column sub-headers */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px] font-medium text-slate-400 pt-2 pb-1 border-b border-dark-border/40">
        <span className="col-span-5">API Key Name</span>
        <span className="col-span-4">Status / Detail</span>
        <span className="col-span-3 text-right">Value</span>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-3 pt-2 my-auto">
        {currentItems.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            No keys available.
          </div>
        ) : (
          currentItems.map((item) => (
            <div key={item.name} className="grid grid-cols-12 gap-2 items-center text-xs">
              <span className="col-span-5 font-medium text-slate-200 truncate" title={item.name}>
                {item.name}
              </span>
              <span className="col-span-4 text-slate-400 truncate text-[11px]">
                {item.detail}
              </span>
              <span className="col-span-3 text-right text-white font-medium tabular-nums">
                {format(item.cost)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
