'use client';

import { useState } from 'react';
import { CheckCircle2, MessageSquare, Repeat, Send, Star } from 'lucide-react';
import { Badge, Button, DemoAction, Panel, Progress, SectionHead } from '@/components/ui/kit';
import { JOBS, REVIEWS } from '@/lib/data/seed';
import { longDate, ownerMetrics } from '@/lib/metrics';

const m = ownerMetrics();

const FLOW = [
  'Job Completed',
  'Payment',
  'Thank You',
  'Review Request',
  'Review Captured',
  'Referral / Repeat',
];

export default function ReviewsPage() {
  const [requested, setRequested] = useState<string[]>([]);
  const eligible = JOBS.filter((j) => j.status === 'completed');

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: REVIEWS.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Reputation
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Reviews are the compounding asset behind referral and commercial outreach.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ['Average Rating', `${m.avgRating.toFixed(1)} ★`, '#FFB020'],
          ['Total Reviews', String(m.reviewCount), '#22B8FF'],
          ['Reviews This Month', String(REVIEWS.filter((r) => r.date.startsWith('2026-08')).length), '#7CFF3D'],
          ['Pending Requests', String(requested.length), '#A66BFF'],
          ['Eligible Customers', String(eligible.length - requested.length), '#C9D4E0'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      {/* Flow */}
      <Panel className="p-5">
        <SectionHead title="Review Capture Flow" sub="What happens automatically after a job closes" />
        <div className="flex flex-wrap items-center gap-2">
          {FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded-lg border border-gd-line bg-white/[0.02] px-3.5 py-2">
                <span className="font-display text-[11px] font-black uppercase tracking-wider text-white">
                  {s}
                </span>
              </div>
              {i < FLOW.length - 1 && <span className="text-gd-neon">→</span>}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <SectionHead title="Rating Distribution" />
          <div className="space-y-2.5">
            {dist.map((d) => (
              <div key={d.star}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-gd-chrome">
                    {d.star} <Star className="h-3 w-3 fill-gd-amber text-gd-amber" />
                  </span>
                  <span className="font-mono text-gd-steel">{d.count}</span>
                </div>
                <div className="mt-1">
                  <Progress value={(d.count / REVIEWS.length) * 100} color="#FFB020" height={5} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 xl:col-span-2">
          <SectionHead title="Recent Reviews" sub="Customer words that become marketing copy" />
          <div className="space-y-2.5">
            {REVIEWS.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{r.customer}</p>
                    <p className="text-[11px] text-gd-steel">
                      {r.property} · {longDate(r.date)} · {r.platform}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gd-amber">{'★'.repeat(r.rating)}</span>
                    {r.responded ? (
                      <Badge tone="neon">
                        <CheckCircle2 className="h-3 w-3" /> Responded
                      </Badge>
                    ) : (
                      <Badge tone="amber">Needs response</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-gd-chrome">
                  &ldquo;{r.text}&rdquo;
                </p>
                {!r.responded && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <Button variant="primary" size="sm">
                      <MessageSquare className="h-3 w-3" /> Draft Response
                    </Button>
                    <DemoAction label="Approval Required" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <SectionHead
          title="Review Requests"
          sub="Customers whose job is complete and paid — the moment a request performs best"
        />
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {eligible.map((j) => {
            const sent = requested.includes(j.id);
            return (
              <div
                key={j.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {j.customer.replace(/^\*/, '')}
                  </p>
                  <p className="truncate text-[11px] text-gd-steel">
                    {j.property} · {j.service}
                  </p>
                </div>
                <Button
                  variant={sent ? 'ghost' : 'neon'}
                  size="sm"
                  onClick={() => setRequested((p) => (sent ? p : [...p, j.id]))}
                >
                  {sent ? (
                    <>
                      <Repeat className="h-3 w-3" /> Queued
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" /> Request
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-gd-steel">
          Queued requests are held for approval in this demo — no text or email is delivered.
        </p>
      </Panel>
    </div>
  );
}
