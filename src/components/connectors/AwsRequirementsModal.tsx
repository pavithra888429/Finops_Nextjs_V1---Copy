import React from "react";
import { X, Check, Shield, FileCode, Server } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AwsRequirementsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-dark-border bg-dark-surface p-6 shadow-2xl shadow-black/80">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-muted hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-dark-border/60 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-dark-heading">
              AWS Connection Requirements
            </h3>
            <p className="text-xs text-dark-muted">
              Prerequisites & IAM permissions needed for FinOps data collection
            </p>
          </div>
        </div>

        {/* Requirements List */}
        <div className="py-5 space-y-4 text-xs text-dark-text">
          
          <div className="flex gap-3 items-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">AWS Administrator Access (to run CloudFormation)</p>
              <p className="text-slate-400 mt-0.5">
                You must have IAM permission to deploy a CloudFormation template in your management (payer) account.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">Read-Only IAM Role Permissions</p>
              <p className="text-slate-400 mt-0.5">
                The deployed template grants read-only access to:
              </p>
              <ul className="mt-1 list-disc list-inside text-slate-400 space-y-0.5 font-mono text-[11px]">
                <li>ce:GetCostAndUsage, ce:GetAnomalies</li>
                <li>s3:GetObject, s3:ListBucket (CUR S3 Bucket)</li>
                <li>cloudwatch:GetMetricData (Model tokens)</li>
                <li>ec2:DescribeInstances, ec2:DescribeVolumes</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">Cost and Usage Report (CUR 2.0 / Data Export)</p>
              <p className="text-slate-400 mt-0.5">
                Enabled in AWS Billing with Parquet format writing to an S3 bucket.
              </p>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-2 border-t border-dark-border/60">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
