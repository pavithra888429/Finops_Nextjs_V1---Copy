import React, { useState } from 'react';

interface TrendDataPoint {
  date: string;
  label: string;
  costCurrent: number;
  costPrevious: number;
  usageCurrent: number;
  usagePrevious: number;
  resourceCurrent: number;
  resourcePrevious: number;
  service: string;
  region: string;
}

const TREND_POINTS: TrendDataPoint[] = [
  { date: '2024-08-11', label: 'Aug 11', costCurrent: 240, costPrevious: 210, usageCurrent: 480, usagePrevious: 420, resourceCurrent: 34, resourcePrevious: 30, service: 'Amazon EKS', region: 'us-east-1' },
  { date: '2024-08-14', label: 'Aug 14', costCurrent: 310, costPrevious: 260, usageCurrent: 620, usagePrevious: 510, resourceCurrent: 42, resourcePrevious: 36, service: 'Amazon EKS', region: 'us-east-1' },
  { date: '2024-08-17', label: 'Aug 17', costCurrent: 280, costPrevious: 240, usageCurrent: 560, usagePrevious: 480, resourceCurrent: 39, resourcePrevious: 35, service: 'Amazon EC2', region: 'us-east-1' },
  { date: '2024-08-20', label: 'Aug 20', costCurrent: 390, costPrevious: 320, usageCurrent: 780, usagePrevious: 640, resourceCurrent: 54, resourcePrevious: 45, service: 'Amazon EKS', region: 'us-east-1' },
  { date: '2024-08-23', label: 'Aug 23', costCurrent: 360, costPrevious: 310, usageCurrent: 720, usagePrevious: 610, resourceCurrent: 50, resourcePrevious: 44, service: 'Amazon RDS', region: 'eu-west-1' },
  { date: '2024-08-25', label: 'Aug 25', costCurrent: 492.20, costPrevious: 410.30, usageCurrent: 984, usagePrevious: 815, resourceCurrent: 68, resourcePrevious: 56, service: 'Amazon EKS', region: 'us-east-1' },
  { date: '2024-08-26', label: 'Aug 26', costCurrent: 420, costPrevious: 370, usageCurrent: 840, usagePrevious: 730, resourceCurrent: 59, resourcePrevious: 52, service: 'Amazon EC2', region: 'us-east-1' },
  { date: '2024-08-29', label: 'Aug 29', costCurrent: 460, costPrevious: 390, usageCurrent: 910, usagePrevious: 770, resourceCurrent: 64, resourcePrevious: 55, service: 'Amazon EKS', region: 'us-east-1' },
  { date: '2024-09-01', label: 'Sep 01', costCurrent: 440, costPrevious: 380, usageCurrent: 870, usagePrevious: 750, resourceCurrent: 62, resourcePrevious: 54, service: 'Amazon S3', region: 'us-east-1' },
  { date: '2024-09-04', label: 'Sep 04', costCurrent: 520, costPrevious: 430, usageCurrent: 1030, usagePrevious: 860, resourceCurrent: 73, resourcePrevious: 60, service: 'Amazon EKS', region: 'us-east-1' },
  { date: '2024-09-07', label: 'Sep 07', costCurrent: 490, costPrevious: 410, usageCurrent: 970, usagePrevious: 810, resourceCurrent: 69, resourcePrevious: 58, service: 'Amazon EC2', region: 'us-east-1' },
  { date: '2024-09-10', label: 'Sep 10', costCurrent: 580, costPrevious: 460, usageCurrent: 1140, usagePrevious: 910, resourceCurrent: 81, resourcePrevious: 65, service: 'Amazon EKS', region: 'us-east-1' },
];

