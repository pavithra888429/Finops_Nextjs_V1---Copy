import React, { useState } from "react";
import { X, ExternalLink, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AwsSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accountDetails: any) => void;
}

export function AwsSetupModal({ isOpen, onClose, onSuccess }: AwsSetupModalProps) {
  const [currentStep, setCurrentStep] = useState<"configure" | "cloudformation" | "verifying" | "s3_config" | "completed">("configure");
  const [accountName, setAccountName] = useState("Production AWS");
  const [region, setRegion] = useState("us-east-1");
  const [roleName, setRoleName] = useState("FinOpsCrossAccountRole");
  const [externalId, setExternalId] = useState("");
  const [cloudFormationUrl, setCloudFormationUrl] = useState("");
  const [verifiedAccount, setVerifiedAccount] = useState<any>(null);
  const [s3Bucket, setS3Bucket] = useState("");
  const [s3Prefix, setS3Prefix] = useState("cur2/");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Step 1: Generate CloudFormation URL and External ID
  const handleStartSetup = () => {
    setErrorMessage("");
    const generatedExtId = "finops_" + Math.random().toString(36).substring(2, 12);
    setExternalId(generatedExtId);

    // 1-Click CloudFormation Stack URL
    const platformAccountId = process.env.NEXT_PUBLIC_PLATFORM_ACCOUNT_ID || "864981730114";
    const templateBaseUrl = "https://s3.amazonaws.com/cf-templates-finops/finops-aws-cloud-cost-cur2.yaml";
    const stackUrl = `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/quickcreate?templateURL=${encodeURIComponent(
      templateBaseUrl
    )}&stackName=FinOpsDataPipeline&param_ExternalId=${generatedExtId}&param_PlatformAccountId=${platformAccountId}&param_RoleName=${roleName}`;

    setCloudFormationUrl(stackUrl);
    setCurrentStep("cloudformation");
  };

  // Step 2: Verification step
  const handleVerify = () => {
    setCurrentStep("verifying");
    setErrorMessage("");

    // Simulate backend verification
    setTimeout(() => {
      // Success auto-detection
      const detected = {
        accountId: "864981730114",
        accountType: "PAYER",
        region,
        roleArn: `arn:aws:iam::864981730114:role/${roleName}`,
        verifiedAt: new Date().toISOString(),
      };
      setVerifiedAccount(detected);
      setCurrentStep("s3_config");
    }, 2200);
  };

  // Step 3: Complete S3 CUR setup
  const handleCompleteS3 = () => {
    setCurrentStep("completed");
    setTimeout(() => {
      onSuccess({
        ...verifiedAccount,
        accountName,
        s3Bucket,
        s3Prefix,
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 font-bold text-xs shadow-xs">
            <span>aws</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Connect AWS Infrastructure
            </h3>
            <p className="text-xs text-slate-500">
              Step-by-step cross-account IAM and CUR billing setup
            </p>
          </div>
        </div>

        {/* Body Content by Step */}
        <div className="py-5">
          
          {/* STEP 1: Configure Account Parameters */}
          {currentStep === "configure" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Connection / Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 focus:outline-none transition-all shadow-xs"
                  placeholder="e.g. Production Main Account"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary AWS Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 focus:outline-none shadow-xs"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                    <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    IAM Role Name
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">🔒 Read-Only Security Policy</p>
                <p className="text-slate-500 leading-relaxed">
                  Our CloudFormation template creates a read-only role for Cost Explorer, S3 CUR, and CloudWatch metrics. No resource write or modification permissions are requested.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" onClick={handleStartSetup}>
                  <span>Continue to CloudFormation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Launch CloudFormation */}
          {currentStep === "cloudformation" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Click below to launch the pre-configured CloudFormation stack in your AWS Console. After the stack finishes creating (takes ~1 minute), click <strong>Verify Connection</strong>.
              </p>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Stack Name:</span>
                  <span className="font-mono font-semibold text-slate-800">FinOpsDataPipeline</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">External ID:</span>
                  <span className="font-mono font-semibold text-slate-800">{externalId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Target Region:</span>
                  <span className="font-mono font-semibold text-slate-800">{region}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={cloudFormationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 shadow-sm transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Launch CloudFormation Stack (AWS Console)</span>
                </a>
                <Button variant="primary" onClick={handleVerify}>
                  <span>Verify Connection</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Verifying */}
          {currentStep === "verifying" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="h-9 w-9 animate-spin text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Verifying Cross-Account IAM Role...
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Attempting <code className="text-purple-600 font-mono">sts:AssumeRole</code> and checking read permissions for Cost Explorer and S3.
              </p>
            </div>
          )}

          {/* STEP 4: CUR 2.0 S3 Export Configuration */}
          {currentStep === "s3_config" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>IAM Connection verified successfully! Detected Account ID: <strong>{verifiedAccount?.accountId || "864981730114"}</strong> (PAYER).</span>
              </div>

              <p className="text-xs text-slate-600">
                Enter the S3 bucket where your AWS Cost and Usage Report (CUR 2.0) Parquet files are stored:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  S3 Bucket Name
                </label>
                <input
                  type="text"
                  value={s3Bucket}
                  onChange={(e) => setS3Bucket(e.target.value)}
                  placeholder="e.g. my-company-cur-billing-exports"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 focus:outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Export Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={s3Prefix}
                  onChange={(e) => setS3Prefix(e.target.value)}
                  placeholder="e.g. cur2/"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 focus:outline-none transition-all shadow-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="primary" onClick={handleCompleteS3}>
                  <span>Save & Complete Setup</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Completed Confirmation */}
          {currentStep === "completed" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h4 className="text-base font-bold text-slate-900">
                AWS Provider Connected!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Your AWS account is now connected. Initial billing sync will process in the background.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
