'use client';

import React from 'react';
import Link from 'next/link';
import { EmptyState, ErrorState, Panel, Skeleton } from './States';
import { formatCount, NO_VALUE } from './format';
import { AgentStatus, WorkforceAgent } from './types';

/**
 * The seven agents the Revenue OS ships with. Used only to lay out the grid and
 * to show which expected agents the API did not report — never to invent a
 * status. An agent missing from the response renders as NEEDS CONFIG with an
 * explicit "not reported" note.
 */
const EXPECTED_AGENTS: { key: string; name: string; blurb: string }[] = [
  { key: 'receptionist', name: 'Receptionist', blurb: 'Answers inbound calls and chats' },
  { key: 'speed_to_lead', name: 'Speed-to-Lead', blurb: 'First response within seconds' },
  { key: 'booking', name: 'Booking', blurb: 'Schedules jobs onto the calendar' },
  { key: 'recovery', name: 'Recovery', blurb: 'Chases missed calls and no-shows' },
  { key: 'membership', name: 'Membership', blurb: 'Offers and renews service plans' },
  { key: 'reviews', name: 'Reviews', blurb: 'Requests reviews after completed jobs' },
  { key: 'reactivation', name: 'Reactivation', blurb: 'Wins back dormant customers' },
];

const STATUS_STYLES: Record<AgentStatus, { dot: string; text: string; label: string }> = {
  ONLINE: { dot: 'bg-wise-neon animate-pulse', text: 'text-wise-neon', label: 'Online' },
  PAUSED: { dot: 'bg-warning', text: 'text-warning', label: 'Paused' },
  ERROR: { dot: 'bg-danger', text: 'text-danger', label: 'Error' },
  NEEDS_CONFIG: { dot: 'bg-text-muted', text: 'text-text-muted', label: 'Needs config' },
};

function matchAgent(agents: WorkforceAgent[], key: string, name: string) {
  const target = key.replace(/[_-]/g, '');
  return agents.find((a) => {
    const k = String(a.key).toLowerCase().replace(/[_-]/g, '');
    const n = a.name.toLowerCase().replace(/[\s_-]/g, '');
    return k === target || n === name.toLowerCase().replace(/[\s_-]/g, '');
  });
}

interface WorkforcePanelProps {
  agents: WorkforceAgent[] | null;
  state: 'loading' | 'ready' | 'error';
  onRetry?: () => void;
  showLink?: boolean;
}

export const WorkforcePanel: React.FC<WorkforcePanelProps> = ({
  agents,
  state,
  onRetry,
  showLink = true,
}) => {
  // Anything the API reports that isn't one of the seven known agents still
  // gets a card, so a new agent type shows up without a UI change.
  const extras =
    agents?.filter(
      (a) => !EXPECTED_AGENTS.some((e) => matchAgent([a], e.key, e.name) !== undefined),
    ) ?? [];

  return (
    <Panel
      title="AI Workforce"
      subtitle="Autonomous agents working the revenue pipeline"
      action={
        showLink ? (
          <Link
            href="/revenue-os/agents"
            className="text-xs font-semibold text-wise-electric hover:text-wise-electric/80"
          >
            Manage →
          </Link>
        ) : undefined
      }
    >
      {state === 'error' ? (
        <ErrorState
          message="Agent status could not be read. No agent is reported as online or offline."
          hint="GET /api/revenue-os/agents"
          onRetry={onRetry}
        />
      ) : state === 'ready' && agents && agents.length === 0 ? (
        <EmptyState
          title="No agents configured"
          message="Connect your phone, messaging, and scheduling channels to put the AI workforce to work."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {EXPECTED_AGENTS.map((expected) => {
            const agent = agents ? matchAgent(agents, expected.key, expected.name) : undefined;
            const status: AgentStatus = agent?.status ?? 'NEEDS_CONFIG';
            const style = STATUS_STYLES[status];

            return (
              <div
                key={expected.key}
                className="rounded-lg border border-border-subtle bg-white/[0.02] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {expected.name}
                    </p>
                    <p className="mt-0.5 text-2xs text-text-muted">{expected.blurb}</p>
                  </div>

                  {state === 'loading' ? (
                    <Skeleton className="h-4 w-16 shrink-0" />
                  ) : (
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                      <span
                        className={`text-2xs font-semibold uppercase tracking-[0.06em] ${style.text}`}
                      >
                        {style.label}
                      </span>
                    </span>
                  )}
                </div>

                {state === 'ready' && (
                  <p className="mt-2 truncate text-2xs text-text-muted">
                    {agent
                      ? (agent.detail ??
                        (agent.handledToday !== null
                          ? `${formatCount(agent.handledToday)} handled today`
                          : NO_VALUE))
                      : 'Not reported by the API'}
                  </p>
                )}
              </div>
            );
          })}

          {extras.map((agent) => {
            const style = STATUS_STYLES[agent.status];
            return (
              <div
                key={`extra-${agent.key}`}
                className="rounded-lg border border-border-subtle bg-white/[0.02] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-text-primary">{agent.name}</p>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <span
                      className={`text-2xs font-semibold uppercase tracking-[0.06em] ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </span>
                </div>
                <p className="mt-2 truncate text-2xs text-text-muted">
                  {agent.detail ?? NO_VALUE}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
