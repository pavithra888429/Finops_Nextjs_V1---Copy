import React from 'react';
import { BarChart3, Box, MapPin, Building2, ArrowUp } from 'lucide-react';

interface DetailKpisProps {
  totalCost?: number;
  periodChange?: number;
  dailyAvg?: number;
  topService?: string;
  topServiceCost?: number;
  topServiceShare?: number;
  topRegion?: string;
  topRegionCost?: number;
  topRegionShare?: number;
  topAccount?: string;
  topAccountCost?: number;
  topAccountShare?: number;
  resourceCoverage?: number;
}

export function DetailKpis({
  totalCost = 8049.40,
  periodChange = 13.5,
  dailyAvg = 268.31,
  topService = 'Amazon EKS',
  topServiceCost = 3420.80,
  topServiceShare = 42.5,
  topRegion = 'us-east-1',
  topRegionCost = 4820.20,
  topRegionShare = 59.9,
  topAccount = 'Workbench Production',
  topAccountCost = 5860.40,
  topAccountShare = 72.8,
  resourceCoverage = 86.4,
}: DetailKpisProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

  // Circular gauge calculations (40px x 40px to match all other icon boxes exactly)
  const size = 40;
  const stroke = 3.5;
  const radius = size / 2;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (resourceCoverage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {/* 1. AWS Cost */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141824] border border-amber-500/30 text-amber-500 shadow-sm">
          <span className="font-bold text-[11px] tracking-tight">aws</span>
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">AWS cost</p>
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

      {/* 3. Top Service */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
          <Box className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Top service</p>
          <h4 className="text-[13px] font-bold text-white tracking-tight truncate mt-0.5" title={topService}>
            {topService}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] truncate">
            <span className="font-bold text-white tabular-nums">{format(topServiceCost)}</span>
            <span className="text-slate-400 font-normal">({topServiceShare}%)</span>
          </div>
        </div>
      </div>

      {/* 4. Top Region */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Top region</p>
          <h4 className="text-[13px] font-bold text-white tracking-tight truncate mt-0.5" title={topRegion}>
            {topRegion}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] truncate">
            <span className="font-bold text-white tabular-nums">{format(topRegionCost)}</span>
            <span className="text-slate-400 font-normal">({topRegionShare}%)</span>
          </div>
        </div>
      </div>

      {/* 5. Top Account */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30 shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Top account</p>
          <h4 className="text-[13px] font-bold text-white tracking-tight truncate mt-0.5" title={topAccount}>
            {topAccount}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] truncate">
            <span className="font-bold text-white tabular-nums">{format(topAccountCost)}</span>
            <span className="text-slate-400 font-normal">({topAccountShare}%)</span>
          </div>
        </div>
      </div>

      {/* 6. Resource Coverage Circular Ring */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 px-3.5 py-3 flex items-center gap-3 shadow-sm hover:border-dark-borderHover transition-all min-h-[86px]">
        {/* SVG Circle Gauge - exactly 40x40 to align with all other cards */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <svg height={size} width={size} className="rotate-[-90deg]">
            <circle
              stroke="#1a273b"
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
          <span className="absolute text-[9px] font-bold text-emerald-400 tabular-nums">{resourceCoverage}%</span>
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-medium text-slate-400 truncate">Resource coverage</p>
          <h3 className="text-base font-bold text-white tracking-tight tabular-nums truncate mt-0.5">
            {resourceCoverage}%
          </h3>
          <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5">Direct & tagged</p>
        </div>
      </div>
    </div>
  );
}
