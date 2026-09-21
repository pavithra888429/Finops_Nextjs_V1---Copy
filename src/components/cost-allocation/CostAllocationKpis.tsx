import React, { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Boxes,
  CalendarClock,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { ProductAllocationRecord } from './costAllocationData';

interface CostAllocationKpisProps {
  products: ProductAllocationRecord[];
  selectedProduct: string;
  onProductClick: (id: string) => void;
  selectedProvider: string;
  currencySymbol?: string;
}

export function CostAllocationKpis({
  products,
  selectedProduct,
  onProductClick,
  selectedProvider,
  currencySymbol = '$',
}: CostAllocationKpisProps) {
  const fmt = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  const fmtCompact = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: 'compact',
    } as Intl.NumberFormatOptions).format(val);

  // --- All metrics derived dynamically from products array (scales to any N) ---
  const metrics = useMemo(() => {
    const getProviderCost = (p: ProductAllocationRecord) => {
      if (selectedProvider === 'gemini') return p.gemini;
      if (selectedProvider === 'openrouter') return p.openrouter;
      if (selectedProvider === 'aws') return p.aws;
      return p.total;
    };

    const visibleProducts =
      selectedProduct !== 'all'
        ? products.filter((p) => p.id === selectedProduct)
        : products;

    const allocated = visibleProducts.filter((p) => p.id !== 'unallocated');
    const unallocatedProd = products.find((p) => p.id === 'unallocated');

    // 1. Total spend
    const totalCost = visibleProducts.reduce((sum, p) => sum + getProviderCost(p), 0);
    const avgChange =
      allocated.length > 0
        ? allocated.reduce((sum, p) => sum + (p.change ?? 0), 0) / allocated.length
        : 0;

    // 2. Top cost driver
    const topDriver = [...allocated].sort(
      (a, b) => getProviderCost(b) - getProviderCost(a)
    )[0];
    const topDriverCost = topDriver ? getProviderCost(topDriver) : 0;
    const topDriverShare = totalCost > 0 ? (topDriverCost / totalCost) * 100 : 0;

    // 3. Allocation coverage
    const allocatedCost = allocated.reduce((sum, p) => sum + getProviderCost(p), 0);
    const unallocatedCost = unallocatedProd ? getProviderCost(unallocatedProd) : 0;
    const allocationRate = totalCost > 0 ? (allocatedCost / totalCost) * 100 : 100;

    // 4. Active products count
    const activeProducts = allocated.filter((p) => getProviderCost(p) > 0);
    const providerSet = new Set<string>();
    allocated.forEach((p) => {
      if (p.gemini > 0) providerSet.add('Gemini');
      if (p.openrouter > 0) providerSet.add('OpenRouter');
      if (p.aws > 0) providerSet.add('AWS');
    });

    // 5. Daily avg and month-end forecast
    const totalDailyAvg = visibleProducts.reduce((sum, p) => sum + (p.dailyAvg ?? 0), 0);
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthEndForecast = totalDailyAvg * daysInMonth;
    const dayProgress = (now.getDate() / daysInMonth) * 100;

    return {
      totalCost,
      avgChange,
      topDriver,
      topDriverCost,
      topDriverShare,
      allocatedCost,
      unallocatedCost,
      allocationRate,
      activeProducts,
      totalProviders: providerSet.size,
      totalDailyAvg,
      monthEndForecast,
      dayProgress,
      currentDay: now.getDate(),
      daysInMonth,
    };
  }, [products, selectedProduct, selectedProvider]);

  const isUp = metrics.avgChange >= 0;
  const coverageColor =
    metrics.allocationRate >= 95
      ? { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Excellent' }
      : metrics.allocationRate >= 80
      ? { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Good' }
      : { bar: 'bg-red-500', text: 'text-red-400', label: 'Needs attention' };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5 w-full">

      {/* ── Card 1: Total Organization Spend ── */}
      <div
        onClick={() => onProductClick('all')}
        className={`group rounded-xl border p-4 flex items-start gap-3.5 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden ${
          selectedProduct === 'all'
            ? 'border-blue-500/60 bg-gradient-to-br from-blue-950/30 to-blue-900/10 ring-1 ring-blue-500/30'
            : 'border-dark-border bg-dark-card/90 hover:border-blue-500/30 hover:bg-dark-card'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none rounded-xl" />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-medium text-slate-400 truncate">
            {selectedProduct === 'all' ? 'Total Organization Spend' : 'Filtered Spend'}
          </p>
          <h3 className="text-xl font-bold text-white tracking-tight tabular-nums mt-0.5 leading-tight">
            {fmt(metrics.totalCost)}
          </h3>
          <div className={`flex items-center gap-1 mt-1 text-[10.5px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUp className="h-3 w-3 stroke-[2.5]" /> : <ArrowDown className="h-3 w-3 stroke-[2.5]" />}
            <span>{isUp ? '+' : ''}{metrics.avgChange.toFixed(1)}% vs previous period</span>
          </div>
        </div>
      </div>

      {/* ── Card 2: Top Cost Driver ── */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 hover:border-purple-500/30 p-4 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none rounded-xl" />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-medium text-slate-400">Top Cost Driver</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-xl font-bold text-white tracking-tight tabular-nums leading-tight">
              {metrics.topDriver ? fmtCompact(metrics.topDriverCost) : '—'}
            </h3>
            {metrics.topDriver && (
              <span className="text-[10.5px] font-semibold text-purple-400">
                {metrics.topDriverShare.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />
            <p className="text-[11px] text-slate-300 font-medium truncate">
              {metrics.topDriver?.name ?? 'No products'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Card 3: Allocation Coverage Rate ── */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 hover:border-emerald-500/30 p-4 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none rounded-xl" />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-medium text-slate-400">Allocation Coverage</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-xl font-bold text-white tracking-tight tabular-nums leading-tight">
              {metrics.allocationRate.toFixed(1)}%
            </h3>
            <span className={`text-[10.5px] font-semibold ${coverageColor.text}`}>
              {coverageColor.label}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-dark-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${coverageColor.bar}`}
              style={{ width: `${Math.min(metrics.allocationRate, 100)}%` }}
            />
          </div>
          {metrics.unallocatedCost > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
              <p className="text-[10.5px] text-amber-400 font-medium truncate">
                {fmtCompact(metrics.unallocatedCost)} unallocated
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Card 4: Active Products & Portfolios ── */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 hover:border-cyan-500/30 p-4 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-transparent pointer-events-none rounded-xl" />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
          <Boxes className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-medium text-slate-400">Active Products</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <h3 className="text-xl font-bold text-white tracking-tight tabular-nums leading-tight">
              {metrics.activeProducts.length}
            </h3>
            <span className="text-sm font-medium text-slate-400">products</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            across{' '}
            <span className="text-cyan-400 font-semibold">
              {metrics.totalProviders} provider{metrics.totalProviders !== 1 ? 's' : ''}
            </span>
          </p>
          {/* Clickable mini product pills — scales to any N */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {metrics.activeProducts.slice(0, 5).map((p) => (
              <span
                key={p.id}
                onClick={(e) => { e.stopPropagation(); onProductClick(selectedProduct === p.id ? 'all' : p.id); }}
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-medium cursor-pointer transition-all border ${
                  selectedProduct === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-dark-border/40 text-slate-400 border-dark-border hover:text-white hover:bg-dark-border/80'
                }`}
              >
                {p.name}
              </span>
            ))}
            {metrics.activeProducts.length > 5 && (
              <span className="text-[9.5px] text-slate-500 font-medium">
                +{metrics.activeProducts.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Card 5: Forecasted Run Rate ── */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 hover:border-violet-500/30 p-4 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none rounded-xl" />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-medium text-slate-400">Forecasted Run Rate</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <h3 className="text-xl font-bold text-white tracking-tight tabular-nums leading-tight">
              {fmtCompact(metrics.totalDailyAvg)}
            </h3>
            <span className="text-sm font-medium text-slate-400">/ day</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            Month-end est.{' '}
            <span className="text-violet-400 font-semibold">
              {fmtCompact(metrics.monthEndForecast)}
            </span>
          </p>
          {/* Monthly day progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-dark-border overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                style={{ width: `${Math.min(metrics.dayProgress, 100)}%` }}
              />
            </div>
            <span className="text-[9.5px] text-slate-500 shrink-0 tabular-nums">
              Day {metrics.currentDay}/{metrics.daysInMonth}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

