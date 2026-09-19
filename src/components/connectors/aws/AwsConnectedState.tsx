'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  RotateCw,
  Settings,
  Unplug,
  BarChart2,
  FileText,
  AlertTriangle,
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
  const [syncStatus, setSyncStatus] = useState<'ready' | 'syncing'>('ready');
  const [lastSyncText, setLastSyncText] = useState(
    record?.verifiedAt
      ? new Date(record.verifiedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'August 20, 2026'
  );
  const [recordsProcessed, setRecordsProcessed] = useState(0);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

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
      const res = await finopsApi.triggerDataIngestionSync(record?.connectionId);
      if (res && typeof res.recordsProcessed === 'number') {
        setRecordsProcessed(res.recordsProcessed);
      }
      setLastSyncText('Just now');
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
    finopsStore.disconnectAws();
    if (record?.connectionId) {
      try {
        await finopsApi.disconnect(record.connectionId);
      } catch (e) {
        console.warn('Disconnect notice:', e);
      }
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
      
      {/* 1. AWS Connection Card */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 p-6 shadow-xl space-y-6">
        {/* Card Header */}
        <div className="flex items-start justify-between pb-4 border-b border-dark-border/80">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              AWS Connection
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your AWS account is connected and verified.
            </p>
          </div>
          <Badge variant="connected" className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
            CONNECTED
          </Badge>
        </div>

        {/* Metadata 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
              AWS ACCOUNT ID
            </span>
            <p className="font-semibold text-white text-xs">{awsAccountId}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
              ACCOUNT TYPE
            </span>
            <p className="font-semibold text-emerald-400 text-xs font-sans">
              {accountType === 'MEMBER'
                ? 'Member (Linked) Account'
                : accountType === 'PAYER'
                ? 'Management (Payer) Account'
                : 'Standalone Account'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
              AWS REGION & PARTITION
            </span>
            <p className="font-semibold text-white text-xs">
              {region} {partition !== 'aws' ? `(${partition})` : ''}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
              CLOUDFORMATION STACK
            </span>
            <p className="font-semibold text-white text-xs">{stackName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
              IAM ROLE
            </span>
            <p className="font-semibold text-white text-xs flex items-center gap-1.5">
              <span>{roleName}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
              S3 CUR BUCKET
            </span>
            <p className="font-semibold text-emerald-400 text-xs truncate">
              {record?.bucketName || 'Configured via Stack'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
              DATA EXPORT NAME
            </span>
            <p className="font-semibold text-white text-xs truncate">
              {record?.exportName || 'daily-cur-export'}
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-dark-border/80">
          <Button
            variant="primary"
            size="md"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="text-xs font-semibold uppercase tracking-wider gap-2 bg-[#090d16] hover:bg-[#111827] border border-dark-border text-white px-4 py-2"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>SYNC NOW</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (onManageConnection) onManageConnection();
              else router.push('/connectors/aws?mode=new');
            }}
            className="text-xs font-semibold uppercase tracking-wider gap-2 border border-dark-border bg-dark-card hover:bg-[#151c2e] text-slate-200 px-4 py-2"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>MANAGE CONNECTION</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowDisconnectModal(true)}
            className="text-xs font-semibold uppercase tracking-wider gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2"
          >
            <Unplug className="h-3.5 w-3.5" />
            <span>DISCONNECT</span>
          </Button>
        </div>
      </div>

      {/* 2. Data Sync Card */}
      <div className="rounded-xl border border-dark-border bg-dark-card/90 p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Data Sync</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Status of your AWS cost and usage data synchronization.
          </p>
        </div>

        {/* 3-Box Inner Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg border border-dark-border overflow-hidden divide-y md:divide-y-0 md:divide-x divide-dark-border bg-[#090d16]">
          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              DATA STATUS
            </span>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Ready</span>
            </div>
          </div>

          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              LAST SYNC
            </span>
            <p className="font-semibold text-white text-sm">{lastSyncText}</p>
          </div>

          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              RECORDS PROCESSED
            </span>
            <p className="font-semibold text-white text-sm font-mono">
              {recordsProcessed.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/connectors')}
            className="text-xs font-semibold uppercase tracking-wider gap-2 bg-[#090d16] hover:bg-[#111827] border border-dark-border text-white px-4 py-2"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>OPEN COST EXPLORER</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push('/connectors')}
            className="text-xs font-semibold uppercase tracking-wider border border-dark-border bg-dark-card hover:bg-[#151c2e] text-slate-200 px-4 py-2"
          >
            <span>VIEW INGESTION LOGS</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="text-xs font-semibold uppercase tracking-wider gap-2 border border-dark-border bg-dark-card hover:bg-[#151c2e] text-slate-200 px-4 py-2"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>SYNC AGAIN</span>
          </Button>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-dark-border bg-dark-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span>Disconnect AWS Account?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure? This will stop cost data syncing and remove the cross-account role mapping for this account.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-dark-border/80">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDisconnectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDisconnect}
                className="bg-rose-600 hover:bg-rose-700 text-white"
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
