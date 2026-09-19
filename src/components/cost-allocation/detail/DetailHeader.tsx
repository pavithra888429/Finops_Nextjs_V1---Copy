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
    if (productId === 'dragon') return <Layers className="h-4 w-4 text-white" />;
    if (productId === 'okrian') return <Box className="h-4 w-4 text-white" />;
    if (productId === 'workbench') return <Monitor className="h-4 w-4 text-white" />;
    return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  };

  const getProductBg = () => {
    if (productId === 'dragon') return 'bg-[#6b21a8]';
    if (productId === 'okrian') return 'bg-[#047857]';
    if (productId === 'workbench') return 'bg-[#1d4ed8]';
    return 'bg-[#78350f]';
  };

  return (
    <div className="space-y-3 w-full">
      {/* Top Bar: Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          {onBack ? (
            <button onClick={onBack} className="hover:text-slate-200 transition-colors">
              FinOps Analytics
            </button>
          ) : (
            <Link href="/cost-allocation" className="hover:text-slate-200 transition-colors">
              FinOps Analytics
            </Link>
          )}
          <span className="text-slate-600">/</span>
          {onBack ? (
            <button onClick={onBack} className="hover:text-slate-200 transition-colors">
              Product Cost Allocation
            </button>
          ) : (
            <Link href="/cost-allocation" className="hover:text-slate-200 transition-colors">
              Product Cost Allocation
            </Link>
          )}
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-medium">{productName}</span>
          <span className="text-slate-600">/</span>
          <span className="text-blue-400 font-medium">{providerName}</span>
        </div>
      </div>

      {/* Main Title Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex flex-col gap-2">
          {/* Back button */}
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-400 hover:text-white transition-colors w-fit border border-dark-border rounded-lg px-2.5 py-1 bg-dark-card/60 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Product Cost Allocation</span>
            </button>
          ) : (
            <Link
              href="/cost-allocation"
              className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-400 hover:text-white transition-colors w-fit border border-dark-border rounded-lg px-2.5 py-1 bg-dark-card/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Product Cost Allocation</span>
            </Link>
          )}

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              {productName} · {providerName} Analytics
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-400 font-normal">
              Detailed {providerName} cost and usage attributed to {productName}
            </p>
          </div>
        </div>

        {/* Right Product & Provider Badges */}
        <div className="flex items-center gap-3">
          {/* Product Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-dark-border bg-dark-card/90 shadow-sm">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${getProductBg()} shadow-sm`}>
              {getProductIcon()}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white leading-tight">{productName}</p>
              <p className="text-[10px] text-slate-400 leading-tight">Product</p>
            </div>
          </div>

          {/* Provider Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-dark-border bg-dark-card/90 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] border border-amber-500/30 text-amber-500 shadow-sm">
              {providerId === 'aws' ? (
                <span className="font-bold text-[11px] tracking-tight">aws</span>
              ) : providerId === 'gemini' ? (
                <Sparkles className="h-4 w-4 text-blue-400" />
              ) : (
                <span className="font-mono text-xs text-purple-400">&lt;</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white leading-tight">{providerName}</p>
              <p className="text-[10px] text-slate-400 leading-tight">Provider</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
