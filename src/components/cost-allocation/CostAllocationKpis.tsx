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
      ? { bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'Excellent' }
      : metrics.allocationRate >= 80
      ? { bar: 'bg-blue-500', text: 'text-blue-700', label: 'Good' }
      : { bar: 'bg-amber-500', text: 'text-amber-700', label: 'Needs attention' };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5 w-full">

      {/* ── Card 1: Total Organization Spend ── */}
      <div
        onClick={() => onProductClick('all')}
        className={`group rounded-xl border p-4.5 flex items-start gap-3.5 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden bg-white ${
          selectedProduct === 'all'
            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {selectedProduct === 'all' ? 'Total Organization Spend' : 'Filtered Spend'}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums mt-0.5 leading-tight font-sans">
            {fmt(metrics.totalCost)}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-500 font-sans">
            {isUp ? <ArrowUp className="h-3 w-3 text-red-500 stroke-[2.5]" /> : <ArrowDown className="h-3 w-3 text-emerald-500 stroke-[2.5]" />}
            <span className={isUp ? 'text-red-600' : 'text-emerald-600'}>{isUp ? '+' : ''}{metrics.avgChange.toFixed(1)}% vs previous</span>
          </div>
        </div>
      </div>

      {/* ── Card 2: Top Cost Driver ── */}
      <div className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md p-4.5 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Top Cost Driver</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-bold text-purple-600 tracking-tight tabular-nums leading-tight font-sans">
              {metrics.topDriver ? fmtCompact(metrics.topDriverCost) : '—'}
            </h3>
            {metrics.topDriver && (
              <span className="text-xs font-semibold text-slate-500 font-sans">
                {metrics.topDriverShare.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Sparkles className="h-3 w-3 text-purple-600 shrink-0" />
            <p className="text-xs text-slate-700 font-medium truncate">
              {metrics.topDriver?.name ?? 'No products'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Card 3: Allocation Coverage Rate ── */}
      <div className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md p-4.5 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Allocation Coverage</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums leading-tight font-sans">
              {metrics.allocationRate.toFixed(1)}%
            </h3>
            <span className={`text-[11px] font-semibold font-sans ${coverageColor.text}`}>
              {coverageColor.label}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${coverageColor.bar}`}
              style={{ width: `${Math.min(metrics.allocationRate, 100)}%` }}
            />
          </div>
          {metrics.unallocatedCost > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-600 font-medium truncate font-sans">
                {fmtCompact(metrics.unallocatedCost)} unallocated
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Card 4: Active Products & Portfolios ── */}
      <div className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md p-4.5 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
          <Boxes className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Products</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums leading-tight font-sans">
              {metrics.activeProducts.length}
            </h3>
            <span className="text-xs font-medium text-slate-500">products</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            across{' '}
            <span className="text-slate-800 font-semibold font-sans">
              {metrics.totalProviders} provider{metrics.totalProviders !== 1 ? 's' : ''}
            </span>
          </p>
          {/* Clickable mini product pills */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {metrics.activeProducts.slice(0, 5).map((p) => (
              <span
                key={p.id}
                onClick={(e) => { e.stopPropagation(); onProductClick(selectedProduct === p.id ? 'all' : p.id); }}
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium cursor-pointer transition-all border ${
                  selectedProduct === p.id
                    ? 'bg-purple-600 text-white font-semibold border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {p.name}
              </span>
            ))}
            {metrics.activeProducts.length > 5 && (
              <span className="text-[10px] text-slate-400 font-medium font-sans">
                +{metrics.activeProducts.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Card 5: Forecasted Run Rate ── */}
      <div className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md p-4.5 flex items-start gap-3.5 transition-all duration-200 shadow-sm relative overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 relative z-10">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Forecasted Run Rate</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums leading-tight font-sans">
              {fmtCompact(metrics.totalDailyAvg)}
            </h3>
            <span className="text-xs font-medium text-slate-500">/ day</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Month-end est.{' '}
            <span className="text-slate-800 font-semibold font-sans">
              {fmtCompact(metrics.monthEndForecast)}
            </span>
          </p>
          {/* Monthly day progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-700"
                style={{ width: `${Math.min(metrics.dayProgress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 tabular-nums font-sans">
              Day {metrics.currentDay}/{metrics.daysInMonth}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

