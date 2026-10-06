import React from 'react';
import { Key, ShieldCheck, DollarSign, Wallet, CheckCircle2, Trash2 } from 'lucide-react';

interface OpenRouterDetailKpisProps {
  totalCost?: number;
  topKey?: string;
  topKeyCost?: number;
  topKeyShare?: number;
  creditLimit?: number | null;
  remainingBalance?: number | null;
  totalKeysCount?: number;
  activeKeysCount?: number;
  idleKeysCount?: number;
  allocatedKeyLimits?: number;
  deletedKeysCount?: number;
  deletedKeysAllocatedLimit?: number;
  deletedKeysSpend?: number;
  unallocatedBuffer?: number;
}

export function OpenRouterDetailKpis({
  totalCost = 0,
  topKey = '—',
  topKeyCost = 0,
  topKeyShare = 0,
  creditLimit = null,
  remainingBalance = null,
  totalKeysCount = 0,
  activeKeysCount = 0,
  idleKeysCount = 0,
  allocatedKeyLimits = 0,
  deletedKeysCount = 0,
  deletedKeysAllocatedLimit = 0,
  deletedKeysSpend = 0,
  unallocatedBuffer = 0,
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
      {/* 1. Total Credit Allocation */}
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Credit Allocation</p>
          <h3 className="text-base font-bold text-slate-900 tracking-tight truncate mt-0.5 font-sans">
            {creditLimit !== null ? format(creditLimit) : 'Unlimited'}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 tabular-nums font-sans">
            {unallocatedBuffer > 0 ? `${format(unallocatedBuffer)} Unallocated` : `${quotaUtilizedPct}% Utilized`}
          </p>
        </div>
      </div>

      {/* 2. Active Incurred Spend */}
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 border border-purple-100 text-purple-600 shadow-sm">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Active Spend</p>
          <h3 className="text-base font-bold text-slate-900 tracking-tight tabular-nums truncate mt-0.5 font-sans">
            {format(totalCost)}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 font-sans">
            Across Active Keys
          </p>
        </div>
      </div>

      {/* 3. Remaining Balance */}
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Remaining Balance</p>
          <h3 className="text-base font-bold text-emerald-600 tracking-tight truncate mt-0.5 font-sans">
            {remainingBalance !== null ? format(remainingBalance) : 'Unlimited'}
          </h3>
          <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5 tabular-nums font-sans">
            Active Keys Liquidity
          </p>
        </div>
      </div>

      {/* 4. Active Key Quotas */}
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 flex items-center gap-2.5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all min-h-[86px]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-700 border border-slate-200 shadow-sm">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider truncate">Key Quotas</p>
            <span className="text-[10px] font-bold text-purple-700 tabular-nums px-1.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 shrink-0 font-sans">
              {totalKeysCount} Keys
            </span>
          </div>
          <div className="mt-1 space-y-0.5 text-[10px] tabular-nums leading-tight font-sans">
            <div className="flex items-center justify-between gap-1 text-slate-500">
              <span>Allocated:</span>
              <span className="text-slate-800 font-semibold">{format(allocatedKeyLimits)}</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-slate-500 font-normal">
              <span>Status:</span>
              <span className="text-slate-800 font-medium">{activeKeysCount} Active • {idleKeysCount} Idle</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Primary Cost Driver */}
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 border border-purple-100 text-purple-600 shadow-sm">
          <Key className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Primary Cost Driver</p>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate mt-0.5 font-sans" title={topKey}>
            {topKey}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 tabular-nums font-sans">
            {format(topKeyCost)} ({topKeyShare}% Share)
          </p>
        </div>
      </div>

      {/* 6. Archived Keys */}
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 flex items-center gap-2.5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all min-h-[86px]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
          <Trash2 className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider truncate">Archived</p>
            <span className="text-[10px] font-bold text-slate-600 tabular-nums px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 shrink-0 font-sans">
              {deletedKeysCount} Keys
            </span>
          </div>
          <div className="mt-1 space-y-0.5 text-[10px] tabular-nums leading-tight font-sans">
            <div className="flex items-center justify-between gap-1 text-slate-500">
              <span>Allocated:</span>
              <span className="text-slate-800 font-semibold">{format(deletedKeysAllocatedLimit)}</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-slate-500 font-medium">
              <span>Incurred:</span>
              <span className="font-semibold text-slate-800">{format(deletedKeysSpend)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
