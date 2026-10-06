'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCloudFormationLaunchUrl } from '@/services/cloudformation.service';

interface CloudFormationSetupProps {
  region: string;
  roleName?: string;
  launchUrl?: string;
  isFormValid: boolean;
  onContinue: () => void;
  onLaunchConsole?: () => Promise<string | void> | void;
}

export function CloudFormationSetup({
  region,
  roleName,
  launchUrl: propLaunchUrl,
  isFormValid,
  onContinue,
  onLaunchConsole,
}: CloudFormationSetupProps) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const isReadyToLaunch = Boolean(region && region.trim().length > 0);

  const getComputedUrl = () => {
    if (propLaunchUrl && propLaunchUrl.includes('templateURL=')) {
      return propLaunchUrl;
    }
    return getCloudFormationLaunchUrl({
      region: region || 'us-east-1',
      roleName: roleName?.trim() || 'FinOpsAwsIntegrationRole',
      stackName: 'Production AWS Account',
    });
  };

  const handleOpenConsole = async () => {
    if (onLaunchConsole) {
      setIsLaunching(true);
      try {
        await onLaunchConsole();
      } finally {
        setIsLaunching(false);
      }
      return;
    }
    const url = getComputedUrl();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const url = getComputedUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-100 w-full">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Apply CloudFormation Template
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
          Use CloudFormation to create the IAM role and resources required to connect
          this AWS account to FinOps Cloud Cost.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 font-normal">
          <li>Launch CloudFormation Stack</li>
          <li>Create IAM Role</li>
          <li>Configure Cloud Cost access</li>
          <li>Create FinOps AWS connection</li>
        </ol>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenConsole}
            disabled={!isReadyToLaunch || isLaunching}
            className="flex items-center gap-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm font-semibold"
          >
            <span>{isLaunching ? 'Connecting & Opening...' : 'Open in AWS Console'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>

          {isReadyToLaunch && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-xs cursor-pointer font-medium"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          )}

          {!isReadyToLaunch && (
            <p className="w-full text-xs text-slate-400">
              Please select a valid AWS Region above first.
            </p>
          )}
        </div>

        <div className="mt-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Template S3 URL:</span>
            <button
              type="button"
              onClick={() => {
                const url = process.env.NEXT_PUBLIC_FINOPS_CFN_TEMPLATE_URL || 'https://square-pulse-public.s3.ap-south-1.amazonaws.com/templates/finops-aws-cloud-cost-role.yaml';
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-purple-600 hover:text-purple-700 transition-colors text-[11px] font-semibold"
            >
              Copy Template URL
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-600 break-all select-all bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
            {process.env.NEXT_PUBLIC_FINOPS_CFN_TEMPLATE_URL || 'https://square-pulse-public.s3.ap-south-1.amazonaws.com/templates/finops-aws-cloud-cost-role.yaml'}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700 font-medium">
          <input
            type="checkbox"
            id="cfn-completed"
            checked={hasCompleted}
            onChange={(e) => setHasCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-purple-600 accent-purple-600"
          />
          <span>I have completed the CloudFormation setup</span>
        </label>

        <div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onContinue}
            disabled={!isFormValid || !hasCompleted}
            className="w-full sm:w-auto rounded-lg shadow-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white"
          >
            Continue to Configure Cloud Cost
          </Button>
        </div>
      </div>
    </div>
  );
}
