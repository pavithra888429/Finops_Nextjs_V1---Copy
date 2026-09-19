import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ServiceCostItem {
  name: string;
  cost: number;
  share: number;
  change: number;
  barColor: string;
}

const SERVICE_DATA: ServiceCostItem[] = [
  { name: 'Gemini 2.0 Flash', cost: 3420.80, share: 42.5, change: 19.2, barColor: 'bg-[#ff781f]' },
  { name: 'Gemini 1.5 Flash', cost: 2180.40, share: 27.1, change: 8.4, barColor: 'bg-[#0070f3]' },
  { name: 'Gemini 3 Flash Preview', cost: 1240.20, share: 15.4, change: 12.1, barColor: 'bg-[#8b5cf6]' },
  { name: 'Gemini Embedding 001', cost: 620.00, share: 7.7, change: 3.2, barColor: 'bg-[#00e599]' },
  { name: 'Other Models', cost: 588.00, share: 7.3, change: -2.1, barColor: 'bg-slate-600' },
];

export function CostByModelCard() {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
        <h3 className="text-sm font-semibold text-white tracking-tight">Cost by OpenRouter Service</h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View all
        </button>
      </div>

      {/* Column sub-headers */}
      <div className="grid grid-cols-12 gap-2 text-[10.5px] font-medium text-slate-400 pt-2 pb-1 border-b border-dark-border/40">
        <span className="col-span-5">Service</span>
        <span className="col-span-3 text-right">Cost</span>
        <span className="col-span-2 text-right">Share</span>
        <span className="col-span-2 text-right">Change</span>
      </div>

      {/* Service Rows */}
      <div className="space-y-3 pt-2">
        {SERVICE_DATA.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="grid grid-cols-12 gap-2 items-center text-xs">
              {/* Service Name with bar color dot */}
              <div className="col-span-5 flex items-center gap-1.5 truncate">
                <span className={`h-2 w-2 rounded-sm shrink-0 ${item.barColor}`} />
                <span className="font-medium text-slate-200 truncate">{item.name}</span>
              </div>

              {/* Cost */}
              <span className="col-span-3 text-right text-white font-medium tabular-nums">
                {format(item.cost)}
              </span>

              {/* Share */}
              <span className="col-span-2 text-right text-slate-400 tabular-nums">
                {item.share}%
              </span>

              {/* Change Indicator */}
              <div className="col-span-2 flex items-center justify-end gap-0.5 text-[11px] font-medium tabular-nums">
                {item.change >= 0 ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-emerald-400 stroke-[2.5]" />
                    <span className="text-emerald-400">+{item.change}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-3 w-3 text-rose-400 stroke-[2.5]" />
                    <span className="text-rose-400">{item.change}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="w-full h-1.5 rounded-full bg-dark-border/60 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.barColor} transition-all duration-300`}
                style={{ width: `${item.share}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
