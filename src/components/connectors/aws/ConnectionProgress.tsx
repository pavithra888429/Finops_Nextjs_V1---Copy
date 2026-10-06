'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, ArrowRight, Loader2, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { finopsStore } from '@/store/finops.store';
import { finopsApi, AwsConnectionRecord, extractAwsConnectionRecord } from '@/api/finops.api';

interface ConnectionProgressProps {
  connectionId?: string;
  onFinish?: () => void;
}

export function ConnectionProgress({ connectionId, onFinish }: ConnectionProgressProps) {
  const router = useRouter();
  const [liveRecord, setLiveRecord] = useState<AwsConnectionRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const runVerification = useCallback(async () => {
    setIsVerifying(true);
    setVerifyError(null);

    let targetConnId =
      connectionId ||
      (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_connection_id') || '' : '');
    let targetAccountId =
      (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_account_id') || '' : '');
    let targetExternalId =
      (typeof window !== 'undefined' ? localStorage.getItem('finops_aws_external_id') || '' : '');

    let targetRoleName = 'FinOpsAwsIntegrationRole';
    let targetBucketName = '';
    let targetExportName = '';
    let targetRegion = 'us-east-1';

    // Fetch active connection from MongoDB to retrieve real saved bucket and export names
    try {
      const conns = await finopsApi.listConnections();
      if (conns && conns.length > 0) {
        const matched = targetConnId ? conns.find(c => c.connectionId === targetConnId) || conns[0] : conns[0];
        targetConnId = matched.connectionId || targetConnId;
        targetAccountId = matched.awsAccountId || targetAccountId;
        targetExternalId = matched.externalId || targetExternalId;
        targetRoleName = matched.roleName || targetRoleName;
        targetBucketName = matched.bucketName || '';
        targetExportName = matched.exportName || '';
        targetRegion = matched.region || targetRegion;

        if (typeof window !== 'undefined') {
          if (targetConnId) localStorage.setItem('finops_aws_connection_id', targetConnId);
          if (targetAccountId) localStorage.setItem('finops_aws_account_id', targetAccountId);
          if (targetExternalId) localStorage.setItem('finops_aws_external_id', targetExternalId);
        }

        setLiveRecord(matched);
      }
    } catch (lookupErr) {
      console.warn('Could not query connections:', lookupErr);
    }

    try {
      // ----------------------------------------------------------------------
      // STEP 1: Trigger Live AWS STS Verification Pipeline (Workflow 2)
      // Webhook: https://api.agents.snsihub.ai/webhook/3aebaff4-1e7f-411f-9976-98eab6c4d210
      // Checks whether the IAM role is created & can be assumed via AWS STS
      // ----------------------------------------------------------------------
      console.log('[ConnectionProgress] Step 1: Triggering Live AWS STS Verification Pipeline (Workflow 2)...', {
        connectionId: targetConnId,
        externalId: targetExternalId,
        roleName: targetRoleName,
        awsAccountId: targetAccountId,
      });

      const phase1Res = await finopsApi.verifyConnection(
        targetConnId,
        targetExternalId,
        targetRoleName,
        targetAccountId
      );
      console.log('[ConnectionProgress] Step 1 IAM Verification response:', phase1Res);

      const parsedPhase1 = extractAwsConnectionRecord(phase1Res) || phase1Res;

      // Update intermediate liveRecord so Phase 1 status immediately updates in UI
      setLiveRecord(prev => ({
        ...(prev || {}),
        ...(parsedPhase1 || {}),
        roleStatus: parsedPhase1?.roleStatus || (parsedPhase1?.status === 'connected' ? 'verified' : prev?.roleStatus || 'unverified'),
        status: parsedPhase1?.status || prev?.status || 'cloudformation_pending',
      }));

      // ----------------------------------------------------------------------
      // STEP 2: Trigger Multi-Tenant AWS STS HTTPS Verification Workflow (Workflow 4)
      // Webhook: https://api.agents.snsihub.ai/webhook/110b05d9-5725-445a-8a1f-da24833ed603
      // Checks whether the S3 bucket and CUR policy are created
      // ----------------------------------------------------------------------
      console.log('[ConnectionProgress] Step 2: Triggering Multi-Tenant AWS STS HTTPS Verification Workflow (Workflow 4)...', {
        connectionId: targetConnId,
        awsAccountId: targetAccountId,
        externalId: targetExternalId,
        roleName: targetRoleName,
        bucketName: targetBucketName,
        exportName: targetExportName,
        region: targetRegion,
      });

      const phase2Res = await finopsApi.verifyCloudCostResources({
        connectionId: targetConnId,
        awsAccountId: targetAccountId,
        externalId: targetExternalId,
        roleName: targetRoleName,
        bucketName: targetBucketName,
        exportName: targetExportName,
        region: targetRegion,
      } as any);
      console.log('[ConnectionProgress] Step 2 Cloud Cost verification response:', phase2Res);

      const parsedPhase2 = extractAwsConnectionRecord(phase2Res) || phase2Res;

      // Fetch the latest updated record directly from MongoDB to ensure complete state sync
      let dbUpdated = null;
      try {
        dbUpdated = await finopsApi.getConnectionStatus(targetConnId, targetAccountId);
      } catch (e) {}

      // Merge real outputs from both workflows + DB
      const combinedRecord: any = {
        ...(parsedPhase1 || {}),
        ...(parsedPhase2 || {}),
        ...(dbUpdated || {}),
      };

      // Preserve explicit phase 1 role verification if verified
      if (parsedPhase1?.roleStatus === 'verified' || parsedPhase1?.status === 'connected') {
        combinedRecord.roleStatus = 'verified';
        combinedRecord.status = 'connected';
      }

      // Preserve Phase 2 S3 bucket status strictly from Workflow 4 / DB
      if (parsedPhase2?.s3BucketStatus) {
        combinedRecord.s3BucketStatus = parsedPhase2.s3BucketStatus;
      } else if (dbUpdated?.s3BucketStatus) {
        combinedRecord.s3BucketStatus = dbUpdated.s3BucketStatus;
      }

      if (parsedPhase2?.exportStatus) {
        combinedRecord.exportStatus = parsedPhase2.exportStatus;
      } else if (dbUpdated?.exportStatus) {
        combinedRecord.exportStatus = dbUpdated.exportStatus;
      }

      if (parsedPhase2?.cloudCostStatus) {
        combinedRecord.cloudCostStatus = parsedPhase2.cloudCostStatus;
      }

      if (combinedRecord && (combinedRecord.status || combinedRecord.roleStatus || combinedRecord._id)) {
        setLiveRecord(combinedRecord);
        if (combinedRecord.status === 'verification_failed') {
          setVerifyError(combinedRecord.lastError?.message || 'AWS STS AssumeRole could not be completed.');
        } else {
          if (typeof window !== 'undefined') {
            if (combinedRecord.connectionId) localStorage.setItem('finops_aws_connection_id', combinedRecord.connectionId);
            if (combinedRecord.awsAccountId) localStorage.setItem('finops_aws_account_id', combinedRecord.awsAccountId);
            if (combinedRecord.externalId) localStorage.setItem('finops_aws_external_id', combinedRecord.externalId);
          }
        }
      } else {
        setVerifyError('Waiting for live deployment confirmation from AWS.');
      }
    } catch (err: any) {
      console.warn('Live verification error:', err);
      setVerifyError(err?.response?.data?.message || err?.message || 'Verification request failed.');
    } finally {
      setIsVerifying(false);
    }
  }, [connectionId]);

  useEffect(() => {
    runVerification();
  }, [runVerification]);

  // Strict live evaluation — NO mock data, purely from real live statuses
  const isRoleVerified =
    (liveRecord?.roleStatus === 'verified' || liveRecord?.status === 'connected') &&
    Boolean(liveRecord?.awsAccountId);

  const isS3Active =
    liveRecord?.s3BucketStatus === 'active' && Boolean(liveRecord?.bucketName);

  const isExportActive =
    liveRecord?.exportStatus === 'active' && Boolean(liveRecord?.exportName);

  const isFullyVerified = isRoleVerified && isS3Active && isExportActive;

  // Real resources strictly mapped to live data (zero synthetic fallbacks)
  const realResources = [
    {
      id: 'p1_iam_role',
      phase: 'Phase 1',
      title: 'IAM Cross-Account Integration Role',
      resourceName: liveRecord?.roleName || '—',
      isVerified: isRoleVerified,
      statusLabel: isRoleVerified ? 'Verified' : isVerifying ? 'Verifying...' : 'Pending',
      details: isRoleVerified
        ? `Role ${liveRecord?.roleName} active with STS AssumeRole trust policy.`
        : 'Waiting for IAM role to be created via CloudFormation.',
    },
    {
      id: 'p1_sts_verification',
      phase: 'Phase 1',
      title: 'STS Cross-Account Verification',
      resourceName: liveRecord?.awsAccountId ? `Account ID: ${liveRecord.awsAccountId}` : '—',
      isVerified: isRoleVerified,
      statusLabel: isRoleVerified ? 'Verified' : isVerifying ? 'Verifying...' : 'Unverified',
      details: isRoleVerified
        ? `Live caller identity confirmed for AWS Account ${liveRecord?.awsAccountId}.`
        : 'Awaiting real-time AWS STS SigV4 session verification.',
    },
    {
      id: 'p2_s3_bucket',
      phase: 'Phase 2',
      title: 'S3 Cost & Usage Report Bucket',
      resourceName: liveRecord?.bucketName || '—',
      isVerified: isS3Active,
      statusLabel: isS3Active ? 'Active' : isVerifying ? 'Checking...' : 'Pending Stack',
      details: isS3Active
        ? `S3 Bucket ${liveRecord?.bucketName} provisioned in ${liveRecord?.region || 'us-east-1'}.`
        : 'Waiting for Phase 2 CloudFormation to create S3 bucket.',
    },
    {
      id: 'p2_s3_policy',
      phase: 'Phase 2',
      title: 'S3 Read Access Policy',
      resourceName: isS3Active && liveRecord?.bucketName ? `${liveRecord.bucketName}-read-policy` : '—',
      isVerified: isS3Active,
      statusLabel: isS3Active ? 'Attached' : isVerifying ? 'Checking...' : 'Pending Stack',
      details: isS3Active
        ? 'S3 Read permissions verified for FinOps integration role.'
        : 'Bucket policy attaches during Phase 2 CloudFormation deployment.',
    },
    {
      id: 'p3_cur_export',
      phase: 'Phase 3',
      title: 'AWS CUR 2.0 Report Delivery',
      resourceName: liveRecord?.exportName || '—',
      isVerified: isExportActive,
      statusLabel: isExportActive ? 'Configured' : isVerifying ? 'Checking...' : 'Pending AWS Delivery',
      details: isExportActive
        ? `Data Export ${liveRecord?.exportName} configured for FOCUS 1.0 Parquet delivery.`
        : 'AWS Billing exports first cost file within 24 hours of creation.',
    },
  ];

  const handleSaveAndFinish = () => {
    if (liveRecord?.awsAccountId) {
      finopsStore.connectAws({
        accountId: liveRecord.awsAccountId,
        name: liveRecord.connectionName || 'AWS Account',
        region: liveRecord.region || 'us-east-1',
        recordsProcessed: 0,
        syncStatus: 'synced',
      });
    }

    if (onFinish) {
      onFinish();
    } else {
      router.push('/connectors/aws?mode=details');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AWS Account Connection & Pipeline Status
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Real live deployment status fetched directly from your AWS environment.
          </p>
        </div>

        {/* Dynamic Top Status Badge */}
        {isVerifying ? (
          <Badge variant="warning" className="text-[10px] uppercase font-semibold px-2.5 py-1">
            <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
            <span>Verifying Live Deployment...</span>
          </Badge>
        ) : isFullyVerified ? (
          <Badge variant="connected" className="text-[10px] uppercase font-semibold px-2.5 py-1">
            All Verified & Active
          </Badge>
        ) : (
          <Badge variant="neutral" className="text-[10px] uppercase font-semibold px-2.5 py-1">
            Verification Pending
          </Badge>
        )}
      </div>

      {/* Real Progress Checklist */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <ul className="space-y-3">
          {realResources.map((res) => {
            return (
              <li
                key={res.id}
                className="flex flex-col border-b border-slate-100 pb-3.5 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                      {res.isVerified ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : isVerifying ? (
                        <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">{res.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">({res.phase})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {res.resourceName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {res.isVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {res.statusLabel}
                      </span>
                    ) : isVerifying ? (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-purple-600" />
                        {res.statusLabel}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {res.statusLabel}
                      </span>
                    )}
                  </div>
                </div>
                <p className="ml-9 text-[11px] text-slate-500">{res.details}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Dynamic Action / Finish Banner */}
      {isVerifying ? (
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Loader2 className="h-5 w-5 text-purple-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">
                Verifying live deployment with AWS STS...
              </p>
              <p className="text-[11px] text-slate-500">
                Contacting AWS STS SigV4 endpoint to verify IAM and CloudFormation state.
              </p>
            </div>
          </div>
        </div>
      ) : isFullyVerified ? (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>AWS Account Connected & Configured!</span>
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Phase 1 & Phase 2 CloudFormation stacks are active. Ready to ingest CUR 2.0 cost data.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="md"
              onClick={handleSaveAndFinish}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
            >
              <span>Save Connector & View Details</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <span>Awaiting AWS CloudFormation Creation</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              {verifyError ||
                'Ensure the CloudFormation stack in your AWS Console has finished creating with status CREATE_COMPLETE.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="md"
              onClick={runVerification}
              variant="outline"
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100/60 text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-lg shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Verify Live Deployment</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
