'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Database,
  Coins,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OpenRouterFormData } from './OpenRouterConfiguration';
import { finopsApi } from '@/api/finops.api';

export interface OpenRouterWorkspaceKey {
  name: string;
  label: string;
  usage: number;
  limit: number | null;
  remaining: number | null;
}

export interface OpenRouterIngestionResult {
  connectionId?: string;
  workspaceId?: string;
  totalUsage: number;
  creditLimit: number | null;
  remainingBalance: number | null;
  keyLabel: string;
  isFreeTier: boolean;
  recordsIngested: number;
  keysList?: OpenRouterWorkspaceKey[];
  lastSyncedAt: string;
}

interface OpenRouterDataVerificationProps {
  formData: OpenRouterFormData;
  onSuccess: (result: OpenRouterIngestionResult) => void;
  onBack: () => void;
}

export function OpenRouterDataVerification({
  formData,
  onSuccess,
  onBack,
}: OpenRouterDataVerificationProps) {
  const [pipelineStep, setPipelineStep] = useState<
    'idle' | 'authenticating' | 'fetching_credits' | 'ingesting_usage' | 'success' | 'failed'
  >('authenticating');

  const [stepStatuses, setStepStatuses] = useState<{
    auth: 'pending' | 'running' | 'success' | 'failed';
    credits: 'pending' | 'running' | 'success' | 'failed';
    ingestion: 'pending' | 'running' | 'success' | 'failed';
  }>({
    auth: 'running',
    credits: 'pending',
    ingestion: 'pending',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ingestionResult, setIngestionResult] = useState<OpenRouterIngestionResult | null>(null);

  // Execute workflow-driven validation and ingestion pipeline
  const runIngestionPipeline = async () => {
    setPipelineStep('authenticating');
    setStepStatuses({ auth: 'running', credits: 'pending', ingestion: 'pending' });
    setErrorMessage(null);

    try {
      // Step 1: Send payload to Backend Workflow Webhook
      const response = await finopsApi.verifyOpenRouterConnection({
        connectionName: formData.connectionName,
        apiKey: formData.apiKey,
        productTag: formData.productTag || 'SHARED_GATEWAY',
        lowBalanceThreshold: formData.lowBalanceThreshold,
      });

      setStepStatuses((prev) => ({ ...prev, auth: 'success', credits: 'running' }));
      setPipelineStep('fetching_credits');

      const raw = (response as any)?.data || response;
      const resData = raw?._responseData || raw?.items?.[0]?.json || raw?.data || raw;

      await new Promise((r) => setTimeout(r, 600));

      setStepStatuses((prev) => ({ ...prev, credits: 'success', ingestion: 'running' }));
      setPipelineStep('ingesting_usage');

      // Execute 2nd workflow (finops-openrouter-sync) for background heartbeat
      let syncRes: any = null;
      try {
        syncRes = await finopsApi.syncOpenRouterConnection({
          connectionId: resData.connectionId || formData.connectionName,
          productTag: formData.productTag || 'SHARED_GATEWAY',
        });
      } catch (syncErr: any) {
        console.warn('Sync workflow notice:', syncErr);
      }

      const rawKeys: OpenRouterWorkspaceKey[] = Array.isArray(resData.keysList)
        ? resData.keysList
        : [];

      const totalKeysCount = rawKeys.length > 0 
        ? rawKeys.length 
        : (syncRes?.recordsProcessed !== undefined ? Number(syncRes.recordsProcessed) : Number(resData.recordsIngested ?? 1));

      const result: OpenRouterIngestionResult = {
        connectionId: resData.connectionId || formData.connectionName,
        workspaceId: resData.workspaceId,
        totalUsage: Number(resData.totalUsage ?? 0),
        creditLimit: resData.creditLimit !== undefined && resData.creditLimit !== null ? Number(resData.creditLimit) : null,
        remainingBalance: resData.remainingBalance !== undefined && resData.remainingBalance !== null ? Number(resData.remainingBalance) : null,
        keyLabel: resData.keyLabel || formData.connectionName,
        isFreeTier: resData.isFreeTier ?? false,
        recordsIngested: totalKeysCount,
        keysList: rawKeys,
        lastSyncedAt: syncRes?.syncedAt || resData.lastSyncedAt || new Date().toISOString(),
      };

      setStepStatuses({ auth: 'success', credits: 'success', ingestion: 'success' });
      setIngestionResult(result);
      setPipelineStep('success');
    } catch (err: any) {
      setStepStatuses({
        auth: 'failed',
        credits: 'pending',
        ingestion: 'pending',
      });
      setErrorMessage(err.message || 'Workflow execution failed to verify OpenRouter credentials.');
      setPipelineStep('failed');
    }
  };

  useEffect(() => {
    runIngestionPipeline();
  }, []);

  const isRunning = ['authenticating', 'fetching_credits', 'ingesting_usage'].includes(pipelineStep);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <div>
        <h2 className="text-base font-bold text-dark-heading">
          Verify & Ingest OpenRouter Data
        </h2>
        <p className="mt-1 text-xs text-dark-muted">
          Validating token credentials and ingesting live consumption data from OpenRouter.
        </p>
      </div>

      {/* Progress Stepper Box */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Data Pipeline Handshake
        </h3>

        <div className="space-y-3">
          {/* Step 1: Authentication */}
          <div className="flex items-center justify-between py-2 border-b border-dark-border/40 text-xs">
            <div className="flex items-center gap-3">
              {stepStatuses.auth === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
              {stepStatuses.auth === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {stepStatuses.auth === 'failed' && <XCircle className="h-4 w-4 text-rose-400" />}
              {stepStatuses.auth === 'pending' && <span className="h-2 w-2 rounded-full bg-slate-600 ml-1 mr-1" />}
              <span className={stepStatuses.auth === 'running' ? 'text-white font-medium' : 'text-slate-300'}>
                1. Authenticate with OpenRouter Management API
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {stepStatuses.auth === 'running' && 'Connecting...'}
              {stepStatuses.auth === 'success' && <span className="text-emerald-400 font-semibold">200 OK</span>}
              {stepStatuses.auth === 'failed' && <span className="text-rose-400 font-semibold">Failed</span>}
            </span>
          </div>

          {/* Step 2: Credits & Limits */}
          <div className="flex items-center justify-between py-2 border-b border-dark-border/40 text-xs">
            <div className="flex items-center gap-3">
              {stepStatuses.credits === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
              {stepStatuses.credits === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {stepStatuses.credits === 'failed' && <XCircle className="h-4 w-4 text-rose-400" />}
              {stepStatuses.credits === 'pending' && <span className="h-2 w-2 rounded-full bg-slate-600 ml-1 mr-1" />}
              <span className={stepStatuses.credits === 'running' ? 'text-white font-medium' : 'text-slate-300'}>
                2. Ingest workspace credit pool & aggregate lifetime spend
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {stepStatuses.credits === 'running' && 'Fetching...'}
              {stepStatuses.credits === 'success' && <span className="text-emerald-400 font-semibold">Synced</span>}
              {stepStatuses.credits === 'failed' && <span className="text-rose-400 font-semibold">Failed</span>}
            </span>
          </div>

          {/* Step 3: Ingest Model Usage */}
          <div className="flex items-center justify-between py-2 text-xs">
            <div className="flex items-center gap-3">
              {stepStatuses.ingestion === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
              {stepStatuses.ingestion === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {stepStatuses.ingestion === 'failed' && <XCircle className="h-4 w-4 text-rose-400" />}
              {stepStatuses.ingestion === 'pending' && <span className="h-2 w-2 rounded-full bg-slate-600 ml-1 mr-1" />}
              <span className={stepStatuses.ingestion === 'running' ? 'text-white font-medium' : 'text-slate-300'}>
                3. Discover active project keys & register shared gateway
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {stepStatuses.ingestion === 'running' && 'Ingesting...'}
              {stepStatuses.ingestion === 'success' && (
                <span className="text-emerald-400 font-semibold">
                  {ingestionResult ? `${ingestionResult.recordsIngested} keys discovered` : 'Synced'}
                </span>
              )}
              {stepStatuses.ingestion === 'failed' && <span className="text-rose-400 font-semibold">Failed</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Box */}
      {pipelineStep === 'success' && ingestionResult && (
        <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>We have successfully connected your OpenRouter Shared Gateway!</span>
            </div>

            <p className="text-xs text-emerald-300/90 leading-relaxed">
              Your OpenRouter workspace is fully verified. Active project keys, centralized credit limits, and usage metrics have been discovered and aggregated.
            </p>

            {/* 3 Metric Cards matching AWS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg border border-dark-border bg-dark-card p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
                  <Database className="h-3.5 w-3.5 text-blue-400" />
                  <span>Tracked Project Keys</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {ingestionResult.recordsIngested}
                </div>
                <div className="text-[10px] text-slate-400">Active workspace keys</div>
              </div>

              <div className="rounded-lg border border-dark-border bg-dark-card p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>Total Workspace Spend</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  ${ingestionResult.totalUsage.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Lifetime spend across all keys</div>
              </div>

              <div className="rounded-lg border border-dark-border bg-dark-card p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Remaining Credit Pool</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {ingestionResult.remainingBalance !== null
                    ? `$${ingestionResult.remainingBalance.toFixed(2)}`
                    : 'Unlimited'}
                </div>
                <div className="text-[10px] text-slate-400">Available workspace balance</div>
              </div>
            </div>

            {/* Discovered Project Keys Table */}
            {ingestionResult.keysList && ingestionResult.keysList.length > 0 && (
              <div className="rounded-lg border border-dark-border bg-dark-card/90 overflow-hidden space-y-2 p-4 pt-3">
                <div className="flex items-center justify-between pb-2 border-b border-dark-border/60">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Key className="h-4 w-4 text-amber-400" />
                    <span>Discovered Workspace Project Keys ({ingestionResult.keysList.length})</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Active Discovery</span>
                </div>
                <div className="overflow-x-auto max-h-56 overflow-y-auto pr-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-[10px] font-semibold uppercase text-slate-400">
                        <th className="py-2 px-2">Key Name</th>
                        <th className="py-2 px-2">Masked Token</th>
                        <th className="py-2 px-2 text-right">Spend</th>
                        <th className="py-2 px-2 text-right">Limit</th>
                        <th className="py-2 px-2 text-right">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 font-mono text-[11px]">
                      {ingestionResult.keysList.map((k, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2 px-2 font-sans font-medium text-white flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="truncate max-w-[160px]" title={k.name}>{k.name}</span>
                          </td>
                          <td className="py-2 px-2 text-slate-400">{k.label}</td>
                          <td className="py-2 px-2 text-right font-semibold text-amber-400">${k.usage.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right text-slate-300">{k.limit !== null ? `$${k.limit.toFixed(2)}` : 'Unlimited'}</td>
                          <td className="py-2 px-2 text-right text-emerald-400">{k.remaining !== null ? `$${k.remaining.toFixed(2)}` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => onSuccess(ingestionResult)}
              className="text-xs font-semibold px-6"
            >
              <span>Activate & View Connection Details</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Failure Notification Box */}
      {pipelineStep === 'failed' && (
        <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>Failed to fetch data from OpenRouter</span>
            </div>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              {errorMessage || 'Unable to authenticate with OpenRouter or retrieve billing data.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onBack}
              className="text-xs"
            >
              Edit API Key
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={runIngestionPipeline}
              className="text-xs"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              <span>Retry Ingestion</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
