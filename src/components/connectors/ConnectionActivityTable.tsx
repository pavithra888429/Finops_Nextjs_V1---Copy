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

export function ConnectionActivityTable({ activities = [] }: { activities?: ActivityItem[] }) {
  const renderProviderIcon = (type: string) => {
    if (type === "gemini") {
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-50 border border-purple-200 text-[10px] font-bold text-purple-600">
          ✦
        </span>
      );
    }
    if (type === "openrouter") {
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 border border-blue-200 text-[11px] font-mono text-blue-600">
          &lt;
        </span>
      );
    }
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-700">
        aws
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-base font-bold text-slate-900">
          Connection Activity
        </h3>
        <button className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-purple-600 transition-colors">
          <span>View all activity</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <th className="pb-3 pr-4 font-semibold">Provider</th>
              <th className="pb-3 px-4 font-semibold">Event</th>
              <th className="pb-3 px-4 font-semibold">Status</th>
              <th className="pb-3 px-4 font-semibold">Date and time</th>
              <th className="pb-3 pl-4 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No connection activity recorded yet.
                </td>
              </tr>
            ) : (
              activities.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                
                {/* Provider */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    {renderProviderIcon(item.provider)}
                    <span>{item.providerName}</span>
                  </div>
                </td>

                {/* Event */}
                <td className="py-3.5 px-4 text-slate-600">
                  {item.event}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {item.status === "success" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Warning
                    </span>
                  )}
                </td>

                {/* Date and time */}
                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                  {item.dateTime}
                </td>

                {/* Details */}
                <td className="py-3.5 pl-4 text-right font-medium text-slate-700 whitespace-nowrap">
                  {item.details}
                </td>

              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
