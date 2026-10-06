import React, { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ArrowRight, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AwsConnectionRecord } from "@/api/finops.api";
import { getCloudFormationLaunchUrl } from "@/services/cloudformation.service";

interface ConnectionVerificationProps {
  status: "verifying" | "success" | "failure";
  connectionRecord?: AwsConnectionRecord | null;
  onVerify: () => void;
  onContinueToCloudCost?: () => void;
  onBackToStep1?: () => void;
}

export function ConnectionVerification({
  status,
  connectionRecord,
  onVerify,
  onContinueToCloudCost,
  onBackToStep1,
}: ConnectionVerificationProps) {
  const [confirmed, setConfirmed] = useState(false);

  const isVerifying = status === "verifying";
  const isSuccess = status === "success";
  const isFailure = status === "failure";

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <h2 className="text-base font-bold text-slate-900">
        Verify AWS Connection
      </h2>

      {!isSuccess && !isFailure && (
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={isVerifying}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-purple-600 text-purple-600"
            />
            <span>
              I confirm that the CloudFormation stack creation completed successfully (status: <strong>CREATE_COMPLETE</strong>) in the AWS Management Console.
            </span>
          </label>

          <Button
            onClick={onVerify}
            disabled={!confirmed || isVerifying}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>AWS Connected Successfully!</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2.5 text-xs font-mono shadow-xs">
              {connectionRecord.awsAccountId && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-sans">AWS Account ID:</span>
                  <span className="text-slate-900 font-semibold">{connectionRecord.awsAccountId}</span>
                </div>
              )}
              {connectionRecord.accountType && (
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-500 font-sans">Account Type:</span>
                  <span className="text-slate-900 font-semibold">
                    {connectionRecord.accountType === "PAYER"
                      ? "Management (Payer) Account"
                      : connectionRecord.accountType === "MEMBER"
                      ? "Member (Linked) Account"
                      : "Standalone Account"}
                  </span>
                </div>
              )}
              {connectionRecord.region && (
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-500 font-sans">AWS Region:</span>
                  <span className="text-slate-900">{connectionRecord.region}</span>
                </div>
              )}
              {connectionRecord.roleName && (
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-500 font-sans">IAM Role:</span>
                  <span className="text-purple-700 font-semibold">{connectionRecord.roleName}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-sans">STS AssumeRole:</span>
                <span className="text-emerald-700 font-bold">Verified</span>
              </div>
            </div>
          </div>

          {/* Member Account Notice */}
          {connectionRecord.accountType === "MEMBER" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Note: This is a Member (Linked) account. AWS Cost and Usage Reports (CUR) are best configured from the Management (Payer) account to capture consolidated billing.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onVerify}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shadow-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Re-Verify Live with AWS STS</span>
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={onContinueToCloudCost}
              className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm"
            >
              <span>Continue to Configure Cloud Cost (CUR & S3)</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Failure State */}
      {isFailure && (() => {
        const cfnUrl =
          connectionRecord?.cloudFormationLaunchUrl ||
          (connectionRecord?.region
            ? getCloudFormationLaunchUrl({
                region: connectionRecord.region,
                roleName: connectionRecord.roleName || 'FinOpsAwsIntegrationRole',
                stackName: connectionRecord.stackName || 'Production AWS Account',
                externalId: connectionRecord.externalId,
              })
            : '');

        return (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 space-y-4 animate-in slide-in-from-bottom-2 shadow-sm">
            <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
              <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>Verification Failed</span>
            </div>

            <p className="text-xs text-rose-800 leading-relaxed">
              {connectionRecord?.lastError?.message ||
                "Could not assume the cross-account IAM role. Please confirm the CloudFormation stack finished creating in your AWS Console with status CREATE_COMPLETE."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {cfnUrl && (
                <a
                  href={cfnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-rose-200 hover:bg-rose-100 text-rose-900 transition-colors shadow-xs"
                >
                  <span>Open in AWS Console</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={onVerify}
                className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                <span>Retry Verification</span>
              </Button>

              {onBackToStep1 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onBackToStep1}
                  className="text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
                >
                  <span>Edit Configuration / Re-launch</span>
                </Button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
