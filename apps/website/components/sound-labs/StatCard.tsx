'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'compact';
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  color,
  trend,
  variant = 'default',
}: StatCardProps) {
  return (
    <div
      className={`bg-wise-bg-card border border-wise-primary-border rounded-lg hover:border-wise-primary-hover/50 transition-all ${
        variant === 'compact' ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`flex items-start justify-between ${variant === 'compact' ? 'mb-2' : 'mb-4'}`}>
        <div
          className={`p-2 bg-opacity-10 rounded-lg text-lg ${color.replace('text-', 'bg-')}`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <div className={`${color} font-bold ${variant === 'compact' ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>
        {value}
        {unit && <span className="text-sm text-wise-text-muted ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-wise-text-muted">{label}</div>
    </div>
  );
}
