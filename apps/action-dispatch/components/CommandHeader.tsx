'use client';

import { BUSINESS_NAME, OPERATING_STATUS, SEED_NOTICE } from '@/lib/seed';
import { formatCents } from '@/lib/format';
import { Metric } from './ui';
import { useDesk } from './DispatchProvider';

export function CommandHeader() {
  const { metrics } = useDesk();

  return (
    <header className="border-b border-white/10 bg-smoked/80 px-4 py-4 pt-[calc(1rem+var(--safe-top))] sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ice">WISE² Home Services</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-snow sm:text-3xl">
            AI Action & Dispatch Center
          </h1>
          <p className="mt-1 text-sm text-chrome">
            {BUSINESS_NAME} · {OPERATING_STATUS}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-amber/40 bg-amber/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">
          Simulation
        </span>
      </div>
      <p className="mt-3 max-w-3xl text-xs text-chrome/80">{SEED_NOTICE}</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Metric label="Urgent" value={String(metrics.urgentItems)} tone="text-critical" />
        <Metric label="Unbooked" value={String(metrics.unbookedOpportunities)} tone="text-emerald" />
        <Metric label="Callbacks" value={String(metrics.callbacksDue)} tone="text-amber" />
        <Metric label="Scheduled value" value={formatCents(metrics.scheduledValueCents)} tone="text-ice" />
      </div>
    </header>
  );
}
