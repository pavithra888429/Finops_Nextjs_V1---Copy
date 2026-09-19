import React from "react";
import { Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-dark-border/60 py-6 text-xs text-dark-muted">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-slate-500" />
          <span>
            Provider credentials are encrypted and read-only access is recommended wherever supported.
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          FinOps Analytics v1.0.0
        </div>
      </div>
    </footer>
  );
}
