/**
 * MetricCard Component
 * Displays a single metric with value, change indicator, and icon
 */

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
}: MetricCardProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-wise-green-neon'
      : changeType === 'negative'
        ? 'text-wise-red-alert'
        : 'text-wise-text-secondary';

  return (
    <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-4 hover:border-wise-blue-electric hover:shadow-blue-glow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs uppercase font-medium text-wise-text-secondary">
          {title}
        </div>
        {icon && <span className="text-lg">{icon}</span>}
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-wise-text-primary">{value}</div>
      </div>

      {/* Change Indicator */}
      <div className={`text-xs font-medium ${changeColor}`}>{change}</div>
    </div>
  );
}
