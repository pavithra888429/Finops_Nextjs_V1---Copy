import React from 'react';
import { Layers, Box, Monitor, AlertTriangle, ArrowUp } from 'lucide-react';
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
  // Helper to format currency
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  // Calculate provider cost for each product
  const getProductCost = (p: ProductAllocationRecord) => {
    if (selectedProvider === 'gemini') return p.gemini;
    if (selectedProvider === 'openrouter') return p.openrouter;
    if (selectedProvider === 'aws') return p.aws;
    return p.total;
  };

  // Total organization cost:
  // If a product is selected, show that product's cost (or sum of all matching)
  const totalCost = products.reduce((sum, p) => sum + getProductCost(p), 0);

  const dragon = products.find((p) => p.id === 'dragon');
  const okrian = products.find((p) => p.id === 'okrian');
  const workbench = products.find((p) => p.id === 'workbench');
  const unallocated = products.find((p) => p.id === 'unallocated');

  const dragonCost = dragon ? getProductCost(dragon) : 0;
  const okrianCost = okrian ? getProductCost(okrian) : 0;
  const workbenchCost = workbench ? getProductCost(workbench) : 0;
  const unallocatedCost = unallocated ? getProductCost(unallocated) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {/* 1. Total Organization Cost */}
      <div
        onClick={() => onProductClick('all')}
        className={`rounded-xl border p-3.5 sm:p-4 flex items-center gap-3.5 transition-all cursor-pointer shadow-sm ${
          selectedProduct === 'all'
            ? 'border-blue-500/60 bg-blue-950/20'
            : 'border-dark-border bg-dark-card/90 hover:border-dark-borderHover'
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0284c7]/20 border border-[#0284c7]/40 text-[#38bdf8]">
          <span className="text-xl font-bold font-sans leading-none">{currencySymbol}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-400 truncate">
            {selectedProduct === 'all' ? 'Total organization cost' : 'Filtered total cost'}
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight tabular-nums mt-0.5">
            {format(totalCost)}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-[10.5px] font-semibold text-emerald-400">
            <ArrowUp className="h-3 w-3 stroke-[2.5]" />
            <span>+12.4% vs previous period</span>
          </div>
        </div>
      </div>

      {/* 2. Dragon Suite */}
      <div
        onClick={() => onProductClick(selectedProduct === 'dragon' ? 'all' : 'dragon')}
        className={`rounded-xl border p-3.5 sm:p-4 flex items-center gap-3.5 transition-all cursor-pointer shadow-sm ${
          selectedProduct === 'dragon'
            ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50'
            : selectedProduct !== 'all'
            ? 'border-dark-border/60 bg-dark-card/50 opacity-50 hover:opacity-100'
            : 'border-dark-border bg-dark-card/90 hover:border-dark-borderHover'
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6b21a8] text-white shadow-md">
          <Layers className="h-5 w-5 fill-white/20" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-400 truncate">Dragon Suite</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight tabular-nums">
              {format(dragonCost)}
            </h3>
            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-emerald-400">
              <ArrowUp className="h-3 w-3 stroke-[2.5]" />
              <span>+14.2%</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            {totalCost > 0 ? `${((dragonCost / totalCost) * 100).toFixed(1)}% of total cost` : '45.6% of total cost'}
          </p>
        </div>
      </div>

      {/* 3. Okrian */}
      <div
        onClick={() => onProductClick(selectedProduct === 'okrian' ? 'all' : 'okrian')}
        className={`rounded-xl border p-3.5 sm:p-4 flex items-center gap-3.5 transition-all cursor-pointer shadow-sm ${
          selectedProduct === 'okrian'
            ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50'
            : selectedProduct !== 'all'
            ? 'border-dark-border/60 bg-dark-card/50 opacity-50 hover:opacity-100'
            : 'border-dark-border bg-dark-card/90 hover:border-dark-borderHover'
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#047857] text-white shadow-md">
          <Box className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-400 truncate">Okrian</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight tabular-nums">
              {format(okrianCost)}
            </h3>
            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-emerald-400">
              <ArrowUp className="h-3 w-3 stroke-[2.5]" />
              <span>+9.8%</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            {totalCost > 0 ? `${((okrianCost / totalCost) * 100).toFixed(1)}% of total cost` : '30.1% of total cost'}
          </p>
        </div>
      </div>

      {/* 4. Workbench */}
      <div
        onClick={() => onProductClick(selectedProduct === 'workbench' ? 'all' : 'workbench')}
        className={`rounded-xl border p-3.5 sm:p-4 flex items-center gap-3.5 transition-all cursor-pointer shadow-sm ${
          selectedProduct === 'workbench'
            ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50'
            : selectedProduct !== 'all'
            ? 'border-dark-border/60 bg-dark-card/50 opacity-50 hover:opacity-100'
            : 'border-dark-border bg-dark-card/90 hover:border-dark-borderHover'
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8] text-white shadow-md">
          <Monitor className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-400 truncate">Workbench</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight tabular-nums">
              {format(workbenchCost)}
            </h3>
            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-emerald-400">
              <ArrowUp className="h-3 w-3 stroke-[2.5]" />
              <span>+11.5%</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            {totalCost > 0 ? `${((workbenchCost / totalCost) * 100).toFixed(1)}% of total cost` : '24.3% of total cost'}
          </p>
        </div>
      </div>

      {/* 5. Unallocated cost */}
      <div
        onClick={() => onProductClick(selectedProduct === 'unallocated' ? 'all' : 'unallocated')}
        className={`rounded-xl border p-3.5 sm:p-4 flex items-center gap-3.5 transition-all cursor-pointer shadow-sm ${
          selectedProduct === 'unallocated'
            ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/50'
            : selectedProduct !== 'all'
            ? 'border-dark-border/60 bg-dark-card/50 opacity-50 hover:opacity-100'
            : 'border-dark-border bg-dark-card/90 hover:border-dark-borderHover'
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#78350f]/70 border border-amber-600/30 text-amber-500 shadow-md">
          <AlertTriangle className="h-5 w-5 fill-amber-500/15" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-400 truncate">Unallocated cost</p>
          <h3 className="text-lg sm:text-xl font-bold text-amber-500 tracking-tight tabular-nums mt-0.5">
            {format(unallocatedCost)}
          </h3>
          <p className="text-[11px] text-amber-500 font-normal mt-0.5">Requires product attribution</p>
        </div>
      </div>
    </div>
  );
}
