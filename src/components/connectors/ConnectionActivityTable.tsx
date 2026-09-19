import React from "react";
import { ArrowUpRight } from "lucide-react";

interface ActivityItem {
  id: string;
  provider: "gemini" | "openrouter" | "aws";
  providerName: string;
  event: string;
  status: "success" | "warning";
  dateTime: string;
  details: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    provider: "gemini",
    providerName: "Gemini",
    event: "Usage data synchronized",
    status: "success",
    dateTime: "Today, 10:42 AM",
    details: "4.2M records imported",
  },
  {
    id: "2",
    provider: "openrouter",
    providerName: "OpenRouter",
    event: "Usage data synchronized",
    status: "success",
    dateTime: "Today, 10:37 AM",
    details: "2.8M records imported",
  },
  {
    id: "3",
    provider: "aws",
    providerName: "AWS",
    event: "Billing export setup incomplete",
    status: "warning",
    dateTime: "Today, 09:15 AM",
    details: "Action required",
  },
];

export function ConnectionActivityTable({ activities = DEFAULT_ACTIVITIES }: { activities?: ActivityItem[] }) {
  const renderProviderIcon = (type: string) => {
    if (type === "gemini") {
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-[10px] font-bold text-pink-400">
          ✦
        </span>
      );
    }
    if (type === "openrouter") {
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-[11px] font-mono text-white">
          &lt;
        </span>
      );
    }
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-[9px] font-bold text-amber-400">
        aws
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/95 p-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-base font-bold text-dark-heading">
          Connection Activity
        </h3>
        <button className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
          <span>View all activity</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-dark-border/80 text-dark-muted font-medium">
              <th className="pb-3 pr-4 font-normal">Provider</th>
              <th className="pb-3 px-4 font-normal">Event</th>
              <th className="pb-3 px-4 font-normal">Status</th>
              <th className="pb-3 px-4 font-normal">Date and time</th>
              <th className="pb-3 pl-4 font-normal text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40 text-dark-text">
            {activities.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                
                {/* Provider */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2 font-medium text-dark-heading">
                    {renderProviderIcon(item.provider)}
                    <span>{item.providerName}</span>
                  </div>
                </td>

                {/* Event */}
                <td className="py-3.5 px-4 text-slate-300">
                  {item.event}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {item.status === "success" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Warning
                    </span>
                  )}
                </td>

                {/* Date and time */}
                <td className="py-3.5 px-4 text-dark-muted whitespace-nowrap">
                  {item.dateTime}
                </td>

                {/* Details */}
                <td className="py-3.5 pl-4 text-right font-medium text-slate-300 whitespace-nowrap">
                  {item.details}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
