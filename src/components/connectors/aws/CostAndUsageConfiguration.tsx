import React from "react";

interface CostAndUsageConfigurationProps {
  value: "yes" | "no";
  onChange: (val: "yes" | "no") => void;
}

export function CostAndUsageConfiguration({
  value,
  onChange,
}: CostAndUsageConfigurationProps) {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-semibold text-white">
          Define Cost and Usage Report (CUR 2.0)
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Would you like to automatically configure the AWS Cost and Usage Report export for this account?
        </p>
      </div>

      <div className="flex gap-4 pt-1">
        <label
          className={`flex-1 flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
            value === "yes"
              ? "border-blue-500/60 bg-blue-500/10 text-white"
              : "border-dark-border bg-dark-card text-slate-400 hover:border-dark-borderHover"
          }`}
        >
          <input
            type="radio"
            name="createCur"
            value="yes"
            checked={value === "yes"}
            onChange={() => onChange("yes")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-[#090d16] border-dark-border"
          />
          <div>
            <p className="text-xs font-semibold">Yes</p>
            <p className="text-[11px] text-slate-400">Configure new CUR 2.0 billing export</p>
          </div>
        </label>

        <label
          className={`flex-1 flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
            value === "no"
              ? "border-blue-500/60 bg-blue-500/10 text-white"
              : "border-dark-border bg-dark-card text-slate-400 hover:border-dark-borderHover"
          }`}
        >
          <input
            type="radio"
            name="createCur"
            value="no"
            checked={value === "no"}
            onChange={() => onChange("no")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-[#090d16] border-dark-border"
          />
          <div>
            <p className="text-xs font-semibold">No</p>
            <p className="text-[11px] text-slate-400">Use existing CUR or skip for now</p>
          </div>
        </label>
      </div>
    </div>
  );
}
