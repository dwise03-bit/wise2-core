'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '../ui';
import { EmptyState, ErrorState, Panel, Skeleton } from './States';
import { formatCurrency, formatRelativeTime, humanize, NO_VALUE } from './format';
import { Lead } from './types';

function stageVariant(stage: Lead['stage']): 'success' | 'warning' | 'info' | 'neutral' {
  switch (stage) {
    case 'WON':
    case 'COMPLETED':
      return 'success';
    case 'BOOKED':
    case 'ESTIMATE':
      return 'info';
    case 'QUALIFIED':
    case 'CONTACTING':
      return 'warning';
    default:
      return 'neutral';
  }
}

interface HotLeadsTableProps {
  leads: Lead[] | null;
  state: 'loading' | 'ready' | 'error';
  onRetry?: () => void;
  /** Limits rows on the overview; omit to show everything. */
  limit?: number;
  title?: string;
  subtitle?: string;
}

/**
 * Hot leads. Renders as a table on desktop (md+) and stacked cards on phones —
 * note this app overrides Tailwind's `sm` to 375px, so `md:` is the real
 * desktop breakpoint here.
 */
export const HotLeadsTable: React.FC<HotLeadsTableProps> = ({
  leads,
  state,
  onRetry,
  limit,
  title = 'Hot Leads',
  subtitle = 'Highest-value opportunities awaiting action',
}) => {
  const rows = leads ? (limit ? leads.slice(0, limit) : leads) : [];

  return (
    <Panel
      title={title}
      subtitle={subtitle}
      action={
        limit ? (
          <Link
            href="/revenue-os/leads"
            className="text-xs font-semibold text-wise-electric hover:text-wise-electric/80"
          >
            All leads →
          </Link>
        ) : undefined
      }
    >
      {state === 'loading' && (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/5" />
              <Skeleton className="h-3 w-1/6" />
              <Skeleton className="ml-auto h-3 w-16" />
            </div>
          ))}
        </div>
      )}

      {state === 'error' && (
        <ErrorState
          message="Leads could not be loaded, so none are listed."
          hint="GET /api/revenue-os/leads"
          onRetry={onRetry}
        />
      )}

      {state === 'ready' && rows.length === 0 && (
        <EmptyState
          title="No leads yet"
          message="New leads will appear here the moment they arrive from any connected channel."
        />
      )}

      {state === 'ready' && rows.length > 0 && (
        <>
          {/* Phone layout: stacked cards. */}
          <ul className="divide-y divide-border-subtle md:hidden">
            {rows.map((lead) => (
              <li key={lead.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {lead.customerName ?? 'Unnamed lead'}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      {lead.serviceNeed ?? NO_VALUE}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-wise-neon">
                    {formatCurrency(lead.opportunityValue)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={stageVariant(lead.stage)}>
                    {lead.stage ? humanize(lead.stage) : 'No stage'}
                  </Badge>
                  <span className="text-2xs text-text-muted">
                    {lead.source ? `via ${lead.source}` : NO_VALUE}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  <span className="text-text-secondary">AI:</span>{' '}
                  {lead.aiStatus ?? NO_VALUE}
                </p>
                <p className="text-xs text-text-muted">
                  <span className="text-text-secondary">Next:</span>{' '}
                  {lead.nextAction ?? NO_VALUE}
                  {lead.nextActionAt ? ` · ${formatRelativeTime(lead.nextActionAt)}` : ''}
                </p>
              </li>
            ))}
          </ul>

          {/* Desktop layout: full table. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="wise-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service Need</th>
                  <th>Source</th>
                  <th>AI Status</th>
                  <th className="text-right">Opportunity</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="font-medium text-text-primary">
                        {lead.customerName ?? 'Unnamed lead'}
                      </div>
                      <div className="mt-1">
                        <Badge variant={stageVariant(lead.stage)}>
                          {lead.stage ? humanize(lead.stage) : 'No stage'}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-text-secondary">{lead.serviceNeed ?? NO_VALUE}</td>
                    <td className="text-text-muted">{lead.source ?? NO_VALUE}</td>
                    <td className="text-text-secondary">
                      {lead.aiStatus ?? NO_VALUE}
                      {lead.aiAgent && (
                        <div className="text-2xs text-text-muted">{lead.aiAgent}</div>
                      )}
                    </td>
                    <td className="text-right font-semibold tabular-nums text-wise-neon">
                      {formatCurrency(lead.opportunityValue)}
                    </td>
                    <td className="text-text-secondary">
                      {lead.nextAction ?? NO_VALUE}
                      {lead.nextActionAt && (
                        <div className="text-2xs text-text-muted">
                          {formatRelativeTime(lead.nextActionAt)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
};
