import React from "react";
import { Link2, Check, AlertTriangle, Clock } from "lucide-react";

interface MetricsOverviewProps {
  total?: number;
  connected?: number;
  actionRequired?: number;
  lastSynced?: string;
}

export function MetricsOverview({
  total = 3,
  connected = 2,
  actionRequired = 1,
  lastSynced = "Today, 10:42 AM",
}: MetricsOverviewProps) {
  const metrics = [
    {
      id: "total",
      label: "Total connectors",
      value: total.toString(),
      icon: Link2,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-600/15 border border-blue-500/20",
    },
    {
      id: "connected",
      label: "Connected",
      value: connected.toString(),
      icon: Check,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15 border border-emerald-500/20",
    },
    {
      id: "actionRequired",
      label: "Action required",
      value: actionRequired.toString(),
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15 border border-amber-500/20",
    },
    {
      id: "lastSynced",
      label: "Last synchronized",
      value: lastSynced,
      icon: Clock,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/15 border border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="flex items-center gap-3.5 rounded-xl border border-dark-border bg-dark-card/90 p-4 transition-all duration-200 hover:border-dark-borderHover hover:shadow-lg hover:shadow-black/20"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide">{item.label}</p>
              <p className="mt-0.5 text-xl font-bold tracking-tight text-white">
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
