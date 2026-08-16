/**
 * Key Metrics Component
 */

'use client';

export function KeyMetrics() {
  const metrics = [
    {
      label: 'Total Revenue',
      value: '$487.3K',
      change: '+18.2%',
      trend: 'up',
      icon: '💰',
      color: 'bg-wise-green-neon/10 border-wise-green-neon/30',
    },
    {
      label: 'Customer Count',
      value: '3,247',
      change: '+128',
      trend: 'up',
      icon: '👥',
      color: 'bg-wise-blue-electric/10 border-wise-blue-electric/30',
    },
    {
      label: 'Conversion Rate',
      value: '4.8%',
      change: '-0.3%',
      trend: 'down',
      icon: '📈',
      color: 'bg-wise-orange-warning/10 border-wise-orange-warning/30',
    },
    {
      label: 'Avg Order Value',
      value: '$156.42',
      change: '+8.5%',
      trend: 'up',
      icon: '🛒',
      color: 'bg-wise-purple-ai/10 border-wise-purple-ai/30',
    },
    {
      label: 'Customer Retention',
      value: '92.3%',
      change: '+2.1%',
      trend: 'up',
      icon: '🔄',
      color: 'bg-wise-green-neon/10 border-wise-green-neon/30',
    },
    {
      label: 'Support Satisfaction',
      value: '4.7/5',
      change: '+0.2',
      trend: 'up',
      icon: '⭐',
      color: 'bg-wise-blue-electric/10 border-wise-blue-electric/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`rounded-lg border p-4 ${metric.color}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-wise-text-secondary">
              {metric.label}
            </span>
            <span className="text-xl">{metric.icon}</span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-wise-text-primary">
              {metric.value}
            </div>
          </div>
          <div className={`text-xs font-medium ${
            metric.trend === 'up' ? 'text-wise-green-neon' : 'text-wise-orange-warning'
          }`}>
            {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
          </div>
        </div>
      ))}
    </div>
  );
}
