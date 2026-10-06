import React from 'react';
import { Calendar, ChevronDown, SlidersHorizontal, RotateCcw, X } from 'lucide-react';

interface DetailFiltersProps {
  productName: string;
  providerName: string;
  dateRange: string;
  setDateRange: (v: string) => void;
  comparePeriod: string;
  setComparePeriod: (v: string) => void;
  environment: string;
  setEnvironment: (v: string) => void;
  account: string;
  setAccount: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  service: string;
  setService: (v: string) => void;
  groupBy: string;
  setGroupBy: (v: string) => void;
  onResetFilters: () => void;
  onRemoveProduct?: () => void;
  onRemoveProvider?: () => void;
}

export function DetailFilters({
  productName,
  providerName,
  dateRange,
  setDateRange,
  comparePeriod,
  setComparePeriod,
  environment,
  setEnvironment,
  account,
  setAccount,
  region,
  setRegion,
  service,
  setService,
  groupBy,
  setGroupBy,
  onResetFilters,
  onRemoveProduct,
  onRemoveProvider,
}: DetailFiltersProps) {
  // Dynamically generate all 12 calendar months (Jan to Dec) without hardcoding
  const dynamicMonths = React.useMemo(() => {
    const targetYear = new Date().getFullYear();
    const months: { value: string; label: string }[] = [];
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

    for (let m = 0; m < 12; m++) {
      const d = new Date(targetYear, m, 1);
      const yyyymm = `${targetYear}-${String(m + 1).padStart(2, '0')}`;
      months.push({
        value: yyyymm,
        label: formatter.format(d),
      });
    }

    return months;
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full space-y-3">
      {/* Row 1: Dropdown Selects */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Date Range / Billing Month */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Billing Month</span>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-8.5 appearance-none pl-8 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer shadow-xs transition-all"
            >
              <option value="all">All Months (Lifetime)</option>
              {dynamicMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Comparison Period */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Comparison Period</span>
          <div className="relative">
            <select
              value={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer shadow-xs transition-all"
            >
              <option value="prevMonth">Previous month</option>
              <option value="prevYear">Same month last year</option>
              <option value="none">No comparison</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Environment */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Environment</span>
          <div className="relative">
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer shadow-xs transition-all"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="all">All environments</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* AWS Account */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500">AWS Account</span>
          <div className="relative">
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer shadow-xs transition-all"
            >
              <option value="all">All accounts</option>
              <option value="prod">Workbench Production (864981730114)</option>
              <option value="staging">Workbench Staging</option>
              <option value="dev">Workbench Dev</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Region</span>
          <div className="relative">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer shadow-xs transition-all"
            >
              <option value="all">All regions</option>
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
              <option value="ap-south-1">ap-south-1 (Mumbai)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Service */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Service</span>
          <div className="relative">
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer shadow-xs transition-all"
            >
              <option value="all">All services</option>
              <option value="eks">Amazon EKS</option>
              <option value="ec2">Amazon EC2</option>
              <option value="rds">Amazon RDS</option>
              <option value="s3">Amazon S3</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Group by */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500">Group By</span>
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer shadow-xs transition-all"
            >
              <option value="service">Service</option>
              <option value="region">Region</option>
              <option value="account">Account</option>
              <option value="usageType">Usage type</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end mb-0.5">
          <button className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>More filters</span>
          </button>

          <button
            onClick={onResetFilters}
            className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset filters</span>
          </button>
        </div>
      </div>

      {/* Row 2: Active Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-200/70 bg-purple-50 text-xs text-purple-700 font-medium shadow-2xs">
          <span>Product: <strong className="text-purple-900 font-bold">{productName}</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onRemoveProduct) {
                onRemoveProduct();
              } else if (typeof window !== 'undefined') {
                window.location.href = '/cost-allocation';
              }
            }}
            title="Clear product filter"
            className="p-0.5 rounded-full text-purple-500 hover:text-purple-800 hover:bg-purple-200/60 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Clear product filter"
          >
            <X className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-200/70 bg-purple-50 text-xs text-purple-700 font-medium shadow-2xs">
          <span>Provider: <strong className="text-purple-900 font-bold">{providerName}</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onRemoveProvider) {
                onRemoveProvider();
              } else if (typeof window !== 'undefined') {
                window.location.href = '/cost-allocation';
              }
            }}
            title="Clear provider filter"
            className="p-0.5 rounded-full text-purple-500 hover:text-purple-800 hover:bg-purple-200/60 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Clear provider filter"
          >
            <X className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-600 font-medium shadow-2xs">
          <span>Environment: <strong className="text-slate-900 font-bold capitalize">{environment}</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEnvironment('all');
            }}
            className="p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Clear environment filter"
          >
            <X className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-600 font-medium shadow-2xs">
          <span>Date: <strong className="text-slate-900 font-bold">Last 30 days</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDateRange('last30');
            }}
            className="p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Reset date filter"
          >
            <X className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
