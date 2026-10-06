'use client';

import React, { useMemo, useState } from 'react';
import { ArrowUpRight, X, Search, Cloud, Filter, CheckCircle2 } from 'lucide-react';

interface AwsCostByServiceCardProps {
  selectedService: string;
  selectedProduct?: string;
  environment?: string;
  onSelectService: (serviceName: string) => void;
  liveServices?: any[];
  liveProjects?: any[];
  totalSpend?: number;
}

const SERVICE_PALETTE_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
  '#6366f1', '#14b8a6', '#f97316', '#3b82f6', '#84cc16',
  '#a855f7', '#0284c7', '#059669', '#d97706', '#db2777',
  '#4f46e5', '#0d9488', '#ea580c', '#2563eb', '#65a30d',
];

function getFriendlyServiceName(service: string): string {
  if (!service) return 'Unknown Service';
  if (service.includes('Elastic Compute Cloud - Compute')) return 'EC2 Compute';
  if (service === 'Tax') return 'Tax';
  if (service.includes('EC2 - Other')) return 'EC2 Other';
  if (service.includes('Elastic Load Balancing')) return 'Load Balancing';
  if (service.includes('Virtual Private Cloud')) return 'VPC Networking';
  if (service.includes('Route 53')) return 'Route 53 DNS';
  if (service.includes('WAF')) return 'AWS WAF';
  if (service.includes('Amplify')) return 'AWS Amplify';
  if (service.includes('Simple Storage Service')) return 'S3 Storage';
  if (service.includes('ECR') || service.includes('Container Registry')) return 'ECR Registry';
  if (service.includes('Cost Explorer')) return 'Cost Explorer';
  if (service.includes('Secrets Manager')) return 'Secrets Manager';
  if (service.includes('Simple Email Service')) return 'SES Email';
  if (service.includes('Glue')) return 'AWS Glue';
  if (service.includes('Key Management Service')) return 'KMS Keys';
  if (service.includes('Lambda')) return 'AWS Lambda';
  if (service.includes('CloudFront')) return 'CloudFront CDN';
  if (service.includes('Elastic Container Service')) return 'ECS Containers';
  if (service.includes('Notification Service')) return 'SNS Notifications';
  if (service.includes('CloudWatch') && !service.includes('Events')) return 'CloudWatch';
  if (service.includes('Events') || service.includes('EventBridge')) return 'EventBridge';
  return service;
}

