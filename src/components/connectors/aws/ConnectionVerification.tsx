import React, { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AwsConnectionRecord } from "@/api/finops.api";

interface ConnectionVerificationProps {
  status: "verifying" | "success" | "failure";
  connectionRecord?: AwsConnectionRecord | null;
  onVerify: () => void;
  onContinueToCloudCost?: () => void;
}

export function ConnectionVerification({
  status,
  connectionRecord,
  onVerify,
  onContinueToCloudCost,
}: ConnectionVerificationProps) {
  const [confirmed, setConfirmed] = useState(false);

  const isVerifying = status === "verifying";
  const isSuccess = status === "success";
  const isFailure = status === "failure";

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <h2 className="text-base font-bold text-white">
        Verify AWS Connection
      </h2>

      {!isSuccess && !isFailure && (
        <div className="space-y-5 rounded-xl border border-dark-border bg-dark-card/90 p-5 sm:p-6">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={isVerifying}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-dark-border bg-[#090d16] text-blue-600 focus:ring-blue-500"
            />
            <span>
              I confirm that the CloudFormation stack creation completed successfully (status: <strong>CREATE_COMPLETE</strong>) in the AWS Management Console.
            </span>
          </label>

          <Button
            onClick={onVerify}
            disabled={!confirmed || isVerifying}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Verifying IAM Role with STS...</span>
              </>
            ) : (
              <span>Verify AWS Connection</span>
            )}
          </Button>
        </div>
      )}

      {/* Success State */}
      {isSuccess && connectionRecord && (
        <div className="space-y-5 animate-in slide-in-from-bottom-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>AWS Connected Successfully!</span>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-[#090d16] p-4 sm:p-5 space-y-2.5 text-xs font-mono">
              {connectionRecord.awsAccountId && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-sans">AWS Account ID:</span>
                  <span className="text-emerald-300 font-semibold">{connectionRecord.awsAccountId}</span>
                </div>
              )}
              {connectionRecord.accountType && (
                <div className="flex justify-between items-center py-1 border-t border-dark-border/40">
                  <span className="text-slate-400 font-sans">Account Type:</span>
                  <span className="text-emerald-300 font-semibold">
                    {connectionRecord.accountType === "PAYER"
                      ? "Management (Payer) Account"
                      : connectionRecord.accountType === "MEMBER"
                      ? "Member (Linked) Account"
                      : "Standalone Account"}
                  </span>
                </div>
              )}
              {connectionRecord.region && (
                <div className="flex justify-between items-center py-1 border-t border-dark-border/40">
                  <span className="text-slate-400 font-sans">AWS Region:</span>
                  <span className="text-white">{connectionRecord.region}</span>
                </div>
              )}
              {connectionRecord.roleName && (
                <div className="flex justify-between items-center py-1 border-t border-dark-border/40">
                  <span className="text-slate-400 font-sans">IAM Role:</span>
                  <span className="text-white">{connectionRecord.roleName}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-dark-border/60">
                <span className="text-slate-400 font-sans">STS AssumeRole:</span>
                <span className="text-emerald-400 font-semibold">Verified</span>
              </div>
            </div>
          </div>

          {/* Member Account Notice */}
          {connectionRecord.accountType === "MEMBER" && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Note: This is a Member (Linked) account. AWS Cost and Usage Reports (CUR) are best configured from the Management (Payer) account to capture consolidated billing.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onVerify}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 rounded-lg border border-dark-border/60 bg-[#090d16] cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
              <span>Re-Verify Live with AWS STS</span>
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={onContinueToCloudCost}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-500"
            >
              <span>Continue to Configure Cloud Cost (CUR & S3)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Failure State */}
      {isFailure && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-4 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>Verification Failed</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {connectionRecord?.lastError?.message ||
              "Could not assume the cross-account IAM role. Please confirm the CloudFormation stack finished creating in your AWS Console with status CREATE_COMPLETE."}
          </p>

          <Button
            variant="primary"
            size="md"
            onClick={onVerify}
            className="text-xs font-semibold bg-rose-600 hover:bg-rose-500"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Verification</span>
          </Button>
        </div>
      )}
    </div>
  );
}
