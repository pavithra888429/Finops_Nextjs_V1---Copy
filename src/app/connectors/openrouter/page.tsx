import { Suspense } from "react";
import { OpenRouterSetupFlow } from "@/components/connectors/openrouter/OpenRouterSetupFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenRouter Connection Setup | FinOps Analytics",
  description: "Connect your OpenRouter account for FinOps AI token and cost analytics",
};

export default function OpenRouterConnectorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a11] flex items-center justify-center text-xs text-slate-500 font-mono">
          Loading OpenRouter setup session...
        </div>
      }
    >
      <OpenRouterSetupFlow />
    </Suspense>
  );
}
