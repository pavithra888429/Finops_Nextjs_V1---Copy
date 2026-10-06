import React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 text-slate-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
