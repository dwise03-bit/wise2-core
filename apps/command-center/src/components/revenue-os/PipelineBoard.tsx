'use client';

import React from 'react';
import Link from 'next/link';
import { ErrorState, Panel, Skeleton } from './States';
import { formatCount, formatCurrency, NO_VALUE } from './format';
import { PIPELINE_STAGES, PipelineColumn } from './types';

const STAGE_ACCENT: Record<string, string> = {
  NEW: 'bg-wise-electric',
  CONTACTING: 'bg-info',
  QUALIFIED: 'bg-warning',
  BOOKED: 'bg-wise-neon',
  ESTIMATE: 'bg-wise-lime',
  WON: 'bg-success',
  COMPLETED: 'bg-text-muted',
};

interface PipelineBoardProps {
  columns: PipelineColumn[] | null;
  state: 'loading' | 'ready' | 'error';
  onRetry?: () => void;
}

/**
 * Seven-stage pipeline. Scrolls horizontally on narrow screens rather than
 * collapsing, so the stage order stays readable on a phone.
 */
export const PipelineBoard: React.FC<PipelineBoardProps> = ({ columns, state, onRetry }) => (
  <Panel
    title="Pipeline"
    subtitle="Lead flow from first contact through completed job"
    action={
      <Link
        href="/revenue-os/leads"
        className="text-xs font-semibold text-wise-electric hover:text-wise-electric/80"
      >
        View leads →
      </Link>
    }
  >
    {state === 'error' ? (
      <ErrorState
        message="The pipeline endpoint did not respond, so no stage counts are shown."
        hint="GET /api/revenue-os/leads/pipeline"
        onRetry={onRetry}
      />
    ) : (
      <div className="overflow-x-auto p-4">
        <div className="flex min-w-max gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const col = columns?.find((c) => c.stage === stage) ?? null;
            const empty = state === 'ready' && (col === null || col.count === null || col.count === 0);

            return (
              <div
                key={stage}
                className="w-[132px] shrink-0 rounded-lg border border-border-subtle bg-white/[0.02] p-3 md:w-[150px]"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${STAGE_ACCENT[stage]}`} />
                  <span className="text-2xs font-semibold uppercase tracking-[0.06em] text-text-muted">
                    {stage}
                  </span>
                </div>

                {state === 'loading' ? (
                  <>
                    <Skeleton className="mt-3 h-6 w-10" />
                    <Skeleton className="mt-2 h-3 w-16" />
                  </>
                ) : (
                  <>
                    <p
                      className={`mt-2 text-2xl font-bold tabular-nums ${
                        empty ? 'text-text-muted' : 'text-text-primary'
                      }`}
                    >
                      {formatCount(col?.count ?? null)}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {col?.value === null || col?.value === undefined
                        ? NO_VALUE
                        : formatCurrency(col.value)}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </Panel>
);
