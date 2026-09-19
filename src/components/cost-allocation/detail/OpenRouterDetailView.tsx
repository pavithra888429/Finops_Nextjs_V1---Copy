'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DetailHeader } from './DetailHeader';
import { OpenRouterFilters } from './openrouter/OpenRouterFilters';
import { OpenRouterDetailKpis } from './openrouter/OpenRouterDetailKpis';
import { OpenRouterCostTrendChart } from './openrouter/OpenRouterCostTrendChart';
import { CostByModelCard } from './openrouter/CostByModelCard';
import { CostByAppCard } from './openrouter/CostByAppCard';
import { CostByKeyEnvCard } from './openrouter/CostByKeyEnvCard';
import { TokenCachingBreakdownCard } from './openrouter/TokenCachingBreakdownCard';
import { OpenRouterCostAttributionCard } from './openrouter/OpenRouterCostAttributionCard';
import { TopAiCostDriversTable } from './openrouter/TopAiCostDriversTable';
import { DetailedOpenRouterUsageTable } from './openrouter/DetailedOpenRouterUsageTable';
import { DetailStatusBar } from './DetailStatusBar';
import { CheckCircle2, ShieldCheck, Database, Key, RotateCw, Sparkles } from 'lucide-react';
import { finopsApi } from '@/api/finops.api';

interface OpenRouterDetailViewProps {
  productId?: string;
  productName?: string;
  providerId?: string;
  providerName?: string;
  onBack?: () => void;
}

