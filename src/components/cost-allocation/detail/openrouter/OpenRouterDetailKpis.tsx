import React from 'react';
import { BarChart3, Key, ShieldCheck, DollarSign, Wallet, CheckCircle2 } from 'lucide-react';

interface OpenRouterDetailKpisProps {
  totalCost?: number;
  monthlySpend?: number;
  topKey?: string;
  topKeyCost?: number;
  topKeyShare?: number;
  creditLimit?: number | null;
  remainingBalance?: number | null;
  totalKeysCount?: number;
  activeKeysCount?: number;
  idleKeysCount?: number;
}

export function OpenRouterDetailKpis({
  totalCost = 0,
  monthlySpend = 0,
  topKey = '—',
  topKeyCost = 0,
  topKeyShare = 0,
  creditLimit = null,
  remainingBalance = null,
  totalKeysCount = 0,
  activeKeysCount = 0,
  idleKeysCount = 0,
}: OpenRouterDetailKpisProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);

  const quotaUtilizedPct = creditLimit && creditLimit > 0
    ? Math.min(100, Math.round((totalCost / creditLimit) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {/* 1. Real OpenRouter Spend */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141824] border border-amber-500/30 text-amber-400 shadow-sm">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Total Real Spend</p>
          <h3 className="text-base font-bold text-white tracking-tight tabular-nums truncate mt-0.5">
            {format(totalCost)}
          </h3>
          <p className="text-[10.5px] text-emerald-400 font-medium truncate mt-0.5">
            Verified OpenRouter API
          </p>
        </div>
      </div>

      {/* 2. Monthly Spend */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Monthly Spend</p>
          <h3 className="text-base font-bold text-white tracking-tight tabular-nums truncate mt-0.5">
            {format(monthlySpend)}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5">
            Real usage_monthly
          </p>
        </div>
      </div>

      {/* 3. Top Key Driver */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#452b0f]/30 border border-amber-500/30 text-amber-400 shadow-sm">
          <Key className="h-5 w-5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Top Spending Key</p>
          <h3 className="text-sm font-bold text-white tracking-tight truncate mt-0.5" title={topKey}>
            {topKey}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5 tabular-nums">
            {format(topKeyCost)} ({topKeyShare}%)
          </p>
        </div>
      </div>

      {/* 4. Credit Limit */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Total Credit Quota</p>
          <h3 className="text-base font-bold text-white tracking-tight truncate mt-0.5">
            {creditLimit !== null ? format(creditLimit) : 'Unlimited'}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5 tabular-nums">
            {quotaUtilizedPct}% utilized
          </p>
        </div>
      </div>

      {/* 5. Remaining Balance */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Remaining Balance</p>
          <h3 className="text-base font-bold text-emerald-400 tracking-tight truncate mt-0.5">
            {remainingBalance !== null ? format(remainingBalance) : 'Unlimited'}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5 tabular-nums">
            Available to spend
          </p>
        </div>
      </div>

      {/* 6. Active Keys Count */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">API Keys Inventory</p>
          <h3 className="text-base font-bold text-white tracking-tight tabular-nums truncate mt-0.5">
            {totalKeysCount} Keys
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5">
            {activeKeysCount} active • {idleKeysCount} standby
          </p>
        </div>
      </div>
    </div>
  );
}
