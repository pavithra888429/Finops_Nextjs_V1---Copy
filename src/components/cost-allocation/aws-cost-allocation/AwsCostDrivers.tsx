'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Search,
  ArrowUpDown,
  Download,
  Eye,
  SlidersHorizontal,
  Check,
  ExternalLink,
} from 'lucide-react';
import { AWS_COST_DRIVERS_DATA, CostDriverRow } from './awsCostData';

interface AwsCostDriversProps {
  selectedProduct: string;
  selectedService: string;
  account?: string;
  region?: string;
  environment?: string;
  onSelectProduct: (productId: string) => void;
  onSelectService: (serviceName: string) => void;
  liveDrivers?: any[];
}

export function AwsCostDrivers({
  selectedProduct,
  selectedService,
  account = 'all',
  region = 'all',
  environment = 'all',
  onSelectProduct,
  onSelectService,
  liveDrivers,
}: AwsCostDriversProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'cost'>('cost');
  const [sortAsc, setSortAsc] = useState(false);
  const [showColMenu, setShowColMenu] = useState(false);

  // Column visibility state
  const [visibleCols, setVisibleCols] = useState({
    resource: true,
    service: true,
    product: true,
    account: true,
    region: true,
    usageType: true,
    cost: true,
  });

  const toggleCol = (col: keyof typeof visibleCols) => {
    setVisibleCols((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  // Filtered & sorted drivers
  const filteredDrivers = useMemo(() => {
    if (liveDrivers && liveDrivers.length > 0) {
      return liveDrivers
        .map((d: any) => {
          const pName = d.name || d.projectName || d.project_name || 'Untagged';
          const isUntagged = pName.toLowerCase() === 'untagged' || pName.toLowerCase() === 'unallocated';
          const svc = d.service || d.services?.[0]?.service || 'Amazon Elastic Compute Cloud - Compute';

          return {
            resourceId: d.resourceId || `arn:aws:cloud:${pName.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`,
            service: svc,
            product: pName,
            productId: isUntagged ? 'unallocated' : pName,
            account: 'Production Platform (864981730114)',
            region: d.region || 'ap-south-1',
            usageType: d.usageType || `${svc.replace('Amazon Elastic Compute Cloud - Compute', 'EC2')} (Active)`,
            operation: d.operation || 'StandardUsage',
            cost: Number(d.cost || 0),
            share: d.share || 0,
            recordsCount: d.recordsCount || 1,
          };
        })
        .filter((item: any) => {
          if (selectedService !== 'all' && !item.service.toLowerCase().includes(selectedService.toLowerCase()) && !selectedService.toLowerCase().includes(item.service.toLowerCase())) {
            return false;
          }
          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return (
              item.resourceId.toLowerCase().includes(q) ||
              item.service.toLowerCase().includes(q) ||
              item.usageType.toLowerCase().includes(q) ||
              item.operation.toLowerCase().includes(q)
            );
          }
          return true;
        })
        .sort((a: any, b: any) => {
          const mult = sortAsc ? 1 : -1;
          return (a[sortField] - b[sortField]) * mult;
        });
    }

    return AWS_COST_DRIVERS_DATA.filter((item) => {
      if (selectedProduct !== 'all' && item.productId !== selectedProduct) {
        return false;
      }
      if (selectedService !== 'all' && item.service !== selectedService) {
        return false;
      }
      if (account !== 'all' && item.account !== account) {
        return false;
      }
      if (region !== 'all' && item.region !== region) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.resourceId.toLowerCase().includes(q) ||
          item.service.toLowerCase().includes(q) ||
          item.product.toLowerCase().includes(q) ||
          item.account.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.usageType.toLowerCase().includes(q)
        );
      }
      return true;
    }).map((item) => ({
      ...item,
      cost: Math.round(item.cost * 100) / 100,
      share: 5.0,
      recordsCount: 1,
    })).sort((a, b) => {
      const mult = sortAsc ? 1 : -1;
      return (a[sortField] - b[sortField]) * mult;
    });
  }, [liveDrivers, selectedProduct, selectedService, account, region, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: 'cost') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Export filtered data to CSV
  const handleExportCSV = () => {
    const headers = [
      'AWS Resource',
      'AWS Service',
      'Allocated Product',
      'AWS Account',
      'Region',
      'Usage Type',
      'Cost (USD)',
    ];
    const rows = filteredDrivers.map((r) => [
      `"${r.resourceId}"`,
      `"${r.service}"`,
      `"${r.product}"`,
      `"${r.account}"`,
      `"${r.region}"`,
      `"${r.usageType}"`,
      r.cost.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aws-cost-drivers-${selectedProduct}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getProductColorDot = (id: string) => {
    return '#a3a3a3';
  };

  return (
    <div className="w-full rounded-none border border-gray-800 bg-[#111111] p-4 sm:p-5 shadow-sm hover:border-gray-700 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-white" />
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
              Top AWS Cost Drivers
            </h2>
            <span className="text-[10px] font-medium text-gray-400 bg-[#141414] px-2 py-0.5 rounded-none border border-gray-800">
              High-impact Resources
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Individual cloud infrastructure components and workloads driving highest AWS dollar spend across products.
          </p>
        </div>

        {/* Action Controls: Search, Sort Buttons, Column Visibility, Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 bg-[#141414] border border-gray-800 rounded-none pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:border-white outline-none"
            />
          </div>

          {/* Sort by Cost */}
          <button
            onClick={() => toggleSort('cost')}
            className={`h-8 flex items-center gap-1.5 px-2.5 rounded-none border text-xs font-medium transition-colors ${
              sortField === 'cost'
                ? 'bg-white text-black font-semibold border-white'
                : 'bg-[#141414] border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
            }`}
          >
            <span>Sort by cost</span>
            <ArrowUpDown size={11} />
          </button>

          {/* Column Visibility Popover */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-none bg-[#141414] border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-all"
              title="Column visibility"
            >
              <Eye size={13} />
              <span>Columns</span>
            </button>

            {showColMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 mt-1.5 w-48 rounded-none bg-[#141414] border border-gray-800 shadow-2xl z-50 p-2 space-y-1 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Visible Columns
                  </div>
                  {Object.entries(visibleCols).map(([colKey, isVisible]) => (
                    <button
                      key={colKey}
                      onClick={() => toggleCol(colKey as keyof typeof visibleCols)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded-none text-gray-300 hover:bg-white/10"
                    >
                      <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                      {isVisible && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Filtered Data Button */}
          <button
            onClick={handleExportCSV}
            className="h-8 flex items-center gap-1.5 px-3 rounded-none bg-white hover:bg-gray-200 text-black text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Export filtered data</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-gray-800 text-[11px] text-gray-400 uppercase tracking-wider font-semibold bg-[#141414]">
              {visibleCols.resource && <th className="py-2.5 px-3">AWS Resource</th>}
              {visibleCols.service && <th className="py-2.5 px-3">AWS Service</th>}
              {visibleCols.product && <th className="py-2.5 px-3">Allocated Product</th>}
              {visibleCols.account && <th className="py-2.5 px-3">AWS Account</th>}
              {visibleCols.region && <th className="py-2.5 px-3">Region</th>}
              {visibleCols.usageType && <th className="py-2.5 px-3">Usage Type</th>}
              {visibleCols.cost && <th className="py-2.5 px-3 text-right">Cost</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredDrivers.map((driver, idx) => (
              <tr
                key={`${driver.resourceId || 'driver'}-${driver.service || ''}-${idx}`}
                className="hover:bg-white/[0.04] transition-colors text-gray-300 group"
              >
                {/* Resource */}
                {visibleCols.resource && (
                  <td className="py-3 px-3 font-mono text-white font-medium flex items-center gap-1.5">
                    <span className="truncate max-w-[200px]" title={driver.resourceId}>
                      {driver.resourceId}
                    </span>
                  </td>
                )}

                {/* Service */}
                {visibleCols.service && (
                  <td className="py-3 px-3">
                    <span
                      onClick={() => onSelectService(driver.service)}
                      className="text-gray-200 hover:text-white cursor-pointer font-medium transition-colors"
                    >
                      {driver.service}
                    </span>
                  </td>
                )}

                {/* Product */}
                {visibleCols.product && (
                  <td className="py-3 px-3">
                    <div
                      onClick={() => onSelectProduct(driver.productId)}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <span
                        className="h-2 w-2 rounded-none shrink-0"
                        style={{ backgroundColor: getProductColorDot(driver.productId) }}
                      />
                      <span className="font-semibold text-white group-hover:text-gray-300 transition-colors">
                        {driver.product}
                      </span>
                    </div>
                  </td>
                )}

                {/* Account */}
                {visibleCols.account && (
                  <td className="py-3 px-3 text-gray-400">
                    {driver.account}
                  </td>
                )}

                {/* Region */}
                {visibleCols.region && (
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-gray-300 bg-[#161616] px-1.5 py-0.5 rounded-none border border-gray-800">
                      {driver.region}
                    </span>
                  </td>
                )}

                {/* Usage Type */}
                {visibleCols.usageType && (
                  <td className="py-3 px-3 font-mono text-[11px] text-gray-400">
                    {driver.usageType}
                  </td>
                )}

                {/* Cost */}
                {visibleCols.cost && (
                  <td className="py-3 px-3 text-right font-bold text-white font-mono">
                    ${driver.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                )}
              </tr>
            ))}

            {filteredDrivers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No matching AWS cost drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
