'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { finopsApi } from '@/api/finops.api';
import { getPhase2CloudFormationLaunchUrl } from '@/services/cloudformation.service';

export interface AwsStep2Form {
  createCur: 'yes' | 'no';
  createS3: 'yes' | 'no';
  bucketName: string;
  bucketRegion: string;
  exportPrefix: string;
  exportName: string;
  existingBucketName: string;
  existingBucketRegion: string;
}

interface CloudFormationSummaryProps {
  connectionId?: string;
  awsAccountId?: string;
  formData: AwsStep2Form;
  isFormValid: boolean;
  onStackCreated: (connectionId: string) => void;
}

export function CloudFormationSummary({
  connectionId = '',
  awsAccountId = '',
  formData,
  isFormValid,
  onStackCreated,
}: CloudFormationSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const bucketName = formData.createS3 === 'yes' ? formData.bucketName : formData.existingBucketName;
  const bucketRegion = formData.createS3 === 'yes' ? formData.bucketRegion : formData.existingBucketRegion;

  const getComputedLaunchUrl = (): string => {
    return getPhase2CloudFormationLaunchUrl({
      region: bucketRegion || 'us-east-1',
      s3BucketName: bucketName,
      exportName: formData.exportName || 'FinOpsFocusCostExport',
      iamRoleName: 'FinOpsAwsIntegrationRole',
    });
  };

  const handleCopyLink = () => {
    const url = getComputedLaunchUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateStack = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let launchUrl = getComputedLaunchUrl();

      try {
        const res = await finopsApi.configureCloudCost(connectionId, {
          createCur: formData.createCur === 'yes',
          createS3: formData.createS3 === 'yes',
          bucketName: bucketName,
          bucketRegion: bucketRegion || 'us-east-1',
          exportPathPrefix: formData.exportPrefix || 'cur2/',
          exportName: formData.exportName || 'FinOpsFocusCostExport',
          awsAccountId: awsAccountId,
        });
        if (res?.cloudFormationLaunchUrl) {
          launchUrl = res.cloudFormationLaunchUrl;
        }
      } catch (apiErr) {
        console.warn('[CloudFormationSummary] configureCloudCost notice:', apiErr);
      }

      // Open AWS CloudFormation Phase 2 stack in AWS Management Console
      if (launchUrl) {
        window.open(launchUrl, '_blank', 'noopener,noreferrer');
      }

      // Advance to Phase 3 (Connection Progress)
      onStackCreated(connectionId);
    } catch (err: any) {
      console.error('handleCreateStack error:', err);
      onStackCreated(connectionId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300 pt-6 border-t border-slate-100">
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          CloudFormation Configuration Summary
        </h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Review the CUR billing and S3 bucket parameters to be applied in your AWS account:
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-slate-500 font-sans">Create CUR 2.0 Export:</span>
          <span className="text-slate-900 font-semibold">{formData.createCur.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 font-sans">S3 Provisioning Mode:</span>
          <span className="text-slate-900 font-semibold">
            {formData.createS3 === 'yes' ? 'Create New Bucket' : 'Use Existing Bucket'}
          </span>
        </div>
        {bucketName && (
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">S3 Bucket:</span>
            <span className="text-purple-700 font-semibold">{bucketName}</span>
          </div>
        )}
        {bucketRegion && (
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">S3 Region:</span>
            <span className="text-slate-900">{bucketRegion}</span>
          </div>
        )}
        {formData.exportName && (
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Export Name:</span>
            <span className="text-slate-900 font-semibold">{formData.exportName}</span>
          </div>
        )}
        {formData.exportPrefix && (
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Export Path Prefix:</span>
            <span className="text-slate-900">{formData.exportPrefix}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={!isFormValid}
          className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-xs"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Template Link Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Copy CloudFormation Link</span>
            </>
          )}
        </button>

        <Button
          variant="primary"
          size="md"
          disabled={!isFormValid || isSubmitting}
          onClick={handleCreateStack}
          className="text-xs font-semibold flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              <span>Launching Stack...</span>
            </>
          ) : (
            <>
              <span>Launch CloudFormation Stack (Phase 2)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
