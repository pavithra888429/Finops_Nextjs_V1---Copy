import React from 'react';
import { ArrowUp } from 'lucide-react';

interface CostDriverItem {
  resource: string;
  service: string;
  account: string;
  region: string;
  usageType: string;
  cost: number;
  change: number;
}

const DRIVERS_DATA: CostDriverItem[] = [
  {
    resource: 'Workbench-eks-prod',
    service: 'Amazon EKS',
    account: 'Workbench Production',
    region: 'us-east-1',
    usageType: 'EKS compute',
    cost: 1860.40,
    change: 22.4,
  },
  {
    resource: 'Workbench-api-01',
    service: 'Amazon EC2',
    account: 'Workbench Production',
    region: 'us-east-1',
    usageType: 'BoxUsage:m5.large',
    cost: 920.20,
    change: 8.1,
  },
  {
    resource: 'Workbench-db-prod',
    service: 'Amazon RDS',
    account: 'Workbench Production',
    region: 'eu-west-1',
    usageType: 'Database instance',
    cost: 740.20,
    change: 12.6,
  },
  {
    resource: 'Workbench-assets',
    service: 'Amazon S3',
    account: 'Workbench Production',
    region: 'us-east-1',
    usageType: 'Storage',
    cost: 220.00,
    change: 4.2,
  },
];

export function TopCostDriversTable({ productName = 'Workbench' }: { productName?: string }) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top AWS Cost Drivers</h3>
        <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/95">
              <th className="py-3 px-4">Resource</th>
              <th className="py-3 px-3">Service</th>
              <th className="py-3 px-3">Account</th>
              <th className="py-3 px-3">Region</th>
              <th className="py-3 px-3">Usage type</th>
              <th className="py-3 px-3 text-right">Cost</th>
              <th className="py-3 px-4 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {DRIVERS_DATA.map((item) => (
              <tr key={item.resource} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-800 truncate max-w-[150px]">
                  {item.resource.replace('Workbench', productName)}
                </td>
                <td className="py-2.5 px-3 text-slate-700 truncate">
                  {item.service}
                </td>
                <td className="py-2.5 px-3 text-slate-500 truncate">
                  {item.account.replace('Workbench', productName)}
                </td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                  {item.region}
                </td>
                <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate">
                  {item.usageType}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                  {format(item.cost)}
                </td>
                <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">
                  <span className="inline-flex items-center gap-0.5 justify-end">
                    <ArrowUp className="h-2.5 w-2.5 stroke-[2.5]" />
                    <span>+{item.change}%</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
