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
        <h3 className="text-sm font-bold text-slate-900">
          Define Cost and Usage Report (CUR 2.0)
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Would you like to automatically configure the AWS Cost and Usage Report export for this account?
        </p>
      </div>

      <div className="flex gap-4 pt-1">
        <label
          className={`flex-1 flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all shadow-xs ${
            value === "yes"
              ? "border-purple-600 bg-purple-50/50 text-slate-900 ring-2 ring-purple-600/20"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          <input
            type="radio"
            name="createCur"
            value="yes"
            checked={value === "yes"}
            onChange={() => onChange("yes")}
            className="h-4 w-4 accent-purple-600"
          />
          <div>
            <p className="text-xs font-bold text-slate-900">Yes</p>
            <p className="text-[11px] text-slate-500">Configure new CUR 2.0 billing export</p>
          </div>
        </label>

        <label
          className={`flex-1 flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all shadow-xs ${
            value === "no"
              ? "border-purple-600 bg-purple-50/50 text-slate-900 ring-2 ring-purple-600/20"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          <input
            type="radio"
            name="createCur"
            value="no"
            checked={value === "no"}
            onChange={() => onChange("no")}
            className="h-4 w-4 accent-purple-600"
          />
          <div>
            <p className="text-xs font-bold text-slate-900">No</p>
            <p className="text-[11px] text-slate-500">Use existing CUR or skip for now</p>
          </div>
        </label>
      </div>
    </div>
  );
}
