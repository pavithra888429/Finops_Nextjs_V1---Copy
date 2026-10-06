'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  RotateCw,
  Settings,
  Unplug,
  BarChart2,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  DollarSign,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { finopsApi, AwsConnectionRecord } from '@/api/finops.api';
import { finopsStore } from '@/store/finops.store';

interface AwsConnectedStateProps {
  record?: AwsConnectionRecord | null;
  onDisconnect?: () => void;
  onManageConnection?: () => void;
}

export function AwsConnectedState({
  record,
  onDisconnect,
  onManageConnection,
}: AwsConnectedStateProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingCe, setIsSyncingCe] = useState(false);
  const [ceSyncMessage, setCeSyncMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [lastCeSyncDate, setLastCeSyncDate] = useState<string>(
    record?.lastCostExplorerSyncDate || ''
  );
  const [ceTotalSpend, setCeTotalSpend] = useState<number | undefined>(
    record?.totalSpend !== undefined && record?.totalSpend !== null && !isNaN(Number(record.totalSpend))
      ? Number(record.totalSpend)
      : undefined
  );
  const [syncStatus, setSyncStatus] = useState<'ready' | 'syncing'>('ready');
  const [lastSyncText, setLastSyncText] = useState(
    record?.lastSyncedAt
      ? new Date(record.lastSyncedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : record?.verifiedAt
      ? new Date(record.verifiedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Not synced yet'
  );
  const [recordsProcessed, setRecordsProcessed] = useState(record?.recordsProcessed || 0);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  useEffect(() => {
    if (record?.recordsProcessed !== undefined) {
      setRecordsProcessed(record.recordsProcessed);
    }
    if (record?.lastSyncedAt) {
      setLastSyncText(
        new Date(record.lastSyncedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
    if (record?.lastCostExplorerSyncDate) {
      setLastCeSyncDate(record.lastCostExplorerSyncDate);
    }
    if (record?.totalSpend !== undefined && record?.totalSpend !== null) {
      const num = Number(record.totalSpend);
      setCeTotalSpend(isNaN(num) ? undefined : num);
    }
  }, [record]);

  const handleSyncCostExplorer = async (force: boolean = false) => {
    setIsSyncingCe(true);
    setCeSyncMessage(null);
    try {
      const res = await finopsApi.triggerCostExplorerSync(record?.connectionId, record?.awsAccountId, force);
      const upstream = res?.upstream || res;

      if (upstream?.status === 'already_synced_today') {
        setCeSyncMessage({
          type: 'info',
          text: `AWS Cost Explorer was already synced today (${upstream.syncDate || 'UTC'}). Daily deduplication active (once per day to minimize AWS API fees).`,
        });
        if (upstream.syncDate) setLastCeSyncDate(upstream.syncDate);
      } else if (upstream?.success || upstream?.status === 'synced_successfully') {
        const rawSpend = upstream.totalUnblendedCost ?? upstream.documents?.[0]?.totalSpend ?? (Array.isArray(upstream) ? upstream[0]?.json?.documents?.[0]?.totalSpend : undefined) ?? record?.totalSpend;
        const costStr = rawSpend !== undefined && rawSpend !== '' ? `$${Number(rawSpend).toFixed(2)}` : '';
        const details = upstream.totalServices ? ` (${upstream.totalServices} services, ${upstream.daysProcessed || 0} days processed)` : '';
        setCeSyncMessage({
          type: 'success',
          text: `AWS Cost Explorer synced successfully!${costStr ? ` Current Month Spend: ${costStr}` : ''}${details}.`,
        });
        const todayStr = new Date().toISOString().slice(0, 10);
        setLastCeSyncDate(todayStr);
        if (rawSpend !== undefined && rawSpend !== '') {
          setCeTotalSpend(Number(rawSpend));
        }
      } else {
        setCeSyncMessage({
          type: 'info',
          text: 'AWS Cost Explorer sync request sent to AgentBuilder pipeline.',
        });
      }
    } catch (e: any) {
      console.warn('Cost Explorer sync notice:', e);
      setCeSyncMessage({
        type: 'error',
        text: e?.response?.data?.message || e.message || 'Cost Explorer sync failed. Please check the AgentBuilder webhook status.',
      });
    } finally {
      setIsSyncingCe(false);
    }
  };

  const awsAccountId = record?.awsAccountId || 'Not Verified';
  const accountType = record?.accountType || 'STANDALONE';
  const region = record?.region || 'us-east-1';
  const partition = record?.partition || 'aws';
  const stackName = record?.stackName || 'FinOpsAwsIntegration';
  const roleName = record?.roleName || 'FinOpsAwsIntegrationRole';

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const res = await finopsApi.triggerDataIngestionSync(record?.connectionId, record?.awsAccountId);
      if (res && typeof res.recordsProcessed === 'number') {
        setRecordsProcessed(res.recordsProcessed);
      }
      setLastSyncText('Just now');
      if (record?.awsAccountId) {
        finopsStore.connectAws({
          accountId: record.awsAccountId,
          recordsProcessed: res?.recordsProcessed || 0,
          syncStatus: 'synced',
          lastSync: 'Just now',
        });
      }
    } catch (e) {
      console.warn('Sync notice:', e);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatus('ready');
      }, 1000);
    }
  };

  const handleConfirmDisconnect = async () => {
    try {
      await finopsApi.disconnect(record?.connectionId, record?.awsAccountId);
    } catch (e) {
      console.warn('Disconnect notice:', e);
    }
    finopsStore.disconnectAws();
    setShowDisconnectModal(false);
    if (onDisconnect) {
      onDisconnect();
    } else {
      router.push('/connectors/aws?mode=new');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      
      {/* 1. AWS Connection Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Card Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              AWS Connection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your AWS account is connected and verified.
            </p>
          </div>
          <Badge variant="connected" className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full">
            CONNECTED
          </Badge>
        </div>

        {/* Metadata 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
              AWS ACCOUNT ID
            </span>
            <p className="font-semibold text-slate-900 text-xs">{awsAccountId}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
              ACCOUNT TYPE
            </span>
            <p className="font-semibold text-slate-900 text-xs font-sans">
              {accountType === 'MEMBER'
                ? 'Member (Linked) Account'
                : accountType === 'PAYER'
                ? 'Management (Payer) Account'
                : 'Standalone Account'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
              AWS REGION & PARTITION
            </span>
            <p className="font-semibold text-slate-900 text-xs">
              {region} {partition !== 'aws' ? `(${partition})` : ''}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
              CLOUDFORMATION STACK
            </span>
            <p className="font-semibold text-slate-900 text-xs">{stackName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
              IAM ROLE
            </span>
            <p className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <span>{roleName}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
              S3 CUR BUCKET
            </span>
            <p className="font-semibold text-purple-700 text-xs truncate">
              {record?.bucketName || '—'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
              DATA EXPORT NAME
            </span>
            <p className="font-semibold text-slate-900 text-xs truncate">
              {record?.exportName || '—'}
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="primary"
            size="md"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="text-xs font-semibold uppercase tracking-wider gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 cursor-pointer rounded-lg shadow-sm"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>SYNC S3 CUR</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleSyncCostExplorer(false)}
            disabled={isSyncingCe}
            className="text-xs font-semibold uppercase tracking-wider gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 cursor-pointer transition-colors rounded-lg shadow-sm"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncingCe ? 'animate-spin' : ''}`} />
            <span>SYNC COST EXPLORER</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (onManageConnection) onManageConnection();
              else router.push('/connectors/aws?mode=new');
            }}
            className="text-xs font-semibold uppercase tracking-wider gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 cursor-pointer rounded-lg shadow-xs"
          >
            <Settings className="h-3.5 w-3.5 text-slate-500" />
            <span>MANAGE CONNECTION</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowDisconnectModal(true)}
            className="text-xs font-semibold uppercase tracking-wider gap-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 cursor-pointer rounded-lg shadow-xs ml-auto"
          >
            <Unplug className="h-3.5 w-3.5" />
            <span>DISCONNECT</span>
          </Button>
        </div>

        {/* Cost Explorer Sync Notification Banner */}
        {ceSyncMessage && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="leading-relaxed font-medium">{ceSyncMessage.text}</p>
            </div>
            <button
              onClick={() => setCeSyncMessage(null)}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Data Sync Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Data Sync</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Status of your AWS cost and usage data synchronization.
          </p>
        </div>

        {/* 4-Box Inner Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-200 overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50">
          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              S3 CUR STATUS
            </span>
            {record?.syncStatus === 'pending_aws_export' ? (
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Awaiting AWS Delivery</span>
              </div>
            ) : recordsProcessed > 0 || record?.syncStatus === 'synced' ? (
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Pending First Sync</span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CUR RECORDS
            </span>
            <p className="font-bold text-slate-900 text-sm font-mono">
              {recordsProcessed.toLocaleString()}
            </p>
          </div>

          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              COST EXPLORER
            </span>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <p className="font-bold text-slate-900 text-sm">
                {lastCeSyncDate ? (
                  <span className="text-slate-900 font-bold">
                    {ceTotalSpend !== undefined && !isNaN(Number(ceTotalSpend))
                      ? `$${Number(ceTotalSpend).toFixed(2)}`
                      : 'Synced'}
                  </span>
                ) : (
                  <span className="text-slate-400">Not synced yet</span>
                )}
              </p>
            </div>
            {lastCeSyncDate && (
              <p className="text-[10px] text-slate-500 font-mono">Date: {lastCeSyncDate}</p>
            )}
          </div>

          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LAST CUR SYNC
            </span>
            <p className="font-semibold text-slate-800 text-sm">{lastSyncText}</p>
          </div>
        </div>

        {/* Informational banner when AWS billing export is still delivering */}
        {record?.syncStatus === 'pending_aws_export' && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 text-xs animate-in fade-in">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Awaiting First AWS CUR 2.0 Export Delivery</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                AWS Data Exports takes up to 24 hours to generate and deposit the initial Parquet billing file into your S3 bucket (<span className="font-mono font-semibold">{record?.bucketName || 'S3 Bucket'}</span>). Your AgentBuilder ingestion pipeline is connected and will process the records as soon as AWS delivers the file.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleSyncCostExplorer(false)}
            disabled={isSyncingCe}
            className="text-xs font-semibold uppercase tracking-wider gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 cursor-pointer transition-colors rounded-lg shadow-sm"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncingCe ? 'animate-spin' : ''}`} />
            <span>SYNC COST EXPLORER</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/cost-allocation/detail?provider=aws')}
            className="text-xs font-semibold uppercase tracking-wider gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 cursor-pointer rounded-lg shadow-sm"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>OPEN COST EXPLORER</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push('/connectors')}
            className="text-xs font-semibold uppercase tracking-wider border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 cursor-pointer rounded-lg shadow-xs"
          >
            <span>VIEW INGESTION LOGS</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="text-xs font-semibold uppercase tracking-wider gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 cursor-pointer rounded-lg shadow-xs"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>SYNC CUR AGAIN</span>
          </Button>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-slate-900">Disconnect AWS Account?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure? This will stop cost data syncing and remove the cross-account role mapping for this account.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-lg"
                onClick={() => setShowDisconnectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDisconnect}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
