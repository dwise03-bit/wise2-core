'use client';

import { useState } from 'react';
import { AlertTriangle, CalendarClock, Repeat, TrendingUp } from 'lucide-react';
import { Badge, Button, DemoAction, Panel, Progress, SectionHead } from '@/components/ui/kit';
import { PROPERTIES } from '@/lib/data/seed';
import { compactMoney, daysBetween, longDate, money, shortDate } from '@/lib/metrics';
import { TODAY } from '@/lib/data/seed';

export default function ContractsPage() {
  const [tab, setTab] = useState<'all' | 'renewals' | 'risk' | 'expansion'>('all');

  const active = PROPERTIES.filter((p) => p.frequency !== 'One-Time');
  const acv = active.reduce((s, p) => s + p.contractValue, 0);
  const mrr = Math.round(acv / 12);
  const atRisk = active.filter((p) => p.risk !== 'healthy');
  const renewals = active
    .filter((p) => daysBetween(TODAY, p.contractEnd) <= 180)
    .sort((a, b) => a.contractEnd.localeCompare(b.contractEnd));
  const upcoming = active
    .filter((p) => p.nextService !== '—')
    .sort((a, b) => a.nextService.localeCompare(b.nextService));
  const expansionValue = PROPERTIES.reduce((s, p) => s + p.expansion.length * 7400, 0);

  const shown =
    tab === 'renewals' ? renewals : tab === 'risk' ? atRisk : tab === 'expansion' ? PROPERTIES : active;

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Recurring Contract Engine
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Capacity follows contracts. Protecting recurring revenue is cheaper than replacing it.
        </p>
      </div>

      <div data-tour="contracts" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          ['Active Contracts', String(active.length), '#22B8FF'],
          ['Annual Contract Value', money(acv), '#7CFF3D'],
          ['Monthly Recurring', money(mrr), '#7CFF3D'],
          ['Renewals ≤ 180 days', String(renewals.length), '#FFB020'],
          ['Contracts At Risk', String(atRisk.length), '#FF4D5E'],
          ['Expansion Surface', compactMoney(expansionValue), '#A66BFF'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <SectionHead title="Upcoming Services" sub="The recurring calendar that keeps the crew booked" />
          <div className="space-y-2">
            {upcoming.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <CalendarClock className="h-4 w-4 shrink-0 text-gd-electric" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                  <p className="text-[11px] text-gd-steel">
                    {p.frequency} · last {shortDate(p.lastService)}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-gd-neon">
                  {shortDate(p.nextService)}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="border-gd-amber/20 p-5">
          <SectionHead title="Renewals" sub="Contracts inside the 180-day window" />
          <div className="space-y-2">
            {renewals.map((p) => {
              const days = daysBetween(TODAY, p.contractEnd);
              return (
                <div
                  key={p.id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                    <Badge tone={days < 30 ? 'red' : days < 90 ? 'amber' : 'steel'}>
                      {days}d left
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-gd-steel">
                    Ends {longDate(p.contractEnd)} · {money(p.contractValue)}/yr
                  </p>
                  <div className="mt-1.5">
                    <Progress
                      value={Math.max(4, 100 - (days / 180) * 100)}
                      color={days < 30 ? '#FF4D5E' : '#FFB020'}
                      height={3}
                    />
                  </div>
                </div>
              );
            })}
            {!renewals.length && (
              <p className="py-6 text-center text-sm text-gd-steel">No renewals in window.</p>
            )}
          </div>
        </Panel>

        <Panel className="border-gd-red/20 p-5">
          <SectionHead title="Needs Attention" sub="Properties where the relationship is drifting" />
          <div className="space-y-2">
            {atRisk.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-gd-red/20 bg-gd-red/[0.05] px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-gd-red" />
                  <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                  <Badge tone={p.risk === 'at_risk' ? 'red' : 'amber'} className="ml-auto">
                    {p.risk === 'at_risk' ? 'At Risk' : 'Watch'}
                  </Badge>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-gd-steel">{p.notes}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Expansion engine */}
      <Panel className="p-5">
        <SectionHead
          title="Expansion Opportunities"
          sub="One property starts with building washing. Every other surface is already on the site."
          right={
            <div className="flex gap-1.5">
              {(['all', 'expansion'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    tab === t
                      ? 'border-gd-violet/45 bg-gd-violet/15 text-gd-violet'
                      : 'border-white/10 text-gd-steel hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'Active Contracts' : 'All Properties'}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const onProgram = p.services.length;
            const off = p.expansion.length;
            const coverage = (onProgram / (onProgram + off)) * 100;
            return (
              <Panel key={p.id} interactive className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-extrabold text-white">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-gd-steel">
                      {p.managementCompany.replace(/^\*/, '')}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-sm font-black text-gd-neon">
                    {p.contractValue ? compactMoney(p.contractValue) : 'One-time'}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gd-steel">
                    <span>Property coverage</span>
                    <span className="font-mono">{Math.round(coverage)}%</span>
                  </div>
                  <div className="mt-1.5">
                    <Progress value={coverage} color="#7CFF3D" height={5} />
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gd-neon">
                    On program ({onProgram})
                  </p>
                  <p className="text-[11px] leading-relaxed text-gd-chrome">
                    {p.services.join(' · ')}
                  </p>
                </div>

                <div className="mt-3 space-y-1 border-t border-white/[0.06] pt-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gd-violet">
                    <TrendingUp className="h-3 w-3" /> Not yet sold ({off})
                  </p>
                  <p className="text-[11px] leading-relaxed text-gd-steel">
                    {p.expansion.join(' · ')}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Repeat className="h-3 w-3" /> Build expansion quote
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <DemoAction />
          <span className="text-[11px] text-gd-steel">
            Expansion values are illustrative estimates based on typical scope, not quoted prices.
          </span>
        </div>
      </Panel>
    </div>
  );
}
