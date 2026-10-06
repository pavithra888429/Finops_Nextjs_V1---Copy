import React, { useMemo } from 'react';
import { ChevronDown, SlidersHorizontal, RotateCcw, RotateCw, X } from 'lucide-react';

interface OpenRouterFiltersProps {
  productName: string;
  providerName: string;
  dateRange?: string;
  setDateRange?: (v: string) => void;
  comparePeriod?: string;
  setComparePeriod?: (v: string) => void;
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
    <div className="space-y-3 w-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
      {/* Row 1: Dropdown Selects */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Key Status (Active / Standby) */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Key Status</span>
          <div className="relative">
            <select
              value={keyStatus}
              onChange={(e) => setKeyStatus && setKeyStatus(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="all">All Keys {keyCounts.total > 0 ? `(${keyCounts.total})` : ''}</option>
              <option value="active">Active Keys {keyCounts.total > 0 ? `(${keyCounts.active})` : ''}</option>
              <option value="standby">Standby Keys {keyCounts.total > 0 ? `(${keyCounts.standby})` : ''}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* OpenRouter API Key */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">API Key</span>
          <div className="relative">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer max-w-[200px] truncate shadow-sm"
            >
              <option value="all">All API Keys</option>
              {keysToUse.map((k) => (
                <option key={k.name} value={k.name}>
                  {k.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* AI Model */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Model</span>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer max-w-[190px] truncate shadow-sm"
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
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Group by */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Group by</span>
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="h-8.5 appearance-none pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="key">API Key</option>
              <option value="model">AI Model</option>
              <option value="provider">Model Provider</option>
              <option value="status">Key Status (Active/Standby)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end mb-0.5 ml-auto">
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              title="Sync Latest OpenRouter Telemetry"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          <button className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>More filters</span>
          </button>

          <button
            onClick={onResetFilters}
            className="h-8.5 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset filters</span>
          </button>
        </div>
      </div>

      {/* Row 2: Active Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        {/* Product Chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-purple-200 bg-purple-50 text-xs text-purple-900">
          <span>
            Product: <strong className="font-bold">{productName}</strong>
          </span>
          {onRemoveProduct && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onRemoveProduct) {
                  onRemoveProduct();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/cost-allocation';
                }
              }}
              title="Clear product filter"
              className="p-0.5 rounded-full text-purple-600 hover:text-purple-900 hover:bg-purple-100 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Clear product filter"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Provider Chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-xs text-blue-900">
          <span>
            Provider: <strong className="font-bold">{providerName}</strong>
          </span>
          {onRemoveProvider && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onRemoveProvider) {
                  onRemoveProvider();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/cost-allocation';
                }
              }}
              title="Clear provider filter"
              className="p-0.5 rounded-full text-blue-600 hover:text-blue-900 hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Clear provider filter"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Key Chip if filtered */}
        {selectedKey !== 'all' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-100 text-xs text-slate-800">
            <span>
              API Key: <strong className="font-bold">{selectedKey}</strong>
            </span>
            <button
              onClick={() => setSelectedKey('all')}
              title="Clear API key filter"
              className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Model Chip if filtered */}
        {selectedModel !== 'all' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-100 text-xs text-slate-800">
            <span>
              Model: <strong className="font-bold">{selectedModel}</strong>
            </span>
            <button
              onClick={() => setSelectedModel('all')}
              title="Clear model filter"
              className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Key Status Chip */}
        {keyStatus !== 'all' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-100 text-xs text-slate-800">
            <span>
              Status: <strong className="font-bold capitalize">{keyStatus === 'active' ? 'Active Keys' : 'Standby Keys'}</strong>
            </span>
            <button
              onClick={() => setKeyStatus && setKeyStatus('all')}
              title="Reset key status filter to All Keys"
              className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
