import React, { useMemo } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal, RotateCcw, RotateCw, X, Key, Cpu } from 'lucide-react';

interface OpenRouterFiltersProps {
  productName: string;
  providerName: string;
  dateRange: string;
  setDateRange: (v: string) => void;
  comparePeriod: string;
  setComparePeriod: (v: string) => void;
  keyStatus?: string;
  setKeyStatus?: (v: string) => void;
  environment?: string;
  setEnvironment?: (v: string) => void;
  selectedKey: string;
  setSelectedKey: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
  groupBy: string;
  setGroupBy: (v: string) => void;
  availableKeys?: any[];
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
  keyStatus = 'all',
  setKeyStatus,
  environment = 'production',
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
  // Dynamically extract all unique months directly from the actual OpenRouter keys in MongoDB
  const dynamicMonths = useMemo(() => {
    const monthMap = new Map<string, string>();

    for (const key of availableKeys || []) {
      const rawDate = key.createdAt || key.created_at || key.date;
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          const yyyymm = d.toISOString().substring(0, 7); // e.g. "2026-09"
          const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // e.g. "September 2026"
          if (!monthMap.has(yyyymm)) {
            monthMap.set(yyyymm, label);
          }
        }
      }
    }

    return Array.from(monthMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([value, label]) => ({ value, label }));
  }, [availableKeys]);

  const activeDateLabel = useMemo(() => {
    if (dateRange === 'all') return 'All Months (Lifetime)';
    const found = dynamicMonths.find((m) => m.value === dateRange);
    return found ? found.label : dateRange;
  }, [dateRange, dynamicMonths]);

  const keyCounts = useMemo(() => {
    const list = availableKeys || [];
    const total = list.length;
    const active = list.filter((k: any) => (Number(k.usage) || 0) > 0).length;
    const standby = total - active;
    return { total, active, standby };
  }, [availableKeys]);

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
        {/* Month Selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Billing Month</span>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-8 appearance-none pl-8 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="all">All Months (Lifetime)</option>
              {dynamicMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
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
              <option value="prevMonth">Previous month</option>
              <option value="prevYear">Same month last year</option>
              <option value="none">No comparison</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Key Status (Active / Standby) */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">Key Status</span>
          <div className="relative">
            <select
              value={keyStatus}
              onChange={(e) => setKeyStatus && setKeyStatus(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer"
            >
              <option value="all">All Keys {keyCounts.total > 0 ? `(${keyCounts.total})` : ''}</option>
              <option value="active">Active Keys {keyCounts.total > 0 ? `(${keyCounts.active})` : ''}</option>
              <option value="standby">Standby Keys {keyCounts.total > 0 ? `(${keyCounts.standby})` : ''}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* OpenRouter API Key */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">API Key</span>
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">All API Keys</option>
              {keysToUse.map((k) => (
                <option key={k.name} value={k.name}>
                  {k.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* AI Model */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium text-slate-400">AI Model</span>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="h-8 appearance-none pl-3 pr-7 rounded-lg border border-dark-border bg-dark-card/90 text-xs font-normal text-slate-300 hover:border-dark-borderHover focus:outline-none cursor-pointer max-w-[190px] truncate"
            >
              <option value="all">All AI Models</option>
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
              <option value="google/gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="google/gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
              <option value="deepseek/deepseek-r1">DeepSeek R1</option>
              <option value="deepseek/deepseek-chat">DeepSeek V3</option>
              <option value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B</option>
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
              <option value="key">API Key</option>
              <option value="model">AI Model</option>
              <option value="provider">Model Provider</option>
              <option value="status">Key Status (Active/Standby)</option>
              <option value="month">Billing Month</option>
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
              API Key: <strong className="text-white font-medium">{selectedKey}</strong>
            </span>
            <button
              onClick={() => setSelectedKey('all')}
              title="Clear API key filter"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Model Chip if filtered */}
        {selectedModel !== 'all' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
            <span>
              Model: <strong className="text-white font-medium">{selectedModel}</strong>
            </span>
            <button
              onClick={() => setSelectedModel('all')}
              title="Clear model filter"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Key Status Chip */}
        {keyStatus !== 'all' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
            <span>
              Status: <strong className="text-white font-medium capitalize">{keyStatus === 'active' ? 'Active Keys' : 'Standby Keys'}</strong>
            </span>
            <button
              onClick={() => setKeyStatus && setKeyStatus('all')}
              title="Reset key status filter to All Keys"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Month Chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dark-border bg-dark-card/80 text-xs text-slate-300">
          <span>
            Month: <strong className="text-white font-medium">{activeDateLabel}</strong>
          </span>
          {dateRange !== 'all' && (
            <button
              onClick={() => setDateRange('all')}
              title="Reset month filter to All Months"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
