'use client';

import React from 'react';

interface MeterGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  showPercentage?: boolean;
}

const colorMap = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

const colorTextMap = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  green: 'text-green-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
};

export function MeterGauge({
  label,
  value,
  max,
  unit,
  color = 'blue',
  showPercentage = true,
}: MeterGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-wise-text-primary">{label}</label>
        <span className={`text-sm font-semibold ${colorTextMap[color]}`}>
          {value.toLocaleString()} / {max.toLocaleString()} {unit}
          {showPercentage && ` (${percentage.toFixed(0)}%)`}
        </span>
      </div>
      <div className="w-full bg-wise-bg-secondary rounded-full h-2 overflow-hidden border border-wise-primary-border">
        <div
          className={`h-full ${colorMap[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
