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
  { account: 'Workbench Production', env: 'Production', cost: 5860.40, share: 72.8, change: 15.2 },
  { account: 'Workbench Staging', env: 'Staging', cost: 1420.20, share: 17.6, change: 8.1 },
  { account: 'Workbench Dev', env: 'Development', cost: 768.80, share: 9.6, change: -2.4 },
];

export function CostByAccountEnvCard({ productName = 'Workbench' }: { productName?: string }) {
  const format = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Cost by Account and Environment</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10.5px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="py-2.5 pr-2">Account</th>
              <th className="py-2.5 px-2">Environment</th>
              <th className="py-2.5 px-2 text-right">Cost</th>
              <th className="py-2.5 px-2 text-right">Share</th>
              <th className="py-2.5 pl-2 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {ACCOUNT_ENV_DATA.map((item) => (
              <tr key={item.account} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 pr-2 font-semibold text-slate-800 truncate max-w-[140px]">
                  {item.account.replace('Workbench', productName)}
                </td>
                <td className="py-3 px-2 text-slate-500 text-[11px] truncate">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                    {item.env}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-slate-900 font-bold tabular-nums">
                  {format(item.cost)}
                </td>
                <td className="py-3 px-2 text-right text-slate-500 tabular-nums">
                  {item.share}%
                </td>
                <td className="py-3 pl-2 text-right font-medium">
                  {item.change >= 0 ? (
                    <span className="text-emerald-600 inline-flex items-center gap-0.5 justify-end font-semibold">
                      <ArrowUp className="h-2.5 w-2.5 stroke-[2.5]" />
                      <span>+{item.change}%</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 inline-flex items-center gap-0.5 justify-end font-semibold">
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
