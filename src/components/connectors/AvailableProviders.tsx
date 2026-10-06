import React from "react";
import { ProviderCard, ProviderData } from "./ProviderCard";

interface AvailableProvidersProps {
  providers?: ProviderData[];
  onCompleteSetupAws?: () => void;
  onViewRequirementsAws?: () => void;
  onViewAnalytics?: (providerId: string) => void;
}

const DEFAULT_PROVIDERS: ProviderData[] = [
  {
    id: "gemini",
    name: "Gemini",
    category: "AI Model Provider",
    status: "not_connected",
    description: "Track Gemini API usage, models, tokens, requests, and cost.",
    accountText: "No API key configured",
    syncText: "Not synchronized",
    metricsText: "Waiting for connection",
    logoType: "gemini",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    category: "AI Model Gateway",
    status: "not_connected",
    description: "Track model usage, token consumption, requests, and provider cost.",
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
];

interface AvailableProvidersProps {
  providers?: ProviderData[];
  onConnectAws?: () => void;
  onCompleteSetupAws?: () => void;
  onViewRequirementsAws?: () => void;
  onConnectOpenRouter?: () => void;
  onManageOpenRouter?: () => void;
  onViewAnalytics?: (providerId: string) => void;
}

export function AvailableProviders({
  providers = DEFAULT_PROVIDERS,
  onConnectAws,
  onCompleteSetupAws,
  onViewRequirementsAws,
  onConnectOpenRouter,
  onManageOpenRouter,
  onViewAnalytics,
}: AvailableProvidersProps) {
  const handleAwsConnect = onConnectAws || onCompleteSetupAws;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Available Providers
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Connect your provider accounts to collect cost and usage data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((item) => (
          <ProviderCard
            key={item.id}
            provider={item}
            onCompleteSetup={
              item.id === "aws"
                ? handleAwsConnect
                : item.id === "openrouter"
                ? onConnectOpenRouter
                : undefined
            }
            onManage={
              item.id === "openrouter"
                ? onManageOpenRouter
                : undefined
            }
            onViewRequirements={
              item.id === "aws"
                ? onViewRequirementsAws
                : item.id === "openrouter"
                ? () => window.open("https://openrouter.ai/docs/api-reference/overview", "_blank")
                : undefined
            }
            onViewAnalytics={() => onViewAnalytics?.(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
