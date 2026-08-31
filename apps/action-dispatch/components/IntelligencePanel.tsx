'use client';

import { Pause, Play } from 'lucide-react';
import { ACTION_TYPES } from '@/lib/types';
import { ACTION_LABELS } from '@/lib/recommend';
import { formatPhone, formatStamp, formatOpportunity } from '@/lib/format';
import { Badge, Button } from './ui';
import { useDesk } from './DispatchProvider';

export function IntelligencePanel({ onBack }: { onBack?: () => void }) {
  const { selected, state, requestAction, complete, defer, toggleAudio } = useDesk();

  if (!selected) {
    return (
      <aside aria-label="Conversation intelligence" className="hidden border-l border-white/10 lg:flex lg:flex-1 lg:items-center lg:justify-center">
        <p className="max-w-sm px-6 text-center text-sm text-chrome">
          Select a queue item to review the customer statement, scoring factors, equipment history, and recommended action.
        </p>
      </aside>
    );
  }

  const { conversation, customer, location, equipment, opportunity, assessment, recommended, serviceHistory, audit } =
    selected;

  return (
    <aside
      aria-label="Conversation intelligence"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto border-white/10 px-4 pb-[calc(7rem+var(--safe-bottom))] pt-4 sm:px-6 lg:border-l lg:pb-8"
    >
      {onBack ? (
        <Button variant="ghost" className="mb-3 self-start lg:hidden" onClick={onBack}>
          Back to queue
        </Button>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="violet">IMP Intelligence</Badge>
        <Badge tone={assessment.band}>{assessment.band} {assessment.score}</Badge>
        <Badge tone="chrome">{conversation.status.replace('_', ' ')}</Badge>
      </div>

      <h2 className="mt-3 font-display text-2xl font-semibold">{customer.name}</h2>
      <p className="text-sm text-chrome">
        {formatPhone(customer.phone)} · {location?.address ?? 'Location unavailable'}
      </p>

      <section className="mt-5 space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chrome">Customer statement</h3>
        <blockquote className="glass rounded-2xl p-4 text-snow">“{conversation.customerStatement}”</blockquote>
      </section>

      <section className="mt-5 space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet">IMP summary</h3>
        <p className="text-sm text-chrome">{conversation.summary}</p>
        {assessment.factors.some((factor) => factor.code === 'immediate_safety') ? (
          <p className="rounded-2xl border border-critical/40 bg-critical/10 p-3 text-sm text-critical">
            Safety language detected. Recommend human escalation. WISE² is not an emergency-service provider.
          </p>
        ) : null}
      </section>

      <section className="mt-5 space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chrome">Scoring factors</h3>
        <ul className="space-y-1.5">
          {assessment.factors.map((factor) => (
            <li key={factor.code} className="flex items-center justify-between rounded-xl bg-steel/80 px-3 py-2 text-sm">
              <span>{factor.label}</span>
              <span className={factor.points < 0 ? 'text-chrome' : factor.points >= 20 ? 'text-critical' : 'text-ice'}>
                {factor.points > 0 ? '+' : ''}
                {factor.points}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-chrome">Rules {assessment.rulesVersion}. Decision support only.</p>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="glass rounded-2xl p-3">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-chrome">Customer</h3>
          <p className="mt-1 text-sm">{customer.email ?? 'Email unavailable'}</p>
          <p className="text-xs text-chrome">{customer.flags.join(' · ') || 'No flags'}</p>
        </div>
        <div className="glass rounded-2xl p-3">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-chrome">Property</h3>
          <p className="mt-1 text-sm">{location?.indoorCondition ?? 'Indoor condition unavailable'}</p>
          <p className="text-xs text-chrome">{location?.accessNotes ?? 'Access notes unavailable'}</p>
        </div>
        <div className="glass rounded-2xl p-3 sm:col-span-2">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-chrome">Equipment</h3>
          <p className="mt-1 text-sm">
            {equipment?.manufacturer ?? 'Manufacturer unavailable'} {equipment?.model ?? ''}
          </p>
          <p className="text-xs text-chrome">
            {equipment?.category ?? 'Category unavailable'} · {equipment?.ageYears != null ? `${equipment.ageYears} yr` : 'Age unavailable'} ·{' '}
            {equipment?.warrantyStatus ?? 'Warranty unavailable'}
          </p>
        </div>
      </section>

      <section className="mt-5 space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chrome">Service history</h3>
        {serviceHistory.length === 0 ? (
          <p className="text-sm text-chrome">Service history unavailable.</p>
        ) : (
          <ul className="space-y-2">
            {serviceHistory.map((event) => (
              <li key={event.id} className="rounded-2xl border border-white/10 px-3 py-2">
                <p className="text-xs text-chrome">{formatStamp(event.occurredAt)} · {event.type}</p>
                <p className="text-sm">{event.summary}</p>
                <p className="text-xs text-chrome">{event.outcome}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5 space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">Opportunity</h3>
        <p className="text-lg font-semibold text-emerald">
          {opportunity ? formatOpportunity(opportunity.lowEstimate, opportunity.highEstimate) : 'Unavailable'}
        </p>
        <p className="text-xs text-chrome">
          {opportunity ? `${opportunity.confidence} confidence · simulated range` : 'No estimate on file'}
        </p>
      </section>

      <section className="mt-5 space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chrome">Transcript</h3>
        <div className="glass flex items-center gap-3 rounded-2xl p-3">
          <Button variant="ice" onClick={toggleAudio} aria-pressed={state.audioPlaying}>
            {state.audioPlaying ? <Pause size={16} /> : <Play size={16} />}
            {state.audioPlaying ? 'Pause simulated audio' : 'Play simulated audio'}
          </Button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full bg-ice" style={{ width: `${Math.round(state.audioProgress * 100)}%` }} />
          </div>
        </div>
        <ol className="space-y-2">
          {conversation.transcript.map((line, index) => (
            <li key={`${line.at}-${index}`} className="text-sm">
              <span className="text-[11px] uppercase tracking-[0.14em] text-chrome">{line.speaker}</span>
              <p className="text-snow">{line.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ice">Recommended next action</h3>
        <div className="rounded-2xl border border-ice/30 bg-ice/10 p-4">
          <p className="font-semibold text-ice">{recommended.label}</p>
          <p className="mt-1 text-sm text-chrome">{recommended.rationale}</p>
        </div>
        <div className="hidden flex-wrap gap-2 lg:flex">
          {ACTION_TYPES.map((type) => (
            <Button key={type} variant={type === recommended.type ? 'ice' : 'ghost'} onClick={() => requestAction(type)}>
              {ACTION_LABELS[type]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="chrome" onClick={complete}>
            Complete
          </Button>
          <Button variant="chrome" onClick={defer}>
            Defer
          </Button>
        </div>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chrome">Audit timeline</h3>
        {audit.length === 0 ? (
          <p className="text-sm text-chrome">No audit events yet.</p>
        ) : (
          <ol className="space-y-2">
            {audit.map((event) => (
              <li key={event.id} className="text-sm">
                <p className="text-xs text-chrome">{formatStamp(event.timestamp)} · {event.actor}</p>
                <p>{event.action}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-[calc(3.5rem+var(--safe-bottom))] z-30 border-t border-white/10 bg-smoked/95 px-4 py-3 lg:hidden">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => requestAction(recommended.type)}>
            {recommended.label}
          </Button>
          <MoreActions onChoose={requestAction} recommended={recommended.type} />
        </div>
      </div>
    </aside>
  );
}

function MoreActions({
  onChoose,
  recommended,
}: {
  onChoose: (type: (typeof ACTION_TYPES)[number]) => void;
  recommended: (typeof ACTION_TYPES)[number];
}) {
  return (
    <details className="relative">
      <summary className="touch-target flex list-none items-center rounded-full border border-white/15 px-4 text-sm font-semibold">
        More actions
      </summary>
      <div className="absolute bottom-12 right-0 z-40 w-44 rounded-2xl border border-white/10 bg-steel p-2">
        {ACTION_TYPES.filter((type) => type !== recommended).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChoose(type)}
            className="touch-target flex w-full items-center rounded-xl px-3 text-left text-sm hover:bg-white/5"
          >
            {ACTION_LABELS[type]}
          </button>
        ))}
      </div>
    </details>
  );
}
