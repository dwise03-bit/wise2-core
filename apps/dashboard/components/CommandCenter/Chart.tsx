'use client';

import React, { useState } from 'react';

interface DataPoint {
  x: string;
  y: number;
}

interface ChartProps {
  title: string;
  data: DataPoint[];
  height?: number;
  color?: string;
  showGridlines?: boolean;
}

export function Chart({
  title,
  data,
  height = 300,
  color = '#00D9FF',
  showGridlines = true,
}: ChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="glass-medium rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const range = maxY - minY || 1;

  // Calculate SVG dimensions
  const width = Math.max(data.length * 40, 300);
  const svgHeight = height;
  const padding = 40;
  const plotHeight = svgHeight - padding * 2;
  const plotWidth = width - padding * 2;

  // Generate SVG path for the line chart
  const points = data.map((d, i) => {
    const svgX = padding + (i / (data.length - 1 || 1)) * plotWidth;
    const svgY = svgHeight - padding - ((d.y - minY) / range) * plotHeight;
    return { x: svgX, y: svgY, xLabel: d.x, yValue: d.y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="glass-medium rounded-lg p-6">
      <h3 className="font-semibold text-white mb-4">{title}</h3>

      <div className="overflow-x-auto">
        <svg width={width} height={svgHeight} className="mx-auto">
          {/* Background grid */}
          {showGridlines && (
            <g className="chart-grid">
              {Array.from({ length: 5 }).map((_, i) => {
                const y = padding + (i / 4) * plotHeight;
                return (
                  <g key={`grid-${i}`}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <text
                      x={padding - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill="currentColor"
                      opacity="0.6"
                    >
                      {Math.round(maxY - (i / 4) * range).toString()}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor="#00FF7F" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area under the curve */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${padding} ${svgHeight - padding} Z`}
            fill="url(#areaGradient)"
            opacity="0.5"
          />

          {/* Line chart */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={`point-${i}`} className="chart-data-point">
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                fill={color}
                opacity={hoveredIndex === i ? 1 : 0.7}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                filter="url(#glow)"
              />

              {/* Tooltip on hover */}
              {hoveredIndex === i && (
                <g>
                  <rect
                    x={p.x - 35}
                    y={p.y - 35}
                    width="70"
                    height="28"
                    rx="4"
                    fill="#0a0f1a"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x={p.x}
                    y={p.y - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={color}
                  >
                    {p.yValue.toString()}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 2}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#999"
                  >
                    {p.xLabel}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) {
              const point = points[i];
              return (
                <text
                  key={`label-${i}`}
                  x={point.x}
                  y={svgHeight - padding + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#999"
                >
                  {d.x}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-gray-400">Data trend</span>
        </div>
      </div>
    </div>
  );
}
