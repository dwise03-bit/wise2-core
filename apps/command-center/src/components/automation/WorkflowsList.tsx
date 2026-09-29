/**
 * Workflows List Component
 */

'use client';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'error';
  trigger: string;
  executions: number;
  successRate: number;
  lastRun: string;
  nextRun?: string;
}

export function WorkflowsList() {
  const workflows: Workflow[] = [
    {
      id: '1',
      name: 'Daily Inventory Sync',
      description: 'Synchronize inventory levels with suppliers at midnight',
      status: 'active',
      trigger: 'Schedule (Daily 12:00 AM)',
      executions: 1247,
      successRate: 99.8,
      lastRun: '2 hours ago',
      nextRun: 'Today 12:00 AM',
    },
    {
      id: '2',
      name: 'Customer Onboarding',
      description: 'Welcome email, setup guide, and initial training for new customers',
      status: 'active',
      trigger: 'New customer signup',
      executions: 456,
      successRate: 99.1,
      lastRun: '5 minutes ago',
    },
    {
      id: '3',
      name: 'Sales Pipeline Update',
      description: 'Update CRM with daily sales activities and move deals',
      status: 'active',
      trigger: 'Manual + Schedule (Daily 5:00 PM)',
      executions: 892,
      successRate: 97.5,
      lastRun: '3 hours ago',
      nextRun: 'Today 5:00 PM',
    },
    {
      id: '4',
      name: 'Support Escalation',
      description: 'Auto-escalate unresolved tickets after 24 hours',
      status: 'active',
      trigger: 'Ticket age > 24 hours',
      executions: 234,
      successRate: 100,
      lastRun: '1 hour ago',
    },
    {
      id: '5',
      name: 'Monthly Report Generation',
      description: 'Generate and email comprehensive business reports',
      status: 'paused',
      trigger: 'Schedule (First day of month)',
      executions: 12,
      successRate: 100,
      lastRun: '25 days ago',
    },
  ];

  const statusColors = {
    active: 'bg-wise-green-neon text-black',
    paused: 'bg-wise-text-secondary text-wise-surface-1',
    draft: 'bg-wise-surface-2 text-wise-text-secondary',
    error: 'bg-wise-red-alert text-white',
  };

  const statusLabels = {
    active: 'Active',
    paused: 'Paused',
    draft: 'Draft',
    error: 'Error',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-wise-text-primary">Workflows</h2>
      <div className="space-y-3">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="rounded-lg bg-wise-surface-1 border border-wise-border p-4 hover:border-wise-blue-electric/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-wise-text-primary">
                    {workflow.name}
                  </h3>
                  <div className={`
                    px-2 py-1 rounded text-xs font-bold
                    ${statusColors[workflow.status]}
                  `}>
                    {statusLabels[workflow.status]}
                  </div>
                </div>
                <p className="text-sm text-wise-text-secondary">
                  {workflow.description}
                </p>
              </div>
              <button className="
                px-3 py-2 text-xs font-semibold
                bg-wise-surface-2 border border-wise-border
                text-wise-text-primary rounded
                hover:bg-wise-surface-1 transition-colors
                whitespace-nowrap ml-4
              ">
                Configure
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-wise-text-secondary">Trigger</span>
                <div className="font-medium text-wise-text-primary">
                  {workflow.trigger}
                </div>
              </div>
              <div>
                <span className="text-wise-text-secondary">Executions</span>
                <div className="font-medium text-wise-text-primary">
                  {workflow.executions.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-wise-text-secondary">Success Rate</span>
                <div className="font-medium text-wise-green-neon">
                  {workflow.successRate}%
                </div>
              </div>
              <div>
                <span className="text-wise-text-secondary">Last Run</span>
                <div className="font-medium text-wise-text-primary">
                  {workflow.lastRun}
                </div>
              </div>
            </div>

            {workflow.nextRun && (
              <div className="mt-3 pt-3 border-t border-wise-border">
                <span className="text-xs text-wise-text-secondary">Next Run: </span>
                <span className="text-xs font-medium text-wise-text-primary">
                  {workflow.nextRun}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
