import React from 'react';
import { BarChart3, Box, MapPin, Building2, ArrowUp, Zap } from 'lucide-react';

interface OpenRouterDetailKpisProps {
  totalCost?: number;
  periodChange?: number;
  dailyAvg?: number;
  topModel?: string;
  topModelCost?: number;
  topModelShare?: number;
  tokenVolume?: string;
  promptTokens?: string;
  topKey?: string;
  topKeyCost?: number;
  topKeyShare?: number;
  cacheHitRate?: number;
  blendedRate?: string;
}

export function OpenRouterDetailKpis({
  totalCost = 26.35,
  periodChange = 14.2,
  dailyAvg = 0.88,
  topModel = 'Gemini 2.0 Flash',
  topModelCost = 14.23,
  topModelShare = 54.0,
  tokenVolume = '58.2M',
  promptTokens = '46.9M prompt',
  topKey = 'PF7-DT-01',
  topKeyCost = 6.41,
  topKeyShare = 24.3,
  cacheHitRate = 91.5,
  blendedRate = '$0.45 / 1M',
}: OpenRouterDetailKpisProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);

  // Circular gauge calculations (40px x 40px to match all other icon boxes exactly)
  const size = 40;
  const stroke = 3.5;
  const radius = size / 2;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (cacheHitRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {/* 1. OpenRouter Cost */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141824] border border-amber-500/30 text-amber-500 shadow-sm">
          <span className="font-mono font-bold text-[11px] tracking-tight">&lt;/&gt;</span>
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">OpenRouter cost</p>
          <h3 className="text-base font-bold text-white tracking-tight tabular-nums truncate mt-0.5">
            {format(totalCost)}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-[10.5px] font-semibold text-emerald-400 whitespace-nowrap truncate">
            <ArrowUp className="h-3 w-3 stroke-[2.5] shrink-0" />
            <span>+{periodChange}% vs prev period</span>
          </div>
        </div>
      </div>

      {/* 2. Daily Average */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Daily average</p>
          <h3 className="text-base font-bold text-white tracking-tight tabular-nums truncate mt-0.5">
            {format(dailyAvg)}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5">Based on 30 days active</p>
        </div>
      </div>

      {/* 3. Top Service (Model) */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#452b0f]/30 border border-amber-500/30 text-amber-400 shadow-sm">
          <Box className="h-5 w-5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Top service</p>
          <h3 className="text-sm font-bold text-white tracking-tight truncate mt-0.5" title={topModel}>
            {topModel}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5 tabular-nums">
            {format(topModelCost)} ({topModelShare}%)
          </p>
        </div>
      </div>

      {/* 4. Top Region / Token Volume */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Token volume</p>
          <h3 className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
            {tokenVolume}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5 tabular-nums">
            {promptTokens}
          </p>
        </div>
      </div>

      {/* 5. Top Account */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Top account</p>
          <h3 className="text-sm font-bold text-white tracking-tight truncate mt-0.5" title={topKey}>
            {topKey}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5 tabular-nums">
            {format(topKeyCost)} ({topKeyShare}%)
          </p>
        </div>
      </div>

      {/* 6. Resource Coverage / Cache Ring Gauge */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <svg height={size} width={size} className="-rotate-90">
            <circle
              stroke="rgba(255, 255, 255, 0.08)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="#10b981"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-emerald-400 tabular-nums">
            {cacheHitRate.toFixed(1)}%
          </span>
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Resource coverage</p>
          <h3 className="text-base font-bold text-white tracking-tight tabular-nums truncate mt-0.5">
            {cacheHitRate}%
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5">Direct & tagged</p>
        </div>
      </div>
    </div>
  );
}
