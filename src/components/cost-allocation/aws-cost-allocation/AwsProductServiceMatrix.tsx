'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface AwsProductServiceMatrixProps {
  selectedProduct: string;
  selectedService: string;
  environment?: string;
  onApplyCellFilter: (productId: string, serviceName: string) => void;
  onOpenDrilldown: (productId: string) => void;
  liveMatrix?: any;
}

export function AwsProductServiceMatrix({
  selectedProduct,
  selectedService,
  environment = 'all',
  onApplyCellFilter,
  onOpenDrilldown,
  liveMatrix,
}: AwsProductServiceMatrixProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Exact columns matching reference screenshot
  const columns = [
    { key: 'ec2Compute', label: 'EC2 COMPUTE', srvName: 'Amazon Elastic Compute Cloud - Compute' },
    { key: 'tax', label: 'TAX', srvName: 'Tax' },
    { key: 'ec2Other', label: 'EC2 OTHER', srvName: 'EC2 - Other' },
    { key: 'elb', label: 'LOAD BALANCING', srvName: 'Amazon Elastic Load Balancing' },
    { key: 'vpc', label: 'VPC', srvName: 'Amazon Virtual Private Cloud' },
    { key: 'otherServices', label: 'OTHER SERVICES', srvName: 'Other' },
  ];

  // Exact data rows matching reference screenshot
  const matrixRows = [
    {
      id: 'Agent_Builder',
      name: 'Agent_Builder',
      color: '#8b5cf6',
      ec2Compute: 128.80,
      tax: 0,
      ec2Other: 39.78,
      elb: 31.21,
      vpc: 0,
      otherServices: 6.19,
      total: 205.98,
    },
    {
      id: 'Untagged',
      name: 'Untagged',
      color: '#f97316',
      ec2Compute: 10.10,
      tax: 115.11,
      ec2Other: 9.01,
      elb: 0,
      vpc: 55.46,
      otherServices: 12.67,
      total: 202.35,
    },
    {
      id: 'postgre-sql DB',
      name: 'postgre-sql DB',
      color: '#06b6d4',
      ec2Compute: 33.92,
      tax: 0,
      ec2Other: 26.00,
      elb: 0,
      vpc: 0,
      otherServices: 0.40,
      total: 60.32,
    },
    {
      id: 'mongo-db',
      name: 'mongo-db',
      color: '#eab308',
      ec2Compute: 32.53,
      tax: 0,
      ec2Other: 19.32,
      elb: 0,
      vpc: 0,
      otherServices: 0.55,
      total: 52.40,
    },
    {
      id: 'sns-hub-cluster-dev',
      name: 'sns-hub-cluster-dev',
      color: '#ec4899',
      ec2Compute: 32.15,
      tax: 0,
      ec2Other: 4.89,
      elb: 0,
      vpc: 0,
      otherServices: 1.28,
      total: 38.32,
    },
    {
      id: 'Testing-Service',
      name: 'Testing-Service',
      color: '#10b981',
      ec2Compute: 12.75,
      tax: 0,
      ec2Other: 8.07,
      elb: 16.59,
      vpc: 0,
      otherServices: 0.29,
      total: 37.70,
    },
    {
      id: 'Other projects',
      name: 'Other projects',
      color: '#64748b',
      ec2Compute: 56.41,
      tax: 0,
      ec2Other: 3.55,
      elb: 40.18,
      vpc: 4.43,
      otherServices: 52.99,
      total: 157.56,
    },
  ];

  // Column totals
  const totals = {
    ec2Compute: 306.66,
    tax: 115.11,
    ec2Other: 110.62,
    elb: 87.98,
    vpc: 59.89,
    otherServices: 74.37,
    grandTotal: 754.63,
  };

  // Cell heatmap background styling matching reference image (pastel pink/magenta/purple)
  const getCellBg = (val: number) => {
    if (!val || val === 0) return 'bg-white text-slate-400';
    if (val >= 100) return 'bg-[#fbcfe8] text-slate-900 font-semibold'; // Pink-200 for >= $100
    if (val >= 50) return 'bg-[#fce7f3] text-slate-900 font-medium'; // Pink-100 for >= $50
    if (val >= 25) return 'bg-[#fdf2f8] text-slate-800 font-medium'; // Pink-50 for >= $25
    if (val >= 10) return 'bg-[#faf5ff] text-slate-800'; // Purple-50 for >= $10
    return 'bg-white text-slate-700';
  };

  const format = (val: number) => `$${val.toFixed(2)}`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Project × AWS Service Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            September spend by product and AWS service · USD
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Spend Density Legend */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Spend density</span>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#fdf2f8] border border-pink-200" />
              <span className="h-2.5 w-2.5 rounded-xs bg-[#fce7f3] border border-pink-300" />
              <span className="h-2.5 w-2.5 rounded-xs bg-[#fbcfe8] border border-pink-400" />
            </div>
          </div>

          {/* Collapse / Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      {!isCollapsed && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] font-semibold text-slate-400 tracking-wider">
                <th className="py-2.5 pr-4 uppercase">PROJECT</th>
                {columns.map((col) => (
                  <th key={col.key} className="py-2.5 px-3 text-right uppercase whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="py-2.5 pl-4 text-right uppercase">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Project Name */}
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <div
                      onClick={() => onOpenDrilldown(row.id)}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-medium text-slate-800 group-hover:text-slate-950">
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {/* Service Cells */}
                  {columns.map((col) => {
                    const val = (row as any)[col.key] as number;
                    const cellBg = getCellBg(val);

                    return (
                      <td
                        key={col.key}
                        onClick={() => onApplyCellFilter(row.id, col.srvName)}
                        className={`py-2.5 px-3 text-right tabular-nums transition-colors cursor-pointer ${cellBg}`}
                        title={`${row.name} - ${col.label}: ${val > 0 ? format(val) : '$0.00'}`}
                      >
                        {val > 0 ? format(val) : '—'}
                      </td>
                    );
                  })}

                  {/* Row Total */}
                  <td className="py-2.5 pl-4 text-right font-semibold text-slate-900 tabular-nums">
                    {format(row.total)}
                  </td>
                </tr>
              ))}

              {/* Total AWS Cost Footer Row */}
              <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-white">
                <td className="py-3 pr-4 font-bold text-slate-900">Total AWS Cost</td>
                <td className="py-3 px-3 text-right tabular-nums">{format(totals.ec2Compute)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{format(totals.tax)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{format(totals.ec2Other)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{format(totals.elb)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{format(totals.vpc)}</td>
                <td className="py-3 px-3 text-right tabular-nums">{format(totals.otherServices)}</td>
                <td className="py-3 pl-4 text-right tabular-nums font-extrabold text-slate-950">
                  {format(totals.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