export function DetailCostTrendChart({ productName = 'Workbench', providerName = 'AWS' }: { productName?: string; providerName?: string }) {
  const [activeTab, setActiveTab] = useState<'cost' | 'usage' | 'resource'>('cost');
  const [hoverIndex, setHoverIndex] = useState<number>(3); // Aug 20 is index 3 (matching reference screenshot)

  // Configure scale and labels based on active tab
  const metricConfig = {
    cost: {
      maxVal: 800,
      ticks: [800, 600, 400, 200, 0],
      axisLabel: 'Cost (USD)',
      titleSuffix: 'Cost Trend',
      currentKey: 'costCurrent' as const,
      previousKey: 'costPrevious' as const,
      formatValue: (v: number) => `$${v.toFixed(2)}`,
      currentLabel: 'Cost (current)',
      previousLabel: 'Cost (previous)',
    },
    usage: {
      maxVal: 1200,
      ticks: [1200, 900, 600, 300, 0],
      axisLabel: 'Usage (Hrs)',
      titleSuffix: 'Usage Trend',
      currentKey: 'usageCurrent' as const,
      previousKey: 'usagePrevious' as const,
      formatValue: (v: number) => `${v.toLocaleString()} hrs`,
      currentLabel: 'Usage (current)',
      previousLabel: 'Usage (previous)',
    },
    resource: {
      maxVal: 100,
      ticks: [100, 75, 50, 25, 0],
      axisLabel: 'Resource Count',
      titleSuffix: 'Resource Trend',
      currentKey: 'resourceCurrent' as const,
      previousKey: 'resourcePrevious' as const,
      formatValue: (v: number) => `${v} units`,
      currentLabel: 'Resources (current)',
      previousLabel: 'Resources (previous)',
    },
  }[activeTab];

  const { maxVal, ticks, axisLabel, titleSuffix, currentKey, previousKey, formatValue, currentLabel, previousLabel } = metricConfig;

  const width = 560;
  const height = 230;
  const paddingLeft = 46;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (TREND_POINTS.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxVal) * chartHeight;

  // Build path
  const createSmoothPath = (key: typeof currentKey | typeof previousKey) => {
    const pts = TREND_POINTS.map((pt, i) => ({ x: getX(i), y: getY(pt[key]) }));
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cur = pts[i];
      const next = pts[i + 1];
      const cpX = (cur.x + next.x) / 2;
      path += ` C ${cpX},${cur.y} ${cpX},${next.y} ${next.x},${next.y}`;
    }
    return path;
  };

  const hoveredPoint = TREND_POINTS[hoverIndex];

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header with Toggles - NO flex-wrap so buttons NEVER drop to the left down */}
      <div className="flex items-center justify-between gap-3 w-full">
        <h3 className="text-sm font-semibold text-white tracking-tight truncate min-w-0">
          {productName} {providerName} {titleSuffix}
        </h3>

        {/* Top Right Toggles - shrink-0 to stay permanently anchored top right */}
        <div className="flex items-center p-0.5 rounded-lg border border-dark-border bg-dark-surface text-xs shrink-0">
          <button
            onClick={() => setActiveTab('cost')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'cost' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cost
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'usage' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Usage quantity
          </button>
          <button
            onClick={() => setActiveTab('resource')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'resource' ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resource count
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-2 w-full select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const ratio = (mouseX - (paddingLeft / width) * rect.width) / ((chartWidth / width) * rect.width);
            const clamped = Math.max(0, Math.min(TREND_POINTS.length - 1, Math.round(ratio * (TREND_POINTS.length - 1))));
            setHoverIndex(clamped);
          }}
        >
          {/* Vertical axis title */}
          <text
            x={-height / 2 + 10}
            y={12}
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-slate-500 text-[9px] font-medium"
          >
            {axisLabel}
          </text>

          {/* Horizontal Gridlines & Y-Axis */}
          {ticks.map((val) => {
            const y = getY(val);
            const displayVal = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`;

            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#16253c"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 font-sans text-[10px]"
                >
                  {displayVal}
                </text>
              </g>
            );
          })}

          {/* X-axis date labels */}
          {[0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11].map((idx) => {
            if (!TREND_POINTS[idx]) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 text-[9px] font-normal"
              >
                {TREND_POINTS[idx].label}
              </text>
            );
          })}

          {/* Previous Period Dashed Curve */}
          <path
            d={createSmoothPath(previousKey)}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            className="opacity-70 transition-all duration-300"
          />

          {/* Current Period Solid Curve */}
          <path
            d={createSmoothPath(currentKey)}
            fill="none"
            stroke="#0070f3"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Current period dots */}
          {TREND_POINTS.map((pt, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(pt[currentKey])}
              r="2.5"
              fill="#0070f3"
              stroke="#0b1322"
              strokeWidth="1"
              className="transition-all duration-300"
            />
          ))}

          {/* Vertical Tracking Guide Line */}
          {hoveredPoint && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={height - paddingBottom}
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="2,2"
              className="opacity-80"
            />
          )}

          {/* Active Hover Points */}
          {hoveredPoint && (
            <>
              <circle cx={getX(hoverIndex)} cy={getY(hoveredPoint[currentKey])} r="4" fill="#0070f3" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={getX(hoverIndex)} cy={getY(hoveredPoint[previousKey])} r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            </>
          )}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none rounded-lg border border-[#1f314c] bg-[#0c1526]/95 px-3 py-2 shadow-2xl backdrop-blur-md text-xs min-w-[170px]"
            style={{
              left: `${Math.min(74, Math.max(22, (getX(hoverIndex) / width) * 100))}%`,
              top: '8px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-[11px] font-semibold text-white mb-1.5 pb-1 border-b border-[#1b283e]">
              {hoveredPoint.label}, 2024
            </p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0070f3]" />
                  <span className="text-slate-300 text-xs">{currentLabel}</span>
                </div>
                <span className="font-semibold text-white tabular-nums">{formatValue(hoveredPoint[currentKey])}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                  <span className="text-slate-300 text-xs">{previousLabel}</span>
                </div>
                <span className="font-semibold text-slate-300 tabular-nums">{formatValue(hoveredPoint[previousKey])}</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-0.5 border-t border-[#1b283e]/60">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  <span className="text-slate-400 text-xs">Service</span>
                </div>
                <span className="text-white text-xs font-medium">{hoveredPoint.service}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span className="text-slate-400 text-xs">Region</span>
                </div>
                <span className="text-white text-xs font-medium">{hoveredPoint.region}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="mt-2 pt-2 border-t border-dark-border/40 flex items-center justify-center gap-6 text-xs text-slate-300 font-normal">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-[#0070f3]" />
          <span>Current period</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-[#38bdf8] border-b border-dashed border-[#38bdf8]" />
          <span>Previous period</span>
        </div>
      </div>
    </div>
  );
}
