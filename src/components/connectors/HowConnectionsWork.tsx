import React from "react";

const STEPS = [
  {
    step: 1,
    title: "Connect provider",
    description: "Securely connect your provider account.",
  },
  {
    step: 2,
    title: "Import billing and usage data",
    description: "We collect your cost and usage data.",
  },
  {
    step: 3,
    title: "Map data to products",
    description: "Organize and classify data across your products.",
  },
  {
    step: 4,
    title: "View FinOps analytics",
    description: "Explore your cost and usage insights.",
  },
];

export function HowConnectionsWork() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      
      {/* Header */}
      <div className="pb-4">
        <h3 className="text-base font-bold text-slate-900">
          How connections work
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Follow these steps to start analyzing your costs.
        </p>
      </div>

      {/* Vertical Stepper */}
      <div className="mt-2 space-y-5">
        {STEPS.map((item, idx) => (
          <div key={item.step} className="relative flex items-start gap-3.5 group">
            
            {/* Connecting line between steps */}
            {idx !== STEPS.length - 1 && (
              <span className="absolute left-3.5 top-8 -bottom-5 w-[1px] bg-slate-200" />
            )}

            {/* Sharp Number Badge */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 shadow-sm font-sans">
              {item.step}
            </div>

            {/* Step Content */}
            <div className="pt-0.5">
              <h4 className="text-xs font-semibold text-slate-900">
                {item.title}
              </h4>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
