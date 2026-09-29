'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  status?: 'success' | 'warning' | 'critical' | 'info';
  icon?: React.ReactNode;
  sparkline?: number[];
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  status = 'info',
  icon,
  sparkline,
  onClick,
}: KPICardProps) {
  const statusColors = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      glow: 'glow-green',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      glow: 'glow-gold',
    },
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      glow: 'glow-blue',
    },
    info: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'glow-blue',
    },
  };

  const colors = statusColors[status];

  return (
    <div
      onClick={onClick}
      className={`
        glass-medium p-6 rounded-xl cursor-pointer
        hover-scale group transition-all duration-300
        ${colors.bg} ${colors.border}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Header with icon and title */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            {title}
          </p>
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Large value display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white group-hover:text-cyan-300 transition-colors">
            {value}
          </span>
          {unit && (
            <span className="text-lg text-gray-400">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex items-center gap-1 ${trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend.direction === 'up' ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span className="text-sm font-semibold">
              {Math.abs(trend.value)}%
            </span>
          </div>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}

      {/* Sparkline/progress bar */}
      {sparkline && (
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full"
            style={{ width: `${Math.max(...sparkline)}%` }}
          />
        </div>
      )}

      {/* Status indicator */}
      {status && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
          <span className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
          <span className="capitalize">{status} Status</span>
        </div>
      )}
    </div>
  );
}
