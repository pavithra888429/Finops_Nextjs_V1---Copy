'use client';

import React, { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface AwsCostByProductCardProps {
  selectedProduct: string;
  selectedService?: string;
  environment?: string;
  onSelectProduct: (productId: string) => void;
  onOpenDrilldown: (productId: string) => void;
  liveProjects?: any[];
  totalSpend?: number;
}

const PROJECT_PALETTE = [
  '#a855f7', // Agent_Builder - Purple
  '#f59e0b', // Untagged - Amber
  '#06b6d4', // postgre-sql DB - Cyan
  '#eab308', // mongo-db - Yellow
  '#ec4899', // sns-hub-cluster-dev - Pink
  '#10b981', // Testing-Service - Emerald
  '#3b82f6', // tat - Blue
  '#8b5cf6', // sns_square - Violet
  '#0ea5e9', // seatify - Sky
  '#d946ef', // Database - Development - Fuchsia
  '#14b8a6', // Other - Teal
];

export function AwsCostByProductCard({
  selectedProduct,
  selectedService = 'all',
  environment = 'all',
  onSelectProduct,
  onOpenDrilldown,
  liveProjects,
  totalSpend: propTotalSpend,
}: AwsCostByProductCardProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);

  // Dynamic products list
  const { displayProducts, totalCost, totalAllocated, productCount } = useMemo(() => {
    if (liveProjects && liveProjects.length > 0) {
      const overallTotal = propTotalSpend || liveProjects.reduce((s: number, p: any) => s + Number(p.unblendedCost || 0), 0);

      const mapped = liveProjects.map((p: any, idx: number) => {
        const pName = p.projectName || p.project_name || 'Untagged';
        let cost = Number(p.unblendedCost || 0);

        if (selectedService !== 'all' && Array.isArray(p.services)) {
          const matchedService = p.services.find((s: any) => (s.service || '').toLowerCase() === selectedService.toLowerCase());
          cost = matchedService ? Number(matchedService.unblendedCost || 0) : 0;
        }

        const share = overallTotal > 0 ? Number(((cost / overallTotal) * 100).toFixed(1)) : 0;
        const isUntagged = pName.toLowerCase() === 'untagged' || pName.toLowerCase() === 'unallocated';

        return {
          id: pName,
          name: pName,
          cost: Math.round(cost * 100) / 100,
          share,
          prevCost: p.prevCost ?? null,
          change: p.change ?? null,
          color: isUntagged ? '#f59e0b' : PROJECT_PALETTE[idx % PROJECT_PALETTE.length],
          servicesCount: Array.isArray(p.services) ? p.services.length : 1,
        };
      })
        .filter((p: any) => selectedService === 'all' || p.cost > 0)
        .sort((a: any, b: any) => b.cost - a.cost);

      const allocated = mapped
        .filter((p: any) => p.id.toLowerCase() !== 'untagged' && p.id.toLowerCase() !== 'unallocated')
        .reduce((sum: number, p: any) => sum + p.cost, 0);

      return {
        displayProducts: mapped,
        totalCost: overallTotal,
        totalAllocated: allocated,
        productCount: liveProjects.length,
      };
    }

    // Default high-fidelity fallback
    const fallbackProjects = [
      { id: 'Agent_Builder',         name: 'Agent_Builder',         cost: 205.98, share: 27.3, color: '#a855f7' },
      { id: 'Untagged',              name: 'Untagged',              cost: 202.35, share: 26.8, color: '#f59e0b' },
      { id: 'postgre-sql DB',        name: 'postgre-sql DB',        cost:  60.32, share:  8.0, color: '#06b6d4' },
      { id: 'mongo-db',              name: 'mongo-db',              cost:  52.40, share:  6.9, color: '#eab308' },
      { id: 'sns-hub-cluster-dev',   name: 'sns-hub-cluster-dev',   cost:  38.32, share:  5.1, color: '#ec4899' },
      { id: 'Testing-Service',       name: 'Testing-Service',       cost:  37.70, share:  5.0, color: '#10b981' },
      { id: 'tat',                   name: 'tat',                   cost:  28.32, share:  3.8, color: '#3b82f6' },
      { id: 'sns_square',            name: 'sns_square',            cost:  27.91, share:  3.7, color: '#8b5cf6' },
      { id: 'seatify',               name: 'seatify',               cost:  24.87, share:  3.3, color: '#0ea5e9' },
      { id: 'Database - Development',name: 'Database - Development',cost:  18.99, share:  2.5, color: '#d946ef' },
    ];

    return {
      displayProducts: fallbackProjects,
      totalCost: propTotalSpend || 754.63,
      totalAllocated: 552.28,
      productCount: 34,
    };
  }, [liveProjects, propTotalSpend, selectedService]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return displayProducts;
    return displayProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  }, [displayProducts, searchQuery]);

  const untaggedCost = displayProducts.find(
    p => p.id.toLowerCase() === 'untagged' || p.id.toLowerCase() === 'unallocated'
  )?.cost || 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm w-full overflow-hidden">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {selectedService !== 'all' ? `${selectedService} by Project` : 'AWS Cost Allocation by Project'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedService !== 'all'
              ? `Expenditure breakdown for ${selectedService} across workloads`
              : 'Workload cost distribution and resource tag allocation'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <input
            type="text"
            placeholder="Search project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white w-36 transition-all"
          />
          <span className="text-[11px] px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold whitespace-nowrap">
            Tagged: {format(totalAllocated)} · {productCount} projects
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">

            {/* thead — sticky */}
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 pl-5 pr-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Project
                </th>
                <th className="py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                  {selectedService !== 'all' ? `${selectedService} Spend` : 'AWS Spend'}
                </th>
                <th className="py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap min-w-[140px]">
                  Share
                </th>
                <th className="py-2.5 pl-3 pr-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p, idx) => {
                const isSelected = selectedProduct.toLowerCase() === p.id.toLowerCase();
                const isUnallocated = p.id.toLowerCase() === 'unallocated' || p.id.toLowerCase() === 'untagged';

                return (
                  <tr
                    key={p.id}
                    onClick={() => {
                      if (!isUnallocated) {
                        onOpenDrilldown(p.id);
                      } else {
                        onSelectProduct(isSelected ? 'all' : 'unallocated');
                      }
                    }}
                    className={`group cursor-pointer border-b border-slate-100 transition-colors last:border-0 ${
                      isSelected
                        ? 'bg-purple-50/60'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* PROJECT */}
                    <td className="py-3 pl-5 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className={`font-medium transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                          {p.name}
                        </span>
                        {isUnallocated && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 font-medium leading-none">
                            shared
                          </span>
                        )}
                      </div>
                    </td>

                    {/* SPEND */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums font-mono whitespace-nowrap">
                      {format(p.cost)}
                    </td>

                    {/* SHARE — thin bar + % */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {/* track */}
                        <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(p.cost > 0 ? 2 : 0, p.share))}%`,
                              backgroundColor: p.color,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 w-9 text-right tabular-nums">
                          {p.share}%
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                      {!isUnallocated ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDrilldown(p.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 hover:text-purple-800 transition-colors cursor-pointer group/btn"
                        >
                          <span className="group-hover/btn:underline">Drilldown</span>
                          <ArrowUpRight size={11} className="opacity-70" />
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-slate-400">
                    No projects match your search.
                  </td>
                </tr>
              )}
            </tbody>

            {/* TOTAL footer row — sticky */}
            <tfoot>
              <tr className="sticky bottom-0 z-10 bg-white border-t-2 border-slate-200">
                <td className="py-3 pl-5 pr-3 text-xs font-bold text-slate-800">
                  Total {selectedService !== 'all' ? selectedService : 'AWS Cloud'}
                </td>
                <td className="py-3 px-3 text-right text-xs font-bold text-slate-900 tabular-nums font-mono">
                  {format(totalCost)}
                </td>
                <td className="py-3 px-3 text-xs font-mono text-slate-500">
                  100%
                </td>
                <td className="py-3 pl-3 pr-5 text-right text-[11px] text-slate-400 font-medium">
                  Verified
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <span className="text-[11px] text-slate-500">
          Tag allocation rate:{' '}
          <strong className="text-slate-700 font-semibold">
            {totalCost > 0 ? ((totalAllocated / totalCost) * 100).toFixed(1) : '0.0'}%
          </strong>{' '}
          across {productCount} workloads
        </span>
        <span className="text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Untagged: {format(untaggedCost)}
        </span>
      </div>
    </div>
  );
}
