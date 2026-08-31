'use client';

import { Search } from 'lucide-react';
import { FILTERS } from '@/lib/brand-tokens';
import { conversationAge, formatOpportunity, formatPhone, rankLabel } from '@/lib/format';
import { emptyQueueMessage } from '@/lib/conversations/queue';
import { SIMULATION_NOW } from '@/lib/seed';
import type { QueueItem } from '@/lib/types';
import { Badge, bandTone } from './ui';
import { useDesk } from './DispatchProvider';

function reason(item: QueueItem): string {
  const top = [...item.assessment.factors].sort((a, b) => Math.abs(b.points) - Math.abs(a.points))[0];
  return top ? `${top.label} (${top.points > 0 ? '+' : ''}${top.points})` : 'No scoring factors';
}

export function PriorityQueue({ onOpenDetail }: { onOpenDetail?: () => void }) {
  const { queue, state, selected, select, setFilter, setSearch } = useDesk();

  return (
    <section aria-labelledby="queue-heading" className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <h2 id="queue-heading" className="font-display text-lg font-semibold">
          Priority queue
        </h2>
        <span className="text-xs text-chrome">{queue.length} shown</span>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-5" role="tablist" aria-label="Queue filters">
        {FILTERS.map((filter) => {
          const active = state.filter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(filter.id)}
              className={`touch-target shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                active ? 'bg-ice text-carbon' : 'border border-white/10 text-chrome hover:border-ice/40'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <label className="mx-4 mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-steel/70 px-3 sm:mx-5">
        <Search size={16} className="text-chrome" aria-hidden="true" />
        <span className="sr-only">Search conversations</span>
        <input
          value={state.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Customer, phone, address, issue, equipment"
          className="touch-target w-full bg-transparent text-sm text-snow placeholder:text-chrome/60 focus:outline-none"
        />
      </label>

      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-24 sm:px-5 lg:pb-6">
        {queue.length === 0 ? (
          <li className="glass rounded-2xl p-5 text-sm text-chrome">{emptyQueueMessage(state.filter, state.search)}</li>
        ) : (
          queue.map((item) => {
            const active = selected?.conversation.id === item.conversation.id;
            return (
              <li key={item.conversation.id}>
                <button
                  type="button"
                  onClick={() => {
                    select(item.conversation.id);
                    onOpenDetail?.();
                  }}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    active ? 'border-ice bg-ice/10 shadow-ice' : 'border-white/10 bg-smoked/70 hover:border-ice/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm text-chrome">P{rankLabel(item.rank)}</span>
                      <Badge tone={bandTone(item.assessment.band)}>{item.assessment.band}</Badge>
                      <Badge tone="chrome">{item.conversation.status.replace('_', ' ')}</Badge>
                    </div>
                    <span className="text-xs text-chrome">
                      {conversationAge(item.conversation.receivedAt, SIMULATION_NOW)} · {item.conversation.channel}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-snow">{item.customer.name}</p>
                  <p className="text-xs text-chrome">{item.location?.address ?? 'Location unavailable'}</p>
                  <p className="mt-1 text-sm text-snow">{item.conversation.issue}</p>
                  <p className="text-xs text-chrome">{item.equipment?.category ?? 'Equipment unavailable'}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-emerald">
                      {item.opportunity
                        ? formatOpportunity(item.opportunity.lowEstimate, item.opportunity.highEstimate)
                        : 'Opportunity unavailable'}
                    </span>
                    <span className="text-violet">{reason(item)}</span>
                  </div>
                  <p className="sr-only">{formatPhone(item.customer.phone)}</p>
                </button>
              </li>
            );
          })
        )}
      </ol>
    </section>
  );
}
