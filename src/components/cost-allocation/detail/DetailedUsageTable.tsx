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
    <div className="rounded-xl border border-dark-border bg-dark-card/90 overflow-hidden shadow-sm w-full space-y-2">
      {/* Header & Toolbar */}
      <div className="p-4 border-b border-dark-border/60 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white tracking-tight">Detailed AWS Usage</h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resource, service, usage type..."
              className="h-7 w-60 pl-8 pr-3 text-xs bg-dark-surface border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sort Buttons */}
          <button
            onClick={() => handleSort('cost')}
            className={`h-7 flex items-center gap-1 px-2 rounded-lg border text-xs font-medium transition-colors ${
              sortField === 'cost' ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'border-dark-border text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort by cost</span>
          </button>

          <button
            onClick={() => handleSort('usage')}
            className={`h-7 flex items-center gap-1 px-2 rounded-lg border text-xs font-medium transition-colors ${
              sortField === 'usage' ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'border-dark-border text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort by usage</span>
          </button>

          {/* Column Visibility */}
          <button className="h-7 flex items-center gap-1 px-2 rounded-lg border border-dark-border text-xs text-slate-300 hover:text-white transition-colors">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Column visibility</span>
          </button>

          {/* Export */}
          <button className="h-7 flex items-center gap-1 px-2 rounded-lg border border-dark-border text-xs text-slate-300 hover:text-white transition-colors">
            <Download className="h-3 w-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-medium text-slate-400 border-b border-dark-border/40 bg-dark-surface/40 whitespace-nowrap">
              <th className="py-2.5 px-3 font-normal">Date</th>
              <th className="py-2.5 px-3 font-normal">Account</th>
              <th className="py-2.5 px-3 font-normal">Environment</th>
              <th className="py-2.5 px-3 font-normal">Region</th>
              <th className="py-2.5 px-3 font-normal">Service</th>
              <th className="py-2.5 px-3 font-normal">Usage type</th>
              <th className="py-2.5 px-3 font-normal">Operation</th>
              <th className="py-2.5 px-3 font-normal">Resource ID</th>
              <th className="py-2.5 px-3 font-normal">Instance type</th>
              <th className="py-2.5 px-3 font-normal">Purchase option</th>
              <th className="py-2.5 px-3 text-right font-normal">Usage amount</th>
              <th className="py-2.5 px-4 text-right font-normal">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30 text-slate-300 whitespace-nowrap font-sans">
            {filtered.slice(0, 4).map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.date}</td>
                <td className="py-2.5 px-3 font-medium text-white">{item.account.replace('Workbench', productName)}</td>
                <td className="py-2.5 px-3 text-slate-400">{item.environment}</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{item.region}</td>
                <td className="py-2.5 px-3 text-slate-200">{item.service}</td>
                <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{item.usageType}</td>
                <td className="py-2.5 px-3 text-slate-400">{item.operation}</td>
                <td className="py-2.5 px-3 text-blue-400 font-mono text-[11px]">{item.resourceId}</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{item.instanceType}</td>
                <td className="py-2.5 px-3">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-dark-surface border border-dark-border text-slate-300 font-medium">
                    {item.purchaseOption}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">{item.usageAmount}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-white tabular-nums">{format(item.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
