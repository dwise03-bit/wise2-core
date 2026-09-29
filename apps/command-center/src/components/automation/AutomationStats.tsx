/**
 * Automation Stats Component
 */

'use client';

export function AutomationStats() {
  const stats = [
    {
      label: 'Total Workflows',
      value: 34,
      icon: '⚙️',
      color: 'bg-wise-blue-electric/10 border-wise-blue-electric/30',
    },
    {
      label: 'Active Executions',
      value: 127,
      icon: '▶️',
      color: 'bg-wise-green-neon/10 border-wise-green-neon/30',
    },
    {
      label: 'Success Rate',
      value: '99.2%',
      icon: '✓',
      color: 'bg-wise-green-neon/10 border-wise-green-neon/30',
    },
    {
      label: 'Time Saved',
      value: '847h',
      icon: '⏱️',
      color: 'bg-wise-purple-ai/10 border-wise-purple-ai/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg border p-4 ${stat.color}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-wise-text-secondary">
              {stat.label}
            </span>
            <span className="text-xl">{stat.icon}</span>
          </div>
          <div className="text-2xl font-bold text-wise-text-primary">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
