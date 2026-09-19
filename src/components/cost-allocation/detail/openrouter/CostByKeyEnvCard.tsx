import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AccountEnvItem {
  account: string;
  env: string;
  cost: number;
  share: number;
  change: number;
}

const ACCOUNT_ENV_DATA: AccountEnvItem[] = [
  { account: 'Dragon Suite Production', env: 'Production', cost: 5860.40, share: 72.8, change: 15.2 },
  { account: 'Dragon Suite Staging', env: 'Staging', cost: 1420.20, share: 17.6, change: 8.1 },
  { account: 'Dragon Suite Dev', env: 'Development', cost: 768.80, share: 9.6, change: -2.4 },
];

export function CostByKeyEnvCard({
  productName = 'Dragon Suite',
  selectedKey = 'all',
}: {
  productName?: string;
  selectedKey?: string;
}) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="pb-3 border-b border-dark-border/60">
        <h3 className="text-sm font-semibold text-white tracking-tight">Cost by Account and Environment</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-medium text-slate-400 border-b border-dark-border/40">
              <th className="py-2 pr-2 font-normal">Account</th>
              <th className="py-2 px-2 font-normal">Environment</th>
              <th className="py-2 px-2 text-right font-normal">Cost</th>
              <th className="py-2 px-2 text-right font-normal">Share</th>
              <th className="py-2 pl-2 text-right font-normal">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30 text-slate-300">
            {ACCOUNT_ENV_DATA.map((item) => (
              <tr key={item.account} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 pr-2 font-medium text-white truncate max-w-[140px]">
                  {item.account}
                </td>
                <td className="py-2.5 px-2 text-slate-400 text-[11px] truncate">
                  {item.env}
                </td>
                <td className="py-2.5 px-2 text-right text-white font-medium tabular-nums">
                  {format(item.cost)}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-400 tabular-nums">
                  {item.share}%
                </td>
                <td className="py-2.5 pl-2 text-right font-medium">
                  {item.change >= 0 ? (
                    <span className="text-emerald-400 inline-flex items-center gap-0.5 justify-end">
                      <ArrowUp className="h-2.5 w-2.5 stroke-[2.5]" />
                      <span>+{item.change}%</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 inline-flex items-center gap-0.5 justify-end">
                      <ArrowDown className="h-2.5 w-2.5 stroke-[2.5]" />
                      <span>{item.change}%</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
