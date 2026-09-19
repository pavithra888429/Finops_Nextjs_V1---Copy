import React, { useState } from 'react';
import { BASE_TREND_DATA, TrendDataPoint } from './costAllocationData';

interface ProductCostTrendChartProps {
  selectedProduct: string;
  selectedProvider: string;
}

export function ProductCostTrendChart({
  selectedProduct,
  selectedProvider,
}: ProductCostTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number>(6); // Aug 25 is index 6

  const width = 620;
  const height = 230;
  const paddingLeft = 38;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Extract numeric value based on selectedProvider filter
  const getVal = (pt: TrendDataPoint, productKey: 'dragon' | 'okrian' | 'workbench' | 'unallocated') => {
    const item = pt[productKey];
    if (selectedProvider === 'gemini') return item.gemini;
    if (selectedProvider === 'openrouter') return item.openrouter;
    if (selectedProvider === 'aws') return item.aws;
    return item.total;
  };

  // Dynamically calculate maxVal based on visible products and providers
  const allVisibleVals = BASE_TREND_DATA.flatMap((pt) => {
    const vals: number[] = [];
    if (selectedProduct === 'all' || selectedProduct === 'dragon') vals.push(getVal(pt, 'dragon'));
    if (selectedProduct === 'all' || selectedProduct === 'okrian') vals.push(getVal(pt, 'okrian'));
    if (selectedProduct === 'all' || selectedProduct === 'workbench') vals.push(getVal(pt, 'workbench'));
    if (selectedProduct === 'all' || selectedProduct === 'unallocated') vals.push(getVal(pt, 'unallocated'));
    return vals;
  });

  const rawMax = Math.max(...allVisibleVals, 100);
  const maxVal = selectedProvider !== 'all' ? Math.ceil(rawMax / 200) * 200 : 2000;

  const getX = (idx: number) => paddingLeft + (idx / (BASE_TREND_DATA.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxVal) * chartHeight;

  // Build smooth cubic bezier curve
  const createSmoothPath = (productKey: 'dragon' | 'okrian' | 'workbench' | 'unallocated') => {
    const pts = BASE_TREND_DATA.map((pt, i) => ({ x: getX(i), y: getY(getVal(pt, productKey)) }));
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cur = pts[i];
      const next = pts[i + 1];
      const cpX = (cur.x + next.x) / 2;
      path += ` C ${cpX},${cur.y} ${cpX},${next.y} ${next.x},${next.y}`;
    }
    return path;
  };

  const hoveredPoint = BASE_TREND_DATA[hoverIndex];

  // Visibility flags
  const showDragon = selectedProduct === 'all' || selectedProduct === 'dragon';
  const showOkrian = selectedProduct === 'all' || selectedProduct === 'okrian';
  const showWorkbench = selectedProduct === 'all' || selectedProduct === 'workbench';
  const showUnallocated = selectedProduct === 'all' || selectedProduct === 'unallocated';

  const yTicks = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

  return (
    <div className="rounded-xl border border-dark-border bg-dark-card/90 p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">Product Cost Trend</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {selectedProvider !== 'all'
              ? `${selectedProvider.toUpperCase()} daily spend over time (USD)`
              : 'Daily product cost over time (USD)'}
          </p>
        </div>
        {(selectedProduct !== 'all' || selectedProvider !== 'all') && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {selectedProduct !== 'all' ? selectedProduct : ''}{' '}
            {selectedProvider !== 'all' ? `• ${selectedProvider.toUpperCase()}` : ''}
          </span>
        )}
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
            const clamped = Math.max(0, Math.min(BASE_TREND_DATA.length - 1, Math.round(ratio * (BASE_TREND_DATA.length - 1))));
            setHoverIndex(clamped);
          }}
        >
          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = getY(val);
            const label = val === 0 ? '0' : val >= 1000 ? `${(val / 1000).toFixed(1)}K` : `${Math.round(val)}`;
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
                  {label}
                </text>
              </g>
            );
          })}

          {/* X-axis date labels */}
          {[0, 2, 4, 6, 8, 10, 12, 14].map((idx) => {
            if (!BASE_TREND_DATA[idx]) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 font-sans text-[10px]"
              >
                {BASE_TREND_DATA[idx].label}
              </text>
            );
          })}

          {/* Curves based on filters */}
          {/* 1. Dragon Suite */}
          {showDragon && (
            <path
              d={createSmoothPath('dragon')}
              fill="none"
              stroke="#0070f3"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* 2. Okrian */}
          {showOkrian && (
            <path
              d={createSmoothPath('okrian')}
              fill="none"
              stroke="#00e599"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* 3. Workbench */}
          {showWorkbench && (
            <path
              d={createSmoothPath('workbench')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* 4. Unallocated */}
          {showUnallocated && (
            <path
              d={createSmoothPath('unallocated')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* Vertical Tracking Line */}
          {hoveredPoint && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={height - paddingBottom}
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="3,3"
              className="opacity-70"
            />
          )}

          {/* Active Points */}
          {hoveredPoint && (
            <>
              {showDragon && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(getVal(hoveredPoint, 'dragon'))}
                  r="4"
                  fill="#0070f3"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
              {showOkrian && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(getVal(hoveredPoint, 'okrian'))}
                  r="4"
                  fill="#00e599"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
              {showWorkbench && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(getVal(hoveredPoint, 'workbench'))}
                  r="4"
                  fill="#8b5cf6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
              {showUnallocated && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(getVal(hoveredPoint, 'unallocated'))}
                  r="4"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </>
          )}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none rounded-lg border border-[#1f314c] bg-[#0c1526]/95 px-3 py-2 shadow-2xl backdrop-blur-md text-xs min-w-[170px]"
            style={{
              left: `${Math.min(74, Math.max(20, (getX(hoverIndex) / width) * 100))}%`,
              top: '8px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-[11px] font-semibold text-white mb-1.5 pb-1 border-b border-[#1b283e]">
              {hoveredPoint.label}, 2024
            </p>
            <div className="space-y-1 text-[11px]">
              {showDragon && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#0070f3]" />
                    <span className="text-slate-300 text-xs">Dragon Suite</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">
                    ${getVal(hoveredPoint, 'dragon').toFixed(2)}
                  </span>
                </div>
              )}
              {showOkrian && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#00e599]" />
                    <span className="text-slate-300 text-xs">Okrian</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">
                    ${getVal(hoveredPoint, 'okrian').toFixed(2)}
                  </span>
                </div>
              )}
              {showWorkbench && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                    <span className="text-slate-300 text-xs">Workbench</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">
                    ${getVal(hoveredPoint, 'workbench').toFixed(2)}
                  </span>
                </div>
              )}
              {showUnallocated && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-slate-300 text-xs">Unallocated</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">
                    ${getVal(hoveredPoint, 'unallocated').toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="mt-2 pt-2 border-t border-dark-border/40 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-300 font-normal">
        {showDragon && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#0070f3]" />
            <span>Dragon Suite</span>
          </div>
        )}
        {showOkrian && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#00e599]" />
            <span>Okrian</span>
          </div>
        )}
        {showWorkbench && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#8b5cf6]" />
            <span>Workbench</span>
          </div>
        )}
        {showUnallocated && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
            <span>Unallocated</span>
          </div>
        )}
      </div>
    </div>
  );
}
