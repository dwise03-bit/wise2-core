/**
 * DigitalWorkforcePanel Component
 * Displays AI agent team status and availability
 */

interface AIAgent {
  name: string;
  type: string;
  status: 'ready' | 'working' | 'error' | 'offline';
  currentTask?: string;
  uptime: string;
}

const DEMO_AGENTS: AIAgent[] = [
  {
    name: 'Hermes',
    type: 'Master Orchestrator',
    status: 'ready',
    uptime: '99.9%',
  },
  {
    name: 'Creative AI',
    type: 'Design & Mockups',
    status: 'working',
    currentTask: 'Generating designs',
    uptime: '99.8%',
  },
  {
    name: 'Marketing AI',
    type: 'Campaigns & Content',
    status: 'ready',
    uptime: '100%',
  },
  {
    name: 'Inventory AI',
    type: 'Stock & Supply',
    status: 'ready',
    uptime: '99.9%',
  },
  {
    name: 'Finance AI',
    type: 'Reconciliation',
    status: 'working',
    currentTask: 'Processing payments',
    uptime: '99.9%',
  },
  {
    name: 'Support AI',
    type: 'Customer Service',
    status: 'ready',
    uptime: '100%',
  },
];

export function DigitalWorkforcePanel() {
  const statusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-wise-green-neon text-black';
      case 'working':
        return 'bg-wise-blue-electric text-black';
      case 'error':
        return 'bg-wise-red-alert text-white';
      default:
        return 'bg-wise-text-secondary text-black';
    }
  };

  return (
    <div className="rounded-lg bg-wise-surface-1 border border-wise-border p-6">
      <h2 className="text-lg font-semibold text-wise-text-primary mb-4">
        Digital Workforce
      </h2>

      <div className="space-y-3">
        {DEMO_AGENTS.map((agent) => (
          <div
            key={agent.name}
            className="p-3 bg-wise-surface-2 border border-wise-border rounded-md hover:border-wise-blue-electric transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-wise-text-primary">
                  {agent.name}
                </h4>
                <p className="text-xs text-wise-text-secondary">
                  {agent.type}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(
                  agent.status
                )}`}
              >
                {agent.status === 'working'
                  ? 'Working'
                  : agent.status === 'ready'
                    ? 'Ready'
                    : 'Offline'}
              </span>
            </div>

            {agent.currentTask && (
              <div className="text-xs text-wise-text-secondary mb-2">
                Task: {agent.currentTask}
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-wise-text-secondary">Uptime</span>
              <span className="font-medium text-wise-green-neon">
                {agent.uptime}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 px-3 bg-wise-surface-2 border border-wise-border text-wise-text-primary rounded-md hover:bg-wise-surface-1 transition-colors text-sm font-medium">
        Manage Workforce
      </button>
    </div>
  );
}
