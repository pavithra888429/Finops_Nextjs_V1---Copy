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
    <div className="w-full py-3 px-4 rounded-xl border border-dark-border/80 bg-dark-card/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
      <div className="flex items-center gap-6">
        <div>
          <span>Last synchronized: </span>
          <strong className="text-slate-200 font-medium">{lastSync}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Data status: </span>
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {dataStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <span>Source: </span>
          <strong className="text-slate-200 font-medium">{source}</strong>
        </div>

        <div>
          <span>Currency: </span>
          <strong className="text-slate-200 font-medium">{currency}</strong>
        </div>
      </div>
    </div>
  );
}
