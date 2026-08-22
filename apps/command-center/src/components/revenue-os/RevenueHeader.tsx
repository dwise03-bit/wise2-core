'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { normalizeAgents } from './normalize';
import { useRevenueData } from './useRevenueData';
import { WorkforceAgent } from './types';

export const REVENUE_TABS: { label: string; href: string }[] = [
  { label: 'Overview', href: '/revenue-os' },
  { label: 'Leads', href: '/revenue-os/leads' },
  { label: 'Customers', href: '/revenue-os/customers' },
  { label: 'Conversations', href: '/revenue-os/conversations' },
  { label: 'Dispatch', href: '/revenue-os/dispatch' },
  { label: 'Estimates', href: '/revenue-os/estimates' },
  { label: 'Agents', href: '/revenue-os/agents' },
  { label: 'Automations', href: '/revenue-os/automations' },
  { label: 'Analytics', href: '/revenue-os/analytics' },
  { label: 'Settings', href: '/revenue-os/settings' },
];

/**
 * AI workforce reachability indicator.
 *
 * Three honest states, never a guess:
 *   ONLINE   — the agents endpoint answered and at least one agent is ONLINE
 *   OFFLINE  — the endpoint answered but nothing is running
 *   UNKNOWN  — the endpoint could not be reached at all
 */
function WorkforceIndicator({
  agents,
  state,
}: {
  agents: WorkforceAgent[] | null;
  state: 'loading' | 'ready' | 'error';
}) {
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-text-muted" />
        <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          AI Workforce · Checking
        </span>
      </div>
    );
  }

  if (state === 'error' || !agents) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-warning" />
        <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-warning">
          AI Workforce · Unknown
        </span>
      </div>
    );
  }

  const online = agents.filter((a) => a.status === 'ONLINE').length;
  const isOnline = online > 0;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
        isOnline
          ? 'border-border-neon bg-wise-neon/10'
          : 'border-border-subtle bg-white/[0.03]'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline ? 'animate-pulse bg-wise-neon' : 'bg-text-muted'
        }`}
      />
      <span
        className={`text-2xs font-semibold uppercase tracking-[0.08em] ${
          isOnline ? 'text-wise-neon' : 'text-text-muted'
        }`}
      >
        AI Workforce · {isOnline ? 'Online' : 'Offline'}
      </span>
      {isOnline && (
        <span className="text-2xs font-medium text-text-muted">
          {online}/{agents.length}
        </span>
      )}
    </div>
  );
}

export const RevenueHeader: React.FC = () => {
  const pathname = usePathname();
  const { data: agents, state } = useRevenueData('/agents', normalizeAgents);

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
            <span className="text-wise-electric">WISE²</span>
            <span aria-hidden="true">/</span>
            <span className="truncate">WISE HVAC Solutions</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-text-primary md:text-2xl">
            Contractor OS
          </h1>
        </div>

        <div className="shrink-0">
          <WorkforceIndicator agents={agents} state={state} />
        </div>
      </div>

      {/* Horizontally scrollable on phones; the tab row never wraps the layout. */}
      <nav
        aria-label="Revenue OS sections"
        className="-mx-1 flex gap-1 overflow-x-auto border-b border-border-subtle px-1 pb-px"
      >
        {REVENUE_TABS.map((tab) => {
          const active =
            tab.href === '/revenue-os'
              ? pathname === '/revenue-os'
              : pathname === tab.href || pathname.startsWith(tab.href + '/');

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? 'border-wise-neon text-wise-neon'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
