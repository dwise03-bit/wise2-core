'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ interactive = false, className = '', children, ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-gradient-to-br from-wise-gunmetal/50 to-transparent transition-all ${
        interactive
          ? 'border-border-subtle hover:border-wise-neon cursor-pointer hover:shadow-green-glow'
          : 'border-border-subtle'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, change, suffix = '', trend = 'neutral' }) => {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted';

  return (
    <Card className="p-4 lg:p-6">
      <div className="space-y-2">
        <p className="text-xs lg:text-sm font-medium uppercase tracking-wider text-text-muted">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-text-primary tabular-nums">
            {value}{suffix}
          </span>
          {change !== undefined && (
            <span className={`text-xs lg:text-sm font-semibold ${trendColor}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
