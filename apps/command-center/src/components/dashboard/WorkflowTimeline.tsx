/**
 * WorkflowTimeline Component
 * Displays the 10-step universal workflow progression
 */

interface WorkflowStep {
  id: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, label: 'Input', status: 'completed', description: 'Data received' },
  {
    id: 2,
    label: 'Understand',
    status: 'completed',
    description: 'Parsed request',
  },
  {
    id: 3,
    label: 'Analysis',
    status: 'completed',
    description: 'Evaluated options',
  },
  {
    id: 4,
    label: 'Decision',
    status: 'active',
    description: 'Awaiting approval',
  },
  {
    id: 5,
    label: 'Automation',
    status: 'pending',
    description: 'Ready to execute',
  },
  {
    id: 6,
    label: 'Approval',
    status: 'pending',
    description: 'Pending review',
  },
  {
    id: 7,
    label: 'Execution',
    status: 'pending',
    description: 'Will run',
  },
  {
    id: 8,
    label: 'Verify',
    status: 'pending',
    description: 'Will check',
  },
  {
    id: 9,
    label: 'Analytics',
    status: 'pending',
    description: 'Will track',
  },
  {
    id: 10,
    label: 'Learning',
    status: 'pending',
    description: 'Will optimize',
  },
];

export function WorkflowTimeline() {
  return (
    <div className="space-y-4">
      {/* Steps Display */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-4">
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step.status === 'completed'
                    ? 'bg-wise-green-neon text-black'
                    : step.status === 'active'
                      ? 'bg-wise-blue-electric text-black animate-blue-pulse'
                      : 'bg-wise-surface-2 border border-wise-border text-wise-text-secondary'
                }`}
              >
                {step.status === 'completed' ? '✓' : step.id}
              </div>
              <div className="text-xs font-medium text-wise-text-primary mt-1 whitespace-nowrap">
                {step.label}
              </div>
            </div>

            {/* Connector Line */}
            {index < WORKFLOW_STEPS.length - 1 && (
              <div
                className={`w-6 h-0.5 ${
                  step.status === 'completed'
                    ? 'bg-wise-green-neon'
                    : 'bg-wise-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Details */}
      <div className="border-t border-wise-border pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-wise-blue-electric rounded-full animate-blue-pulse" />
            <h3 className="font-semibold text-wise-text-primary">
              Decision — Awaiting approval
            </h3>
          </div>
          <p className="text-sm text-wise-text-secondary ml-4">
            The system has analyzed the request and is waiting for user approval
            to proceed with automation. Review the recommendation and approve or
            modify the action.
          </p>
          <div className="flex gap-2 mt-3 ml-4">
            <button className="px-3 py-1.5 bg-wise-blue-electric text-black font-semibold rounded text-sm hover:opacity-90 transition-opacity">
              Approve
            </button>
            <button className="px-3 py-1.5 bg-wise-surface-2 border border-wise-border text-wise-text-primary rounded text-sm hover:bg-wise-surface-1 transition-colors">
              Review Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
