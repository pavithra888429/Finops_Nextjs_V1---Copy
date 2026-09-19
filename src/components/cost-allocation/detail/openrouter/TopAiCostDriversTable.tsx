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
    resource: 'Dragon Suite-eks-prod',
    service: 'Gemini 2.0 Flash',
    account: 'Dragon Suite Production',
    region: 'us-east-1',
    usageType: 'EKS compute',
    cost: 1860.40,
    change: 22.4,
  },
  {
    resource: 'Dragon Suite-api-01',
    service: 'Gemini 1.5 Flash',
    account: 'Dragon Suite Production',
    region: 'us-east-1',
    usageType: 'BoxUsage:m5.large',
    cost: 920.20,
    change: 8.1,
  },
  {
    resource: 'Dragon Suite-db-prod',
    service: 'Gemini 3 Flash Preview',
    account: 'Dragon Suite Production',
    region: 'eu-west-1',
    usageType: 'Database instance',
    cost: 740.20,
    change: 12.6,
  },
  {
    resource: 'Dragon Suite-assets',
    service: 'Gemini Embedding 001',
    account: 'Dragon Suite Production',
    region: 'us-east-1',
    usageType: 'Storage',
    cost: 220.00,
    change: 4.2,
  },
];

export function TopAiCostDriversTable({ productName = 'Dragon Suite' }: { productName?: string }) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-dark-border/60 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight">Top OpenRouter Cost Drivers</h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-medium text-slate-400 border-b border-dark-border/40 bg-dark-surface/40">
              <th className="py-2.5 px-4 font-normal">Resource</th>
              <th className="py-2.5 px-3 font-normal">Service</th>
              <th className="py-2.5 px-3 font-normal">Account</th>
              <th className="py-2.5 px-3 font-normal">Region</th>
              <th className="py-2.5 px-3 font-normal">Usage type</th>
              <th className="py-2.5 px-3 text-right font-normal">Cost</th>
              <th className="py-2.5 px-4 text-right font-normal">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30 text-slate-300">
            {DRIVERS_DATA.map((item) => (
              <tr key={item.resource} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-4 font-medium text-white truncate max-w-[150px]">
                  {item.resource.replace('Dragon Suite', productName)}
                </td>
                <td className="py-2.5 px-3 text-slate-300 truncate">
                  {item.service}
                </td>
                <td className="py-2.5 px-3 text-slate-400 truncate">
                  {item.account.replace('Dragon Suite', productName)}
                </td>
                <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                  {item.region}
                </td>
                <td className="py-2.5 px-3 text-slate-300 text-[11px] truncate">
                  {item.usageType}
                </td>
                <td className="py-2.5 px-3 text-right font-medium text-white tabular-nums">
                  {format(item.cost)}
                </td>
                <td className="py-2.5 px-4 text-right text-emerald-400 font-medium">
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
