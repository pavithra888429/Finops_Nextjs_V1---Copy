'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  RotateCw,
  Unplug,
  Database,
  Coins,
  Cpu,
  ShieldCheck,
  Tag,
  Bell,
  AlertTriangle,
  Key,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { finopsApi } from '@/api/finops.api';

export interface OpenRouterWorkspaceKey {
  name: string;
  label: string;
  usage: number;
  limit: number | null;
  remaining: number | null;
}

export interface OpenRouterSavedConnection {
  connectionId?: string;
  workspaceId?: string;
  connectionName: string;
  apiKey: string;
  productTag: string;
  lowBalanceThreshold?: number;
  totalUsage?: number;
  creditLimit?: number | null;
  remainingBalance?: number | null;
  keyLabel?: string;
  verifiedAt: string;
  recordsIngested?: number;
  keysList?: OpenRouterWorkspaceKey[];
  dateWiseTelemetry?: any[];
  focusRecords?: any[];
}

interface OpenRouterConnectedStateProps {
  connection: OpenRouterSavedConnection;
  onDisconnect?: () => void;
  onUpdate?: (updated: OpenRouterSavedConnection) => void;
}

export function OpenRouterConnectedState({
  connection,
  onDisconnect,
  onUpdate,
}: OpenRouterConnectedStateProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'ready' | 'syncing' | 'success'>('ready');
  const [lastSyncText, setLastSyncText] = useState('Just now');
  const [recordsCount, setRecordsCount] = useState(
    connection.keysList?.length || connection.recordsIngested || 1
  );
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Mask API key: sk-or-v1-****************************48a2
  const maskedKey = connection.apiKey
    ? `${connection.apiKey.substring(0, 10)}${'*'.repeat(24)}${connection.apiKey.slice(-4)}`
    : 'sk-or-v1-****************************48a2';

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // Trigger live delta synchronization via Backend Telemetry Workflow
      const syncRes = await finopsApi.fetchOpenRouterTelemetry({
        apiKey: connection.apiKey,
        connectionId: connection.connectionId || connection.connectionName,
      });

      const updatedKeys = Array.isArray(syncRes.keysList) ? syncRes.keysList : connection.keysList;
      const newRecords = updatedKeys?.length || connection.recordsIngested || 1;
      setRecordsCount(newRecords);
      setLastSyncText('Just now');
      setSyncStatus('success');

      const updated: OpenRouterSavedConnection = {
        ...connection,
        totalUsage: syncRes.totalUsage !== undefined ? Number(syncRes.totalUsage) : connection.totalUsage,
        creditLimit: syncRes.creditLimit !== undefined ? syncRes.creditLimit : connection.creditLimit,
        remainingBalance: syncRes.remainingBalance !== undefined ? syncRes.remainingBalance : connection.remainingBalance,
        keysList: updatedKeys,
        recordsIngested: newRecords,
        verifiedAt: new Date().toISOString(),
        dateWiseTelemetry: Array.isArray(syncRes.dateWiseTelemetry) ? syncRes.dateWiseTelemetry : connection.dateWiseTelemetry,
        focusRecords: Array.isArray(syncRes.focusRecords) ? syncRes.focusRecords : connection.focusRecords,
      };

      try {
        localStorage.setItem('finops_openrouter_connection', JSON.stringify(updated));
      } catch (err) {
        console.warn('Storage sync update error:', err);
      }

      if (onUpdate) {
        onUpdate(updated);
      }
    } catch (e) {
      console.warn('Sync notice:', e);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus('ready'), 3000);
    }
  };

  const handleConfirmDisconnect = () => {
    try {
      localStorage.removeItem('finops_openrouter_connection');
    } catch (e) {
      console.warn('Failed to remove OpenRouter connection from storage', e);
    }
    setShowDisconnectModal(false);
    if (onDisconnect) {
      onDisconnect();
    } else {
      router.push('/connectors');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      
      {/* 1. OpenRouter Connection Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Card Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              OpenRouter Enterprise AI Gateway
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organization-wide shared gateway actively tracking all workspace project keys and token telemetry.
            </p>
          </div>
          <Badge variant="connected" className="rounded-full">Connected & Synchronized</Badge>
        </div>

        {/* Configuration Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Gateway Name:</span>
              <span className="text-slate-900 font-semibold font-sans">{connection.connectionName}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/80 pt-2">
              <span className="text-slate-500 font-sans">Gateway Scope:</span>
              <span className="text-slate-900 font-semibold uppercase">Organization Shared</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/80 pt-2">
              <span className="text-slate-500 font-sans">Status:</span>
              <span className="text-emerald-700 font-semibold font-sans flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active & Metering
              </span>
            </div>
          </div>

          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Management Key:</span>
              <span className="text-slate-700 font-mono text-[11px] truncate max-w-[200px]" title={connection.apiKey}>
                {maskedKey}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/80 pt-2">
              <span className="text-slate-500 font-sans">Low Balance Alert:</span>
              <span className="text-slate-900 font-semibold font-mono">
                ${(typeof connection?.lowBalanceThreshold === 'number' && !isNaN(connection.lowBalanceThreshold)
                  ? connection.lowBalanceThreshold
                  : (Number(connection?.lowBalanceThreshold) || 15.0)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/80 pt-2">
              <span className="text-slate-500 font-sans">Provider Portal:</span>
              <a
                href="https://openrouter.ai/activity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-sans text-[11px] font-medium"
              >
                <span>openrouter.ai/activity</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Ingestion Status Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              <span>Workspace Ingestion & Telemetry Status</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated token consumption telemetry ingestion for all workspace keys.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="text-xs rounded-lg shadow-sm"
            onClick={handleSyncNow}
            disabled={isSyncing}
          >
            <RotateCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Fetching from OpenRouter...' : 'Sync Now'}</span>
          </Button>
        </div>

        {/* Informative Status Banner */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-900">
              Workspace telemetry synchronized from OpenRouter
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              We have connected to your OpenRouter organization workspace and aggregated usage across all project keys. Token consumption, lifetime costs, and available credit pools are actively monitored.
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <Database className="h-3.5 w-3.5 text-purple-600" />
              <span>Tracked Project Keys</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {recordsCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Active workspace keys</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span>Total Workspace Spend</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              ${connection?.totalUsage !== undefined && connection?.totalUsage !== null && !isNaN(Number(connection.totalUsage))
                ? Number(connection.totalUsage).toFixed(2)
                : '0.00'}
            </div>
            <div className="text-[10px] text-slate-500">Lifetime spend across all keys</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Remaining Credit Pool</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {connection?.remainingBalance !== null && connection?.remainingBalance !== undefined && !isNaN(Number(connection.remainingBalance))
                ? `$${Number(connection.remainingBalance).toFixed(2)}`
                : 'Active / Unlimited'}
            </div>
            <div className="text-[10px] text-slate-500">Available workspace credits</div>
          </div>
        </div>

        {/* Discovered Keys Breakdown Table */}
        {connection.keysList && connection.keysList.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden space-y-2 p-4 pt-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Key className="h-4 w-4 text-purple-600" />
                <span>Workspace Project Keys Breakdown ({connection.keysList.length})</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-semibold">All Keys Active</span>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase text-slate-400">
                    <th className="py-2.5 px-3">Project / Key Name</th>
                    <th className="py-2.5 px-3">Masked Token</th>
                    <th className="py-2.5 px-3 text-right">Lifetime Spend</th>
                    <th className="py-2.5 px-3 text-right">Allocated Limit</th>
                    <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {connection.keysList.map((k, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-sans font-semibold text-slate-800 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-600 shrink-0" />
                        <span className="truncate max-w-[200px]" title={k.name}>{k.name}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{k.label}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">${(Number(k?.usage) || 0).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{k?.limit !== null && k?.limit !== undefined && !isNaN(Number(k.limit)) ? `$${Number(k.limit).toFixed(2)}` : 'Unlimited'}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{k?.remaining !== null && k?.remaining !== undefined && !isNaN(Number(k.remaining)) ? `$${Number(k.remaining).toFixed(2)}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Last Ingestion Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <span>Last Synced:</span>
            <span className="text-slate-900 font-semibold">{lastSyncText}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Sync Frequency:</span>
            <span className="text-slate-600">Automated Hourly & On-Demand</span>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone / Disconnect Action */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Disconnect OpenRouter AI Gateway</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Removes the encrypted API key and stops automatic token telemetry ingestion.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          className="text-xs text-rose-700 border-rose-200 bg-white hover:bg-rose-100 transition-colors shrink-0 rounded-lg shadow-xs"
          onClick={() => setShowDisconnectModal(true)}
        >
          <Unplug className="h-3.5 w-3.5 mr-1.5" />
          <span>Disconnect Gateway</span>
        </Button>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Disconnect OpenRouter?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to disconnect <strong>{connection.connectionName}</strong>? Future token telemetry and spend deltas will no longer be fetched for FinOps analytics.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="md"
                className="text-xs rounded-lg"
                onClick={() => setShowDisconnectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm"
                onClick={handleConfirmDisconnect}
              >
                Confirm Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
