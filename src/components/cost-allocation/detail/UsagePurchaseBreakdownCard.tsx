import React, { useState } from 'react';

interface BreakdownItem {
  name: string;
  amount: string;
  cost: number;
  unitCost: string;
}

const BREAKDOWN_DATA: Record<'usage' | 'purchase' | 'operation' | 'az', { headerLabel: string; items: BreakdownItem[] }> = {
  usage: {
    headerLabel: 'Usage type',
    items: [
      { name: 'BoxUsage:m5.large', amount: '18,240 hours', cost: 1420.20, unitCost: '$0.0778/hour' },
      { name: 'DataTransfer-Out-Bytes', amount: '2.8 TB', cost: 620.00, unitCost: '$221.42/TB' },
      { name: 'EBS:VolumeUsage', amount: '12,400 GB', cost: 340.20, unitCost: '$0.0274/GB' },
      { name: 'NatGateway-Bytes', amount: '1.2 TB', cost: 280.00, unitCost: '$233.33/TB' },
    ],
  },
  purchase: {
    headerLabel: 'Purchase option',
    items: [
      { name: 'On-Demand', amount: '24,180 hours', cost: 1820.40, unitCost: '$0.0753/hour' },
      { name: 'Savings Plans (Compute)', amount: '14,600 hours', cost: 640.20, unitCost: '$0.0438/hour' },
      { name: 'Reserved Instances (Standard)', amount: '8,200 hours', cost: 310.00, unitCost: '$0.0378/hour' },
      { name: 'Spot Instances', amount: '5,400 hours', cost: 125.40, unitCost: '$0.0232/hour' },
    ],
  },
  operation: {
    headerLabel: 'Operation',
    items: [
      { name: 'RunInstances (Compute)', amount: '32,400 hours', cost: 1940.60, unitCost: '$0.0599/hour' },
      { name: 'GetObject (S3 Storage)', amount: '8.4M requests', cost: 340.20, unitCost: '$0.0405/1K req' },
      { name: 'CreateVolume (EBS Storage)', amount: '12,400 GB', cost: 310.00, unitCost: '$0.0250/GB' },
      { name: 'NatGateway (Data Processing)', amount: '1.2 TB', cost: 280.00, unitCost: '$233.33/TB' },
    ],
  },
  az: {
    headerLabel: 'Availability zone',
    items: [
      { name: 'us-east-1a', amount: '18,420 hours', cost: 1240.50, unitCost: '$0.0673/hour' },
      { name: 'us-east-1b', amount: '14,180 hours', cost: 980.20, unitCost: '$0.0691/hour' },
      { name: 'us-east-1c', amount: '8,640 hours', cost: 580.40, unitCost: '$0.0672/hour' },
      { name: 'us-east-1 (Regional/Egress)', amount: '4.0 TB', cost: 320.00, unitCost: '$80.00/TB' },
    ],
  },
};

export function UsagePurchaseBreakdownCard() {
  const [activeTab, setActiveTab] = useState<'usage' | 'purchase' | 'operation' | 'az'>('usage');

  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const currentConfig = BREAKDOWN_DATA[activeTab];

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-dark-border/60">
        <h3 className="text-sm font-semibold text-white tracking-tight">AWS Usage and Purchase Breakdown</h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View all
        </button>
      </div>

      {/* Pill Tabs */}
      <div className="flex items-center gap-1.5 pt-2 pb-1 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'usage' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30' : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          Usage type
        </button>
        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'purchase' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30' : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          Purchase option
        </button>
        <button
          onClick={() => setActiveTab('operation')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'operation' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30' : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          Operation
        </button>
        <button
          onClick={() => setActiveTab('az')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            activeTab === 'az' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30' : 'bg-dark-surface text-slate-400 hover:text-white'
          }`}
        >
          Availability zone
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-auto pt-1">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="text-[10.5px] font-medium text-slate-400 border-b border-dark-border/40">
              <th className="py-2 pr-2 font-normal">{currentConfig.headerLabel}</th>
              <th className="py-2 px-2 font-normal">Usage amount</th>
              <th className="py-2 px-2 text-right font-normal">Cost</th>
              <th className="py-2 pl-2 text-right font-normal">Unit cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30 text-slate-300">
            {currentConfig.items.map((item) => (
              <tr key={item.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 pr-2 font-medium text-white truncate max-w-[190px]" title={item.name}>
                  {item.name}
                </td>
                <td className="py-2.5 px-2 text-slate-400 text-xs tabular-nums whitespace-nowrap">
                  {item.amount}
                </td>
                <td className="py-2.5 px-2 text-right text-white font-medium tabular-nums whitespace-nowrap">
                  {format(item.cost)}
                </td>
                <td className="py-2.5 pl-2 text-right text-slate-400 tabular-nums whitespace-nowrap">
                  {item.unitCost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
