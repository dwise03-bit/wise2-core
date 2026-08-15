'use client';

import React from 'react';
import { EmptyState, ErrorState, Panel, Skeleton } from './States';
import { formatCurrency, formatRelativeTime, humanize } from './format';
import { ActivityItem } from './types';

/** Dot colour + label per event kind the Revenue OS emits. */
const KIND_META: Record<string, { dot: string; label: string }> = {
  lead_created: { dot: 'bg-wise-electric', label: 'New lead' },
  ai_contacted: { dot: 'bg-info', label: 'AI contacted' },
  appointment_booked: { dot: 'bg-wise-neon', label: 'Appointment booked' },
  estimate_sent: { dot: 'bg-warning', label: 'Estimate sent' },
  estimate_sold: { dot: 'bg-success', label: 'Estimate sold' },
  job_completed: { dot: 'bg-success', label: 'Job completed' },
  review_requested: { dot: 'bg-wise-lime', label: 'Review requested' },
  membership_sold: { dot: 'bg-wise-purple-ai', label: 'Membership sold' },
  customer_reactivated: { dot: 'bg-wise-chrome', label: 'Customer reactivated' },
};

interface ActivityFeedProps {
  items: ActivityItem[] | null;
  state: 'loading' | 'ready' | 'error';
  onRetry?: () => void;
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, state, onRetry, limit = 20 }) => {
  const rows = items ? items.slice(0, limit) : [];

  return (
    <Panel title="Activity" subtitle="Live stream of revenue events">
      {state === 'loading' && (
        <div className="space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-1 h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state === 'error' && (
        <ErrorState
          message="The activity stream could not be loaded."
          hint="GET /api/revenue-os/attribution"
          onRetry={onRetry}
        />
      )}

      {state === 'ready' && rows.length === 0 && (
        <EmptyState
          title="No activity yet"
          message="Lead, booking, estimate, and job events will stream in here as they happen."
        />
      )}

      {state === 'ready' && rows.length > 0 && (
        <ul className="divide-y divide-border-subtle">
          {rows.map((item) => {
            const meta = KIND_META[item.kind] ?? { dot: 'bg-text-muted', label: humanize(item.kind) };
            return (
              <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
                    {meta.label}
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {item.message || humanize(item.kind)}
                  </p>
                  <p className="mt-1 text-2xs text-text-muted">
                    {formatRelativeTime(item.at)}
                    {item.actor ? ` · ${item.actor}` : ''}
                  </p>
                </div>
                {item.value !== null && (
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-wise-neon">
                    {formatCurrency(item.value)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
};
