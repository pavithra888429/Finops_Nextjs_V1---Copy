import React from "react";
import { User, Clock, Database, BarChart2, Plus, Settings, FileText, MoreHorizontal, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ProviderData {
  id: string;
  name: string;
  category: string;
  status: "connected" | "action_required" | "not_connected";
  description: string;
  accountText: string;
  syncText: string;
  metricsText: string;
  logoType: "gemini" | "openrouter" | "aws";
}

interface ProviderCardProps {
  provider: ProviderData;
  onCompleteSetup?: () => void;
  onViewRequirements?: () => void;
  onViewAnalytics?: () => void;
  onManage?: () => void;
}

export function ProviderCard({
  provider,
  onCompleteSetup,
  onViewRequirements,
  onViewAnalytics,
  onManage,
}: ProviderCardProps) {
  const isConnected = provider.status === "connected";

  // Official high-fidelity vector logos
  const renderLogo = () => {
    if (provider.logoType === "gemini") {
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b0f1a] border border-white/5 shadow-inner">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
              fill="url(#geminiGradient)"
            />
            <defs>
              <linearGradient id="geminiGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="0.5" stopColor="#A855F7" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    }

    if (provider.logoType === "openrouter") {
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b0f1a] border border-white/5 shadow-inner">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6L9 12L15 18"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }

    // Official AWS Vector Logo with smile arrow
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b0f1a] border border-white/5 p-2 shadow-inner">
        <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
          <path
            d="M11.66 16.32c-.52.27-1.16.41-1.92.41-1.07 0-1.89-.3-2.45-.91-.56-.61-.84-1.46-.84-2.55 0-1.08.3-1.93.9-2.56.6-.63 1.45-.94 2.55-.94.7 0 1.29.13 1.76.38v-1.1c-.5-.22-1.12-.33-1.87-.33-1.48 0-2.65.45-3.5 1.34-.86.89-1.28 2.08-1.28 3.56 0 1.49.42 2.68 1.27 3.57.85.89 2.01 1.34 3.49 1.34.8 0 1.48-.12 2.04-.37v-1.84zM16.5 8.9h-1.94l-2.46 8.9h1.86l.54-2.14h2.15l.53 2.14h1.88L16.5 8.9zm-1.57 5.34l.64-2.69.64 2.69h-1.28zm9.53-3.69h-1.74l-1.39 5.39-1.29-5.39h-1.81l2.13 7.37h1.9l2.2-7.37zm-.26 10.97c-3.15 2.1-7.53 3.23-12.7 3.23-2.14 0-4.09-.23-5.83-.69l-.67 1.39c1.97.55 4.19.82 6.64.82 5.67 0 10.45-1.25 13.88-3.55l-1.32-.86v-.34zm.96 1.83l1.84-2.5-3.08-.41 1.24 2.91z"
            fill="#FF9900"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-dark-border bg-dark-card/90 p-5 transition-all duration-200 hover:border-dark-borderHover hover:shadow-xl hover:shadow-black/40">
      
      {/* Top Header: Indicator Dot + Logo + Info + Badge */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Pulsing Status Dot */}
            <span
              className={`absolute top-4 left-4 h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-emerald-500 shadow-sm shadow-emerald-500/60"
                  : provider.status === "action_required"
                  ? "bg-amber-500 shadow-sm shadow-amber-500/60"
                  : "bg-slate-500 shadow-sm shadow-slate-500/40"
              }`}
            />
            
            <div className="ml-2">
              {renderLogo()}
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white leading-tight">
                {provider.name}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {provider.category}
              </p>
            </div>
          </div>

          <Badge
            variant={
              isConnected
                ? "connected"
                : provider.status === "action_required"
                ? "warning"
                : "neutral"
            }
          >
            {isConnected
              ? "Connected"
              : provider.status === "action_required"
              ? "Action required"
              : "Not connected"}
          </Badge>
        </div>

        {/* Description */}
        <p className="mt-3.5 text-xs text-slate-400 font-normal leading-relaxed min-h-[36px]">
          {provider.description}
        </p>

        {/* Metadata items list */}
        <div className="mt-4 space-y-2 border-t border-dark-border/80 pt-3.5 text-[11px] text-slate-400">
          {provider.id === "aws" && isConnected ? (
            <>
              <div className="flex items-center justify-between">
                <span className="uppercase text-[10px] tracking-wider text-slate-400 font-semibold">AWS Region:</span>
                <span className="font-mono text-white font-semibold">us-east-1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase text-[10px] tracking-wider text-slate-400 font-semibold">Last Synced:</span>
                <span className="text-slate-300 font-medium">August 22, 2026</span>
              </div>
            </>
          ) : provider.id === "openrouter" && isConnected ? (
            <>
              <div className="flex items-center justify-between">
                <span className="uppercase text-[10px] tracking-wider text-slate-400 font-semibold">Scope:</span>
                <span className="font-mono text-white font-semibold">{provider.accountText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase text-[10px] tracking-wider text-slate-400 font-semibold">Balance:</span>
                <span className="font-mono text-emerald-400 font-semibold">{provider.metricsText}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{provider.accountText}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{provider.syncText}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Database className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{provider.metricsText}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-2">
        {isConnected ? (
          provider.id === "aws" || provider.id === "openrouter" ? (
            <Button
              variant="outline"
              size="md"
              className="w-full text-xs font-semibold py-2.5 uppercase tracking-wider justify-center gap-1.5 border-dark-border bg-dark-card hover:bg-[#151c2e] text-white"
              onClick={provider.id === "openrouter" ? (onManage || onViewAnalytics) : onViewAnalytics}
            >
              <span>MANAGE DETAILS</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1 text-xs font-semibold py-2"
                onClick={onViewAnalytics}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span>View Analytics</span>
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 shrink-0 text-slate-400 hover:text-white"
                onClick={onManage}
                title="Configure connection settings"
              >
                {onManage ? <Settings className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              className="flex-1 text-xs font-semibold py-2"
              onClick={onCompleteSetup}
            >
              {provider.status === "action_required" ? (
                <>
                  <Settings className="h-3.5 w-3.5" />
                  <span>Complete Setup</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Connect</span>
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="text-xs font-medium px-3.5 py-2 text-slate-300 hover:text-white shrink-0"
              onClick={onViewRequirements}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>View requirements</span>
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
