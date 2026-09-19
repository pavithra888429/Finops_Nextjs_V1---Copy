'use client';

import React, { useState } from 'react';
import { CloudFormationSetup } from './CloudFormationSetup';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import { AwsConnectionRecord } from '@/api/finops.api';
import { getCloudFormationLaunchUrl } from '@/services/cloudformation.service';

export interface AwsStep1Form {
  accountName: string;
  region: string;
  awsAccountId?: string;
  partition?: 'aws' | 'aws-us-gov' | 'aws-cn';
  roleName?: string;
  permissionsBoundaryArn?: string;
  externalId?: string;
}

interface AwsAccountConfigurationProps {
  initialData: Partial<AwsStep1Form>;
  onComplete: (data: AwsStep1Form & { connectionRecord?: AwsConnectionRecord | null }) => void;
}

const AWS_REGIONS = [
  { value: '', label: 'Select AWS Region...' },
  { value: 'us-east-1', label: 'US East (N. Virginia) us-east-1' },
  { value: 'us-east-2', label: 'US East (Ohio) us-east-2' },
  { value: 'us-west-1', label: 'US West (N. California) us-west-1' },
  { value: 'us-west-2', label: 'US West (Oregon) us-west-2' },
  { value: 'eu-west-1', label: 'Europe (Ireland) eu-west-1' },
  { value: 'eu-west-2', label: 'Europe (London) eu-west-2' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt) eu-central-1' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai) ap-south-1' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore) ap-southeast-1' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney) ap-southeast-2' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo) ap-northeast-1' },
  { value: 'ca-central-1', label: 'Canada (Central) ca-central-1' },
  { value: 'sa-east-1', label: 'South America (São Paulo) sa-east-1' },
];

export function AwsAccountConfiguration({ initialData, onComplete }: AwsAccountConfigurationProps) {
  const [accountName, setAccountName] = useState(initialData.accountName || '');
  const [region, setRegion] = useState(initialData.region || '');
  const [awsAccountId, setAwsAccountId] = useState(initialData.awsAccountId || '');
  const [partition, setPartition] = useState<'aws' | 'aws-us-gov' | 'aws-cn'>(
    initialData.partition || 'aws'
  );
  const [roleName, setRoleName] = useState(initialData.roleName || '');
  const [permissionsBoundaryArn, setPermissionsBoundaryArn] = useState(
    initialData.permissionsBoundaryArn || ''
  );
  const [externalId] = useState<string>(
    () => initialData.externalId || `ext_${Math.random().toString(36).substring(2, 14)}`
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isFormValid =
    accountName.trim().length > 0 &&
    region.trim().length > 0 &&
    awsAccountId.trim().length === 12;

  const handleContinue = () => {
    if (!isFormValid) return;
    onComplete({
      accountName: accountName.trim(),
      region: region.trim(),
      awsAccountId: awsAccountId.trim(),
      partition,
      roleName: roleName.trim() || undefined,
      permissionsBoundaryArn: permissionsBoundaryArn.trim() || undefined,
      externalId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Form Header & Fields */}
      <div className="space-y-4 w-full">
        <h2 className="text-base font-bold text-dark-heading">
          Configure Amazon Web Services for Cloud Cost
        </h2>

        {/* Connection Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Connection name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g. Production Account"
            className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* AWS Account ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            AWS Account ID (12-Digit) <span className="text-rose-400">*</span>
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Enter the 12-digit AWS Account ID where the CloudFormation stack will be deployed.
          </p>
          <input
            type="text"
            required
            maxLength={12}
            value={awsAccountId}
            onChange={(e) => setAwsAccountId(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 992382766703"
            className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
          {awsAccountId.length > 0 && awsAccountId.length < 12 && (
            <p className="text-[10px] text-amber-400 mt-1">
              Must be exactly 12 digits ({awsAccountId.length}/12 digits entered)
            </p>
          )}
        </div>

        {/* AWS Region */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            AWS Region <span className="text-rose-400">*</span>
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            The AWS Region where the CloudFormation stack will be created.
          </p>
          <div className="relative">
            <select
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full appearance-none rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none pr-8 transition-colors"
            >
              {AWS_REGIONS.map((r) => (
                <option key={r.value} value={r.value} className="bg-dark-surface text-white">
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* AWS Partition */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            AWS Partition
          </label>
          <div className="relative">
            <select
              value={partition}
              onChange={(e) => setPartition(e.target.value as any)}
              className="w-full appearance-none rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none pr-8 transition-colors"
            >
              <option value="aws" className="bg-dark-surface text-white">AWS Standard Commercial (arn:aws)</option>
              <option value="aws-us-gov" className="bg-dark-surface text-white">AWS GovCloud (arn:aws-us-gov)</option>
              <option value="aws-cn" className="bg-dark-surface text-white">AWS China (arn:aws-cn)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Advanced Enterprise Options Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors focus:outline-none"
          >
            {showAdvanced ? '− Hide Advanced Security Options' : '+ Show Advanced Security Options (Permissions Boundary)'}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 rounded-xl border border-dark-border bg-[#090d16] space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Permissions Boundary ARN (Optional)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  If your enterprise enforces Permissions Boundaries on IAM roles, specify the ARN here.
                </p>
                <input
                  type="text"
                  value={permissionsBoundaryArn}
                  onChange={(e) => setPermissionsBoundaryArn(e.target.value)}
                  placeholder="arn:aws:iam::123456789012:policy/EnterpriseBoundary"
                  className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom IAM Role Name (Optional)
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Enter custom IAM role name"
                  className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CloudFormation Section - Exact Agent Builder Workflow */}
      <CloudFormationSetup
        region={region}
        roleName={roleName}
        launchUrl={getCloudFormationLaunchUrl({
          region,
          roleName: roleName?.trim() || 'FinOpsAwsIntegrationRole',
          stackName: accountName?.trim() || 'Production AWS Account',
          externalId,
        })}
        isFormValid={isFormValid}
        onContinue={handleContinue}
      />
    </div>
  );
}
