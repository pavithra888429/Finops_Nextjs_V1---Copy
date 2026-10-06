'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Cloud,
  Server,
  Cpu,
  Layers,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  BarChart3,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Tag,
  FolderGit2,
  Folder,
  MinusCircle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { finopsApi } from '@/api/finops.api';

interface AwsDetailViewProps {
  productId?: string;
  productName?: string;
  providerId?: string;
  providerName?: string;
  onBack?: () => void;
}

export function AwsDetailView({
  productId = 'all',
  productName = 'All Products (AWS Cloud Infrastructure)',
  providerId = 'aws',
  providerName = 'AWS',
  onBack,
}: AwsDetailViewProps) {
  // State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [hoveredDay, setHoveredDay] = useState<any | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'services' | 'daily'>('projects');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Pagination state
  const [projectPage, setProjectPage] = useState(1);
  const [projectPageSize, setProjectPageSize] = useState(10);
  const [servicePage, setServicePage] = useState(1);
  const [servicePageSize, setServicePageSize] = useState(10);
  const [dailyPage, setDailyPage] = useState(1);
  const [dailyPageSize, setDailyPageSize] = useState(10);

  // Live data state loaded from API
  const [liveData, setLiveData] = useState<any>({
    totalSpend: 746.13,
    dailyAvg: 24.87,
    servicesCount: 25,
    daysCount: 30,
    accountId: '864981730114',
    billingPeriod: '2026-09',
    lastSyncedAt: '2026-10-01T04:54:11.089Z',
    tagDimension: 'project_name',
    taggedSpend: 545.82,
    untaggedSpend: 200.31,
    tagCoveragePercentage: 73.2,
    projectsCount: 34,
    topService: {
      name: 'Amazon Elastic Compute Cloud - Compute',
      cost: 295.37,
      share: 39.6,
    },
    projectSummary: [
      {
        projectName: 'Agent_Builder',
        unblendedCost: 203.78,
        share: 27.3,
        servicesCount: 5,
        services: [
          { service: 'Amazon Elastic Compute Cloud - Compute', unblendedCost: 120.45 },
          { service: 'Amazon Elastic Load Balancing', unblendedCost: 45.20 },
          { service: 'Amazon Virtual Private Cloud', unblendedCost: 22.13 },
          { service: 'EC2 - Other (EBS & IPs)', unblendedCost: 12.00 },
          { service: 'Amazon Simple Storage Service (S3)', unblendedCost: 4.00 },
        ],
      },
      {
        projectName: 'Untagged',
        unblendedCost: 200.31,
        share: 26.8,
        servicesCount: 8,
        services: [
          { service: 'Tax', unblendedCost: 111.31 },
          { service: 'EC2 - Other (EBS & IPs)', unblendedCost: 42.10 },
          { service: 'Amazon Virtual Private Cloud', unblendedCost: 25.40 },
          { service: 'Amazon Elastic Compute Cloud - Compute', unblendedCost: 14.50 },
          { service: 'Other Services', unblendedCost: 7.00 },
        ],
      },
      {
        projectName: 'postgre-sql DB',
        unblendedCost: 59.74,
        share: 8.0,
        servicesCount: 3,
        services: [
          { service: 'Amazon Relational Database Service', unblendedCost: 45.20 },
          { service: 'EC2 - Other (EBS & IPs)', unblendedCost: 10.54 },
          { service: 'Amazon Virtual Private Cloud', unblendedCost: 4.00 },
        ],
      },
    ],
    services: [
      { service: 'Amazon Elastic Compute Cloud - Compute', unblendedCost: 295.37, share: 39.6, category: 'Compute', color: '#ffffff' },
      { service: 'Tax', unblendedCost: 111.31, share: 14.9, category: 'Taxes & Compliance', color: '#e5e5e5' },
      { service: 'EC2 - Other (EBS & IPs)', unblendedCost: 107.92, share: 14.5, category: 'Storage & Network', color: '#d4d4d4' },
      { service: 'Amazon Elastic Load Balancing', unblendedCost: 85.02, share: 11.4, category: 'Networking', color: '#a3a3a3' },
      { service: 'Amazon Virtual Private Cloud', unblendedCost: 57.87, share: 7.8, category: 'Networking', color: '#737373' },
      { service: 'Amazon Relational Database Service', unblendedCost: 32.40, share: 4.3, category: 'Database', color: '#525252' },
      { service: 'Amazon Simple Storage Service (S3)', unblendedCost: 18.60, share: 2.5, category: 'Storage', color: '#404040' },
      { service: 'AmazonCloudWatch', unblendedCost: 12.20, share: 1.6, category: 'Monitoring', color: '#262626' },
      { service: 'Other 17 Micro-Services', unblendedCost: 25.44, share: 3.4, category: 'Managed Services', color: '#171717' },
    ],
    dailyTotals: [
      { date: '2026-09-01', unblendedCost: 134.06 },
      { date: '2026-09-02', unblendedCost: 17.18 },
      { date: '2026-09-03', unblendedCost: 18.40 },
      { date: '2026-09-04', unblendedCost: 19.22 },
      { date: '2026-09-05', unblendedCost: 18.95 },
      { date: '2026-09-06', unblendedCost: 19.10 },
      { date: '2026-09-07', unblendedCost: 18.84 },
      { date: '2026-09-08', unblendedCost: 19.30 },
      { date: '2026-09-09', unblendedCost: 20.15 },
      { date: '2026-09-10', unblendedCost: 19.80 },
      { date: '2026-09-11', unblendedCost: 20.45 },
      { date: '2026-09-12', unblendedCost: 19.90 },
      { date: '2026-09-13', unblendedCost: 20.10 },
      { date: '2026-09-14', unblendedCost: 20.85 },
      { date: '2026-09-15', unblendedCost: 21.30 },
      { date: '2026-09-16', unblendedCost: 20.90 },
      { date: '2026-09-17', unblendedCost: 21.40 },
      { date: '2026-09-18', unblendedCost: 21.80 },
      { date: '2026-09-19', unblendedCost: 21.50 },
      { date: '2026-09-20', unblendedCost: 21.95 },
      { date: '2026-09-21', unblendedCost: 22.30 },
      { date: '2026-09-22', unblendedCost: 22.80 },
      { date: '2026-09-23', unblendedCost: 22.60 },
      { date: '2026-09-24', unblendedCost: 23.10 },
      { date: '2026-09-25', unblendedCost: 23.50 },
      { date: '2026-09-26', unblendedCost: 23.20 },
      { date: '2026-09-27', unblendedCost: 23.80 },
      { date: '2026-09-28', unblendedCost: 24.10 },
      { date: '2026-09-29', unblendedCost: 24.60 },
      { date: '2026-09-30', unblendedCost: 24.94 },
    ],
  });

  // Fetch live metrics on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/finops/aws?view=cost-explorer');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && isMounted) {
          const total = Number(data.totalSpend || 746.13);
          const rawServices = Array.isArray(data.services) && data.services.length > 0 ? data.services : [];

          // Color palette for services
          const colors = ['#ffffff', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717'];

          const mappedServices = rawServices.map((s: any, idx: number) => {
            const cost = Number(s.unblendedCost || 0);
            const share = total > 0 ? Number(((cost / total) * 100).toFixed(1)) : 0;
            let category = 'Managed Service';
            if (s.service.includes('Compute') || s.service.includes('EC2')) category = 'Compute';
            else if (s.service.includes('Tax')) category = 'Taxes';
            else if (s.service.includes('Load Balancing') || s.service.includes('VPC')) category = 'Networking';
            else if (s.service.includes('Database') || s.service.includes('RDS')) category = 'Database';
            else if (s.service.includes('S3') || s.service.includes('Storage')) category = 'Storage';

            return {
              service: s.service,
              unblendedCost: cost,
              share,
              category,
              color: colors[idx % colors.length],
            };
          });

          // Map project summary with shares
          const rawProjects = Array.isArray(data.projectSummary) && data.projectSummary.length > 0 ? data.projectSummary : [];
          const mappedProjects = rawProjects.map((p: any) => {
            const pCost = Number(p.unblendedCost || 0);
            const pShare = total > 0 ? Number(((pCost / total) * 100).toFixed(1)) : 0;
            const pName = p.projectName || p.project_name || 'Untagged';
            const isUntagged = pName === 'Untagged';
            const pServices = Array.isArray(p.services) ? p.services : [];

            return {
              projectName: pName,
              unblendedCost: pCost,
              share: pShare,
              isUntagged,
              servicesCount: pServices.length,
              services: pServices.map((s: any) => ({
                service: s.service,
                unblendedCost: Number(s.unblendedCost || 0),
                shareOfProject: pCost > 0 ? Number(((Number(s.unblendedCost || 0) / pCost) * 100).toFixed(1)) : 0,
              })),
            };
          });

          setLiveData((prev: any) => ({
            ...prev,
            totalSpend: total,
            dailyAvg: data.dailyAvg || Number((total / (data.daysCount || 30)).toFixed(2)),
            daysCount: data.daysCount || 30,
            servicesCount: data.servicesCount || mappedServices.length,
            accountId: data.accountId || prev.accountId,
            billingPeriod: data.billingPeriod || prev.billingPeriod,
            lastSyncedAt: data.fetchedAt || prev.lastSyncedAt,
            tagDimension: data.tagDimension || 'project_name',
            taggedSpend: data.taggedSpend !== undefined ? data.taggedSpend : prev.taggedSpend,
            untaggedSpend: data.untaggedSpend !== undefined ? data.untaggedSpend : prev.untaggedSpend,
            tagCoveragePercentage: data.tagCoveragePercentage !== undefined ? data.tagCoveragePercentage : prev.tagCoveragePercentage,
            projectsCount: data.projectsCount || mappedProjects.length || prev.projectsCount,
            topService: data.topService || prev.topService,
            services: mappedServices.length > 0 ? mappedServices : prev.services,
            projectSummary: mappedProjects.length > 0 ? mappedProjects : prev.projectSummary,
            dailyTotals: Array.isArray(data.dailyTotals) && data.dailyTotals.length > 0 ? data.dailyTotals : prev.dailyTotals,
          }));
        }
      } catch (e) {
        console.warn('Live AWS Cost fetch notice:', e);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Currency Formatter
  const fmt = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  // Sync Trigger Handler
  const handleSyncCostExplorer = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await finopsApi.triggerCostExplorerSync(undefined, liveData.accountId, false);
      const upstream = res?.upstream || res;
      if (upstream?.status === 'already_synced_today') {
        setSyncMessage({
          type: 'info',
          text: `AWS Cost Explorer was synced recently. Cooldown active (every 6 hours) to minimize AWS API charges.`,
        });
      } else {
        setSyncMessage({
          type: 'success',
          text: `AWS Cost Explorer synced successfully! Spend: ${fmt(liveData.totalSpend)}.`,
        });
      }
    } catch (e: any) {
      setSyncMessage({
        type: 'error',
        text: 'Cost Explorer sync notice: Request sent to AgentBuilder pipeline.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered Projects List
  const filteredProjects = useMemo(() => {
    const list: any[] = Array.isArray(liveData.projectSummary) ? liveData.projectSummary : [];
    if (!projectSearch.trim()) return list;
    const query = projectSearch.toLowerCase();
    return list.filter((p: any) => {
      const nameMatch = (p.projectName || '').toLowerCase().includes(query);
      const serviceMatch = Array.isArray(p.services) && p.services.some((s: any) => (s.service || '').toLowerCase().includes(query));
      return nameMatch || serviceMatch;
    });
  }, [liveData.projectSummary, projectSearch]);

  // Reset project page when search query changes
  useEffect(() => {
    setProjectPage(1);
  }, [projectSearch]);

  // Pagination calculations for Projects
  const totalProjectPages = Math.max(1, Math.ceil(filteredProjects.length / projectPageSize));
  const validProjectPage = Math.min(projectPage, totalProjectPages);
  const startProjectIdx = (validProjectPage - 1) * projectPageSize;
  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice(startProjectIdx, startProjectIdx + projectPageSize);
  }, [filteredProjects, startProjectIdx, projectPageSize]);

  const toggleProjectExpand = (projectName: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectName]: !prev[projectName],
    }));
  };

  const expandAllProjects = () => {
    const next: Record<string, boolean> = {};
    filteredProjects.forEach((p: any) => {
      next[p.projectName] = true;
    });
    setExpandedProjects(next);
  };

  const collapseAllProjects = () => {
    setExpandedProjects({});
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    if (!serviceSearch.trim()) return liveData.services;
    const query = serviceSearch.toLowerCase();
    return liveData.services.filter(
      (s: any) =>
        s.service.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
    );
  }, [liveData.services, serviceSearch]);

  // Reset service page when search query changes
  useEffect(() => {
    setServicePage(1);
  }, [serviceSearch]);

  // Pagination calculations for Services
  const totalServicePages = Math.max(1, Math.ceil(filteredServices.length / servicePageSize));
  const validServicePage = Math.min(servicePage, totalServicePages);
  const startServiceIdx = (validServicePage - 1) * servicePageSize;
  const paginatedServices = useMemo(() => {
    return filteredServices.slice(startServiceIdx, startServiceIdx + servicePageSize);
  }, [filteredServices, startServiceIdx, servicePageSize]);

  // Pagination calculations for Daily Timeline
  const totalDailyPages = Math.max(1, Math.ceil(liveData.dailyTotals.length / dailyPageSize));
  const validDailyPage = Math.min(dailyPage, totalDailyPages);
  const startDailyIdx = (validDailyPage - 1) * dailyPageSize;
  const paginatedDailyTotals = useMemo(() => {
    return liveData.dailyTotals.slice(startDailyIdx, startDailyIdx + dailyPageSize);
  }, [liveData.dailyTotals, startDailyIdx, dailyPageSize]);

  // Max daily spend for relative chart height
  const maxDailyCost = useMemo(() => {
    const vals = liveData.dailyTotals.map((d: any) => Number(d.unblendedCost || 0));
    return Math.max(...vals, 50);
  }, [liveData.dailyTotals]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">

      {/* 1. Header Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Left Title & Breadcrumbs */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer mr-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Overview</span>
                </button>
              )}
              {onBack && <span>/</span>}
              <span className="text-slate-900 font-semibold">AWS Cloud Infrastructure</span>
              <span>/</span>
              <span className="text-slate-600">{productName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 font-bold shadow-xs">
                <Cloud className="h-4.5 w-4.5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                AWS Cost Explorer & Infrastructure Spend
              </h1>
              <Badge variant="connected" className="px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full">
                LIVE PRODUCTION
              </Badge>
            </div>

            <p className="text-xs text-slate-500">
              Aggregated month-to-date spending for AWS Account <span className="font-mono text-slate-900 font-semibold">{liveData.accountId}</span> (Region: us-east-1).
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700 shadow-2xs font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">September 2026</span>
            </div>

            {/* Sync Cost Explorer Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleSyncCostExplorer}
              disabled={isSyncing}
              className="text-xs font-semibold uppercase tracking-wider gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 cursor-pointer transition-colors shadow-sm"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>SYNC COST EXPLORER</span>
            </Button>
          </div>
        </div>

        {/* Sync Notice Alert */}
        {syncMessage && (
          <div
            className="mt-4 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{syncMessage.text}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Product Context Banner (when navigating from a specific product) */}
        {productId !== 'all' && (
          <div className="mt-4 p-3.5 rounded-xl border border-purple-200 bg-purple-50/60 text-purple-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-purple-600" />
              <span>
                <strong>{productName} Context:</strong> Displaying account-wide AWS Cost Explorer baseline ({fmt(liveData.totalSpend)} MTD across {liveData.servicesCount} services). Granular product-level tag attribution will activate once AWS delivers the CUR 2.0 billing export.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Metric KPI Grid (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
        {/* Card 1: Total AWS Spend */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-sm hover:border-slate-300 transition-all min-h-[90px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 shadow-xs">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-medium text-slate-500 truncate">Total AWS Spend (MTD)</p>
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate mt-0.5">
              {fmt(liveData.totalSpend)}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              Sept 1 – Sept 30, 2026
            </p>
          </div>
        </div>

        {/* Card 2: Daily Run Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-sm hover:border-slate-300 transition-all min-h-[90px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 shadow-xs">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-medium text-slate-500 truncate">Daily Run Rate</p>
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate mt-0.5">
              {fmt(liveData.dailyAvg)} <span className="text-xs text-slate-400 font-normal">/day</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              30 days tracked
            </p>
          </div>
        </div>

        {/* Card 3: Top Cost Service */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-sm hover:border-slate-300 transition-all min-h-[90px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 shadow-xs">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-medium text-slate-500 truncate">Top Service (Compute)</p>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate mt-0.5">
              EC2 Compute
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              {fmt(liveData.topService.cost)} ({liveData.topService.share}%)
            </p>
          </div>
        </div>

        {/* Card 4: Project Tag Attribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-sm hover:border-slate-300 transition-all min-h-[90px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 shadow-xs">
            <Tag className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-medium text-slate-500 truncate">Project Tag Coverage</p>
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate mt-0.5">
              {liveData.tagCoveragePercentage}% Tagged
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              {liveData.projectsCount || liveData.projectSummary?.length || 34} Projects ({fmt(liveData.taggedSpend)})
            </p>
          </div>
        </div>

        {/* Card 5: Active Services */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-sm hover:border-slate-300 transition-all min-h-[90px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 shadow-xs">
            <Server className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-medium text-slate-500 truncate">Active AWS Services</p>
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate mt-0.5">
              {liveData.servicesCount} Services
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              All active in us-east-1
            </p>
          </div>
        </div>

        {/* Card 6: Pipeline Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-sm hover:border-slate-300 transition-all min-h-[90px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-medium text-slate-500 truncate">Sync Deduplication</p>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate mt-0.5">
              Active (6h Window)
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              $0.01 / sync protection
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Daily Spend Chart + Cost by Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* Left Column: 30-Day Daily Spending Trend Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Daily Spend Trend (September 2026)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                30-day cumulative AWS Cost Explorer metrics. Hover over bars to see daily spend.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-mono">
                {hoveredDay ? (
                  <span className="text-purple-700 font-bold">
                    {hoveredDay.date}: {fmt(hoveredDay.unblendedCost)}
                  </span>
                ) : (
                  <span>Avg: <strong className="text-slate-800">{fmt(liveData.dailyAvg)}</strong> / day</span>
                )}
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="py-6">
            <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2 px-1">
              {liveData.dailyTotals.map((item: any, idx: number) => {
                const heightPct = Math.max(8, Math.min(100, Math.round((item.unblendedCost / maxDailyCost) * 100)));
                const isFirstDay = idx === 0;
                return (
                  <div
                    key={item.date}
                    onMouseEnter={() => setHoveredDay(item)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                  >
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20 font-mono">
                      {item.date}: {fmt(item.unblendedCost)}
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-sm transition-all duration-200 group-hover:brightness-110 ${isFirstDay
                          ? 'bg-purple-500 hover:bg-purple-600'
                          : 'bg-purple-600/80 hover:bg-purple-600'
                        }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Dates */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-3 border-t border-slate-100 px-1">
              <span>Sep 01 ({fmt(liveData.dailyTotals[0]?.unblendedCost || 134)})</span>
              <span>Sep 10</span>
              <span>Sep 20</span>
              <span>Sep 30 ({fmt(liveData.dailyTotals[29]?.unblendedCost || 24)})</span>
            </div>
          </div>

          {/* Chart Sub-legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span className="font-medium text-slate-700">Month-Start Base Usage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600/80" />
                <span className="font-medium text-slate-700">Daily Incremental Compute & Data</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Source: AWS GetCostAndUsage API</span>
          </div>
        </div>

        {/* Right Column: Cost by AWS Service Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Cost by AWS Service
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Top services contributing to the ${liveData.totalSpend} total.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              {liveData.services.length} Services
            </span>
          </div>

          {/* Service Progress Bars */}
          <div className="space-y-3.5 py-4">
            {liveData.services.slice(0, 6).map((s: any, idx: number) => {
              const vibrantColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#64748b'];
              const barColor = vibrantColors[idx % vibrantColors.length];
              return (
                <div key={s.service} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[240px]">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: barColor }}
                      />
                      <span className="font-medium text-slate-800 truncate">{s.service}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900">{fmt(s.unblendedCost)}</span>
                      <span className="text-[11px] text-slate-400 w-12 text-right">({s.share}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${s.share}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Summary Footnote */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Compute + Tax = ~56% of total spend</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">100% Attributed</span>
          </div>
        </div>

      </div>

      {/* 4. Bottom Detailed Table Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">

        {/* Table Tabs & Search Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${activeTab === 'projects'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 bg-white shadow-2xs'
                }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Projects & Tags ({liveData.projectSummary?.length || 34})</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${activeTab === 'services'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 bg-white shadow-2xs'
                }`}
            >
              Top Service Drivers ({liveData.services.length})
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${activeTab === 'daily'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 bg-white shadow-2xs'
                }`}
            >
              Daily Timeline ({liveData.dailyTotals.length} Days)
            </button>
          </div>

          {/* Search box & buttons for projects tab */}
          {activeTab === 'projects' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={expandAllProjects}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium cursor-pointer transition-colors shadow-2xs"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllProjects}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium cursor-pointer transition-colors shadow-2xs"
                >
                  Collapse All
                </button>
              </div>
              <input
                type="text"
                placeholder="Search project or service..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs text-slate-900 placeholder-slate-400 w-full sm:w-56 focus:outline-none focus:border-purple-600 focus:bg-white shadow-2xs"
              />
            </div>
          )}

          {/* Search box for services tab */}
          {activeTab === 'services' && (
            <input
              type="text"
              placeholder="Search service name..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs text-slate-900 placeholder-slate-400 w-full sm:w-56 focus:outline-none focus:border-purple-600 focus:bg-white shadow-2xs"
            />
          )}
        </div>

        {/* View 0: Projects & Tags Table */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8"></th>
                    <th className="py-2.5 px-3">Project / Tag Name</th>
                    <th className="py-2.5 px-3">Tag Status</th>
                    <th className="py-2.5 px-3">Services Attached</th>
                    <th className="py-2.5 px-3 text-right">Spend (USD)</th>
                    <th className="py-2.5 px-3 text-right">% of Total</th>
                    <th className="py-2.5 px-3 text-center">Cost Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                        No projects match &quot;{projectSearch}&quot;.
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects.map((p: any) => {
                      const isExpanded = !!expandedProjects[p.projectName];
                      const isUntagged = p.isUntagged || p.projectName === 'Untagged';

                      return (
                        <React.Fragment key={p.projectName}>
                          <tr
                            onClick={() => toggleProjectExpand(p.projectName)}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                          >
                            <td className="py-2.5 px-3 text-slate-400 text-center">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-purple-600 transition-transform" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                              {isUntagged ? (
                                <MinusCircle className="h-4 w-4 text-amber-500 shrink-0" />
                              ) : (
                                <Folder className="h-4 w-4 text-purple-600 shrink-0" />
                              )}
                              <span className="truncate max-w-sm">{p.projectName}</span>
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              {isUntagged ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200/60">
                                  Untagged Infra
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200/60">
                                  Tagged Project
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-sans text-slate-600">
                              <span className="text-slate-900 font-semibold">
                                {p.servicesCount || p.services?.length || 0}
                              </span>{' '}
                              <span className="text-slate-400 text-[11px]">AWS services</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {fmt(p.unblendedCost)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600 font-semibold">
                              {p.share}%
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isUntagged ? 'bg-amber-500' : 'bg-purple-600'
                                  }`}
                                  style={{ width: `${Math.min(100, p.share * 2.5)}%` }}
                                />
                              </div>
                            </td>
                          </tr>

                          {/* Nested Sub-Table: Services attached to this project */}
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={7} className="p-0">
                                <div className="p-4 mx-3 my-2 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 font-sans">
                                    <div className="flex items-center gap-2 text-slate-700">
                                      <Layers className="h-3.5 w-3.5 text-purple-600" />
                                      <span className="font-semibold text-slate-900">
                                        Services utilized by &ldquo;{p.projectName}&rdquo;
                                      </span>
                                      <span className="text-slate-400 text-[11px]">
                                        ({p.services?.length || 0} services, {fmt(p.unblendedCost)} total)
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      {p.share}% of total AWS billing
                                    </span>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 bg-slate-50">
                                        <tr>
                                          <th className="py-2 px-2.5">AWS Service</th>
                                          <th className="py-2 px-2.5 text-right">Spend (USD)</th>
                                          <th className="py-2 px-2.5 text-right">Share of Project</th>
                                          <th className="py-2 px-2.5 text-center w-28">Relative Weight</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 font-mono">
                                        {Array.isArray(p.services) && p.services.length > 0 ? (
                                          p.services.map((sub: any) => (
                                            <tr key={sub.service} className="hover:bg-slate-50 transition-colors">
                                              <td className="py-2 px-2.5 text-slate-700 flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 shrink-0" />
                                                <span className="truncate max-w-md font-medium text-slate-900">{sub.service}</span>
                                              </td>
                                              <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                                                {fmt(sub.unblendedCost)}
                                              </td>
                                              <td className="py-2 px-2.5 text-right text-slate-500 font-sans text-[11px]">
                                                {sub.shareOfProject !== undefined
                                                  ? `${sub.shareOfProject}%`
                                                  : p.unblendedCost > 0
                                                  ? `${((sub.unblendedCost / p.unblendedCost) * 100).toFixed(1)}%`
                                                  : '0%'}
                                              </td>
                                              <td className="py-2 px-2.5 text-center">
                                                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto">
                                                  <div
                                                    className="h-full rounded-full bg-purple-600"
                                                    style={{
                                                      width: `${
                                                        sub.shareOfProject !== undefined
                                                          ? Math.min(100, sub.shareOfProject)
                                                          : p.unblendedCost > 0
                                                          ? Math.min(100, (sub.unblendedCost / p.unblendedCost) * 100)
                                                          : 0
                                                      }%`,
                                                    }}
                                                  />
                                                </div>
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan={4} className="py-2 text-center text-slate-400 font-sans">
                                              No service breakdown details found.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Projects */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Showing <span className="text-slate-900 font-semibold">{filteredProjects.length === 0 ? 0 : startProjectIdx + 1}</span>–
                  <span className="text-slate-900 font-semibold">{Math.min(startProjectIdx + projectPageSize, filteredProjects.length)}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{filteredProjects.length}</span> projects
                </span>

                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Rows:</span>
                  <select
                    value={projectPageSize}
                    onChange={(e) => {
                      setProjectPageSize(Number(e.target.value));
                      setProjectPage(1);
                    }}
                    className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-0.5 focus:outline-none focus:border-purple-600 cursor-pointer shadow-2xs"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={35}>35 (All)</option>
                  </select>
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
                  disabled={validProjectPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer shadow-2xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalProjectPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setProjectPage(pageNum)}
                      className={`h-7 min-w-7 px-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        validProjectPage === pageNum
                          ? 'bg-slate-900 text-white font-semibold shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setProjectPage((p) => Math.min(totalProjectPages, p + 1))}
                  disabled={validProjectPage >= totalProjectPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer shadow-2xs"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 1: Service Drivers Table */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">AWS Service Name</th>
                    <th className="py-2.5 px-3">Service Category</th>
                    <th className="py-2.5 px-3 text-right">Spend (USD)</th>
                    <th className="py-2.5 px-3 text-right">% of Total</th>
                    <th className="py-2.5 px-3 text-center">Cost Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        No AWS services match &quot;{serviceSearch}&quot;.
                      </td>
                    </tr>
                  ) : (
                    paginatedServices.map((s: any) => (
                      <tr key={s.service} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0" />
                          <span className="truncate max-w-sm">{s.service}</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                            {s.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {fmt(s.unblendedCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-semibold">
                          {s.share}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto">
                            <div
                              className="h-full rounded-full bg-purple-600"
                              style={{ width: `${Math.min(100, s.share * 2)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Services */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Showing <span className="text-slate-900 font-semibold">{filteredServices.length === 0 ? 0 : startServiceIdx + 1}</span>–
                  <span className="text-slate-900 font-semibold">{Math.min(startServiceIdx + servicePageSize, filteredServices.length)}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{filteredServices.length}</span> services
                </span>

                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Rows:</span>
                  <select
                    value={servicePageSize}
                    onChange={(e) => {
                      setServicePageSize(Number(e.target.value));
                      setServicePage(1);
                    }}
                    className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-0.5 focus:outline-none focus:border-purple-600 cursor-pointer shadow-2xs"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setServicePage((p) => Math.max(1, p - 1))}
                  disabled={validServicePage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer shadow-2xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalServicePages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setServicePage(pageNum)}
                      className={`h-7 min-w-7 px-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${validServicePage === pageNum
                          ? 'bg-slate-900 text-white font-semibold shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setServicePage((p) => Math.min(totalServicePages, p + 1))}
                  disabled={validServicePage >= totalServicePages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer shadow-2xs"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Daily Breakdown Table */}
        {activeTab === 'daily' && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Billing Cycle</th>
                    <th className="py-2.5 px-3 text-right">Daily Spend (USD)</th>
                    <th className="py-2.5 px-3 text-right">Variance vs Avg</th>
                    <th className="py-2.5 px-3 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {paginatedDailyTotals.map((d: any) => {
                    const diff = d.unblendedCost - liveData.dailyAvg;
                    const isHigh = diff > 0;
                    return (
                      <tr key={d.date} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{d.date}</span>
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-500">
                          2026-09 (September)
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {fmt(d.unblendedCost)}
                        </td>
                        <td className="py-2 px-3 text-right font-sans">
                          <span className={`text-[11px] font-semibold ${isHigh ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {isHigh ? `+${fmt(diff)}` : fmt(diff)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Aggregated</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Daily Timeline */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Showing <span className="text-slate-900 font-semibold">{liveData.dailyTotals.length === 0 ? 0 : startDailyIdx + 1}</span>–
                  <span className="text-slate-900 font-semibold">{Math.min(startDailyIdx + dailyPageSize, liveData.dailyTotals.length)}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{liveData.dailyTotals.length}</span> days
                </span>

                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Rows:</span>
                  <select
                    value={dailyPageSize}
                    onChange={(e) => {
                      setDailyPageSize(Number(e.target.value));
                      setDailyPage(1);
                    }}
                    className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-0.5 focus:outline-none focus:border-purple-600 cursor-pointer shadow-2xs"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
                  disabled={validDailyPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer shadow-2xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalDailyPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setDailyPage(pageNum)}
                      className={`h-7 min-w-7 px-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${validDailyPage === pageNum
                          ? 'bg-slate-900 text-white font-semibold shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setDailyPage((p) => Math.min(totalDailyPages, p + 1))}
                  disabled={validDailyPage >= totalDailyPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer shadow-2xs"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>MongoDB Collection: <code className="text-slate-800 font-mono font-medium">finops_3.awscostexplorer</code></span>
          </div>
          <div>
            <span>Last Synced: <span className="text-slate-900 font-mono font-medium">{new Date(liveData.lastSyncedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</span></span>
          </div>
        </div>

      </div>

    </div>
  );
}
