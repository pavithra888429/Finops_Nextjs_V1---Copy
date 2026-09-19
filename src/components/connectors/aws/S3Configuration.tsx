import React from "react";
import { ChevronDown } from "lucide-react";

interface S3ConfigurationProps {
  createS3: "yes" | "no";
  onCreateS3Change: (val: "yes" | "no") => void;
  bucketName: string;
  onBucketNameChange: (val: string) => void;
  bucketRegion: string;
  onBucketRegionChange: (val: string) => void;
  exportPrefix: string;
  onExportPrefixChange: (val: string) => void;
  exportName: string;
  onExportNameChange: (val: string) => void;
  existingBucketName: string;
  onExistingBucketNameChange: (val: string) => void;
  existingBucketRegion: string;
  onExistingBucketRegionChange: (val: string) => void;
}

const AWS_REGIONS = [
  { value: "", label: "Select Bucket Region..." },
  { value: "us-east-1", label: "US East (N. Virginia) us-east-1" },
  { value: "us-west-2", label: "US West (Oregon) us-west-2" },
  { value: "eu-west-1", label: "Europe (Ireland) eu-west-1" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai) ap-south-1" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore) ap-southeast-1" },
  { value: "us-east-2", label: "US East (Ohio) us-east-2" },
];

export function S3Configuration({
  createS3,
  onCreateS3Change,
  bucketName,
  onBucketNameChange,
  bucketRegion,
  onBucketRegionChange,
  exportPrefix,
  onExportPrefixChange,
  exportName,
  onExportNameChange,
  existingBucketName,
  onExistingBucketNameChange,
  existingBucketRegion,
  onExistingBucketRegionChange,
}: S3ConfigurationProps) {
  return (
    <div className="space-y-5 w-full animate-in fade-in duration-300 pt-6 border-t border-dark-border/80">
      <div>
        <h3 className="text-sm font-semibold text-white">
          S3 Bucket Configuration
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Where will the Cost and Usage Report (CUR) Parquet files be stored?
        </p>
      </div>

      <div className="flex gap-4">
        <label
          className={`flex-1 flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
            createS3 === "yes"
              ? "border-blue-500/60 bg-blue-500/10 text-white"
              : "border-dark-border bg-dark-card text-slate-400 hover:border-dark-borderHover"
          }`}
        >
          <input
            type="radio"
            name="createS3"
            value="yes"
            checked={createS3 === "yes"}
            onChange={() => onCreateS3Change("yes")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-[#090d16] border-dark-border"
          />
          <div>
            <p className="text-xs font-semibold">Create New Bucket</p>
            <p className="text-[11px] text-slate-400">Deploy dedicated S3 bucket via template</p>
          </div>
        </label>

        <label
          className={`flex-1 flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
            createS3 === "no"
              ? "border-blue-500/60 bg-blue-500/10 text-white"
              : "border-dark-border bg-dark-card text-slate-400 hover:border-dark-borderHover"
          }`}
        >
          <input
            type="radio"
            name="createS3"
            value="no"
            checked={createS3 === "no"}
            onChange={() => onCreateS3Change("no")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-[#090d16] border-dark-border"
          />
          <div>
            <p className="text-xs font-semibold">Use Existing Bucket</p>
            <p className="text-[11px] text-slate-400">Point to already configured bucket</p>
          </div>
        </label>
      </div>

      {createS3 === "yes" ? (
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                New S3 Bucket Name <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-sans">
                Lowercase letters, numbers, and hyphens only
              </span>
            </div>
            <input
              type="text"
              required
              value={bucketName}
              onChange={(e) => {
                const sanitized = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9.-]/g, '-');
                onBucketNameChange(sanitized);
              }}
              placeholder="e.g. finops-cur2-864981730114"
              className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
            />
            {bucketName.length > 0 && !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucketName) && (
              <p className="mt-1 text-[11px] text-rose-400 font-sans">
                Must be 3-63 characters, start/end with a letter or number, and contain only lowercase letters, numbers, and hyphens.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bucket Region <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={bucketRegion}
                  onChange={(e) => onBucketRegionChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none pr-8"
                >
                  {AWS_REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Export Prefix
              </label>
              <input
                type="text"
                value={exportPrefix}
                onChange={(e) => onExportPrefixChange(e.target.value)}
                placeholder="cur2/"
                className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Export Name
            </label>
            <input
              type="text"
              value={exportName}
              onChange={(e) => onExportNameChange(e.target.value)}
              placeholder="e.g. daily-cur-export"
              className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Existing S3 Bucket Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={existingBucketName}
              onChange={(e) => onExistingBucketNameChange(e.target.value)}
              placeholder="e.g. my-existing-billing-bucket"
              className="w-full rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Existing Bucket Region <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={existingBucketRegion}
                onChange={(e) => onExistingBucketRegionChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-dark-border bg-dark-card px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none pr-8"
              >
                {AWS_REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
