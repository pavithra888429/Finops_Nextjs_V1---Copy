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
    <div className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm transition-all">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
            <KeyRound className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Standby API Keys & Quota Governance
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-sans font-semibold">
                {unusedKeys.length} Unused Keys
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-sans font-semibold">
                ${totalReservedQuota.toFixed(2)} Reserved Quota
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className="text-slate-800 font-semibold">{unusedKeys.length} provisioned API keys</span> have recorded <strong className="text-slate-900 font-bold">$0.00 spend</strong> since creation. They are currently on standby with reserved quotas.
            </p>
          </div>
        </div>

        {/* Toggle Details Action */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Key Breakdown' : 'View Key Breakdown'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expanded Key Details Card Grid */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {unusedKeys.map((key: any) => (
              <div
                key={key.keyId || key.name}
                onClick={() => onSelectKey && onSelectKey(key.name)}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 truncate group-hover:text-purple-600 transition-colors" title={key.name}>
                      {key.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    Standby
                  </span>
                </div>

                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Created:
                    </span>
                    <span className="text-slate-700 font-medium">{formatCreationDate(key.createdAt || key.created_at)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span>Credit Limit:</span>
                    <span className="text-slate-900 font-sans font-semibold">
                      {key.limit !== null && key.limit !== undefined ? `$${Number(key.limit).toFixed(2)}` : 'Unlimited'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span>Available Remaining:</span>
                    <span className="text-emerald-600 font-sans font-bold">
                      {key.remaining !== null && key.remaining !== undefined ? `$${Number(key.remaining).toFixed(2)}` : '$10.00'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 pt-0.5">
                    <span>Masked Key:</span>
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{key.label || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-purple-900 bg-purple-50/60 p-2.5 rounded-lg border border-purple-200">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span>
                <strong className="font-bold">FinOps Recommendation:</strong> These keys hold <strong className="font-bold">${totalReservedQuota.toFixed(2)}</strong> in pre-approved credit limits. You can safely allocate them to new projects or keep them as zero-downtime failover reserves.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
