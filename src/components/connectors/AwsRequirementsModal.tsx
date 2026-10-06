import React from "react";
import { X, Check, Shield, FileCode, Server } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AwsRequirementsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 shadow-xs">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AWS Connection Requirements
            </h3>
            <p className="text-xs text-slate-500">
              Prerequisites & IAM permissions needed for FinOps data collection
            </p>
          </div>
        </div>

        {/* Requirements List */}
        <div className="py-5 space-y-4 text-xs text-slate-600">
          
          <div className="flex gap-3 items-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-600 mt-0.5 shadow-2xs">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">AWS Administrator Access (to run CloudFormation)</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                You must have IAM permission to deploy a CloudFormation template in your management (payer) account.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-600 mt-0.5 shadow-2xs">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div className="w-full">
              <p className="font-semibold text-slate-900">Read-Only IAM Role Permissions</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                The deployed template grants read-only access to:
              </p>
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 space-y-1 font-mono text-[11px]">
                <div>• ce:GetCostAndUsage, ce:GetAnomalies</div>
                <div>• s3:GetObject, s3:ListBucket (CUR S3 Bucket)</div>
                <div>• cloudwatch:GetMetricData (Model tokens)</div>
                <div>• ec2:DescribeInstances, ec2:DescribeVolumes</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-600 mt-0.5 shadow-2xs">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Cost and Usage Report (CUR 2.0 / Data Export)</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Enabled in AWS Billing with Parquet format writing to an S3 bucket.
              </p>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
