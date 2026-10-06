import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "connected" | "warning" | "operational" | "neutral" | "default";
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  const variantStyles = {
    connected: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    operational: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    default: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-normal",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
