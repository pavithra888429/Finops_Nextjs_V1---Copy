import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: 1 | 2;
}

const STEPS = [
  { id: 1, label: "Configure OpenRouter Gateway" },
  { id: 2, label: "Ingest & Verify Data" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Setup progress" className="mb-8 w-full">
      <ol className="flex items-center justify-between max-w-xl mx-auto w-full">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <li key={step.id} className="flex-1 flex items-center last:flex-none">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200",
                    isCompleted && "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/20",
                    isActive && "border-blue-500 bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/20 ring-2 ring-blue-500/30",
                    !isCompleted && !isActive && "border-dark-border bg-dark-card text-dark-muted"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? <Check size={16} strokeWidth={2.5} /> : step.id}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium whitespace-nowrap",
                    isActive ? "text-white font-semibold" : isCompleted ? "text-slate-300" : "text-dark-muted"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 mx-4 h-[1px] -mt-5 transition-colors",
                    isCompleted ? "bg-emerald-500/50" : "bg-dark-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
