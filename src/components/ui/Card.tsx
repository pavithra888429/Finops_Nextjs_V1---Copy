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
        "bg-dark-card border border-dark-border rounded-xl p-5 transition-all duration-200 hover:border-dark-borderHover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
