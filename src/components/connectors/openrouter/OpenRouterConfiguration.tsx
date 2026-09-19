


'use client';

import React, { useState } from 'react';
import { ExternalLink, Key, Tag, Bell, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface OpenRouterFormData {
  connectionName: string;
  apiKey: string;
  productTag?: string;
  lowBalanceThreshold: number;
}

interface OpenRouterConfigurationProps {
  initialData: Partial<OpenRouterFormData>;
  onContinue: (data: OpenRouterFormData) => void;
}

export function OpenRouterConfiguration({
  initialData,
  onContinue,
}: OpenRouterConfigurationProps) {
  const [connectionName, setConnectionName] = useState(
    initialData.connectionName || 'Enterprise OpenRouter Gateway'
  );
  const [apiKey, setApiKey] = useState(initialData.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(
    initialData.lowBalanceThreshold !== undefined
      ? initialData.lowBalanceThreshold.toString()
      : '25.00'
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setError('Please enter your OpenRouter Management API key.');
      return;
    }

    if (!cleanKey.startsWith('sk-or-')) {
      setError('Invalid format. OpenRouter Management API keys start with "sk-or-v1-".');
      return;
    }

    onContinue({
      connectionName: connectionName.trim() || 'Enterprise OpenRouter Gateway',
      apiKey: cleanKey,
      productTag: 'SHARED_GATEWAY',
      lowBalanceThreshold: parseFloat(lowBalanceThreshold) || 25.0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full animate-in fade-in duration-300">
      <div>
        <h2 className="text-base font-bold text-dark-heading">
          Configure OpenRouter Shared AI Gateway
        </h2>
        <p className="mt-1 text-xs text-dark-muted">
          Connect your organization's OpenRouter workspace to track all project keys, token telemetry, and centralized costs.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="space-y-4 rounded-xl border border-dark-border bg-dark-card/90 p-5 sm:p-6">
        
        {/* Connection Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Gateway connection name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="e.g. Enterprise Shared Gateway"
            className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Management API Key */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              OpenRouter Management API key <span className="text-rose-400">*</span>
            </label>
            <a
              href="https://openrouter.ai/settings/provisioning-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>Get Management Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 pr-10 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Management keys (<code className="font-mono text-slate-300">sk-or-v1-...</code>) enable full FinOps discovery of all workspace project keys and aggregated usage.
          </p>
        </div>

        {/* Low Balance Alert */}
        <div className="pt-2 border-t border-dark-border/40">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Low balance alert threshold ($)</span>
          </label>
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs">
              $
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={lowBalanceThreshold}
              onChange={(e) => setLowBalanceThreshold(e.target.value)}
              placeholder="25.00"
              className="w-full rounded-lg border border-dark-border bg-dark-card pl-7 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Trigger proactive alerts when remaining workspace credits drop below this threshold.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

      </div>

      {/* Trust & Security Notice matching AWS */}
      <div className="rounded-xl border border-dark-border/80 bg-dark-card/50 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-white">Direct & Read-Only API Ingestion</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            FinOps connects directly to OpenRouter endpoints (<code className="text-blue-300">api/v1/auth/key</code> and <code className="text-blue-300">api/v1/credits</code>) to monitor spend deltas and token volumes. No prompt data or message content is ever stored or inspected.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="text-xs font-semibold px-5"
        >
          <span>Continue to Ingest & Verify</span>
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </form>
  );
}
