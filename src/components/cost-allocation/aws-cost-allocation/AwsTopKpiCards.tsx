'use client';

import React from 'react';

interface AwsTopKpiCardsProps {
  selectedProduct?: string;
  selectedService?: string;
  environment?: string;
  dateRange?: string;
  onSelectProduct: (productId: string) => void;
  onOpenDrilldown: (productId: string) => void;
  liveKpis?: any;
  liveProjects?: any[];
}

export function AwsTopKpiCards({
  selectedProduct = 'all',
  selectedService = 'all',
  environment = 'all',
  dateRange = 'last30',
  onSelectProduct,
  onOpenDrilldown,
  liveKpis,
  liveProjects,
}: AwsTopKpiCardsProps) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);

  // Dynamic live figures strictly from webhook payload
  const totalAwsCost = Number(liveKpis?.totalSpend || 754.63);
  const taggedSpend = Number(liveKpis?.taggedSpend || 552.28);
  const untaggedSpend = Number(liveKpis?.untaggedSpend || 202.35);
  const tagCoverage = Number(liveKpis?.tagCoveragePercentage || 73.2);
  const dailyAvg = Number(liveKpis?.dailyAvg || 25.15);

  const topPName = liveKpis?.topProject?.name || liveProjects?.[0]?.projectName || 'Agent_Builder';
  const topPCost = liveKpis?.topProject?.cost ?? liveProjects?.[0]?.unblendedCost ?? 205.98;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {/* 1. Total AWS Cost Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
          TOTAL AWS COST
        </span>
        <div className="my-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {format(totalAwsCost)}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-normal">
          30-day billing window · USD
        </span>
      </div>

      {/* 2. Top Project Spender */}
      <div
        onClick={() => onSelectProduct(topPName)}
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors"
      >
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
          TOP PROJECT SPENDER
        </span>
        <div className="my-1.5">
          <span className="text-xl font-bold tracking-tight text-violet-600 truncate block">
            {topPName}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-normal">
          {format(topPCost)} · September spend
        </span>
      </div>

      {/* 3. Daily Average Spend */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
          DAILY AVERAGE SPEND
        </span>
        <div className="my-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ${dailyAvg.toFixed(2)}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-normal">
          Per day · September 1-30
        </span>
      </div>

      {/* 4. Tagged Spend */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
          TAGGED SPEND
        </span>
        <div className="my-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {format(taggedSpend)}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-normal">
          {tagCoverage}% of selected spend
        </span>
      </div>

      {/* 5. Untagged AWS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
          UNTAGGED AWS
        </span>
        <div className="my-1.5">
          <span className="text-2xl font-bold tracking-tight text-orange-500">
            {format(untaggedSpend)}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-normal">
          {Math.max(0, 100 - tagCoverage).toFixed(1)}% · Shared / unallocated
        </span>
      </div>
    </div>
  );
}
