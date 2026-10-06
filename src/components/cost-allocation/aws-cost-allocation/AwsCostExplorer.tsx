'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Search,
  Sliders,
  ChevronDown,
  ArrowUpDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { AWS_EXPLORER_ROWS, ExplorerRow } from './awsCostData';

interface AwsCostExplorerProps {
  selectedProduct: string;
  selectedService: string;
  account?: string;
  region?: string;
  environment?: string;
  onSelectProduct: (productId: string) => void;
  onSelectService: (serviceName: string) => void;
  liveProjects?: any[];
  totalSpend?: number;
  liveExplorerRows?: any[];
}

const PROJECT_PALETTE = [
  '#8b5cf6', '#f97316', '#06b6d4', '#eab308', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6', '#0ea5e9', '#d946ef', '#14b8a6'
];

export function AwsCostExplorer({
  selectedProduct,
  selectedService,
  account = 'all',
  region = 'all',
  environment = 'all',
  onSelectProduct,
  onSelectService,
  liveProjects,
  totalSpend: propTotalSpend,
  liveExplorerRows,
}: AwsCostExplorerProps) {
  const [groupBy, setGroupBy] = useState('Product');
  const [thenBy, setThenBy] = useState('AWS Service');
  const [view, setView] = useState('Cost');
  const [granularity, setGranularity] = useState('Daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'cost' | 'share'>('cost');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Helper to infer realistic region
  const inferRegion = (svcName: string, reg?: string) => {
    if (reg && reg !== 'unknown' && reg !== 'unmapped') return reg;
    const s = String(svcName || '').toLowerCase();
    if (
      s.includes('route 53') ||
      s.includes('route53') ||
      s.includes('cloudfront') ||
      s.includes('waf') ||
      s.includes('certificate manager') ||
      s.includes('acm')
    ) {
      return 'global';
    }
    return 'ap-south-1';
  };

  // Base rows
  const baseRows = useMemo(() => {
    if (liveExplorerRows && liveExplorerRows.length > 0) {
      const overallTotal = propTotalSpend || liveExplorerRows.reduce((s: number, r: any) => s + Number(r.cost || 0), 0);
      return liveExplorerRows.map((r: any, idx: number): ExplorerRow => {
        const pName = r.project || 'Untagged';
        const cost = Number(r.cost || 0);
        const resolvedRegion = inferRegion(r.service, r.region);
        return {
          id: `cur-${idx}-${pName}-${r.service}-${resolvedRegion}`,
          product: pName,
          productId: pName,
          service: r.service,
          account: 'Production Platform (864981730114)',
          region: resolvedRegion,
          environment: pName === 'Untagged' ? 'unallocated' : 'production',
          cost: Math.round(cost * 100) / 100,
          share: overallTotal > 0 ? Number(((cost / overallTotal) * 100).toFixed(1)) : 0,
          change: 0,
          usageType: `${r.service} (CUR)`,
          resourceId: `arn:aws:${String(r.service).toLowerCase().replace(/[^a-z0-9]/g, '')}:${resolvedRegion}:${pName.toLowerCase()}`,
        };
      });
    }
    if (liveProjects && liveProjects.length > 0) {
      const overallTotal = propTotalSpend || liveProjects.reduce((s: number, p: any) => s + Number(p.unblendedCost || 0), 0);
      const rows: ExplorerRow[] = [];

      liveProjects.forEach((p: any) => {
        const pName = p.projectName || p.project_name || 'Untagged';
        const isUntagged = pName === 'Untagged';
        const services = Array.isArray(p.services) ? p.services : [];

        if (services.length === 0) {
          const cost = Number(p.unblendedCost || 0);
          rows.push({
            id: `row-${pName}-general`,
            product: pName,
            productId: pName,
            service: 'General AWS Infrastructure',
            account: 'Production Platform (864981730114)',
            region: 'ap-south-1',
            environment: isUntagged ? 'unallocated' : 'production',
            cost: Math.round(cost * 100) / 100,
            share: overallTotal > 0 ? Number(((cost / overallTotal) * 100).toFixed(1)) : 0,
            change: 0,
            usageType: 'General Cloud Spend',
            resourceId: `arn:aws:cloud:${pName.toLowerCase()}`,
          });
        } else {
          services.forEach((s: any, sIdx: number) => {
            const cost = Number(s.unblendedCost || 0);
            if (cost <= 0 && services.length > 1) return;
            const resolvedRegion = inferRegion(s.service, s.region);

            rows.push({
              id: `row-${pName}-${sIdx}-${s.service}`,
              product: pName,
              productId: pName,
              service: s.service,
              account: 'Production Platform (864981730114)',
              region: resolvedRegion,
              environment: isUntagged ? 'unallocated' : 'production',
              cost: Math.round(cost * 100) / 100,
              share: overallTotal > 0 ? Number(((cost / overallTotal) * 100).toFixed(1)) : 0,
              change: 0,
              usageType: `${s.service} Usage`,
              resourceId: `arn:aws:${String(s.service).toLowerCase().replace(/[^a-z0-9]/g, '')}:${resolvedRegion}:${pName.toLowerCase()}`,
            });
          });
        }
      });

      return rows;
    }

    return AWS_EXPLORER_ROWS;
  }, [liveProjects, liveExplorerRows, propTotalSpend]);

  // Filtering + Sorting
  const filteredRows = useMemo(() => {
    return baseRows.filter((r) => {
      if (selectedProduct !== 'all') {
        const target = selectedProduct.toLowerCase();
        const rowProd = r.product.toLowerCase();
        if (target === 'unallocated' && rowProd !== 'untagged') return false;
        if (target !== 'unallocated' && rowProd !== target) return false;
      }
      if (selectedService !== 'all' && r.service.toLowerCase() !== selectedService.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return r.product.toLowerCase().includes(q) || r.service.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      const mult = sortAsc ? 1 : -1;
      return (a[sortField] - b[sortField]) * mult;
    });
  }, [baseRows, selectedProduct, selectedService, searchQuery, sortField, sortAsc]);

  // Pagination calculations
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (validPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(startIdx, endIdx);
  }, [filteredRows, startIdx, endIdx]);

  const toggleSort = (field: 'cost' | 'share') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getProductColorDot = (id: string) => {
    if (id.toLowerCase() === 'untagged' || id.toLowerCase() === 'unallocated') return '#f97316';
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return PROJECT_PALETTE[Math.abs(hash) % PROJECT_PALETTE.length];
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={15} className="text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Cost Allocation Explorer
            </h2>
            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Workloads
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exploration across products and AWS services with direct search filtering.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product or AWS service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Explorer Controls Bar */}
      <div className="flex items-center gap-3 flex-wrap py-2.5 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 h-8 rounded-lg text-slate-600">
          <span className="text-[11px] text-slate-400">View:</span>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="Cost">Cost</option>
            <option value="Unblended Cost">Unblended Cost</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 h-8 rounded-lg text-slate-600">
          <span className="text-[11px] text-slate-400">Granularity:</span>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="Daily">Daily</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-400">
          Showing <strong className="text-slate-700">{totalRows === 0 ? 0 : startIdx + 1}–{endIdx}</strong> of <strong className="text-slate-700">{totalRows}</strong> allocation rows
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
              <th className="py-2.5 px-3 rounded-l-md">Product</th>
              <th className="py-2.5 px-3">AWS Service</th>
              <th
                onClick={() => toggleSort('cost')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-800"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cost</span>
                  <ArrowUpDown size={11} className={sortField === 'cost' ? 'text-violet-600' : 'text-slate-400'} />
                </div>
              </th>
              <th
                onClick={() => toggleSort('share')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-800 rounded-r-md"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Share</span>
                  <ArrowUpDown size={11} className={sortField === 'share' ? 'text-violet-600' : 'text-slate-400'} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 transition-colors text-slate-700"
              >
                <td className="py-2.5 px-3">
                  <div
                    onClick={() => onSelectProduct(row.productId)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: getProductColorDot(row.productId) }}
                    />
                    <span className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {row.product}
                    </span>
                  </div>
                </td>

                <td className="py-2.5 px-3">
                  <span
                    onClick={() => onSelectService(row.service)}
                    className="font-medium text-slate-700 hover:text-slate-950 cursor-pointer transition-colors"
                  >
                    {row.service}
                  </span>
                </td>

                <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                  ${row.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                  {row.share}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Page {validPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage <= 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
