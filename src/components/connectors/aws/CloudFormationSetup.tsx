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
}

export function CloudFormationSetup({
  region,
  roleName,
  launchUrl: propLaunchUrl,
  isFormValid,
  onContinue,
}: CloudFormationSetupProps) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleOpenConsole = () => {
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
    <div className="space-y-6 pt-6 border-t border-dark-border/60 w-full">
      <div>
        <h3 className="text-base font-bold text-dark-heading">
          Apply CloudFormation Template
        </h3>
        <p className="mt-1.5 text-xs text-dark-muted leading-relaxed">
          Use CloudFormation to create the IAM role and resources required to connect
          this AWS account to FinOps Cloud Cost.
        </p>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-card/90 p-5 space-y-4">
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 font-normal">
          <li>Launch CloudFormation Stack</li>
          <li>Create IAM Role</li>
          <li>Configure Cloud Cost access</li>
          <li>Create FinOps AWS connection</li>
        </ol>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenConsole}
            disabled={!isReadyToLaunch}
            className="flex items-center gap-2"
          >
            <span>Open in AWS Console</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>

          {isReadyToLaunch && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1.5 rounded-lg border border-dark-border/60 bg-[#090d16]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          )}

          {!isReadyToLaunch && (
            <p className="w-full text-xs text-slate-500">
              Please select a valid AWS Region above first.
            </p>
          )}
        </div>

        <div className="mt-3 p-3 rounded-lg border border-dark-border/60 bg-[#080b13] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Template S3 URL:</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('https://finops-cloudformation-templates-12345.s3.amazonaws.com/finops-aws-cloud-cost-role.yaml');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors text-[11px] font-medium"
            >
              Copy Template URL
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-400 break-all select-all bg-black/40 p-2 rounded border border-dark-border/40">
            https://finops-cloudformation-templates-12345.s3.amazonaws.com/finops-aws-cloud-cost-role.yaml
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-300">
          <input
            type="checkbox"
            id="cfn-completed"
            checked={hasCompleted}
            onChange={(e) => setHasCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-dark-border bg-dark-card text-blue-600 focus:ring-blue-500/30 accent-blue-600"
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
            className="w-full sm:w-auto"
          >
            Continue to Configure Cloud Cost
          </Button>
        </div>
      </div>
    </div>
  );
}
