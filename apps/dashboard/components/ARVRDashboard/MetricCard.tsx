import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  icon?: React.ReactNode;
  trend?: number;
  delay?: number;
}

const statusColors = {
  healthy: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    text: 'text-emerald-400',
    icon: 'bg-emerald-500/20 text-emerald-400',
    bar: 'bg-emerald-500',
    width: '100%',
  },
  warning: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    text: 'text-amber-400',
    icon: 'bg-amber-500/20 text-amber-400',
    bar: 'bg-amber-500',
    width: '66%',
  },
  critical: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30 hover:border-red-500/60',
    text: 'text-red-400',
    icon: 'bg-red-500/20 text-red-400',
    bar: 'bg-red-500',
    width: '33%',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
  trend,
  delay = 0,
}) => {
  const colors = statusColors[status];

  return (
    <div
      className={`rounded-lg p-6 backdrop-blur-sm border bg-slate-900/50 transition-all duration-300 ${colors.border}`}
      style={{
        animation: `fadeIn 0.4s ease-out ${delay * 0.06}s both`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300 font-fira-sans">{title}</h3>
        {icon && <div className={`p-2 rounded-lg ${colors.icon}`}>{icon}</div>}
      </div>

      <div className="mb-2">
        <div className="text-2xl font-bold font-fira-code">
          {value}
          {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
        </div>
      </div>

      {trend && (
        <p className={`text-xs font-fira-code ${colors.text}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this hour
        </p>
      )}

      <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${colors.bar}`}
          style={{ width: colors.width }}
        />
      </div>
    </div>
  );
};

export default MetricCard;
