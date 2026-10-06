import React, { useState } from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, Download } from 'lucide-react';

interface DetailedUsageRow {
  id: string;
  date: string;
  account: string;
  environment: string;
  region: string;
  service: string;
  usageType: string;
  operation: string;
  resourceId: string;
  instanceType: string;
  purchaseOption: string;
  usageAmount: string;
  cost: number;
}

const USAGE_ROWS: DetailedUsageRow[] = [
  {
    id: '1',
    date: 'Sep 9',
    account: 'Workbench Prod',
    environment: 'Production',
    region: 'us-east-1',
    service: 'Amazon EC2',
    usageType: 'BoxUsage:m5.large',
    operation: 'RunInstances',
    resourceId: 'i-0abc123',
    instanceType: 'm5.large',
    purchaseOption: 'On-Demand',
    usageAmount: '420 hours',
    cost: 32.40,
  },
  {
    id: '2',
    date: 'Sep 9',
    account: 'Workbench Prod',
    environment: 'Production',
    region: 'us-east-1',
    service: 'Amazon EKS',
    usageType: 'EKS compute',
    operation: 'CreateCluster',
    resourceId: 'eks-prod-1',
    instanceType: '-',
    purchaseOption: 'On-Demand',
    usageAmount: '1 count',
    cost: 28.60,
  },
  {
    id: '3',
    date: 'Sep 8',
    account: 'Workbench Prod',
    environment: 'Production',
    region: 'eu-west-1',
    service: 'Amazon RDS',
    usageType: 'DatabaseUsage',
    operation: '-',
    resourceId: 'db-prod-1',
    instanceType: 'db.m6g.large',
    purchaseOption: 'Reserved',
    usageAmount: '24 hours',
    cost: 24.20,
  },
  {
    id: '4',
    date: 'Sep 8',
    account: 'Workbench Prod',
    environment: 'Production',
    region: 'us-east-1',
    service: 'Amazon S3',
    usageType: 'TimedStorage-ByteHrs',
    operation: '-',
    resourceId: 'workbench-bucket',
    instanceType: '-',
    purchaseOption: 'On-Demand',
    usageAmount: '1.2 TB',
    cost: 18.40,
  },
  {
    id: '5',
    date: 'Sep 7',
    account: 'Workbench Prod',
    environment: 'Production',
    region: 'us-east-1',
    service: 'Amazon EC2',
    usageType: 'EBS:VolumeUsage.gp3',
    operation: 'CreateVolume',
    resourceId: 'vol-0fed456',
    instanceType: 'gp3',
    purchaseOption: 'On-Demand',
    usageAmount: '500 GB-Mo',
    cost: 16.50,
  },
  {
    id: '6',
    date: 'Sep 7',
    account: 'Workbench Staging',
    environment: 'Staging',
    region: 'us-east-1',
    service: 'Amazon EC2',
    usageType: 'BoxUsage:t3.medium',
    operation: 'RunInstances',
    resourceId: 'i-0987xyz',
    instanceType: 't3.medium',
    purchaseOption: 'Spot',
    usageAmount: '180 hours',
    cost: 12.80,
  },
];

export function DetailedUsageTable({ productName = 'Workbench' }: { productName?: string }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'cost' | 'usage' | 'date'>('cost');
  const [sortAsc, setSortAsc] = useState(false);

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleSort = (field: 'cost' | 'usage' | 'date') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = USAGE_ROWS.filter((r) => {
    if (search.trim() === '') return true;
    const q = search.toLowerCase();
    return (
      r.service.toLowerCase().includes(q) ||
      r.usageType.toLowerCase().includes(q) ||
      r.resourceId.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (sortField === 'cost') return sortAsc ? a.cost - b.cost : b.cost - a.cost;
    return 0;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm w-full space-y-2">
      {/* Header & Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Detailed AWS Usage</h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resource, service, usage type..."
              className="h-8 w-60 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
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
            onClick={() => handleSort('usage')}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${
              sortField === 'usage' ? 'bg-slate-900 text-white font-semibold border-slate-900 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort by usage</span>
          </button>

          {/* Column Visibility */}
          <button className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Column visibility</span>
          </button>

          {/* Export */}
          <button className="h-8 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
            <Download className="h-3 w-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/95 whitespace-nowrap">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Account</th>
              <th className="py-3 px-3">Environment</th>
              <th className="py-3 px-3">Region</th>
              <th className="py-3 px-3">Service</th>
              <th className="py-3 px-3">Usage type</th>
              <th className="py-3 px-3">Operation</th>
              <th className="py-3 px-3">Resource ID</th>
              <th className="py-3 px-3">Instance type</th>
              <th className="py-3 px-3">Purchase option</th>
              <th className="py-3 px-3 text-right">Usage amount</th>
              <th className="py-3 px-4 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 whitespace-nowrap font-sans">
            {filtered.slice(0, 4).map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.date}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">{item.account.replace('Workbench', productName)}</td>
                <td className="py-2.5 px-3 text-slate-500">{item.environment}</td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.region}</td>
                <td className="py-2.5 px-3 text-slate-700">{item.service}</td>
                <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{item.usageType}</td>
                <td className="py-2.5 px-3 text-slate-500">{item.operation}</td>
                <td className="py-2.5 px-3 text-slate-800 font-mono text-[11px]">{item.resourceId}</td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.instanceType}</td>
                <td className="py-2.5 px-3">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] bg-purple-50 border border-purple-200/60 text-purple-700 font-medium">
                    {item.purchaseOption}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{item.usageAmount}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">{format(item.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
