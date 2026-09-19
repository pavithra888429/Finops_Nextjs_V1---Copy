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
  return (
    <div className="space-y-2.5 w-full">
      {/* Row 1: Dropdown Selects */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Date Range */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Date range</span>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-8 appearance-none pl-8 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="last30">Last 30 days</option>
              <option value="last7">Last 7 days</option>
              <option value="last90">Last 90 days</option>
              <option value="ytd">Year to date</option>
            </select>
            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Comparison Period */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Comparison period</span>
          <div className="relative">
            <select
              value={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.value)}
              className="h-8 appearance-none pl-8 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="prev30">Previous 30 days</option>
              <option value="prevPeriod">Previous period</option>
              <option value="samePeriodLastYear">Same period last year</option>
            </select>
            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Environment */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Environment</span>
          <div className="relative">
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="all">All environments</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* AWS Account */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">AWS account</span>
          <div className="relative">
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="all">All accounts</option>
              <option value="prod">Workbench Production (864981730114)</option>
              <option value="staging">Workbench Staging</option>
              <option value="dev">Workbench Dev</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Region</span>
          <div className="relative">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="all">All regions</option>
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
              <option value="ap-south-1">ap-south-1 (Mumbai)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Service */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Service</span>
          <div className="relative">
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="all">All services</option>
              <option value="eks">Amazon EKS</option>
              <option value="ec2">Amazon EC2</option>
              <option value="rds">Amazon RDS</option>
              <option value="s3">Amazon S3</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Group by */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Group by</span>
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="service">Service</option>
              <option value="region">Region</option>
              <option value="account">Account</option>
              <option value="usageType">Usage type</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end mb-0.5">
          <button className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-dark-border bg-dark-card/90 text-xs text-slate-300 hover:border-dark-borderHover transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>More filters</span>
          </button>

          <button
            onClick={onResetFilters}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-dark-border bg-dark-card/90 text-xs text-blue-400 hover:border-blue-500/40 hover:bg-blue-600/10 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      </div>

      {/* Row 2: Active Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>Product: <strong className="text-white font-medium">{productName}</strong></span>
          <button
            onClick={onRemoveProduct}
            title="Clear product filter"
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>Provider: <strong className="text-white font-medium">{providerName}</strong></span>
          <button
            onClick={onRemoveProvider}
            title="Clear provider filter"
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>Environment: <strong className="text-white font-medium capitalize">{environment}</strong></span>
          <button
            onClick={() => setEnvironment('all')}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>Date: <strong className="text-white font-medium">Last 30 days</strong></span>
          <button
            onClick={() => setDateRange('last30')}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
