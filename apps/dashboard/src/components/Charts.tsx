'use client';

import React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  maxValue?: number;
  height?: number;
}

export function BarChart({ data, title, maxValue, height = 300 }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const getColor = (color?: string) => color || '#3b82f6';

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, idx) => {
          const percentage = (item.value / max) * 100;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="text-sm font-medium text-gray-400">{item.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: getColor(item.color),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface LineChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export function LineChart({ data, title }: LineChartProps) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  // Simple ASCII-style line chart
  const height = 8;
  const points = data.map(d => Math.round(((d.value - min) / range) * height));

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex gap-1 items-end h-32 justify-between">
          {data.map((item, idx) => {
            const percentage = ((item.value - min) / range) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all"
                    style={{ height: `${Math.max(4, percentage)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>Min: {min.toFixed(0)}</span>
          <span>Max: {max.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

export interface PieChartProps {
  data: ChartDataPoint[];
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PieChart({ data, title, size = 'md' }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const sizeClass = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  }[size];

  let currentAngle = 0;
  const slices = data.map((item, idx) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const radius = 50;
    const start = {
      x: 50 + radius * Math.cos((startAngle - 90) * (Math.PI / 180)),
      y: 50 + radius * Math.sin((startAngle - 90) * (Math.PI / 180)),
    };
    const end = {
      x: 50 + radius * Math.cos((endAngle - 90) * (Math.PI / 180)),
      y: 50 + radius * Math.sin((endAngle - 90) * (Math.PI / 180)),
    };

    const largeArc = angle > 180 ? 1 : 0;
    const color = item.color || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][idx % 5];

    return (
      <React.Fragment key={idx}>
        <path
          d={`M 50 50 L ${start.x} ${start.y} A 50 50 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
          fill={color}
          className="transition-opacity hover:opacity-75"
        />
        <title>{`${item.label}: ${item.value.toLocaleString()} (${percentage.toFixed(1)}%)`}</title>
      </React.Fragment>
    );
  });

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="flex gap-6">
        <svg viewBox="0 0 100 100" className={`${sizeClass}`}>
          {slices}
        </svg>
        <div className="flex flex-col justify-center gap-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][idx % 5] }}
              />
              <span className="text-sm text-gray-300">
                {item.label}: {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, unit, change, icon }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">{value}</span>
            {unit && <span className="text-gray-500">{unit}</span>}
          </div>
          {change && (
            <div className={`mt-2 text-sm font-medium ${
              change.trend === 'up' ? 'text-green-400' :
              change.trend === 'down' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '→'} {Math.abs(change.value)}%
            </div>
          )}
        </div>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
    </div>
  );
}
