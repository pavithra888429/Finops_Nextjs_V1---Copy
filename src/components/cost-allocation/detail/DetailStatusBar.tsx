import React from 'react';

interface DetailStatusBarProps {
  lastSync?: string;
  dataStatus?: string;
  source?: string;
  currency?: string;
}

export function DetailStatusBar({
  lastSync = 'Today, 09:58 AM',
  dataStatus = 'Complete',
  source = 'AWS Cost and Usage Report',
  currency = 'USD',
}: DetailStatusBarProps) {
  return (
    <div className="w-full py-3 px-5 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <span>Last synchronized: </span>
          <strong className="text-slate-800 font-semibold font-sans">{lastSync}</strong>
        </div>

        <div className="flex items-center gap-2">
          <span>Data status: </span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 font-sans">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {dataStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <span>Source: </span>
          <strong className="text-slate-700 font-medium">{source}</strong>
        </div>

        <div>
          <span>Currency: </span>
          <strong className="text-slate-800 font-semibold font-sans">{currency}</strong>
        </div>
      </div>
    </div>
  );
}
