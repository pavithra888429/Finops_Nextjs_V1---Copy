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
    <div className="rounded-xl border border-dark-border bg-dark-card/95 p-5">
      
      {/* Header */}
      <div className="pb-4">
        <h3 className="text-base font-bold text-dark-heading">
          How connections work
        </h3>
        <p className="mt-0.5 text-xs text-dark-muted">
          Follow these steps to start analyzing your costs.
        </p>
      </div>

      {/* Vertical Stepper */}
      <div className="mt-2 space-y-5">
        {STEPS.map((item, idx) => (
          <div key={item.step} className="relative flex items-start gap-3.5 group">
            
            {/* Connecting line between steps */}
            {idx !== STEPS.length - 1 && (
              <span className="absolute left-3.5 top-8 -bottom-5 w-[1px] bg-dark-border" />
            )}

            {/* Circular Number Badge */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-500/20">
              {item.step}
            </div>

            {/* Step Content */}
            <div className="pt-0.5">
              <h4 className="text-xs font-semibold text-dark-heading">
                {item.title}
              </h4>
              <p className="mt-0.5 text-xs text-dark-muted leading-relaxed">
                {item.description}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
