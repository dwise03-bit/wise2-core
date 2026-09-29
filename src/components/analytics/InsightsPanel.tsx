/**
 * Insights Panel Component
 */

'use client';

export function InsightsPanel() {
  const insights = [
    {
      icon: '📈',
      title: 'Revenue Peak',
      description: 'Revenue peaked on the 15th, driven by campaign launch',
      severity: 'positive',
    },
    {
      icon: '⚠️',
      title: 'Churn Alert',
      description: 'Detected 3 high-value customers at churn risk',
      severity: 'warning',
    },
    {
      icon: '✓',
      title: 'Goal On Track',
      description: 'Monthly revenue goal is on track to be exceeded by 12%',
      severity: 'positive',
    },
    {
      icon: '🔍',
      title: 'Opportunity',
      description: 'Upsell potential in Enterprise segment (+$50K ARR)',
      severity: 'info',
    },
  ];

  const severityColors = {
    positive: 'bg-wise-green-neon/10 border-wise-green-neon/30',
    warning: 'bg-wise-orange-warning/10 border-wise-orange-warning/30',
    info: 'bg-wise-blue-electric/10 border-wise-blue-electric/30',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-wise-text-primary">AI Insights</h2>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 ${severityColors[insight.severity]}`}
          >
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-wise-text-primary">
                  {insight.title}
                </h4>
                <p className="text-xs text-wise-text-secondary mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="
        w-full px-3 py-2 text-xs font-semibold
        bg-wise-surface-1 border border-wise-border
        text-wise-text-primary
        rounded hover:bg-wise-surface-2 transition-colors
      ">
        View Full Report
      </button>
    </div>
  );
}
