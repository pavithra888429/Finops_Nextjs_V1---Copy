import React, { useState, useMemo } from 'react';
import { BASE_TREND_DATA, ProductAllocationRecord, TrendDataPoint } from './costAllocationData';

interface ProductCostTrendChartProps {
  selectedProduct: string;
  selectedProvider: string;
  products?: ProductAllocationRecord[];
  dailyTimeline?: { date: string; unblendedCost?: number; totalCost?: number; [key: string]: any }[];
  billingPeriod?: string;
}

const PALETTE = ['#8b5cf6', '#f97316', '#06b6d4', '#eab308', '#ec4899', '#10b981'];

export function ProductCostTrendChart({
  selectedProduct,
  selectedProvider,
  products,
  dailyTimeline,
  billingPeriod,
}: ProductCostTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number>(0);

  const width = 620;
  const height = 230;
  const paddingLeft = 38;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Active product list to render
  const activeProducts = useMemo(() => {
    if (products && products.length > 0) {
      if (selectedProduct !== 'all') {
        const found = products.filter((p) => p.id === selectedProduct);
        if (found.length > 0) return found;
      }
      return products.slice(0, 4);
    }
    return [];
  }, [products, selectedProduct]);

  // Dynamic series points
  const points = useMemo(() => {
    if (dailyTimeline && dailyTimeline.length > 0 && activeProducts.length > 0) {
      const year = billingPeriod ? billingPeriod.slice(0, 4) : '2026';
      return dailyTimeline.map((item, idx) => {
        const dateStr = item.date || `2026-10-${String(idx + 1).padStart(2, '0')}`;
        const parts = dateStr.split('-');
        const monthNum = parseInt(parts[1] || '10', 10);
        const dayNum = parseInt(parts[2] || String(idx + 1), 10);
        const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthNum - 1] || 'Oct';
        const label = `${monthName} ${String(dayNum).padStart(2, '0')}`;

        const dayTotal = Number(item.unblendedCost || item.totalCost || 0);

        const productVals: Record<string, number> = {};
        activeProducts.forEach((p) => {
          // If product has a daily timeline matching this date
          const pDaily = (p as any).dailyTimeline?.find((d: any) => d.date === dateStr);
          if (pDaily && pDaily.unblendedCost !== undefined) {
            productVals[p.id] = Number(pDaily.unblendedCost || 0);
          } else {
            // Allocate based on product share
            const shareRatio = Math.max(0.01, p.share) / 100;
            productVals[p.id] = Number((dayTotal * shareRatio).toFixed(2));
          }
        });

        return {
          date: dateStr,
          label,
          year,
          vals: productVals,
          dayTotal,
        };
      });
    }

    return [];
  }, [dailyTimeline, activeProducts, billingPeriod]);

  // Keep hoverIndex within range
  const safeHoverIndex = Math.min(hoverIndex, Math.max(0, points.length - 1));

  // Dynamic products to plot
  const renderedProducts = useMemo(() => {
    if (activeProducts.length > 0) {
      return activeProducts.map((p, i) => ({
        id: p.id,
        name: p.name,
        color: PALETTE[i % PALETTE.length],
      }));
    }
    return [];
  }, [activeProducts]);

  const allVisibleVals = points.flatMap((pt) =>
    renderedProducts.map((p) => pt.vals[p.id] || 0)
  );

  const rawMax = Math.max(...allVisibleVals, 10);
  const maxVal = Math.ceil(rawMax * 1.15) || 50;

  const getX = (idx: number) => paddingLeft + (idx / Math.max(1, points.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxVal) * chartHeight;

  const createSmoothPath = (prodId: string) => {
    if (points.length === 0) return '';
    const pts = points.map((pt, i) => ({ x: getX(i), y: getY(pt.vals[prodId] || 0) }));
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y} L ${pts[0].x + chartWidth},${pts[0].y}`;
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cur = pts[i];
      const next = pts[i + 1];
      const cpX = (cur.x + next.x) / 2;
      path += ` C ${cpX},${cur.y} ${cpX},${next.y} ${next.x},${next.y}`;
    }
    return path;
  };

  const hoveredPoint = points[safeHoverIndex];
  const yTicks = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

  // Pick tick indices for X axis (up to 7 ticks)
  const xTickIndices = useMemo(() => {
    if (points.length <= 7) return points.map((_, i) => i);
    const step = Math.floor(points.length / 5);
    const indices = [0];
    for (let i = step; i < points.length - 1; i += step) {
      indices.push(i);
    }
    indices.push(points.length - 1);
    return Array.from(new Set(indices));
  }, [points]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Product Cost Trend</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {selectedProvider !== 'all'
              ? `${selectedProvider.toUpperCase()} daily spend over time (USD)`
              : 'Daily product cost over time (USD)'}
          </p>
        </div>
        {(selectedProduct !== 'all' || selectedProvider !== 'all') && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-sans">
            {selectedProduct !== 'all' ? selectedProduct : ''}{' '}
            {selectedProvider !== 'all' ? `• ${selectedProvider.toUpperCase()}` : ''}
          </span>
        )}
      </div>

      {/* SVG Chart Area */}
      {points.length === 0 ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-xs gap-2 border border-dashed border-slate-200 rounded-lg my-2 bg-slate-50">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing daily timeline from workflow...</span>
        </div>
      ) : (
        <div className="relative mt-2 w-full select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible cursor-crosshair"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const ratio = (mouseX - (paddingLeft / width) * rect.width) / ((chartWidth / width) * rect.width);
              const clamped = Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1))));
              setHoverIndex(clamped);
            }}
          >
          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = getY(val);
            const label = val === 0 ? '$0' : val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${Math.round(val)}`;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
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
          {xTickIndices.map((idx) => {
            if (!points[idx]) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 font-sans text-[10px]"
              >
                {points[idx].label}
              </text>
            );
          })}

          {/* Render Curve for Each Product */}
          {renderedProducts.map((p) => (
            <path
              key={p.id}
              d={createSmoothPath(p.id)}
              fill="none"
              stroke={p.color}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ))}

          {/* Vertical Tracking Line */}
          {hoveredPoint && (
            <line
              x1={getX(safeHoverIndex)}
              y1={paddingTop}
              x2={getX(safeHoverIndex)}
              y2={height - paddingBottom}
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="3,3"
              className="opacity-70"
            />
          )}

          {/* Active Points */}
          {hoveredPoint &&
            renderedProducts.map((p) => {
              const val = hoveredPoint.vals[p.id] || 0;
              return (
                <circle
                  key={p.id}
                  cx={getX(safeHoverIndex)}
                  cy={getY(val)}
                  r="4"
                  fill={p.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              );
            })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xl text-xs min-w-[170px]"
            style={{
              left: `${Math.min(74, Math.max(20, (getX(safeHoverIndex) / width) * 100))}%`,
              top: '8px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-[11px] font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-100 font-sans">
              {hoveredPoint.label}, {hoveredPoint.year}
            </p>
            <div className="space-y-1 text-[11px]">
              {renderedProducts.map((p) => {
                const cost = hoveredPoint.vals[p.id] || 0;
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-slate-600 text-xs truncate max-w-[120px] font-medium">{p.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums font-sans">
                      ${cost.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Legend Footer */}
      {renderedProducts.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 font-medium">
          {renderedProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="truncate max-w-[130px]">{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

