import React, { useState } from 'react';

interface OpenRouterTrendPoint {
  date: string;
  label: string;
  costCurrent: number;
  costPrevious: number;
  usageCurrent: number; // in thousands (k)
  usagePrevious: number;
  resourceCurrent: number;
  resourcePrevious: number;
  service: string;
  region: string;
}

const TREND_POINTS: OpenRouterTrendPoint[] = [
  { date: '2026-08-11', label: 'Aug 11', costCurrent: 240, costPrevious: 210, usageCurrent: 480, usagePrevious: 420, resourceCurrent: 34, resourcePrevious: 30, service: 'Gemini 2.0 Flash', region: 'us-east-1' },
  { date: '2026-08-14', label: 'Aug 14', costCurrent: 310, costPrevious: 260, usageCurrent: 620, usagePrevious: 510, resourceCurrent: 42, resourcePrevious: 36, service: 'Gemini 2.0 Flash', region: 'us-east-1' },
  { date: '2026-08-17', label: 'Aug 17', costCurrent: 280, costPrevious: 240, usageCurrent: 560, usagePrevious: 480, resourceCurrent: 39, resourcePrevious: 35, service: 'Gemini 1.5 Flash', region: 'us-east-1' },
  { date: '2026-08-20', label: 'Aug 20', costCurrent: 390, costPrevious: 320, usageCurrent: 780, usagePrevious: 640, resourceCurrent: 54, resourcePrevious: 45, service: 'Gemini 2.0 Flash', region: 'us-east-1' },
  { date: '2026-08-23', label: 'Aug 23', costCurrent: 360, costPrevious: 310, usageCurrent: 720, usagePrevious: 610, resourceCurrent: 50, resourcePrevious: 44, service: 'Gemini 3 Flash Preview', region: 'us-east-1' },
  { date: '2026-08-25', label: 'Aug 25', costCurrent: 492.20, costPrevious: 410.30, usageCurrent: 984, usagePrevious: 815, resourceCurrent: 68, resourcePrevious: 56, service: 'Gemini 2.0 Flash', region: 'us-east-1' },
  { date: '2026-08-26', label: 'Aug 26', costCurrent: 420, costPrevious: 370, usageCurrent: 840, usagePrevious: 730, resourceCurrent: 59, resourcePrevious: 52, service: 'Gemini 1.5 Flash', region: 'us-east-1' },
  { date: '2026-08-29', label: 'Aug 29', costCurrent: 460, costPrevious: 390, usageCurrent: 910, usagePrevious: 770, resourceCurrent: 64, resourcePrevious: 55, service: 'Gemini 2.0 Flash', region: 'us-east-1' },
  { date: '2026-09-01', label: 'Sep 01', costCurrent: 440, costPrevious: 380, usageCurrent: 870, usagePrevious: 750, resourceCurrent: 62, resourcePrevious: 54, service: 'Gemini Embedding 001', region: 'us-east-1' },
  { date: '2026-09-04', label: 'Sep 04', costCurrent: 520, costPrevious: 430, usageCurrent: 1030, usagePrevious: 860, resourceCurrent: 73, resourcePrevious: 60, service: 'Gemini 2.0 Flash', region: 'us-east-1' },
  { date: '2026-09-07', label: 'Sep 07', costCurrent: 490, costPrevious: 410, usageCurrent: 970, usagePrevious: 810, resourceCurrent: 69, resourcePrevious: 58, service: 'Gemini 1.5 Flash', region: 'us-east-1' },
  { date: '2026-09-10', label: 'Sep 10', costCurrent: 580, costPrevious: 460, usageCurrent: 1140, usagePrevious: 910, resourceCurrent: 81, resourcePrevious: 65, service: 'Gemini 2.0 Flash', region: 'us-east-1' },
];

