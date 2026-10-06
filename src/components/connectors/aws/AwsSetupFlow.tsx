"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StepIndicator } from "./StepIndicator";
import { AwsAccountConfiguration, AwsStep1Form } from "./AwsAccountConfiguration";
import { ConnectionVerification } from "./ConnectionVerification";
import { CostAndUsageConfiguration } from "./CostAndUsageConfiguration";
import { S3Configuration } from "./S3Configuration";
import { CloudFormationSummary, AwsStep2Form } from "./CloudFormationSummary";
import { ConnectionProgress } from "./ConnectionProgress";
import { AwsConnectedState } from "./AwsConnectedState";
import { finopsApi, AwsConnectionRecord } from "@/api/finops.api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function AwsSetupFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");

  const isExplicitNew = mode === "new";
  const isExplicitDetails = mode === "details";

  const [state, setState] = useState<"step1" | "verifying" | "success" | "failure" | "step2" | "step3">("step1");
  const [connectionId, setConnectionId] = useState<string>("");
  const [step1Data, setStep1Data] = useState<Partial<AwsStep1Form>>({});
  const [activeRecord, setActiveRecord] = useState<AwsConnectionRecord | null>(null);
  const [isLoadingActive, setIsLoadingActive] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Step 2 Clean Form State (Zero hardcoded values)
  const [createCur, setCreateCur] = useState<"yes" | "no">("yes");
  const [createS3, setCreateS3] = useState<"yes" | "no">("yes");
  const [bucketName, setBucketName] = useState("");
  const [bucketRegion, setBucketRegion] = useState("");
  const [exportPrefix, setExportPrefix] = useState("cur2/");
  const [exportName, setExportName] = useState("");
  const [existingBucketName, setExistingBucketName] = useState("");
  const [existingBucketRegion, setExistingBucketRegion] = useState("");

  // Load existing connection from backend or localStorage on mount
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingActive(true);

    if (typeof window !== "undefined") {
      const savedConnId = localStorage.getItem("finops_aws_connection_id");
      const savedAccountId = localStorage.getItem("finops_aws_account_id");
      if (savedConnId) {
        setConnectionId(savedConnId);
      }
      if (savedAccountId) {
        setStep1Data((prev) => ({ ...prev, awsAccountId: savedAccountId }));
        setBucketName(`finops-cur2-${savedAccountId}-v1`);
      }
    }

    finopsApi
      .listConnections()
      .then((connections) => {
        if (!isSubscribed) return;
        if (connections && connections.length > 0) {
          const active = connections.find((c) => c.status === "connected") || connections[0];
          setActiveRecord(active);
          setConnectionId(active.connectionId);
          if (typeof window !== "undefined") {
            localStorage.setItem("finops_aws_connection_id", active.connectionId);
            if (active.awsAccountId) {
              localStorage.setItem("finops_aws_account_id", active.awsAccountId);
            }
          }
          setStep1Data({
            accountName: active.connectionName || "",
            region: active.region || "",
            awsAccountId: active.awsAccountId || "",
            roleName: active.roleName || "",
            externalId: active.externalId || "",
          });
          if (active.region) {
            setBucketRegion(active.region);
          }
          if (active.awsAccountId) {
            setBucketName(`finops-cur2-${active.awsAccountId}-v1`);
          }
          // Never prematurely set 'success' badge on mount — live verification must be explicitly triggered
          if (isExplicitDetails) {
            // Details mode is handled by isExplicitDetails flag
          }
        } else if (isExplicitDetails) {
          // If in details mode but no connection exists in backend, redirect to new
          router.replace("/connectors/aws?mode=new");
        }
      })
      .catch((err) => {
        console.warn("Fetch active connection notice:", err);
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingActive(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isExplicitDetails, router]);

  // Handle Step 1 Complete (User filled accountName & region, initiated CloudFormation)
  const handleStep1Complete = async (data: AwsStep1Form & { connectionRecord?: AwsConnectionRecord | null }) => {
    setStep1Data(data);
    let connId = data.connectionRecord?.connectionId || connectionId;

    setState("verifying");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      let activeExtId = data.connectionRecord?.externalId || data.externalId;

      if (!connId && data.accountName && data.region) {
        const startRes = await finopsApi.startConnection({
          connectionName: data.accountName,
          region: data.region,
          awsAccountId: data.awsAccountId,
          roleName: data.roleName,
          externalId: activeExtId,
        });
        if (startRes && startRes.connectionId) {
          connId = startRes.connectionId;
          setConnectionId(connId);
          setActiveRecord(startRes);
          if (typeof window !== "undefined") {
            localStorage.setItem("finops_aws_connection_id", connId);
            if (data.awsAccountId) localStorage.setItem("finops_aws_account_id", data.awsAccountId);
          }
          if (startRes.externalId) {
            activeExtId = startRes.externalId;
          }
        }
      }

      if (connId) {
        await finopsApi.confirmCloudFormation(connId, true, activeExtId);
        const res = await finopsApi.verifyConnection(
          connId,
          activeExtId,
          data.roleName,
          data.awsAccountId
        );
        setActiveRecord(res);

        if (res && res.status === "connected") {
          setState("success");
        } else {
          setError(res?.lastError?.message || "Could not assume the cross-account IAM role. Please confirm the CloudFormation stack finished creating in your AWS Console with status CREATE_COMPLETE.");
          setState("failure");
        }
      } else {
        setError("Missing connection ID. Please restart setup.");
        setState("failure");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("handleStep1Complete error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not assume the cross-account IAM role. Please confirm the CloudFormation stack finished creating in your AWS Console with status CREATE_COMPLETE.";
      setError(errMsg);
      setState("failure");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleVerify = async () => {
    if (!connectionId) return;
    setState("verifying");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const extId = activeRecord?.externalId || step1Data.externalId;
      const role = activeRecord?.roleName || step1Data.roleName;
      const accId = activeRecord?.awsAccountId || step1Data.awsAccountId;

      await finopsApi.confirmCloudFormation(connectionId, true, extId);
      const res = await finopsApi.verifyConnection(connectionId, extId, role, accId);
      setActiveRecord(res);

      if (res && res.status === "connected") {
        setState("success");
      } else {
        setError(res?.lastError?.message || "Verification failed. AWS role could not be assumed.");
        setState("failure");
      }
    } catch (err: any) {
      console.error("handleVerify error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not assume the cross-account IAM role. Please confirm the CloudFormation stack finished creating in your AWS Console with status CREATE_COMPLETE.";
      setError(errMsg);
      setState("failure");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToStep1 = () => {
    setState("step1");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueToPhase2 = () => {
    setState("step2");
    if (activeRecord?.region && !bucketRegion) {
      setBucketRegion(activeRecord.region);
    }
    if (activeRecord?.awsAccountId && !bucketName) {
      setBucketName(`finops-cur2-${activeRecord.awsAccountId}-v1`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isStep2Valid = () => {
    if (createS3 === "yes") {
      const isPatternValid = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucketName.trim());
      return bucketName.trim() !== "" && isPatternValid && bucketRegion.trim() !== "";
    }
    const isExistingPatternValid = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(existingBucketName.trim());
    return existingBucketName.trim() !== "" && isExistingPatternValid && existingBucketRegion.trim() !== "";
  };

  const getStep2Data = (): AwsStep2Form => ({
    createCur,
    createS3,
    bucketName: bucketName.trim(),
    bucketRegion: bucketRegion.trim(),
    exportPrefix: exportPrefix.trim(),
    exportName: exportName.trim(),
    existingBucketName: existingBucketName.trim(),
    existingBucketRegion: existingBucketRegion.trim(),
  });

  const currentStepNum =
    state === "step1" || state === "verifying" || state === "success" || state === "failure"
      ? 1
      : state === "step2"
      ? 2
      : 3;

  return (
    <div className="w-full min-h-full flex-1 flex flex-col justify-between font-sans">
      <div className="w-full flex-1 flex justify-center px-4 sm:px-6 lg:px-8 py-6">
        <main className="w-full max-w-4xl space-y-6">
        
        {/* Header Banner */}
        <div className="mb-8 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>FINOPS</span>
            <span className="text-slate-300">/</span>
            <span>CONNECTORS</span>
            <span className="text-slate-300">/</span>
            <span className="text-purple-600 font-bold">
              {isExplicitDetails ? "AWS DETAILS" : "AWS SETUP"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {isExplicitDetails ? "AWS Connection Details" : "Connect AWS Account"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            {isExplicitDetails
              ? "Manage your AWS connection and data synchronization."
              : "Follow the steps below to connect your AWS environment."}
          </p>
        </div>

        {/* Details Mode */}
        {isExplicitDetails ? (
          <AwsConnectedState record={activeRecord} />
        ) : (
          <>
            {/* 3-Step Indicator */}
            <StepIndicator currentStep={currentStepNum} />

            {/* Step Card Container */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              
              {/* STEP 1: Account Configuration */}
              {state === "step1" && (
                <AwsAccountConfiguration
                  initialData={step1Data}
                  onComplete={handleStep1Complete}
                />
              )}

              {/* STEP 1 SUB-STATES: Verifying / Success / Failure */}
              {["verifying", "success", "failure"].includes(state) && (
                <ConnectionVerification
                  status={state as "verifying" | "success" | "failure"}
                  connectionRecord={activeRecord}
                  onVerify={handleVerify}
                  onContinueToCloudCost={handleContinueToPhase2}
                  onBackToStep1={handleBackToStep1}
                />
              )}

              {/* STEP 2: Configure Cloud Cost (CUR 2.0 & S3) */}
              {state === "step2" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <h2 className="text-base font-bold text-slate-900">
                    Configure Cloud Cost & Usage Reports
                  </h2>

                  <CostAndUsageConfiguration
                    value={createCur}
                    onChange={setCreateCur}
                  />

                  <S3Configuration
                    createS3={createS3}
                    onCreateS3Change={setCreateS3}
                    bucketName={bucketName}
                    onBucketNameChange={setBucketName}
                    bucketRegion={bucketRegion}
                    onBucketRegionChange={setBucketRegion}
                    exportPrefix={exportPrefix}
                    onExportPrefixChange={setExportPrefix}
                    exportName={exportName}
                    onExportNameChange={setExportName}
                    existingBucketName={existingBucketName}
                    onExistingBucketNameChange={setExistingBucketName}
                    existingBucketRegion={existingBucketRegion}
                    onExistingBucketRegionChange={setExistingBucketRegion}
                  />

                  <CloudFormationSummary
                    connectionId={connectionId}
                    awsAccountId={step1Data.awsAccountId || activeRecord?.awsAccountId}
                    formData={getStep2Data()}
                    isFormValid={isStep2Valid()}
                    onStackCreated={async (id: string) => {
                      const finalConnId = id || connectionId;
                      if (finalConnId) {
                        try {
                          const s2Data = getStep2Data();
                          const bName = s2Data.createS3 === "yes" ? s2Data.bucketName : s2Data.existingBucketName;
                          const bRegion = s2Data.createS3 === "yes" ? s2Data.bucketRegion : s2Data.existingBucketRegion;
                          const confRes = await finopsApi.configureCloudCost(finalConnId, {
                            createCur: s2Data.createCur === "yes",
                            createS3: s2Data.createS3 === "yes",
                            bucketName: bName,
                            bucketRegion: bRegion,
                            exportPathPrefix: s2Data.exportPrefix,
                            exportName: s2Data.exportName,
                            awsAccountId: step1Data.awsAccountId || activeRecord?.awsAccountId,
                          });
                          if (confRes?.connection) {
                            setActiveRecord(confRes.connection);
                          }
                        } catch (confErr) {
                          console.warn("Configure cloud cost notice:", confErr);
                        }
                      }
                      setConnectionId(finalConnId);
                      setState("step3");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}

              {/* STEP 3: Connection Progress */}
              {state === "step3" && (
                <ConnectionProgress
                  connectionId={connectionId}
                  onFinish={() => router.push("/connectors/aws?mode=details")}
                />
              )}

            </div>
          </>
        )}

      </main>
      </div>

      <Footer />
    </div>
  );
}
