/**
 * Issues List Component
 * Detected problems with recommendations
 */

'use client';

interface Issue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedSystem: string;
  impact: string;
  recommendation: string;
  autoFixAvailable: boolean;
  estimatedBenefit: string;
}

export function IssuesList() {
  const issues: Issue[] = [
    {
      id: '1',
      severity: 'high',
      title: 'API Response Time Degradation',
      description: 'Average response time increased by 45% over last 6 hours',
      affectedSystem: 'API Gateway',
      impact: 'Reduced user satisfaction, potential revenue impact',
      recommendation: 'Scale up API worker instances from 3 to 5, clear Redis cache',
      autoFixAvailable: true,
      estimatedBenefit: 'Restore response time to <500ms baseline',
    },
    {
      id: '2',
      severity: 'medium',
      title: 'Database Connection Pool Exhaustion Risk',
      description: 'Current pool utilization at 87%, trending toward saturation',
      affectedSystem: 'PostgreSQL',
      impact: 'Future requests may be queued or rejected',
      recommendation: 'Increase connection pool from 50 to 75 connections',
      autoFixAvailable: true,
      estimatedBenefit: 'Provide 38% more connection headroom',
    },
    {
      id: '3',
      severity: 'medium',
      title: 'Support Ticket Backlog Growing',
      description: '156 tickets in queue, avg response time 4.2 hours',
      affectedSystem: 'Support AI',
      impact: 'Customer satisfaction declining, SLA at risk',
      recommendation: 'Activate 2 additional Support AI instances, prioritize VIP tickets',
      autoFixAvailable: true,
      estimatedBenefit: 'Reduce avg response to <2 hours, improve CSAT to 4.7+',
    },
    {
      id: '4',
      severity: 'low',
      title: 'Storage Usage Trending High',
      description: 'Database storage at 73% capacity, growing ~5GB/day',
      affectedSystem: 'Object Storage',
      impact: 'May reach capacity in 12 days without action',
      recommendation: 'Archive logs older than 90 days, implement data retention policy',
      autoFixAvailable: false,
      estimatedBenefit: 'Recover ~45GB, extend runway to 60+ days',
    },
  ];

  const severityColors = {
    critical: 'bg-wise-red-alert/10 border-wise-red-alert/30 text-wise-red-alert',
    high: 'bg-wise-orange-warning/10 border-wise-orange-warning/30 text-wise-orange-warning',
    medium: 'bg-wise-blue-electric/10 border-wise-blue-electric/30 text-wise-blue-electric',
    low: 'bg-wise-text-secondary/10 border-wise-text-secondary/30 text-wise-text-secondary',
  };

  const severityLabels = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-wise-text-primary">Detected Issues</h2>
      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="rounded-lg bg-wise-surface-1 border border-wise-border p-4 hover:border-wise-blue-electric/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`
                  px-2 py-1 rounded text-xs font-bold
                  ${severityColors[issue.severity]}
                `}>
                  {severityLabels[issue.severity]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-wise-text-primary">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-wise-text-secondary mt-1">
                    {issue.description}
                  </p>
                </div>
              </div>
              {issue.autoFixAvailable && (
                <button className="
                  px-3 py-1.5 text-xs font-semibold
                  bg-wise-green-neon text-black
                  rounded hover:opacity-90 transition-opacity
                  whitespace-nowrap ml-3
                ">
                  Auto-Fix
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <span className="text-wise-text-secondary">Affected System</span>
                <div className="font-medium text-wise-text-primary">
                  {issue.affectedSystem}
                </div>
              </div>
              <div>
                <span className="text-wise-text-secondary">Estimated Benefit</span>
                <div className="font-medium text-wise-green-neon">
                  {issue.estimatedBenefit}
                </div>
              </div>
            </div>

            <div className="mb-3 p-3 bg-wise-surface-2 rounded border border-wise-border">
              <div className="text-xs text-wise-text-secondary mb-1">Impact</div>
              <div className="text-sm text-wise-text-primary">
                {issue.impact}
              </div>
            </div>

            <div className="p-3 bg-wise-blue-electric/5 rounded border border-wise-blue-electric/20">
              <div className="text-xs text-wise-text-secondary mb-1">Recommendation</div>
              <div className="text-sm text-wise-text-primary">
                {issue.recommendation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
