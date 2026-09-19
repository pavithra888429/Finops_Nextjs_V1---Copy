"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MetricsOverview } from "@/components/connectors/MetricsOverview";
import { AvailableProviders } from "@/components/connectors/AvailableProviders";
import { ConnectionActivityTable } from "@/components/connectors/ConnectionActivityTable";
import { HowConnectionsWork } from "@/components/connectors/HowConnectionsWork";
import { AwsSetupModal } from "@/components/connectors/AwsSetupModal";
import { AwsRequirementsModal } from "@/components/connectors/AwsRequirementsModal";
import { OpenRouterSetupModal, OpenRouterConnectionDetails } from "@/components/connectors/OpenRouterSetupModal";
import { ProviderData } from "@/components/connectors/ProviderCard";
import { finopsStore } from "@/store/finops.store";
import { finopsApi } from "@/api/finops.api";

export default function ConnectorsPage() {
  const router = useRouter();
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);

  // Dynamic state for providers
  const [providers, setProviders] = useState<ProviderData[]>([
    {
      id: "gemini",
      name: "Gemini",
      category: "AI Model Provider",
      status: "connected",
      description: "Track Gemini API usage, models, tokens, requests, and cost.",
      accountText: "Production account",
      syncText: "Synced 10 minutes ago",
      metricsText: "Tokens, requests, models, cost",
      logoType: "gemini",
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      category: "AI Model Gateway",
      status: "not_connected",
      description: "Track multi-model AI usage, token consumption, requests, and provider cost.",
      accountText: "No API key configured",
      syncText: "Not synchronized",
      metricsText: "Waiting for connection",
      logoType: "openrouter",
    },
    {
      id: "aws",
      name: "AWS",
      category: "Cloud Infrastructure",
      status: "not_connected",
      description: "Track AWS accounts, services, regions, resources, usage, and cost.",
      accountText: "No account connected",
      syncText: "Not synchronized",
      metricsText: "Waiting for connection",
      logoType: "aws",
    },
  ]);

  // Sync state from Backend API & localStorage
  useEffect(() => {
    let isSubscribed = true;

    // 1. Check local storage for OpenRouter connection
    try {
      const savedOpenRouter = localStorage.getItem("finops_openrouter_connection");
      if (savedOpenRouter) {
        const parsed: any = JSON.parse(savedOpenRouter);
        setProviders((prev) =>
          prev.map((p) => {
            if (p.id === "openrouter") {
              const rem = parsed.remainingBalance !== null && parsed.remainingBalance !== undefined
                ? `$${parsed.remainingBalance.toFixed(2)}`
                : parsed.creditLimit
                ? `$${parsed.creditLimit.toFixed(2)}`
                : "Active";
              return {
                ...p,
                name: parsed.connectionName || "OpenRouter",
                status: "connected",
                accountText: parsed.keysList?.length ? `${parsed.keysList.length} Keys Tracked` : "Shared Gateway",
                syncText: parsed.verifiedAt ? `Synced ${new Date(parsed.verifiedAt).toLocaleDateString()}` : "Synced just now",
                metricsText: rem,
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.warn("Failed to load saved OpenRouter connection:", err);
    }

    // 2. Check Backend API for AWS connections
    const loadBackendConnections = async () => {
      try {
        const connections = await finopsApi.listConnections();
        if (!isSubscribed) return;

        if (connections && connections.length > 0) {
          const activeConn = connections.find((c) => c.status === "connected") || connections[0];
          const isConn = activeConn.status === "connected";
          const isFailed = activeConn.status === "verification_failed";

          setProviders((prev) =>
            prev.map((p) => {
              if (p.id === "aws") {
                return {
                  ...p,
                  name: activeConn.connectionName || "AWS Account",
                  status: isConn ? "connected" : isFailed ? "action_required" : "not_connected",
                  accountText: activeConn.awsAccountId
                    ? `ACCOUNT: ${activeConn.awsAccountId}`
                    : `STACK: ${activeConn.stackName}`,
                  syncText: activeConn.verifiedAt
                    ? `Verified ${new Date(activeConn.verifiedAt).toLocaleDateString()}`
                    : isFailed
                    ? "Verification failed"
                    : "Setup in progress",
                  metricsText: activeConn.bucketName
                    ? `S3: ${activeConn.bucketName}`
                    : isConn
                    ? "Connected (Pending Cloud Cost)"
                    : "Action required in console",
                };
              }
              return p;
            })
          );
        } else {
          setProviders((prev) =>
            prev.map((p) =>
              p.id === "aws"
                ? {
                    ...p,
                    name: "AWS",
                    status: "not_connected",
                    accountText: "No account connected",
                    syncText: "Not synchronized",
                    metricsText: "Waiting for connection",
                  }
                : p
            )
          );
        }
      } catch (err) {
        console.warn("Backend connections fetch notice:", err);
      }
    };

    loadBackendConnections();

    const handleUpdate = () => loadBackendConnections();
    window.addEventListener("finops_store_update", handleUpdate);
    return () => {
      isSubscribed = false;
      window.removeEventListener("finops_store_update", handleUpdate);
    };
  }, []);

  const [activities, setActivities] = useState<any[]>([
    {
      id: "1",
      provider: "gemini",
      providerName: "Gemini",
      event: "Usage data synchronized",
      status: "success",
      dateTime: "Today, 10:42 AM",
      details: "4.2M records imported",
    },
    {
      id: "2",
      provider: "aws",
      providerName: "AWS",
      event: "Billing export setup incomplete",
      status: "warning",
      dateTime: "Today, 09:15 AM",
      details: "Action required",
    },
  ]);

  // Handle successful AWS connection
  const handleAwsConnected = (accountDetails: any) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === "aws"
          ? {
              ...p,
              status: "connected",
              accountText: `${accountDetails.accountName || "Production"} (${accountDetails.accountId || "864981730114"})`,
              syncText: "Synced just now",
              metricsText: "CUR Parquet & CloudWatch active",
            }
          : p
      )
    );

    setActivities((prev) => [
      {
        id: Date.now().toString(),
        provider: "aws",
        providerName: "AWS",
        event: "AWS IAM & CUR connection verified",
        status: "success",
        dateTime: "Just now",
        details: "Initial sync scheduled",
      },
      ...prev,
    ]);
  };

  // Handle successful OpenRouter connection
  const handleOpenRouterConnected = (details: OpenRouterConnectionDetails) => {
    try {
      localStorage.setItem("finops_openrouter_connection", JSON.stringify(details));
    } catch (e) {
      console.warn("Failed to persist OpenRouter details:", e);
    }

    const spent = details.totalUsage !== undefined ? details.totalUsage.toFixed(2) : "0.00";
    const rem = details.remainingBalance !== null && details.remainingBalance !== undefined
      ? `$${details.remainingBalance.toFixed(2)}`
      : details.creditLimit
      ? `$${details.creditLimit.toFixed(2)}`
      : "Active";

    setProviders((prev) =>
      prev.map((p) =>
        p.id === "openrouter"
          ? {
              ...p,
              name: details.connectionName || "OpenRouter",
              status: "connected",
              accountText: (details.productTag || "ALL").toUpperCase(),
              syncText: "Synced just now",
              metricsText: rem,
            }
          : p
      )
    );

    setActivities((prev) => [
      {
        id: Date.now().toString(),
        provider: "openrouter",
        providerName: "OpenRouter",
        event: "API Key verified & activated",
        status: "success",
        dateTime: "Just now",
        details: `Spent: $${spent} • Allocated to: ${details.productTag.toUpperCase()}`,
      },
      ...prev,
    ]);
  };

  const connectedCount = providers.filter((p) => p.status === "connected").length;
  const actionRequiredCount = providers.filter((p) => p.status === "action_required").length;

  return (
    <div className="w-full flex-1 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Content */}
      <main className="w-full max-w-[1600px] mx-auto flex-1 px-6 lg:px-10 py-6 space-y-6">
        
        {/* Page Banner / Header matching Agent_Builder_Nextjs_V1 */}
        <div className="pb-2">
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>FINOPS</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400">CONNECTORS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Connectors
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
            Connect billing and usage providers to start FinOps analytics
          </p>
        </div>

        {/* 4 KPI Metric Cards */}
        <MetricsOverview
          total={providers.length}
          connected={connectedCount}
          actionRequired={actionRequiredCount}
          lastSynced="Today, 10:42 AM"
        />

        {/* Available Providers Section */}
        <AvailableProviders
          providers={providers}
          onConnectAws={() => router.push("/connectors/aws?mode=new")}
          onViewRequirementsAws={() => setIsRequirementsOpen(true)}
          onConnectOpenRouter={() => router.push("/connectors/openrouter?mode=new")}
          onManageOpenRouter={() => router.push("/connectors/openrouter?mode=details")}
          onViewAnalytics={(providerId) => {
            if (providerId === "aws") {
              router.push("/connectors/aws?mode=details");
            } else if (providerId === "openrouter") {
              router.push("/connectors/openrouter?mode=details");
            } else {
              alert(`Opening Analytics for ${providerId.toUpperCase()}`);
            }
          }}
        />

        {/* Bottom 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Connection Activity Table (approx 65% / 8 cols) */}
          <div className="lg:col-span-8">
            <ConnectionActivityTable activities={activities} />
          </div>

          {/* Right Column: How Connections Work Stepper (approx 35% / 4 cols) */}
          <div className="lg:col-span-4">
            <HowConnectionsWork />
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* OpenRouter Setup Modal */}
      <OpenRouterSetupModal
        isOpen={isOpenRouterModalOpen}
        onClose={() => setIsOpenRouterModalOpen(false)}
        onSuccess={handleOpenRouterConnected}
      />

      {/* AWS CloudFormation Setup Modal */}
      <AwsSetupModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
        onSuccess={handleAwsConnected}
      />

      {/* AWS Requirements Modal */}
      <AwsRequirementsModal
        isOpen={isRequirementsOpen}
        onClose={() => setIsRequirementsOpen(false)}
      />

    </div>
  );
}
