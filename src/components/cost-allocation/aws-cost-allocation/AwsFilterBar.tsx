'use client';

import React, { useMemo } from 'react';
import {
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

export interface FilterState {
  dateRange: string;
  comparison: string;
  provider: string;
  product: string;
  environment?: string;
  account?: string;
  region?: string;
  service: string;
  groupBy?: string;
  usageType?: string;
  operation?: string;
  resourceId?: string;
  instanceType?: string;
  purchaseOption?: string;
  availabilityZone?: string;
  awsTag?: string;
  chargeType?: string;
}

interface AwsFilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onRemoveProvider?: () => void;
  onRemoveProduct?: () => void;
  availableProducts?: string[];
  availableServices?: string[];
  availableMonths?: string[];
  billingPeriod?: string;
}

export function AwsFilterBar({
  filters,
  onFilterChange,
  onReset,
  onRemoveProvider,
  onRemoveProduct,
  availableProducts,
  availableServices,
  availableMonths,
  billingPeriod,
}: AwsFilterBarProps) {
  // Dynamically derive available months without hardcoding
  const dynamicMonths = useMemo(() => {
    const monthMap = new Map<string, string>();
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

    if (availableMonths && availableMonths.length > 0) {
      availableMonths.forEach((mStr) => {
        const match = mStr.match(/^(\d{4})-(\d{2})/);
        if (match) {
          const yr = parseInt(match[1], 10);
          const mo = parseInt(match[2], 10);
          const d = new Date(yr, mo - 1, 1);
          const yyyymm = `${yr}-${String(mo).padStart(2, '0')}`;
          monthMap.set(yyyymm, formatter.format(d));
        }
      });
    }

    if (billingPeriod) {
      const match = billingPeriod.match(/^(\d{4})-(\d{2})/);
      if (match) {
        const yr = parseInt(match[1], 10);
        const mo = parseInt(match[2], 10);
        const d = new Date(yr, mo - 1, 1);
        const yyyymm = `${yr}-${String(mo).padStart(2, '0')}`;
        monthMap.set(yyyymm, formatter.format(d));
      }
    }

    if (filters.dateRange && /^\d{4}-\d{2}$/.test(filters.dateRange)) {
      const [y, m] = filters.dateRange.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      monthMap.set(filters.dateRange, formatter.format(d));
    }

    let anchorYear = new Date().getFullYear();
    let anchorMonth = new Date().getMonth();

    const keys = Array.from(monthMap.keys()).sort();
    if (keys.length > 0) {
      const latestKey = keys[keys.length - 1];
      const [y, m] = latestKey.split('-').map(Number);
      if (y > anchorYear || (y === anchorYear && m - 1 > anchorMonth)) {
        anchorYear = y;
        anchorMonth = m - 1;
      }
    }

    for (let i = 0; i < 12; i++) {
      const d = new Date(anchorYear, anchorMonth - i, 1);
      const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(yyyymm)) {
        monthMap.set(yyyymm, formatter.format(d));
      }
    }

    return Array.from(monthMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [availableMonths, billingPeriod, filters.dateRange]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center justify-between flex-wrap gap-3">
      {/* Left Filter Dropdowns */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Month Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300 transition-colors">
          <span className="text-slate-400">Month:</span>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer pr-1"
          >
            {dynamicMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Provider Tag matching Screenshot */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700">
          <span className="text-slate-400">Provider:</span>
          <span className="font-semibold text-cyan-600">AWS</span>
        </div>

        {/* Product Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300 transition-colors">
          <span className="text-slate-400">Product:</span>
          <select
            value={filters.product}
            onChange={(e) => onFilterChange('product', e.target.value)}
            className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer pr-1"
          >
            <option value="all">All products</option>
            {availableProducts && availableProducts.length > 0 ? (
              availableProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))
            ) : null}
          </select>
        </div>

        {/* AWS Service Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300 transition-colors">
          <span className="text-slate-400">Service:</span>
          <select
            value={filters.service}
            onChange={(e) => onFilterChange('service', e.target.value)}
            className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer pr-1"
          >
            <option value="all">All AWS services</option>
            {availableServices && availableServices.length > 0 ? (
              availableServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))
            ) : null}
          </select>
        </div>
      </div>

      {/* Right: Reset filters */}
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
        title="Reset filters"
      >
        <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
        <span>Reset filters</span>
      </button>
    </div>
  );
}
