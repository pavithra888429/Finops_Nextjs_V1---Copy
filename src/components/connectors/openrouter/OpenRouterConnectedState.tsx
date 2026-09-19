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
  lowBalanceThreshold: number;
  totalUsage: number;
  creditLimit: number | null;
  remainingBalance: number | null;
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
      <div className="rounded-xl border border-dark-border bg-dark-card/90 p-6 shadow-xl space-y-6">
        {/* Card Header */}
        <div className="flex items-start justify-between pb-4 border-b border-dark-border/80">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              OpenRouter Enterprise AI Gateway
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Organization-wide shared gateway actively tracking all workspace project keys and token telemetry.
            </p>
          </div>
          <Badge variant="connected">Connected & Synchronized</Badge>
        </div>

        {/* Configuration Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-2.5 rounded-lg border border-dark-border bg-dark-card p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Gateway Name:</span>
              <span className="text-white font-semibold font-sans">{connection.connectionName}</span>
            </div>
            <div className="flex justify-between items-center border-t border-dark-border/40 pt-2">
              <span className="text-slate-400 font-sans">Gateway Scope:</span>
              <span className="text-blue-400 font-semibold uppercase">Organization Shared</span>
            </div>
            <div className="flex justify-between items-center border-t border-dark-border/40 pt-2">
              <span className="text-slate-400 font-sans">Status:</span>
              <span className="text-emerald-400 font-semibold font-sans flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active & Metering
              </span>
            </div>
          </div>

          <div className="space-y-2.5 rounded-lg border border-dark-border bg-dark-card p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Management Key:</span>
              <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]" title={connection.apiKey}>
                {maskedKey}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-dark-border/40 pt-2">
              <span className="text-slate-400 font-sans">Low Balance Alert:</span>
              <span className="text-amber-400 font-semibold">${connection.lowBalanceThreshold.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-dark-border/40 pt-2">
              <span className="text-slate-400 font-sans">Provider Portal:</span>
              <a
                href="https://openrouter.ai/activity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-sans text-[11px]"
              >
                <span>openrouter.ai/activity</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Ingestion Status Card (Informing User About Data Fetch) */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 p-6 shadow-xl space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-dark-border/80">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-400" />
              <span>Workspace Ingestion & Telemetry Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated token consumption telemetry ingestion for all workspace keys.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="text-xs text-white"
            onClick={handleSyncNow}
            disabled={isSyncing}
          >
            <RotateCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isSyncing ? 'Fetching from OpenRouter...' : 'Sync Now'}</span>
          </Button>
        </div>

        {/* Informative Status Banner */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-emerald-300">
              Workspace telemetry synchronized from OpenRouter
            </h4>
            <p className="text-[11px] text-emerald-300/80 leading-relaxed">
              We have connected to your OpenRouter organization workspace and aggregated usage across all project keys. Token consumption, lifetime costs, and available credit pools are actively monitored.
            </p>
          </div>
        </div>

        {/* 3 Metric Cards matching AWS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-dark-border bg-dark-card p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
              <Database className="h-3.5 w-3.5 text-blue-400" />
              <span>Tracked Project Keys</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {recordsCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Active workspace keys</div>
          </div>

          <div className="rounded-lg border border-dark-border bg-dark-card p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>Total Workspace Spend</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              ${connection.totalUsage !== undefined ? connection.totalUsage.toFixed(2) : '0.00'}
            </div>
            <div className="text-[10px] text-slate-400">Lifetime spend across all keys</div>
          </div>

          <div className="rounded-lg border border-dark-border bg-dark-card p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Remaining Credit Pool</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {connection.remainingBalance !== null && connection.remainingBalance !== undefined
                ? `$${connection.remainingBalance.toFixed(2)}`
                : 'Active / Unlimited'}
            </div>
            <div className="text-[10px] text-slate-400">Available workspace credits</div>
          </div>
        </div>

        {/* Discovered Keys Breakdown Table */}
        {connection.keysList && connection.keysList.length > 0 && (
          <div className="rounded-lg border border-dark-border bg-dark-card/90 overflow-hidden space-y-2 p-4 pt-3">
            <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Key className="h-4 w-4 text-amber-400" />
                <span>Workspace Project Keys Breakdown ({connection.keysList.length})</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">All Keys Active</span>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-dark-border/40 text-[10px] font-semibold uppercase text-slate-400">
                    <th className="py-2.5 px-3">Project / Key Name</th>
                    <th className="py-2.5 px-3">Masked Token</th>
                    <th className="py-2.5 px-3 text-right">Lifetime Spend</th>
                    <th className="py-2.5 px-3 text-right">Allocated Limit</th>
                    <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/30 font-mono text-[11px]">
                  {connection.keysList.map((k, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={k.name}>{k.name}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{k.label}</td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-400">${k.usage.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{k.limit !== null ? `$${k.limit.toFixed(2)}` : 'Unlimited'}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">{k.remaining !== null ? `$${k.remaining.toFixed(2)}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Last Ingestion Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-dark-border/40 pt-3">
          <div className="flex items-center gap-2">
            <span>Last Synced:</span>
            <span className="text-white font-medium">{lastSyncText}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Sync Frequency:</span>
            <span className="text-slate-300">Automated Hourly & On-Demand</span>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone / Disconnect Action */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-rose-400">Disconnect OpenRouter AI Gateway</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Removes the encrypted API key and stops automatic token telemetry ingestion.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 shrink-0"
          onClick={() => setShowDisconnectModal(true)}
        >
          <Unplug className="h-3.5 w-3.5 mr-1.5" />
          <span>Disconnect Gateway</span>
        </Button>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Disconnect OpenRouter?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to disconnect <strong>{connection.connectionName}</strong>? Future token telemetry and spend deltas will no longer be fetched for FinOps analytics.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/40">
              <Button
                variant="secondary"
                size="md"
                className="text-xs"
                onClick={() => setShowDisconnectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="text-xs bg-rose-600 hover:bg-rose-500"
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
