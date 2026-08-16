/**
 * Workforce Stats Component
 * Overview metrics for the AI team
 */

'use client';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

export function WorkforceStats() {
  const stats: StatCard[] = [
    {
      label: 'Total Agents',
      value: 22,
      change: '+3 this week',
      icon: '🤖',
      color: 'purple',
    },
    {
      label: 'Active Now',
      value: 18,
      change: '82% utilization',
      icon: '✓',
      color: 'green',
    },
    {
      label: 'Tasks in Queue',
      value: 156,
      change: '-12 today',
      icon: '⏱️',
      color: 'blue',
    },
    {
      label: 'Avg Response Time',
      value: '1.2s',
      change: '-0.3s vs yesterday',
      icon: '⚡',
      color: 'orange',
    },
  ];

  const colorMap = {
    blue: 'bg-wise-blue-electric/10 border-wise-blue-electric/30',
    green: 'bg-wise-green-neon/10 border-wise-green-neon/30',
    orange: 'bg-wise-orange-warning/10 border-wise-orange-warning/30',
    purple: 'bg-wise-purple-ai/10 border-wise-purple-ai/30',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`
            rounded-lg border p-4
            ${colorMap[stat.color]}
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium text-wise-text-secondary">
              {stat.label}
            </div>
            <span className="text-xl">{stat.icon}</span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-wise-text-primary">
              {stat.value}
            </div>
          </div>
          {stat.change && (
            <div className="text-xs text-wise-text-secondary">
              {stat.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
