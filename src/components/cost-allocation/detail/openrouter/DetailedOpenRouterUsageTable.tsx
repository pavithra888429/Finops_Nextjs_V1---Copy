import React, { useState } from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, Download, Key, Sparkles, Smartphone } from 'lucide-react';

export interface OpenRouterTelemetryRow {
  id: string;
  date: string;
  keyName: string;
  keyLabel?: string;
  app: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  requests: number;
  cost: number;
}

export function DetailedOpenRouterUsageTable({
  productName = 'Dragon Suite',
  data = [],
}: {
  productName?: string;
  data?: OpenRouterTelemetryRow[];
}) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'cost' | 'tokens' | 'date'>('cost');
  const [sortAsc, setSortAsc] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat('en-US').format(val);

  const handleSort = (field: 'cost' | 'tokens' | 'date') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = (data || []).filter((r) => {
    if (search.trim() === '') return true;
    const q = search.toLowerCase();
    return (
      r.keyName.toLowerCase().includes(q) ||
      r.app.toLowerCase().includes(q) ||
      r.model.toLowerCase().includes(q) ||
      r.date.includes(q)
    );
  }).sort((a, b) => {
    if (sortField === 'cost') return sortAsc ? a.cost - b.cost : b.cost - a.cost;
    if (sortField === 'tokens') {
      const aTot = a.promptTokens + a.completionTokens;
      const bTot = b.promptTokens + b.completionTokens;
      return sortAsc ? aTot - bTot : bTot - aTot;
    }
    if (sortField === 'date') return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    return 0;
  });

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 overflow-hidden shadow-sm w-full space-y-2">
      {/* Header & Toolbar */}
      <div className="p-4 border-b border-dark-border/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Granular Date-Wise Telemetry</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Breakdown of API keys, client apps, model inference tokens, prompt caching, and consumption costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search key, model, client app..."
              className="h-7 w-64 pl-8 pr-3 text-xs bg-dark-surface border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sort Buttons */}
          <button
            onClick={() => handleSort('cost')}
            className={`h-7 flex items-center gap-1 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
              sortField === 'cost' ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'border-dark-border text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort by cost</span>
          </button>

          <button
            onClick={() => handleSort('tokens')}
            className={`h-7 flex items-center gap-1 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
              sortField === 'tokens' ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'border-dark-border text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort by tokens</span>
          </button>

          {/* Export */}
          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `openrouter_telemetry_${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="h-7 flex items-center gap-1.5 px-2.5 rounded-lg border border-dark-border text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Download className="h-3 w-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-medium text-slate-400 border-b border-dark-border/40 bg-dark-surface/40 whitespace-nowrap">
              <th className="py-2.5 px-3 font-normal">Date</th>
              <th className="py-2.5 px-3 font-normal">API Key</th>
              <th className="py-2.5 px-3 font-normal">Client Application</th>
              <th className="py-2.5 px-3 font-normal">Model</th>
              <th className="py-2.5 px-3 text-right font-normal">Prompt Tokens</th>
              <th className="py-2.5 px-3 text-right font-normal">Completion Tokens</th>
              <th className="py-2.5 px-3 text-right font-normal">Cached Tokens</th>
              <th className="py-2.5 px-3 text-right font-normal">Requests</th>
              <th className="py-2.5 px-4 text-right font-normal">Cost ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30 text-slate-300 whitespace-nowrap font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                    <span className="text-slate-300 font-medium">No live telemetry records ingested yet</span>
                    <span className="text-[11px] text-slate-500">Run the workflow sync to fetch your date-wise OpenRouter consumption records</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{item.date}</td>
                <td className="py-2.5 px-3 font-medium text-white">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{item.keyName}</span>
                    {item.keyLabel && (
                      <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-1 py-0.5 rounded">
                        {item.keyLabel}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>{item.app}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                  {item.model && item.model !== item.keyName && !item.model.startsWith('PF') && item.model !== 'OpenRouter Model' ? (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.model}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-300 font-mono text-[11px]">
                  {formatNumber(item.promptTokens)}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-300 font-mono text-[11px]">
                  {formatNumber(item.completionTokens)}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums font-mono text-[11px]">
                  {item.cachedTokens > 0 ? (
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {formatNumber(item.cachedTokens)}
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                  {formatNumber(item.requests)}
                </td>
                <td className="py-2.5 px-4 text-right font-semibold text-white tabular-nums">
                  {formatCurrency(item.cost)}
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