export function OpenRouterDetailView({
  productId = 'dragon',
  productName = 'Dragon Suite',
  providerId = 'openrouter',
  providerName = 'OpenRouter',
  onBack,
}: OpenRouterDetailViewProps) {
  // Filters state
  const [dateRange, setDateRange] = useState('last30');
  const [comparePeriod, setComparePeriod] = useState('prev30');
  const [environment, setEnvironment] = useState('production');
  const [selectedKey, setSelectedKey] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [groupBy, setGroupBy] = useState('model');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Today, 09:58 AM');

  // Stored connection from localStorage
  const [savedConnection, setSavedConnection] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('finops_openrouter_connection');
      if (stored) {
        setSavedConnection(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading saved OpenRouter connection', e);
    }
  }, []);

  const handleLiveSync = async () => {
    setIsSyncing(true);
    try {
      const apiKey = savedConnection?.apiKey || '';
      const syncRes = await finopsApi.fetchOpenRouterTelemetry({
        apiKey,
        connectionId: savedConnection?.connectionId || 'Enterprise OpenRouter Gateway',
      });

      if (syncRes) {
        const updated = {
          ...savedConnection,
          totalUsage: syncRes.totalUsage !== undefined ? Number(syncRes.totalUsage) : savedConnection?.totalUsage,
          keysList: Array.isArray(syncRes.keysList) ? syncRes.keysList : savedConnection?.keysList,
          dateWiseTelemetry: Array.isArray(syncRes.dateWiseTelemetry) ? syncRes.dateWiseTelemetry : savedConnection?.dateWiseTelemetry,
          focusRecords: Array.isArray(syncRes.focusRecords) ? syncRes.focusRecords : savedConnection?.focusRecords,
          verifiedAt: new Date().toISOString(),
        };
        setSavedConnection(updated);
        try {
          localStorage.setItem('finops_openrouter_connection', JSON.stringify(updated));
        } catch (err) {}
        setLastSyncText('Just now');
      }
    } catch (e) {
      console.warn('Live sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const availableKeys = useMemo(() => {
    if (savedConnection?.keysList && Array.isArray(savedConnection.keysList)) {
      return savedConnection.keysList;
    }
    return [
      { name: 'Prod API KEy chatbot', label: 'sk-or-v1-07f...d0e', usage: 3.1617 },
      { name: 'PF7-DT-01', label: 'sk-or-v1-620...703', usage: 6.41 },
      { name: 'Code-Migration', label: 'sk-or-v1-34a...ee1', usage: 6.208 },
      { name: 'COE ', label: 'sk-or-v1-a0b...88a', usage: 3.601 },
      { name: 'PF 1 - Aug 01', label: 'sk-or-v1-761...4c6', usage: 3.3887 },
      { name: 'Dev Key 1', label: 'sk-or-v1-710...fc0', usage: 2.291 },
      { name: 'PF 1 - Aug 05', label: 'sk-or-v1-9ed...041', usage: 1.2137 },
      { name: 'DS | 10/9/26', label: 'sk-or-v1-c46...cc2', usage: 0.0799 },
    ];
  }, [savedConnection]);

  // Compute active metrics dynamically based on selected key
  const dynamicKpiMetrics = useMemo(() => {
    if (selectedKey !== 'all') {
      const matched = availableKeys.find((k: any) => k.name === selectedKey);
      const spend = matched?.usage ? Number(matched.usage) : 3.16;
      return {
        totalCost: Number(spend.toFixed(2)),
        periodChange: 12.4,
        dailyAvg: Number((spend / 30).toFixed(2)),
        topModel: 'Gemini 2.0 Flash',
        topModelCost: Number((spend * 0.58).toFixed(2)),
        topModelShare: 58.2,
        tokenVolume: `${(spend * 2.15).toFixed(1)}M`,
        promptTokens: `${(spend * 1.7).toFixed(1)}M prompt`,
        topKey: selectedKey,
        topKeyCost: Number(spend.toFixed(2)),
        topKeyShare: 100,
        cacheHitRate: 1.3,
        blendedRate: '$0.46 / 1M',
      };
    }

    // "All Keys" aggregated view
    const totalSpend =
      savedConnection?.totalUsage !== undefined && savedConnection?.totalUsage !== null
        ? Number(savedConnection.totalUsage)
        : 26.35;

    return {
      totalCost: totalSpend,
      periodChange: 16.8,
      dailyAvg: Number((totalSpend / 30).toFixed(2)),
      topModel: 'Gemini 2.0 Flash',
      topModelCost: Number((totalSpend * 0.54).toFixed(2)),
      topModelShare: 54.0,
      tokenVolume: `${(totalSpend * 2.21).toFixed(1)}M`,
      promptTokens: `${(totalSpend * 1.78).toFixed(1)}M prompt`,
      topKey: 'PF7-DT-01',
      topKeyCost: 6.41,
      topKeyShare: 24.3,
      cacheHitRate: 2.4,
      blendedRate: '$0.45 / 1M',
    };
  }, [selectedKey, availableKeys, savedConnection]);

  // Format strictly live date-wise telemetry directly from OpenRouter sync response
  const telemetryRows = useMemo(() => {
    if (savedConnection?.dateWiseTelemetry && Array.isArray(savedConnection.dateWiseTelemetry) && savedConnection.dateWiseTelemetry.length > 0) {
      return savedConnection.dateWiseTelemetry.map((row: any, idx: number) => ({
        id: row.id || `live-${row.date || 'item'}-${idx}`,
        date: row.date || '',
        keyName: row.keyName || row.key || row.name || (row.keyLabel ? `Key (${row.keyLabel})` : ''),
        keyLabel: row.keyLabel || row.label || '',
        app: row.app || row.appName || '',
        model: row.model || '',
        promptTokens: Number(row.promptTokens ?? row.prompt_tokens ?? 0),
        completionTokens: Number(row.completionTokens ?? row.completion_tokens ?? 0),
        cachedTokens: Number(row.cachedTokens ?? row.cached_tokens ?? 0),
        requests: Number(row.requests ?? row.request_count ?? 0),
        cost: Number(row.cost ?? 0),
      }));
    }
    return [];
  }, [savedConnection]);

  const handleResetFilters = () => {
    setDateRange('last30');
    setComparePeriod('prev30');
    setEnvironment('production');
    setSelectedKey('all');
    setSelectedModel('all');
    setGroupBy('model');
  };

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header (Back button, Breadcrumb, Title, Product/Provider Badges) */}
      <DetailHeader
        productId={productId}
        productName={productName}
        providerId={providerId}
        providerName={providerName}
        onBack={onBack}
      />

      {/* Quick Action & Sync Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-dark-border bg-dark-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Database className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-semibold text-white">FinOps FOCUS 1.0 Pipeline:</span>{' '}
            <span className="text-slate-400 font-mono">OpenRouter API &gt; Telemetry Normalization &gt; FinOps DB</span>
          </div>
        </div>

        <button
          onClick={handleLiveSync}
          disabled={isSyncing}
          className="h-7 inline-flex items-center gap-1.5 px-3 rounded-lg border border-blue-500/30 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 hover:text-blue-300 text-xs font-medium transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RotateCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Fetching from OpenRouter...' : 'Sync Latest Telemetry'}</span>
        </button>
      </div>

      {/* 2. Filter Toolbar (2 rows of dropdowns & active filter chips) */}
      <OpenRouterFilters
        productName={productName}
        providerName={providerName}
        dateRange={dateRange}
        setDateRange={setDateRange}
        comparePeriod={comparePeriod}
        setComparePeriod={setComparePeriod}
        environment={environment}
        setEnvironment={setEnvironment}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        availableKeys={availableKeys}
        onResetFilters={handleResetFilters}
        onRemoveProduct={onBack}
        onRemoveProvider={onBack}
      />

      {/* 3. 6 Primary FinOps KPI Cards */}
      <OpenRouterDetailKpis {...dynamicKpiMetrics} />

      {/* 4. Middle Section 1: Cost Trend (5 cols) + Cost by AI Model (4 cols) + Cost by App (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5">
          <OpenRouterCostTrendChart productName={productName} providerName={providerName} />
        </div>
        <div className="lg:col-span-4">
          <CostByModelCard />
        </div>
        <div className="lg:col-span-3">
          <CostByAppCard />
        </div>
      </div>

      {/* 5. Middle Section 2: API Key & Environment (4 cols) + Token & Caching Breakdown (5 cols) + Cost Attribution (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4">
          <CostByKeyEnvCard productName={productName} selectedKey={selectedKey} />
        </div>
        <div className="lg:col-span-5">
          <TokenCachingBreakdownCard />
        </div>
        <div className="lg:col-span-3">
          <OpenRouterCostAttributionCard productName={productName} />
        </div>
      </div>

      {/* 6. Bottom Section: Top AI Cost Drivers (5 cols) + Detailed Ingestion Telemetry (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5">
          <TopAiCostDriversTable productName={productName} />
        </div>
        <div className="lg:col-span-7">
          <DetailedOpenRouterUsageTable productName={productName} data={telemetryRows} />
        </div>
      </div>

      {/* 7. Bottom Status Bar */}
      <DetailStatusBar
        lastSync={lastSyncText}
        dataStatus="Complete"
        source="OpenRouter FOCUS 1.0 Cost and Usage Report"
        currency="USD"
      />
    </div>
  );
}
