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
      return sortedBySpend.map((k) => {
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
      return sortedBySpend.map((k) => ({
        name: k.name || 'Unnamed Key',
        detail: k.remaining !== null && k.remaining !== undefined ? `$${Number(k.remaining).toFixed(2)} remaining` : 'No limit set',
        cost: k.limit !== null && k.limit !== undefined ? Number(k.limit) : 0,
        metric: `Limit: $${Number(k.limit || 0).toFixed(2)}`,
      }));
    }

    if (activeTab === 'monthly') {
      return sortedByMonthly.map((k) => {
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
    return sortedByWeekly.map((k) => {
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">OpenRouter Usage & Velocity Breakdown</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Real API key velocity & credit limits from OpenRouter</p>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/70 text-slate-600 font-medium">
          {keysList.length} Keys
        </span>
      </div>

      {/* Pill Tabs */}
      <div className="flex items-center gap-1.5 pt-3 pb-1 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('spend')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeTab === 'spend'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          By Lifetime Spend
        </button>
        <button
          onClick={() => setActiveTab('limits')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeTab === 'limits'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Credit Quotas
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeTab === 'monthly'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Monthly Velocity
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeTab === 'weekly'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Weekly Velocity
        </button>
      </div>

      {/* Column sub-headers */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px] font-semibold text-slate-400 pt-3 pb-1.5 border-b border-slate-100">
        <span className="col-span-5">API Key Name</span>
        <span className="col-span-4">Status / Detail</span>
        <span className="col-span-3 text-right">Value</span>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-1.5 pt-2 max-h-56 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {currentItems.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No keys available.
          </div>
        ) : (
          currentItems.map((item) => (
            <div key={item.name} className="grid grid-cols-12 gap-2 items-center text-xs group hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <span className="col-span-5 font-semibold text-slate-800 truncate group-hover:text-purple-600 transition-colors" title={item.name}>
                {item.name}
              </span>
              <span className="col-span-4 text-slate-500 truncate text-[11px]">
                {item.detail}
              </span>
              <span className="col-span-3 text-right text-slate-900 font-bold tabular-nums">
                {format(item.cost)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
