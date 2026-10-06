import React, { useState } from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, Download, Key, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
    setCurrentPage(1);
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm w-full space-y-2">
      {/* Header & Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Granular Date-Wise Telemetry</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Breakdown of API keys, model inference tokens, prompt caching, and consumption costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search key, model..."
              className="h-8 w-64 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Sort Buttons */}
          <button
            onClick={() => handleSort('cost')}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${
              sortField === 'cost' ? 'bg-slate-900 text-white font-semibold border-slate-900 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort by cost</span>
          </button>

          <button
            onClick={() => handleSort('tokens')}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${
              sortField === 'tokens' ? 'bg-slate-900 text-white font-semibold border-slate-900 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
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
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="h-3 w-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/95 whitespace-nowrap">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">API Key</th>
              <th className="py-3 px-3">Model</th>
              <th className="py-3 px-3 text-right">Prompt Tokens</th>
              <th className="py-3 px-3 text-right">Completion Tokens</th>
              <th className="py-3 px-3 text-right">Cached Tokens</th>
              <th className="py-3 px-3 text-right">Requests</th>
              <th className="py-3 px-4 text-right">Cost ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 whitespace-nowrap font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                    <span className="text-slate-800 font-semibold">No live telemetry records ingested yet</span>
                    <span className="text-[11px] text-slate-500">Run the workflow sync to fetch your date-wise OpenRouter consumption records</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{item.keyName}</span>
                      {item.keyLabel && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                          {item.keyLabel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {item.model && item.model !== item.keyName && !item.model.startsWith('PF') && item.model !== 'OpenRouter Model' ? (
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200/60">
                        {item.model}
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 font-mono text-[11px]">
                    {formatNumber(item.promptTokens)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 font-mono text-[11px]">
                    {formatNumber(item.completionTokens)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-mono text-[11px]">
                    {item.cachedTokens > 0 ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
                        {formatNumber(item.cachedTokens)}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                    {formatNumber(item.requests)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {formatCurrency(item.cost)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination controls */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing <span className="text-slate-900 font-semibold">{filtered.length === 0 ? 0 : startIndex + 1}</span>–<span className="text-slate-900 font-semibold">{Math.min(startIndex + pageSize, filtered.length)}</span> of <span className="text-slate-900 font-semibold">{filtered.length}</span> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 shadow-xs"
            title="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-medium text-slate-700 px-1.5">
            Page {validPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 shadow-xs"
            title="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
