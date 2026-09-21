import React from 'react';
import { Calendar, ChevronDown, SlidersHorizontal, RotateCcw, RotateCw, X, Key, Cpu } from 'lucide-react';

interface OpenRouterFiltersProps {
  productName: string;
  providerName: string;
  dateRange: string;
  setDateRange: (v: string) => void;
  comparePeriod: string;
  setComparePeriod: (v: string) => void;
  environment: string;
  setEnvironment: (v: string) => void;
  selectedKey: string;
  setSelectedKey: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
  groupBy: string;
  setGroupBy: (v: string) => void;
  availableKeys?: Array<{ name: string; label: string; usage: number }>;
  onResetFilters: () => void;
  onRemoveProduct?: () => void;
  onRemoveProvider?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function OpenRouterFilters({
  productName,
  providerName,
  dateRange,
  setDateRange,
  comparePeriod,
  setComparePeriod,
  environment,
  setEnvironment,
  selectedKey,
  setSelectedKey,
  selectedModel,
  setSelectedModel,
  groupBy,
  setGroupBy,
  availableKeys = [],
  onResetFilters,
  onRemoveProduct,
  onRemoveProvider,
  onSync,
  isSyncing = false,
}: OpenRouterFiltersProps) {
  const defaultKeys = [
    { name: 'Prod API KEy chatbot', label: 'sk-or-v1-07f...d0e' },
    { name: 'PF7-DT-01', label: 'sk-or-v1-620...703' },
    { name: 'Code-Migration', label: 'sk-or-v1-34a...ee1' },
    { name: 'COE ', label: 'sk-or-v1-a0b...88a' },
    { name: 'Dev Key 1', label: 'sk-or-v1-710...fc0' },
    { name: 'PF 1 - Aug 01', label: 'sk-or-v1-761...4c6' },
  ];

  const keysToUse = availableKeys.length > 0 ? availableKeys : defaultKeys;

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
              <option value="last1y">Past 1 Year</option>
              <option value="today">Today</option>
            </select>
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
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
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="prev30">Previous 30 days</option>
              <option value="prevYear">Previous year</option>
              <option value="none">No comparison</option>
            </select>
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

        {/* OpenRouter Account / Key */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">OpenRouter account</span>
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">All accounts</option>
              {keysToUse.map((k) => (
                <option key={k.name} value={k.name}>
                  {k.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Service / Model */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Service</span>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="all">All services</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-3-flash">Gemini 3 Flash Preview</option>
              <option value="gemini-embedding">Gemini Embedding 001</option>
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
              <option value="account">Account</option>
              <option value="app">Application</option>
              <option value="usageType">Usage type</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons matching AWS DetailFilters */}
        <div className="flex items-center gap-2 self-end mb-0.5 ml-auto">
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-blue-500/30 bg-blue-600/10 text-xs text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync Latest OpenRouter Telemetry"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          <button className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-dark-border bg-dark-card/90 text-xs text-slate-300 hover:border-dark-borderHover transition-colors cursor-pointer">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>More filters</span>
          </button>

          <button
            onClick={onResetFilters}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-dark-border bg-dark-card/90 text-xs text-blue-400 hover:border-blue-500/40 hover:bg-blue-600/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      </div>

      {/* Row 2: Active Filter Chips matching AWS DetailFilters */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Product Chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>
            Product: <strong className="text-white font-medium">{productName}</strong>
          </span>
          {onRemoveProduct && (
            <button
              onClick={onRemoveProduct}
              title="Clear product filter"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Provider Chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>
            Provider: <strong className="text-white font-medium">{providerName}</strong>
          </span>
          {onRemoveProvider && (
            <button
              onClick={onRemoveProvider}
              title="Clear provider filter"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Key Chip if filtered */}
        {selectedKey !== 'all' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
            <span>
              Account: <strong className="text-white font-medium">{selectedKey}</strong>
            </span>
            <button
              onClick={() => setSelectedKey('all')}
              title="Clear account filter"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Service / Model Chip if filtered */}
        {selectedModel !== 'all' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
            <span>
              Service: <strong className="text-white font-medium">{selectedModel}</strong>
            </span>
            <button
              onClick={() => setSelectedModel('all')}
              title="Clear service filter"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Environment Chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>
            Environment: <strong className="text-white font-medium capitalize">{environment}</strong>
          </span>
          <button
            onClick={() => setEnvironment('all')}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Date Range Chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>
            Date: <strong className="text-white font-medium">Last 30 days</strong>
          </span>
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
