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

  const loadDataFromMongo = async () => {
    try {
      // 1. Try querying the dedicated Cost Allocation Workflow in AgentBuilder
      const wfData = await finopsApi.queryCostAllocationWorkflow({
        productId,
        productTag: productId,
        environment,
      });
      if (wfData && wfData.success && Array.isArray(wfData.keysList) && wfData.keysList.length > 0) {
        setSavedConnection((prev: any) => {
          const merged = { ...(prev || {}), ...wfData };
          try {
            localStorage.setItem('finops_openrouter_connection', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
        setLastSyncText('AgentBuilder Workflow (Live)');
        return true;
      }
    } catch (err) {
      console.warn('Error querying cost allocation workflow:', err);
    }

    // 2. Direct fallback to MongoDB Atlas API
    try {
      const res = await fetch('/api/finops/openrouter');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.keysList) && data.keysList.length > 0) {
        setSavedConnection((prev: any) => {
          const merged = { ...(prev || {}), ...data };
          try {
            localStorage.setItem('finops_openrouter_connection', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
        setLastSyncText('MongoDB Atlas (Direct)');
        return true;
      }
    } catch (err) {
      console.warn('Error loading from MongoDB API:', err);
    }
    return false;
  };

  useEffect(() => {
    let storedParsed: any = null;
    try {
      const stored = localStorage.getItem('finops_openrouter_connection');
      if (stored) {
        storedParsed = JSON.parse(stored);
        setSavedConnection(storedParsed);
      }
    } catch (e) {
      console.warn('Error reading saved OpenRouter connection', e);
    }

    // 1. Immediately fetch from MongoDB Atlas collection finops_3
    loadDataFromMongo().then((hasMongoData) => {
      // 2. Query webhook if apiKey is present or if MongoDB had no records
      const apiKey = storedParsed?.apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
      if (apiKey) {
        finopsApi
          .fetchOpenRouterTelemetry({
            apiKey,
            connectionId: storedParsed?.connectionId || 'Production OpenRouter',
            connectionName: storedParsed?.connectionName || 'Production OpenRouter',
            userId: storedParsed?.userId || 'default_user',
            productTag: productId || 'SHARED_GATEWAY',
            environment: environment || 'production',
          })
          .then((syncRes: any) => {
            if (syncRes && Array.isArray(syncRes.keysList) && syncRes.keysList.length > 0) {
              setSavedConnection((prev: any) => {
                const merged = { ...(prev || {}), ...syncRes };
                try {
                  localStorage.setItem('finops_openrouter_connection', JSON.stringify(merged));
                } catch (err) {}
                return merged;
              });
              setLastSyncText('Workbench Webhook Live');
            } else if (!hasMongoData) {
              loadDataFromMongo();
            }
          })
          .catch(() => {
            if (!hasMongoData) loadDataFromMongo();
          });
      }
    });
  }, []);

  const handleLiveSync = async () => {
    setIsSyncing(true);
    try {
      const apiKey = savedConnection?.apiKey || '';
      if (apiKey) {
        const syncRes = await finopsApi.fetchOpenRouterTelemetry({
          apiKey,
          connectionId: savedConnection?.connectionId || 'Enterprise OpenRouter Gateway',
          connectionName: savedConnection?.connectionName || 'Production OpenRouter',
          userId: savedConnection?.userId || 'usr_default',
          productTag: productId || 'DRAGON',
          environment: environment || 'production',
          lastSyncedAt: savedConnection?.verifiedAt,
        });

        if (syncRes && Array.isArray(syncRes.keysList) && syncRes.keysList.length > 0) {
          const updated = {
            ...savedConnection,
            ...syncRes,
            verifiedAt: new Date().toISOString(),
          };
          setSavedConnection(updated);
          try {
            localStorage.setItem('finops_openrouter_connection', JSON.stringify(updated));
          } catch (err) {}
          setLastSyncText('Just now (Webhook)');
          return;
        }
      }

      // Refresh directly from MongoDB Atlas collection finops_3
      await loadDataFromMongo();
      setLastSyncText('Just now (MongoDB Atlas)');
    } catch (e) {
      console.warn('Live sync error:', e);
      await loadDataFromMongo();
    } finally {
      setIsSyncing(false);
    }
  };

  const availableKeys = useMemo(() => {
    if (savedConnection?.keysList && Array.isArray(savedConnection.keysList)) {
      return savedConnection.keysList;
    }
    return [];
  }, [savedConnection]);

  // Compute active metrics dynamically based strictly on real OpenRouter keys
  const dynamicKpiMetrics = useMemo(() => {
    const sortedBySpend = [...availableKeys].sort((a: any, b: any) => (Number(b.usage) || 0) - (Number(a.usage) || 0));
    const topKeyItem = sortedBySpend[0];
    const activeCount = availableKeys.filter((k: any) => (Number(k.usage) || 0) > 0).length;
    const idleCount = availableKeys.length - activeCount;

    if (selectedKey !== 'all') {
      const matched = availableKeys.find((k: any) => k.name === selectedKey);
      const spend = matched?.usage ? Number(matched.usage) : 0;
      const mSpend = matched?.usageMonthly ?? matched?.usage_monthly ?? 0;
      return {
        totalCost: Number(spend.toFixed(2)),
        monthlySpend: Number(Number(mSpend).toFixed(2)),
        topKey: selectedKey,
        topKeyCost: Number(spend.toFixed(2)),
        topKeyShare: 100,
        creditLimit: matched?.limit !== null && matched?.limit !== undefined ? Number(matched.limit) : null,
        remainingBalance: matched?.remaining !== null && matched?.remaining !== undefined ? Number(matched.remaining) : null,
        totalKeysCount: 1,
        activeKeysCount: spend > 0 ? 1 : 0,
        idleKeysCount: spend === 0 ? 1 : 0,
      };
    }

    // "All Keys" aggregated view
    const totalSpend =
      savedConnection?.totalUsage !== undefined && savedConnection?.totalUsage !== null
        ? Number(savedConnection.totalUsage)
        : availableKeys.reduce((acc: number, k: any) => acc + (Number(k.usage) || 0), 0);

    const totalMonthly = availableKeys.reduce((acc: number, k: any) => acc + (Number(k.usageMonthly ?? k.usage_monthly) || 0), 0);
    const topKeyCost = topKeyItem?.usage ? Number(topKeyItem.usage) : 0;
    const topKeyShare = totalSpend > 0 ? Number(((topKeyCost / totalSpend) * 100).toFixed(1)) : 0;

    const creditLimit = savedConnection?.creditLimit ?? availableKeys.reduce((acc: number, k: any) => acc + (Number(k.limit) || 0), 0);
    const remainingBalance = savedConnection?.remainingBalance ?? availableKeys.reduce((acc: number, k: any) => acc + (Number(k.remaining) || 0), 0);

    return {
      totalCost: Number(totalSpend.toFixed(2)),
      monthlySpend: Number(totalMonthly.toFixed(2)),
      topKey: topKeyItem?.name || 'Active Key',
      topKeyCost: Number(topKeyCost.toFixed(2)),
      topKeyShare,
      creditLimit: creditLimit > 0 ? Number(creditLimit.toFixed(2)) : null,
      remainingBalance: remainingBalance > 0 ? Number(remainingBalance.toFixed(2)) : null,
      totalKeysCount: availableKeys.length,
      activeKeysCount: activeCount,
      idleKeysCount: idleCount,
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

      {/* 2. Filter Toolbar (Dropdowns, active filter chips, and sync action) */}
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
        onSync={handleLiveSync}
        isSyncing={isSyncing}
      />

      {/* 3. 6 Primary FinOps KPI Cards (100% Real OpenRouter Metrics) */}
      <OpenRouterDetailKpis {...dynamicKpiMetrics} />

      {/* 4. Middle Section 1: Cost Trend (5 cols) + Cost by Key (4 cols) + Gateway Infrastructure (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5">
          <OpenRouterCostTrendChart productName={productName} providerName={providerName} />
        </div>
        <div className="lg:col-span-4">
          <CostByModelCard keysList={availableKeys} />
        </div>
        <div className="lg:col-span-3">
          <CostByAppCard keysList={availableKeys} />
        </div>
      </div>

      {/* 5. Middle Section 2: Active API Keys (4 cols) + Quotas & Velocity (5 cols) + Spend Attribution (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4">
          <CostByKeyEnvCard
            productName={productName}
            selectedKey={selectedKey}
            keysList={availableKeys}
            onSelectKey={setSelectedKey}
          />
        </div>
        <div className="lg:col-span-5">
          <TokenCachingBreakdownCard keysList={availableKeys} />
        </div>
        <div className="lg:col-span-3">
          <OpenRouterCostAttributionCard
            productName={productName}
            keysList={availableKeys}
            totalSpend={dynamicKpiMetrics.totalCost}
          />
        </div>
      </div>

      {/* 6. Bottom Section: Top AI Cost Drivers (5 cols) + Detailed Ingestion Telemetry (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5">
          <TopAiCostDriversTable productName={productName} keysList={availableKeys} />
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