export function OpenRouterCostTrendChart({
  productName = 'Dragon Suite',
  providerName = 'OpenRouter',
}: {
  productName?: string;
  providerName?: string;
}) {
  const [activeTab, setActiveTab] = useState<'cost' | 'usage' | 'resource'>('cost');
  const [hoverIndex, setHoverIndex] = useState<number>(3); // Aug 20 default

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
      axisLabel: 'Usage (Ktok)',
      titleSuffix: 'Usage Trend',
      currentKey: 'usageCurrent' as const,
      previousKey: 'usagePrevious' as const,
      formatValue: (v: number) => `${v.toLocaleString()}k tok`,
      currentLabel: 'Usage (current)',
      previousLabel: 'Usage (previous)',
    },
    resource: {
      maxVal: 100,
      ticks: [100, 75, 50, 25, 0],
      axisLabel: 'Resource Count',
      titleSuffix: 'Resource Count Trend',
      currentKey: 'resourceCurrent' as const,
      previousKey: 'resourcePrevious' as const,
      formatValue: (v: number) => `${v} active`,
      currentLabel: 'Resources (current)',
      previousLabel: 'Resources (previous)',
    },
  };

  const currentCfg = metricConfig[activeTab];

  // SVG dimensions
  const svgWidth = 520;
  const svgHeight = 220;
  const margin = { top: 25, right: 20, bottom: 35, left: 48 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const getX = (index: number) =>
    margin.left + (index / (TREND_POINTS.length - 1)) * chartWidth;

  const getY = (val: number) => {
    const ratio = Math.max(0, Math.min(1, val / currentCfg.maxVal));
    return margin.top + (1 - ratio) * chartHeight;
  };

  const createSmoothPath = (key: 'currentKey' | 'previousKey') => {
    const valKey = currentCfg[key];
    const pts = TREND_POINTS.map((d, i) => ({
      x: getX(i),
      y: getY(d[valKey]),
    }));
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const hoveredPoint = TREND_POINTS[hoverIndex];
  const tooltipX = getX(hoverIndex);
  const tooltipY = getY(hoveredPoint[currentCfg.currentKey]);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-4 sm:p-5 flex flex-col justify-between shadow-sm h-full relative">
      {/* Header with Title & Metric Toggle Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-dark-border/60">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            {productName} {providerName} Cost Trend
          </h3>
        </div>

        {/* 3 Tab Switcher matching AWS DetailCostTrendChart */}
        <div className="flex items-center rounded-lg bg-dark-surface/80 p-0.5 border border-dark-border/60 text-xs">
          <button
            onClick={() => setActiveTab('cost')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'cost'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cost
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'usage'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Usage quantity
          </button>
          <button
            onClick={() => setActiveTab('resource')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'resource'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resource count
          </button>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full pt-2 overflow-visible">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Y Axis Gridlines */}
          {currentCfg.ticks.map((tickVal) => {
            const y = getY(tickVal);
            return (
              <g key={tickVal}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={svgWidth - margin.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9.5px] font-mono"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Y Axis Label */}
          <text
            x={14}
            y={margin.top + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 14, ${margin.top + chartHeight / 2})`}
            className="fill-slate-400 text-[9px] uppercase tracking-wider font-semibold"
          >
            {currentCfg.axisLabel}
          </text>

          {/* Previous Period Line (Muted Dashed White) */}
          <path
            d={createSmoothPath('previousKey')}
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.75"
            strokeDasharray="4 4"
          />

          {/* Current Period Line (Electric Blue #0070f3) */}
          <path
            d={createSmoothPath('currentKey')}
            fill="none"
            stroke="#0070f3"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Hover Crosshair & Data Points */}
          <line
            x1={tooltipX}
            y1={margin.top}
            x2={tooltipX}
            y2={margin.top + chartHeight}
            stroke="rgba(0, 112, 243, 0.6)"
            strokeDasharray="2 2"
            strokeWidth="1"
          />

          {/* Current Point Dot */}
          <circle
            cx={tooltipX}
            cy={tooltipY}
            r="4.5"
            fill="#0070f3"
            stroke="#0a0d14"
            strokeWidth="2"
            className="transition-all duration-150 shadow-sm"
          />

          {/* X Axis Labels */}
          {TREND_POINTS.map((d, i) => {
            const x = getX(i);
            const isHovered = i === hoverIndex;
            return (
              <text
                key={d.label}
                x={x}
                y={svgHeight - 8}
                textAnchor="middle"
                className={`text-[9.5px] transition-colors cursor-pointer ${
                  isHovered
                    ? 'fill-blue-400 font-semibold'
                    : 'fill-slate-400 font-normal'
                }`}
                onClick={() => setHoverIndex(i)}
              >
                {d.label}
              </text>
            );
          })}

          {/* Invisible Hover Rectangles */}
          {TREND_POINTS.map((_, i) => {
            const x = getX(i) - chartWidth / (TREND_POINTS.length * 2);
            const w = chartWidth / TREND_POINTS.length;
            return (
              <rect
                key={i}
                x={x}
                y={margin.top}
                width={w}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Box matching AWS DetailCostTrendChart */}
        <div
          className="absolute z-20 pointer-events-none rounded-lg border border-dark-border bg-dark-card/95 p-3 shadow-xl backdrop-blur-md text-xs transition-all duration-150 w-48"
          style={{
            left: `${Math.min(65, Math.max(12, (hoverIndex / (TREND_POINTS.length - 1)) * 80))}%`,
            top: '25px',
          }}
        >
          <div className="font-semibold text-white border-b border-dark-border/60 pb-1.5 mb-1.5 flex justify-between items-center text-[11px]">
            <span>{hoveredPoint.label}, 2024</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0070f3]" />
                <span className="text-slate-300">Cost (current):</span>
              </div>
              <span className="font-semibold text-white font-mono">
                {currentCfg.formatValue(hoveredPoint[currentCfg.currentKey])}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">Cost (previous):</span>
              </div>
              <span className="font-normal text-slate-400 font-mono">
                {currentCfg.formatValue(hoveredPoint[currentCfg.previousKey])}
              </span>
            </div>
            <div className="pt-1 mt-1 border-t border-dark-border/40 text-[10px] text-slate-400 flex flex-col gap-0.5">
              <div className="flex justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Service:</span>
                </div>
                <span className="text-white font-medium">{hoveredPoint.service}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Region:</span>
                </div>
                <span className="text-slate-300">{hoveredPoint.region}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Footer matching AWS DetailCostTrendChart */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-dark-border/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-blue-500 rounded-full" />
          <span className="text-slate-300 text-[11px] font-medium">Current period</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-slate-500 border-b border-dashed border-slate-400 rounded-full" />
          <span className="text-slate-400 text-[11px]">Previous period</span>
        </div>
      </div>
    </div>
  );
}
