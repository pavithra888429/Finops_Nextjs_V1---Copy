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
  availableProducts?: { id: string; name: string }[];
  availablePeriods?: string[];
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
  availableProducts,
  availablePeriods,
}: CostAllocationFiltersProps) {
  // Dynamically generate all 12 calendar months (Jan to Dec) or use available periods
  const dynamicMonths = React.useMemo(() => {
    if (availablePeriods && availablePeriods.length > 0) {
      return availablePeriods.map((p) => {
        const parts = p.split('-');
        const y = parts[0];
        const m = parseInt(parts[1] || '1', 10);
        const d = new Date(parseInt(y, 10), m - 1, 1);
        const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
        return { value: p, label };
      });
    }

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
  }, [availablePeriods]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
      {/* Left side: Filter dropdown controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Billing Month Selector */}
        <div className="relative">
          <select
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="h-8.5 appearance-none pl-8 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors cursor-pointer shadow-sm"
          >
            <option value="all">All Months (Lifetime)</option>
            {dynamicMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Compare Period */}
        <div className="relative">
          <select
            value={compareRange}
            onChange={(e) => onCompareRangeChange(e.target.value)}
            className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors cursor-pointer shadow-sm"
          >
            <option value="prevMonth">Previous month</option>
            <option value="prevYear">Same month last year</option>
            <option value="none">No comparison</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Product Filter */}
        <div className="relative">
          <select
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value)}
            className={`h-8.5 appearance-none pl-3 pr-7 rounded-lg border text-xs transition-colors cursor-pointer shadow-sm ${
              selectedProduct !== 'all'
                ? 'border-purple-300 bg-purple-50 text-purple-900 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <option value="all">All products</option>
            {availableProducts && availableProducts.length > 0 ? (
              Array.from(new Map(availableProducts.map((p) => [p.id, p])).values()).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            ) : null}
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Provider Filter */}
        <div className="relative">
          <select
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className={`h-8.5 appearance-none pl-3 pr-7 rounded-lg border text-xs transition-colors cursor-pointer shadow-sm ${
              selectedProvider !== 'all'
                ? 'border-purple-300 bg-purple-50 text-purple-900 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <option value="all">All providers</option>
            <option value="gemini">Gemini</option>
            <option value="openrouter">OpenRouter</option>
            <option value="aws">AWS</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Environment Filter */}
        <div className="relative">
          <select
            value={selectedEnv}
            onChange={(e) => onEnvChange(e.target.value)}
            className={`h-8.5 appearance-none pl-3 pr-7 rounded-lg border text-xs transition-colors cursor-pointer shadow-sm ${
              selectedEnv !== 'production'
                ? 'border-purple-300 bg-purple-50 text-purple-900 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Currency Filter */}
        <div className="relative">
          <select
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="h-8.5 appearance-none pl-3 pr-6 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors cursor-pointer shadow-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Reset Filter Button if active */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
            title="Reset to default filters"
          >
            <X className="h-3 w-3 text-slate-500" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Right side: Search Bar */}
      <div className="relative flex-1 min-w-[240px] max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, services..."
          className="h-8.5 w-full pl-8 pr-7 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
