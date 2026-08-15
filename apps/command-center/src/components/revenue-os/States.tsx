'use client';

import React from 'react';
import { Button, Card } from '../ui';

/** Shimmering placeholder block. Never contains a number. */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded bg-white/[0.06] ${className}`}
  />
);

export const SkeletonText: React.FC<{ width?: string }> = ({ width = 'w-24' }) => (
  <Skeleton className={`h-3 ${width}`} />
);

/** Card-shaped skeleton used while KPI / panel data is in flight. */
export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 2 }) => (
  <Card className="p-4 md:p-6">
    <div className="space-y-3">
      <Skeleton className="h-3 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === 0 ? 'h-7 w-2/3' : 'h-3 w-1/2'} />
      ))}
    </div>
  </Card>
);

interface PanelProps {
  title?: string;
  message: string;
  hint?: string;
  onRetry?: () => void;
}

/**
 * Shown when the tenant genuinely has no data. Distinct from ErrorState so an
 * empty pipeline never gets mistaken for a broken one.
 */
export const EmptyState: React.FC<PanelProps> = ({ title = 'Nothing here yet', message, hint }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-muted">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-text-secondary">{title}</p>
    <p className="max-w-sm text-xs text-text-muted">{message}</p>
    {hint && <p className="max-w-sm text-xs text-text-muted/70">{hint}</p>}
  </div>
);

/**
 * Shown when the API failed or is not deployed yet. Explicitly says no data was
 * loaded, so the panel can never be read as "the real number is zero".
 */
export const ErrorState: React.FC<PanelProps> = ({
  title = 'Data unavailable',
  message,
  hint,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-danger/40 text-danger">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-text-secondary">{title}</p>
    <p className="max-w-sm text-xs text-text-muted">{message}</p>
    {hint && <p className="max-w-sm text-xs text-text-muted/70">{hint}</p>}
    {onRetry && (
      <div className="pt-2">
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    )}
  </div>
);

interface PanelShellProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Consistent titled panel used by every Revenue OS section. */
export const Panel: React.FC<PanelShellProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => (
  <Card className={className}>
    <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children}
  </Card>
);
