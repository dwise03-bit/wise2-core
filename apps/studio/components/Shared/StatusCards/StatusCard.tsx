'use client';

export interface StatusCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
  secondaryValue?: string;
  secondaryLabel?: string;
}

export function StatusCard({
  icon,
  label,
  value,
  unit,
  status = 'good',
  secondaryValue,
  secondaryLabel,
}: StatusCardProps) {
  const statusColors = {
    good: 'text-green-400 border-green-500/30',
    warning: 'text-yellow-400 border-yellow-500/30',
    critical: 'text-red-400 border-red-500/30',
  };

  const statusBgColors = {
    good: 'bg-green-500/10',
    warning: 'bg-yellow-500/10',
    critical: 'bg-red-500/10',
  };

  return (
    <div
      className={`p-3 rounded-lg border ${statusColors[status]} ${statusBgColors[status]} min-w-fit`}
    >
      <div className="flex items-start gap-2">
        {icon && <div className="text-lg">{icon}</div>}
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">{label}</div>
          <div className="flex items-baseline gap-1">
            <div className="text-lg font-bold">{value}</div>
            {unit && <div className="text-xs text-gray-400">{unit}</div>}
          </div>
          {secondaryValue && (
            <div className="text-xs text-gray-500 mt-1">
              {secondaryLabel}: {secondaryValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
