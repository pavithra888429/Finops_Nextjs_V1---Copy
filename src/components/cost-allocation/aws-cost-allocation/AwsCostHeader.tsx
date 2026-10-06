'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cloud,
  Layers,
  BookOpen,
} from 'lucide-react';

interface AwsCostHeaderProps {
  onRefresh?: () => void;
  onBack?: () => void;
  billingPeriodLabel?: string;
}

export function AwsCostHeader({ onRefresh, onBack, billingPeriodLabel = 'September 2026' }: AwsCostHeaderProps) {
  return (
    <div className="w-full space-y-3 pb-1">
      {/* Top Bar with Breadcrumbs */}
      <div className="flex items-center justify-between">
        {/* Breadcrumb matching Reference Image */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/cost-allocation" className="hover:text-slate-800 transition-colors">
            FinOps Analytics
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/cost-allocation" className="hover:text-slate-800 transition-colors">
            Cost Allocation
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-violet-600 font-semibold">AWS</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cost Allocation
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-normal">
          Product attribution and service-level spend - {billingPeriodLabel}
        </p>
      </div>
    </div>
  );
}
