/**
 * Workforce Agent Card Component
 * Individual AI agent card with details and actions
 */

'use client';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: 'ready' | 'working' | 'offline' | 'error';
  uptime: number;
  currentTask?: string;
  tasksCompleted: number;
  avgResponseTime: string;
  specialties: string[];
  availability: number;
}

interface WorkforceAgentCardProps {
  agent: Agent;
}

export function WorkforceAgentCard({ agent }: WorkforceAgentCardProps) {
  const statusColors = {
    ready: 'bg-wise-green-neon text-black',
    working: 'bg-wise-blue-electric text-black',
    offline: 'bg-wise-surface-2 text-wise-text-secondary',
    error: 'bg-wise-red-alert text-white',
  };

  const statusLabels = {
    ready: 'Ready',
    working: 'Working',
    offline: 'Offline',
    error: 'Error',
  };

  return (
    <div className="
      rounded-lg bg-wise-surface-1 border border-wise-border p-4
      hover:border-wise-blue-electric hover:shadow-blue-glow-md
      transition-all duration-200
      flex flex-col
    ">
      {/* Header: Icon, Name, Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-3xl mb-2">{agent.icon}</div>
          <h3 className="text-sm font-semibold text-wise-text-primary">
            {agent.name}
          </h3>
          <p className="text-xs text-wise-text-secondary">
            {agent.role}
          </p>
        </div>
        <div className={`
          px-2 py-1 rounded text-xs font-medium
          ${statusColors[agent.status]}
        `}>
          {statusLabels[agent.status]}
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mb-3 p-2 bg-wise-surface-2 rounded border border-wise-border">
          <div className="text-xs text-wise-text-secondary mb-1">Current Task</div>
          <div className="text-xs text-wise-text-primary line-clamp-2">
            {agent.currentTask}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <div className="text-wise-text-secondary">Uptime</div>
          <div className="font-semibold text-wise-text-primary">{agent.uptime}%</div>
        </div>
        <div>
          <div className="text-wise-text-secondary">Response</div>
          <div className="font-semibold text-wise-text-primary">{agent.avgResponseTime}</div>
        </div>
        <div>
          <div className="text-wise-text-secondary">Completed</div>
          <div className="font-semibold text-wise-text-primary">{agent.tasksCompleted}</div>
        </div>
        <div>
          <div className="text-wise-text-secondary">Available</div>
          <div className="font-semibold text-wise-green-neon">{agent.availability}%</div>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-3">
        <div className="text-xs text-wise-text-secondary mb-1">Specialties</div>
        <div className="flex flex-wrap gap-1">
          {agent.specialties.map((specialty) => (
            <span
              key={specialty}
              className="
                text-xs px-2 py-1 rounded
                bg-wise-surface-2 text-wise-text-secondary
                border border-wise-border
              "
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Availability Meter */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-wise-text-secondary">Capacity</span>
          <span className="text-xs font-semibold text-wise-text-primary">
            {agent.availability}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-wise-surface-2 rounded-full overflow-hidden">
          <div
            className={`
              h-full rounded-full transition-all
              ${
                agent.availability >= 90
                  ? 'bg-wise-green-neon'
                  : agent.availability >= 70
                    ? 'bg-wise-blue-electric'
                    : 'bg-wise-orange-warning'
              }
            `}
            style={{ width: `${agent.availability}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-wise-border">
        <button className="
          flex-1 px-2 py-1.5 text-xs font-medium
          bg-wise-surface-2 text-wise-text-primary
          rounded hover:bg-wise-surface-1 transition-colors
          border border-wise-border
        ">
          Details
        </button>
        <button className="
          flex-1 px-2 py-1.5 text-xs font-medium
          bg-wise-blue-electric text-black
          rounded hover:opacity-90 transition-opacity
        ">
          Assign
        </button>
      </div>
    </div>
  );
}
