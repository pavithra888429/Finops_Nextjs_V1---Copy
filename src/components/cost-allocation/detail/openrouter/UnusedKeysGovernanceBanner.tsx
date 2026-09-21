import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Clock, Sparkles, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UnusedKeysGovernanceBannerProps {
  keysList?: any[];
  onSelectKey?: (keyName: string) => void;
}

export function UnusedKeysGovernanceBanner({ keysList = [], onSelectKey }: UnusedKeysGovernanceBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamically filter all zero-spend keys directly from real OpenRouter data
  const unusedKeys = keysList.filter((k: any) => (Number(k.usage) || 0) === 0);
  const activeKeysCount = keysList.length - unusedKeys.length;
  const totalReservedQuota = unusedKeys.reduce((acc: number, k: any) => acc + (Number(k.limit) || 0), 0);

  if (unusedKeys.length === 0) {
    return null;
  }

  const formatCreationDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr.split('T')[0];
    }
  };

  return (
    <div className="rounded-xl border border-blue-500/25 bg-gradient-to-r from-blue-950/30 via-dark-card/90 to-purple-950/20 p-4 shadow-sm backdrop-blur-sm transition-all">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <KeyRound className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Standby API Keys & Quota Governance
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-medium">
                {unusedKeys.length} Unused Keys
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                ${totalReservedQuota.toFixed(2)} Reserved Quota
              </span>
            </div>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              <span className="text-white font-medium">{unusedKeys.length} provisioned API keys</span> have recorded <strong className="text-amber-400 font-semibold">$0.00 spend</strong> since creation. They are currently on standby with reserved quotas.
            </p>
          </div>
        </div>

        {/* Toggle Details Action */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface/80 hover:bg-dark-surface hover:border-slate-600 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Key Breakdown' : 'View Key Breakdown'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expanded Key Details Card Grid */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-dark-border/60 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {unusedKeys.map((key: any) => (
              <div
                key={key.keyId || key.name}
                onClick={() => onSelectKey && onSelectKey(key.name)}
                className="p-3 rounded-lg border border-dark-border/80 bg-dark-card/90 hover:border-blue-500/40 hover:bg-blue-950/15 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-dark-border/40">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full bg-slate-500 shrink-0" />
                    <span className="font-semibold text-xs text-white truncate group-hover:text-blue-300 transition-colors" title={key.name}>
                      {key.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    Standby
                  </span>
                </div>

                <div className="pt-2 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      Created:
                    </span>
                    <span className="text-slate-200 font-medium">{formatCreationDate(key.createdAt)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Credit Limit:</span>
                    <span className="text-white font-mono font-medium">
                      {key.limit !== null && key.limit !== undefined ? `$${Number(key.limit).toFixed(2)}` : 'Unlimited'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Available Remaining:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {key.remaining !== null && key.remaining !== undefined ? `$${Number(key.remaining).toFixed(2)}` : '$10.00'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 pt-0.5">
                    <span>Masked Key:</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">{key.label || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 bg-dark-surface/50 p-2.5 rounded-lg border border-dark-border/40">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>
                <strong>FinOps Recommendation:</strong> These keys hold <strong>${totalReservedQuota.toFixed(2)}</strong> in pre-approved credit limits. You can safely allocate them to new projects or keep them as zero-downtime failover reserves.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
