import { Suspense } from "react";
import { AwsSetupFlow } from "@/components/connectors/aws/AwsSetupFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AWS Connection Setup | FinOps Analytics",
  description: "Connect your AWS account via CloudFormation for FinOps cost analytics",
};

export default function AwsConnectorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a11] flex items-center justify-center text-xs text-slate-500 font-mono">
          Loading AWS setup session...
        </div>
      }
    >
      <AwsSetupFlow />
    </Suspense>
  );
}
