import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Layers, Box, AlertTriangle, Sparkles } from 'lucide-react';

interface DetailHeaderProps {
  productId: string;
  productName: string;
  providerId: string;
  providerName: string;
  onBack?: () => void;
}

export function DetailHeader({
  productId,
  productName,
  providerId,
  providerName,
  onBack,
}: DetailHeaderProps) {
  const getProductIcon = () => {
    if (productId === 'all') return <Layers className="h-4 w-4 text-white" />;
    if (productId === 'agent_builder') return <Sparkles className="h-4 w-4 text-white" />;
    if (productId === 'unallocated') return <AlertTriangle className="h-4 w-4 text-gray-300" />;
    if (productId === 'dragon') return <Layers className="h-4 w-4 text-white" />;
    if (productId === 'okrian') return <Box className="h-4 w-4 text-white" />;
    if (productId === 'workbench') return <Monitor className="h-4 w-4 text-white" />;
    return <Layers className="h-4 w-4 text-white" />;
  };

  return (
    <div className="space-y-3 w-full">
      {/* Top Bar: Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          {onBack ? (
            <button onClick={onBack} className="hover:text-purple-600 transition-colors">
              FinOps Analytics
            </button>
          ) : (
            <Link href="/cost-allocation" className="hover:text-purple-600 transition-colors">
              FinOps Analytics
            </Link>
          )}
          <span className="text-slate-300">/</span>
          {onBack ? (
            <button onClick={onBack} className="hover:text-purple-600 transition-colors">
              Product Cost Allocation
            </button>
          ) : (
            <Link href="/cost-allocation" className="hover:text-purple-600 transition-colors">
              Product Cost Allocation
            </Link>
          )}
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium">{productName}</span>
          <span className="text-slate-300">/</span>
          <span className="text-purple-600 font-bold">{providerName}</span>
        </div>
      </div>

      {/* Main Title Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex flex-col gap-2">
          {/* Back button */}
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors w-fit border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Cost Allocation</span>
            </button>
          ) : (
            <Link
              href="/cost-allocation"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors w-fit border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Cost Allocation</span>
            </Link>
          )}

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {productName} · {providerName} Analytics
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-normal">
              Detailed {providerName} cost and usage attributed to {productName}
            </p>
          </div>
        </div>

        {/* Right Product & Provider Badges */}
        <div className="flex items-center gap-3">
          {/* Product Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
              {getProductIcon()}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{productName}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">Product</p>
            </div>
          </div>

          {/* Provider Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              {providerId === 'aws' ? (
                <span className="font-bold text-[11px] tracking-tight text-amber-600">aws</span>
              ) : providerId === 'gemini' ? (
                <Sparkles className="h-4 w-4 text-purple-600" />
              ) : (
                <span className="font-sans font-bold text-xs text-blue-600">&lt;</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{providerName}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">Provider</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
