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
                    isCompleted && "border-purple-600 bg-purple-600 text-white font-bold shadow-xs",
                    isActive && "border-purple-600 bg-white text-purple-600 ring-4 ring-purple-100 font-bold shadow-xs",
                    !isCompleted && !isActive && "border-slate-200 bg-slate-50 text-slate-400 font-medium"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? <Check size={16} strokeWidth={2.5} /> : step.id}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs whitespace-nowrap",
                    isActive ? "text-purple-700 font-bold" : isCompleted ? "text-slate-700 font-semibold" : "text-slate-400 font-normal"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 mx-4 h-0.5 -mt-5 transition-colors rounded-full",
                    isCompleted ? "bg-purple-600" : "bg-slate-200"
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
