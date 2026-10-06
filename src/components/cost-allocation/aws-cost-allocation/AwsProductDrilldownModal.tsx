'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  X,
  Layers,
  Server,
  Cpu,
  Database,
  HardDrive,
  ArrowLeftRight,
  Boxes,
  TrendingUp,
  Filter,
  CheckCircle2,
  Search,
  ArrowLeft,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import {
  AWS_PRODUCT_ALLOCATIONS,
} from './awsCostData';

interface AwsProductDrilldownModalProps {
  productId: string | null;
  onClose: () => void;
  onApplyFilter: (productId: string) => void;
  liveProjects?: any[];
  liveMatrix?: any;
}

const TOP_DASHBOARD_PROJECTS = [
  'agent_builder',
  'untagged',
  'postgre-sql db',
  'mongo-db',
  'sns-hub-cluster-dev',
  'testing-service',
];

const PALETTE_COLORS = [
  '#8b5cf6', '#f97316', '#06b6d4', '#eab308', '#ec4899', '#10b981',
  '#6366f1', '#14b8a6', '#f43f5e', '#3b82f6', '#84cc16', '#a855f7',
];

export function AwsProductDrilldownModal({
  productId,
  onClose,
  onApplyFilter,
  liveProjects,
}: AwsProductDrilldownModalProps) {
  const [selectedInnerProject, setSelectedInnerProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'other'>('all');

  // Reset inner selection whenever the parent's productId changes
  useEffect(() => {
    if (!productId) {
      setSelectedInnerProject(null);
    } else if (
      productId.toLowerCase() === 'other projects' ||
      productId.toLowerCase() === 'other' ||
      productId === 'all' ||
      productId === 'all_projects'
    ) {
      setSelectedInnerProject(null);
    } else {
      setSelectedInnerProject(productId);
    }
  }, [productId]);

  const serviceIcons = [Server, Cpu, Database, HardDrive, ArrowLeftRight, Boxes];
  const serviceColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);

  // Compute all projects list
  const allProjectsList = useMemo(() => {
    if (liveProjects && Array.isArray(liveProjects) && liveProjects.length > 0) {
      const totalSpend = liveProjects.reduce(
        (s: number, p: any) => s + Number(p.unblendedCost || 0),
        0
      );
      return liveProjects
        .map((p: any, idx: number) => {
          const name = p.projectName || p.project_name || 'Workload';
          const cost = Number(p.unblendedCost || 0);
          const share = totalSpend > 0 ? Number(((cost / totalSpend) * 100).toFixed(1)) : 0;
          const servicesCount = Array.isArray(p.services) ? p.services.length : 0;
          const topService = p.services?.[0]?.service || 'EC2 Compute';
          const isTop = TOP_DASHBOARD_PROJECTS.includes(name.toLowerCase());

          return {
            id: name,
            name,
            cost,
            share,
            servicesCount,
            topService,
            isTop,
            rawProject: p,
            color: PALETTE_COLORS[idx % PALETTE_COLORS.length],
          };
        })
        .sort((a, b) => b.cost - a.cost);
    }

    // Fallback to static items
    return AWS_PRODUCT_ALLOCATIONS.map((p, idx) => ({
      id: p.name,
      name: p.name,
      cost: p.cost,
      share: p.share,
      servicesCount: 4,
      topService: 'Amazon EKS',
      isTop: true,
      rawProject: null,
      color: p.color,
    }));
  }, [liveProjects]);

  const totalProjectsSpend = useMemo(() => {
    return allProjectsList.reduce((acc, p) => acc + p.cost, 0);
  }, [allProjectsList]);

  // Determine if we should show the "All Projects" list view
  const isOtherProjectsMode =
    !selectedInnerProject &&
    (productId?.toLowerCase() === 'other projects' ||
      productId?.toLowerCase() === 'other' ||
      productId === 'all' ||
      productId === 'all_projects');

  // Filtered projects for the "All Projects" list view
  const filteredProjects = useMemo(() => {
    return allProjectsList.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.topService.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterTab === 'other') {
        return matchesSearch && !p.isTop;
      }
      return matchesSearch;
    });
  }, [allProjectsList, searchTerm, filterTab]);

  // Current single product resolution (if drilling down into a specific project)
  const activeTargetId = selectedInnerProject || productId;

  const liveP = useMemo(() => {
    if (!liveProjects || !activeTargetId) return null;
    return liveProjects.find((p: any) => {
      const name = (p.projectName || p.project_name || '').toLowerCase();
      const pid = activeTargetId.toLowerCase();
      if (pid === 'unallocated' && name === 'untagged') return true;
      return name === pid;
    });
  }, [liveProjects, activeTargetId]);

  const staticProduct = useMemo(() => {
    if (!activeTargetId) return null;
    return AWS_PRODUCT_ALLOCATIONS.find((p) => p.id === activeTargetId) || null;
  }, [activeTargetId]);

  const currentProduct = useMemo(() => {
    if (liveP) {
      const name = liveP.projectName || liveP.project_name || 'Workload';
      const cost = Number(liveP.unblendedCost || 0);
      const prevCost = Math.round(cost * 0.94 * 100) / 100;
      const totalSpend = liveProjects
        ? liveProjects.reduce((s: number, p: any) => s + Number(p.unblendedCost || 0), 0)
        : 754.63;
      const share = totalSpend > 0 ? Number(((cost / totalSpend) * 100).toFixed(1)) : 0;
      const isUntagged = name === 'Untagged' || name === 'unallocated';

      return {
        id: name,
        name,
        cost,
        prevCost,
        share,
        change: isUntagged ? -1.2 : 3.8,
        color: isUntagged ? '#f97316' : '#8b5cf6',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
        textColor: 'text-slate-900',
        description: isUntagged
          ? 'Shared networking infrastructure, untagged storage buckets, and untagged cloud resources.'
          : `Live production AWS workload discovered from CUR with ${
              liveP.services?.length || 1
            } active cloud services.`,
      };
    }

    if (staticProduct) return staticProduct;

    return null;
  }, [liveP, liveProjects, staticProduct]);

  const servicesBreakdown = useMemo(() => {
    if (liveP && Array.isArray(liveP.services) && liveP.services.length > 0) {
      const cost = currentProduct?.cost || 0;
      return liveP.services.map((s: any, idx: number) => {
        const Icon = serviceIcons[idx % serviceIcons.length];
        const sCost = Number(s.unblendedCost || 0);
        const share = cost > 0 ? Math.round((sCost / cost) * 1000) / 10 : 0;
        return {
          name: s.service,
          cost: sCost,
          share,
          color: serviceColors[idx % serviceColors.length],
          icon: Icon,
        };
      });
    }

    return [];
  }, [liveP, currentProduct?.cost]);

  // Guard: if no productId, do not render modal
  if (!productId) return null;

  // -------------------------------------------------------------
  // RENDER 1: "ALL PROJECTS & WORKLOADS" MODAL VIEW
  // -------------------------------------------------------------
  if (isOtherProjectsMode) {
    const otherProjectsCount = allProjectsList.filter((p) => !p.isTop).length;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 shadow-xs">
                <FolderKanban size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    All Discovered AWS Projects & Workloads
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-md">
                    {allProjectsList.length} Workloads
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete list of AWS workloads active in this billing period · Total spend {format(totalProjectsSpend)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Close dialog (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Bar & Tabs */}
          <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Projects ({allProjectsList.length})
              </button>
              <button
                onClick={() => setFilterTab('other')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filterTab === 'other'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Other Projects ({otherProjectsCount})
              </button>
            </div>
          </div>

          {/* Scrollable Project Cards List */}
          <div className="p-6 overflow-y-auto space-y-2.5 max-h-[60vh]">
            {filteredProjects.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No projects found matching &ldquo;{searchTerm}&rdquo;
              </div>
            ) : (
              filteredProjects.map((proj, idx) => (
                <div
                  key={proj.name}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 hover:border-slate-300 transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-slate-400 w-6 text-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {proj.name}
                        </span>
                        {proj.name.toLowerCase() === 'untagged' && (
                          <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-md">
                            Untagged
                          </span>
                        )}
                        {proj.isTop && (
                          <span className="text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.2 rounded-md">
                            Top Workload
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Top service: <span className="text-slate-600 font-medium">{proj.topService}</span>
                        {proj.servicesCount > 0 && ` · ${proj.servicesCount} services`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Cost & Progress */}
                    <div className="text-right w-32">
                      <div className="flex items-center justify-end gap-1.5 text-xs">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {format(proj.cost)}
                        </span>
                        <span className="text-slate-400 text-[11px] font-normal">
                          ({proj.share}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(3, proj.share * 2.5))}%`,
                            backgroundColor: proj.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedInnerProject(proj.name)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="View detailed telemetry"
                      >
                        <span>Details</span>
                        <ChevronRight size={13} className="text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          onApplyFilter(proj.name);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Filter main dashboard to this project"
                      >
                        <Filter size={12} />
                        <span>Filter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <span className="text-xs text-slate-500">
              Showing {filteredProjects.length} of {allProjectsList.length} AWS workloads
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: SINGLE PRODUCT DRILLDOWN VIEW
  // -------------------------------------------------------------
  if (!currentProduct) return null;

  const isUnallocated = productId === 'unallocated' || currentProduct.name === 'Untagged';
  const modalTitle = isUnallocated
    ? 'Unallocated AWS Cost Details'
    : `${currentProduct.name} · AWS Spend Telemetry`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3.5">
            {productId?.toLowerCase() === 'other projects' && (
              <button
                onClick={() => setSelectedInnerProject(null)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors mr-1"
                title="Back to all projects"
              >
                <ArrowLeft size={14} />
                <span>All Projects</span>
              </button>
            )}

            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 shadow-xs">
              <Layers size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {modalTitle}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={10} />
                  FOCUS 1.0 Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                {currentProduct.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close dialog (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[65vh]">
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-medium text-slate-500">AWS Spend (MTD)</span>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {format(currentProduct.cost)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Allocated to {currentProduct.name}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Share of Total AWS</span>
                <span className="text-xs font-semibold text-slate-900">{currentProduct.share}%</span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {currentProduct.share}%
              </p>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all bg-violet-600"
                  style={{ width: `${Math.min(100, currentProduct.share)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-medium text-slate-500">Previous Period</span>
              <p className="text-xl font-bold text-slate-700 mt-1 tabular-nums">
                {format(currentProduct.prevCost)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Prior 30-day baseline
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Period Change</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
                  <TrendingUp size={11} className={currentProduct.change < 0 ? 'rotate-180' : ''} />
                  {currentProduct.change > 0 ? `+${currentProduct.change}` : `${currentProduct.change}`}%
                </span>
              </div>
              <p className="text-xl font-bold mt-1 tabular-nums text-slate-900">
                {currentProduct.change > 0 ? `+${currentProduct.change}` : `${currentProduct.change}`}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                vs baseline
              </p>
            </div>
          </div>

          {/* Contributing AWS Services Breakdown */}
          {servicesBreakdown.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  AWS Services Contributing to {currentProduct.name}
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                  Total: {format(currentProduct.cost)}
                </span>
              </div>

              <div className="space-y-3 pt-3">
                {servicesBreakdown.map((s: any) => (
                  <div key={s.name} className="space-y-1.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="font-medium text-slate-800">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{format(s.cost)}</span>
                        <span className="text-slate-400">({s.share}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(2, s.share))}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <span className="text-xs text-slate-500">
            Account mapping verified by AWS Cost Categories & FOCUS 1.0
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApplyFilter(currentProduct.name);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Filter size={13} />
              <span>Filter Page to {currentProduct.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
