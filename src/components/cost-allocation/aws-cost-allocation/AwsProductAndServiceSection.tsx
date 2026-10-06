'use client';

import React from 'react';
import {
  Layers,
  Server,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Database,
  HardDrive,
  ArrowLeftRight,
  Boxes,
  Filter,
  Check,
} from 'lucide-react';
import {
  AWS_PRODUCT_ALLOCATIONS,
  AWS_SERVICES_DATA,
  AWS_TOTAL_COST,
  AWS_PREV_TOTAL_COST,
  AWS_TOTAL_CHANGE,
  ProductCostSummary,
  AwsServiceCost,
} from './awsCostData';

interface AwsProductAndServiceSectionProps {
  selectedProduct: string;
  selectedService: string;
  onSelectProduct: (productId: string) => void;
  onSelectService: (serviceName: string) => void;
  onOpenDrilldown: (productId: string) => void;
}

export function AwsProductAndServiceSection({
  selectedProduct,
  selectedService,
  onSelectProduct,
  onSelectService,
  onOpenDrilldown,
}: AwsProductAndServiceSectionProps) {
  // Service icon resolver
  const renderServiceIcon = (name: string) => {
    switch (name) {
      case 'Amazon EKS':
        return <Server size={14} className="text-white" />;
      case 'Amazon EC2':
        return <Cpu size={14} className="text-white" />;
      case 'Amazon RDS':
        return <Database size={14} className="text-white" />;
      case 'Amazon S3':
        return <HardDrive size={14} className="text-white" />;
      case 'Data Transfer':
        return <ArrowLeftRight size={14} className="text-white" />;
      default:
        return <Boxes size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mx-6 mt-4">
      {/* LEFT PANEL: AWS Cost by Product (6 cols) */}
      <div className="lg:col-span-6 rounded-none border border-gray-800 bg-[#111111] p-4 shadow-sm hover:border-gray-700 transition-all flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-white" />
                <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  AWS Cost by Product
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Product-level cloud allocation. Click any row to open product AWS analytics drill-down.
              </p>
            </div>
            <span className="text-[10px] font-medium text-gray-300 bg-[#141414] px-2 py-0.5 rounded-none border border-gray-800">
              Click row to drill-down
            </span>
          </div>

          {/* Table */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-800 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">AWS Cost</th>
                  <th className="py-2.5 px-3 text-left">Share of AWS</th>
                  <th className="py-2.5 px-3 text-right">Previous Period</th>
                  <th className="py-2.5 px-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {AWS_PRODUCT_ALLOCATIONS.map((p) => {
                  const isSelected = selectedProduct === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onOpenDrilldown(p.id)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-white/10 text-white font-medium'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {/* Product Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-none shrink-0 shadow-sm bg-white"
                          />
                          <span className="font-semibold text-white group-hover:text-gray-200 flex items-center gap-1 transition-colors">
                            {p.name}
                            <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 text-white transition-opacity" />
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        ${p.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Share with visual bar */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200 w-10 text-right">{p.share}%</span>
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-none overflow-hidden min-w-[50px]">
                            <div
                              className="h-full rounded-none bg-white"
                              style={{ width: `${p.share}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Previous Period */}
                      <td className="py-2.5 px-3 text-right text-gray-400 font-medium">
                        ${p.prevCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Change */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-none bg-white/10 text-white border border-white/20"
                        >
                          {p.change > 0 ? `+${p.change}` : `${p.change}`}%
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Total Row */}
                <tr className="bg-[#141414] font-bold text-white border-t-2 border-gray-800">
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-none bg-white" />
                    <span>Total</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-white font-extrabold text-sm">
                    ${AWS_TOTAL_COST.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-gray-300">100%</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-300">
                    ${AWS_PREV_TOTAL_COST.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center text-[10px] font-semibold bg-white/10 text-white border border-white/20 px-1.5 py-0.5 rounded-none">
                      {AWS_TOTAL_CHANGE > 0 ? `+${AWS_TOTAL_CHANGE}` : `${AWS_TOTAL_CHANGE}`}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <span>Total AWS compute coverage: 100%</span>
          <span className="text-white font-medium">Tagged &amp; Allocated Workloads</span>
        </div>
      </div>

      {/* RIGHT PANEL: AWS Cost by Service (6 cols) */}
      <div className="lg:col-span-6 rounded-none border border-gray-800 bg-[#111111] p-4 shadow-sm hover:border-gray-700 transition-all flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <Server size={15} className="text-white" />
                <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  AWS Cost by Service
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Service breakdown. Click any service to filter the entire Cost Allocation page.
              </p>
            </div>
            {selectedService !== 'all' && (
              <button
                onClick={() => onSelectService('all')}
                className="text-[11px] text-white hover:text-gray-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded-none flex items-center gap-1 font-medium"
              >
                <span>Clear filter ({selectedService})</span>
              </button>
            )}
          </div>

          {/* Service Bars & Table */}
          <div className="mt-3 space-y-2.5">
            {AWS_SERVICES_DATA.map((srv) => {
              const isFiltered = selectedService === srv.service;
              return (
                <div
                  key={srv.service}
                  onClick={() => onSelectService(isFiltered ? 'all' : srv.service)}
                  className={`p-2.5 rounded-none border transition-all cursor-pointer group ${
                    isFiltered
                      ? 'bg-white/10 border-white ring-1 ring-white/30'
                      : 'bg-[#141414] border-gray-800 hover:border-gray-600 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      {renderServiceIcon(srv.service)}
                      <span className={`font-semibold transition-colors ${
                        isFiltered ? 'text-white font-bold' : 'text-white group-hover:text-gray-200'
                      }`}>
                        {srv.service}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:inline">
                        ({srv.category})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">
                        ${srv.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="font-semibold text-gray-400 w-11 text-right">
                        {srv.share}%
                      </span>
                      <Filter
                        size={12}
                        className={`transition-opacity ${
                          isFiltered ? 'text-white opacity-100' : 'text-gray-500 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-2 w-full bg-gray-800 rounded-none overflow-hidden">
                    <div
                      className={`h-full rounded-none transition-all duration-300 ${
                        isFiltered
                          ? 'bg-white'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${srv.share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <span>Top service: Amazon EKS ($10,420.40 - 33.0%)</span>
          <span className="text-gray-300">6 AWS Service Categories</span>
        </div>
      </div>
    </div>
  );
}
