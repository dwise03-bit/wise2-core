/**
 * BusinessHealthCard Component
 * Displays business health metrics and KPIs
 */

interface HealthMetric {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  trend?: string;
}

export function BusinessHealthCard() {
  const metrics: HealthMetric[] = [
    {
      label: 'Order Fulfillment Rate',
      value: '94%',
      status: 'good',
      trend: '+2% this week',
    },
    {
      label: 'Customer Satisfaction',
      value: '4.6/5',
      status: 'good',
      trend: '+0.2 points',
    },
    {
      label: 'Automation Success Rate',
      value: '97.3%',
      status: 'good',
      trend: '+1.2%',
    },
    {
      label: 'Average Response Time',
      value: '2.3h',
      status: 'warning',
      trend: '+0.5h vs yesterday',
    },
  ];

  const statusIndicator = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-wise-green-neon';
      case 'warning':
        return 'bg-wise-orange-warning';
      case 'critical':
        return 'bg-wise-red-alert';
      default:
        return 'bg-wise-text-secondary';
    }
  };

  return (
    <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
      <h2 className="text-lg font-semibold text-wise-text-primary mb-4">
        Business Health
      </h2>

      <div className="space-y-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-3 bg-wise-surface-2 rounded-md border border-wise-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${statusIndicator(
                    metric.status
                  )}`}
                />
                <span className="text-sm font-medium text-wise-text-primary">
                  {metric.label}
                </span>
              </div>
              <span className="text-lg font-bold text-wise-text-primary ml-2">
                {metric.value}
              </span>
            </div>
            {metric.trend && (
              <div className="text-xs text-wise-text-secondary ml-4">
                {metric.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Health Score */}
      <div className="mt-4 p-4 bg-gradient-to-r from-wise-green-neon/10 to-wise-blue-electric/10 border border-wise-green-neon/30 rounded-md">
        <div className="text-center">
          <div className="text-xs uppercase font-medium text-wise-text-secondary mb-1">
            Overall Health Score
          </div>
          <div className="text-3xl font-bold text-wise-green-neon">95%</div>
          <div className="text-xs text-wise-text-secondary mt-1">
            All systems operating optimally
          </div>
        </div>
      </div>
    </div>
  );
}