export function AwsCostByServiceCard({
  selectedService,
  selectedProduct = 'all',
  environment = 'all',
  onSelectService,
  liveServices,
  liveProjects,
  totalSpend: propTotalSpend,
}: AwsCostByServiceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardViewMode, setCardViewMode] = useState<'top5' | 'all'>('top5');
  const [searchQuery, setSearchQuery] = useState('');

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);

  // Compute full sorted list of all services
  const allServices = useMemo(() => {
    if (liveServices && Array.isArray(liveServices) && liveServices.length > 0) {
      const calculatedTotal =
        propTotalSpend ||
        liveServices.reduce((sum, s) => sum + Number(s.unblendedCost || 0), 0) ||
        754.63;

      return liveServices
        .map((s, idx) => {
          const cost = Number(s.unblendedCost || 0);
          const share = calculatedTotal > 0 ? Number(((cost / calculatedTotal) * 100).toFixed(1)) : 0;
          const friendlyName = getFriendlyServiceName(s.service);

          return {
            name: friendlyName,
            fullName: s.service,
            cost,
            share,
            change: s.change,
            color: SERVICE_PALETTE_COLORS[idx % SERVICE_PALETTE_COLORS.length],
          };
        })
        .sort((a, b) => b.cost - a.cost);
    }

    // Default static fallback if no live data
    return [
      { name: 'EC2 Compute', fullName: 'Amazon Elastic Compute Cloud - Compute', cost: 306.66, share: 40.6, color: '#8b5cf6' },
      { name: 'Tax', fullName: 'Tax', cost: 115.11, share: 15.3, color: '#06b6d4' },
      { name: 'EC2 Other', fullName: 'EC2 - Other', cost: 110.62, share: 14.7, color: '#10b981' },
      { name: 'Load Balancing', fullName: 'Amazon Elastic Load Balancing', cost: 87.98, share: 11.7, color: '#f59e0b' },
      { name: 'Other services', fullName: 'Other', cost: 74.37, share: 9.9, color: '#ec4899' },
    ];
  }, [liveServices, propTotalSpend]);

  const effectiveTotalSpend = useMemo(() => {
    return allServices.reduce((acc, s) => acc + s.cost, 0);
  }, [allServices]);

  // Services displayed inside the card
  const cardServices = useMemo(() => {
    if (cardViewMode === 'top5') {
      return allServices.slice(0, 5);
    }
    return allServices;
  }, [allServices, cardViewMode]);

  // Services filtered in the modal search
  const modalFilteredServices = useMemo(() => {
    if (!searchQuery.trim()) return allServices;
    const q = searchQuery.toLowerCase();
    return allServices.filter(
      (s) => s.name.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q)
    );
  }, [allServices, searchQuery]);

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
        <div>
          {/* Header matching Reference Image */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Top AWS Services
              </h3>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {allServices.length} Total
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCardViewMode(cardViewMode === 'top5' ? 'all' : 'top5')}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors cursor-pointer"
                title={cardViewMode === 'top5' ? 'Scroll through all services' : 'Show top 5 only'}
              >
                {cardViewMode === 'top5' ? `Show All (${allServices.length})` : 'Show Top 5'}
              </button>
              <span className="text-xs text-slate-400 font-normal">
                By spend
              </span>
            </div>
          </div>

          {/* Services Progress Rows (Scrollable if "Show All" is chosen) */}
          <div
            className={`space-y-4 pt-4 ${
              cardViewMode === 'all' ? 'max-h-[300px] overflow-y-auto pr-1.5' : ''
            }`}
          >
            {cardServices.map((srv) => {
              const isSelected =
                selectedService === srv.name || selectedService === srv.fullName;

              return (
                <div
                  key={srv.fullName}
                  onClick={() => onSelectService(isSelected ? 'all' : srv.fullName)}
                  className="space-y-1.5 cursor-pointer group"
                  title={`Click to filter by ${srv.name} (${srv.fullName})`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-medium transition-colors truncate max-w-[170px] ${
                        isSelected
                          ? 'text-violet-600 font-bold'
                          : 'text-slate-800 group-hover:text-slate-950'
                      }`}
                    >
                      {srv.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {format(srv.cost)}
                      </span>
                      <span className="text-slate-400 font-normal text-[11px]">
                        ({srv.share}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with vibrant curved styling */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(3, srv.share * 2.2))}%`,
                        backgroundColor: srv.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Button: Opens Detailed Breakdown Modal with all services scrollable */}
        <div className="pt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full border border-slate-200 rounded-lg py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>View Detailed Breakdown</span>
            <ArrowUpRight size={13} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* DETAILED ALL SERVICES BREAKDOWN MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 shadow-xs">
                  <Cloud size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      All AWS Services Breakdown
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-md">
                      {allServices.length} Services
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranked by unblended spend · Total: {format(effectiveTotalSpend)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close dialog (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search AWS services by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Scrollable Services List */}
            <div className="p-6 overflow-y-auto space-y-2.5 max-h-[60vh]">
              {modalFilteredServices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No services found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                modalFilteredServices.map((srv, idx) => {
                  const isSelected =
                    selectedService === srv.name || selectedService === srv.fullName;

                  return (
                    <div
                      key={srv.fullName}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all shadow-2xs group ${
                        isSelected
                          ? 'border-violet-300 bg-violet-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-400 w-6 text-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: srv.color }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {srv.name}
                            </span>
                            {srv.name !== srv.fullName && (
                              <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                                ({srv.fullName})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Share of AWS spend: <span className="font-semibold text-slate-700">{srv.share}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Cost & Progress */}
                        <div className="text-right w-28 sm:w-36">
                          <span className="font-bold text-slate-900 text-xs tabular-nums">
                            {format(srv.cost)}
                          </span>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(3, srv.share * 2.2))}%`,
                                backgroundColor: srv.color,
                              }}
                            />
                          </div>
                        </div>

                        {/* Action: Filter by service */}
                        <button
                          onClick={() => {
                            onSelectService(isSelected ? 'all' : srv.fullName);
                            setIsModalOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 text-white hover:bg-violet-700'
                              : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
                          }`}
                        >
                          <Filter size={11} />
                          <span>{isSelected ? 'Active' : 'Filter'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">
              <span className="text-xs text-slate-500">
                Showing {modalFilteredServices.length} of {allServices.length} AWS services
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
