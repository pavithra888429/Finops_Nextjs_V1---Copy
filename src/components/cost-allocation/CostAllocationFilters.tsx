import React from 'react';
import { Calendar, ChevronDown, Search, X } from 'lucide-react';

interface CostAllocationFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedProduct: string;
  onProductChange: (p: string) => void;
  selectedProvider: string;
  onProviderChange: (p: string) => void;
  selectedEnv: string;
  onEnvChange: (e: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (d: string) => void;
  compareRange: string;
  onCompareRangeChange: (c: string) => void;
  selectedCurrency: string;
  onCurrencyChange: (c: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function CostAllocationFilters({
  searchQuery,
  onSearchChange,
  selectedProduct,
  onProductChange,
  selectedProvider,
  onProviderChange,
  selectedEnv,
  onEnvChange,
  selectedDateRange,
  onDateRangeChange,
  compareRange,
  onCompareRangeChange,
  selectedCurrency,
  onCurrencyChange,
  onReset,
  hasActiveFilters,
}: CostAllocationFiltersProps) {
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
    <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
      {/* Left side: Filter dropdown controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Billing Month Selector */}
        <div className="relative">
          <select
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="h-8 appearance-none pl-8 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none transition-colors cursor-pointer"
          >
            <option value="all">All Months (Lifetime)</option>
            {dynamicMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Compare Period */}
        <div className="relative">
          <select
            value={compareRange}
            onChange={(e) => onCompareRangeChange(e.target.value)}
            className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none transition-colors cursor-pointer"
          >
            <option value="prevMonth">Previous month</option>
            <option value="prevYear">Same month last year</option>
            <option value="none">No comparison</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Product Filter */}
        <div className="relative">
          <select
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value)}
            className={`h-8 appearance-none pl-3 pr-7 rounded-lg border bg-dark-card/90 text-xs font-normal transition-colors cursor-pointer ${
              selectedProduct !== 'all'
                ? 'border-blue-500 text-white font-medium bg-blue-600/10'
                : 'border-dark-border text-slate-300 hover:border-dark-borderHover'
            }`}
          >
            <option value="all">All products</option>
            <option value="dragon">Dragon Suite</option>
            <option value="okrian">Okrian</option>
            <option value="workbench">Workbench</option>
            <option value="unallocated">Unallocated</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Provider Filter */}
        <div className="relative">
          <select
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className={`h-8 appearance-none pl-3 pr-7 rounded-lg border bg-dark-card/90 text-xs font-normal transition-colors cursor-pointer ${
              selectedProvider !== 'all'
                ? 'border-blue-500 text-white font-medium bg-blue-600/10'
                : 'border-dark-border text-slate-300 hover:border-dark-borderHover'
            }`}
          >
            <option value="all">All providers</option>
            <option value="gemini">Gemini</option>
            <option value="openrouter">OpenRouter</option>
            <option value="aws">AWS</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Environment Filter */}
        <div className="relative">
          <select
            value={selectedEnv}
            onChange={(e) => onEnvChange(e.target.value)}
            className={`h-8 appearance-none pl-3 pr-7 rounded-lg border bg-dark-card/90 text-xs font-normal transition-colors cursor-pointer ${
              selectedEnv !== 'production'
                ? 'border-blue-500 text-white font-medium bg-blue-600/10'
                : 'border-dark-border text-slate-300 hover:border-dark-borderHover'
            }`}
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Currency Filter */}
        <div className="relative">
          <select
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="h-8 appearance-none pl-3 pr-6 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none transition-colors cursor-pointer"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Reset Filter Button if active */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors"
            title="Reset to default filters"
          >
            <X className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Right side: Search Bar */}
      <div className="relative flex-1 min-w-[260px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search product, provider, model, or service..."
          className="h-8 w-full pl-8 pr-3 rounded-lg border border-dark-border bg-dark-card/90 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
