'use client';

import { useMemo, useState } from 'react';
import { Building2, Filter, GripVertical, Home, Lightbulb, Phone } from 'lucide-react';
import { Badge, Drawer, Field, Panel, Progress, SectionHead, Button, DemoAction } from '@/components/ui/kit';
import { OPPORTUNITIES } from '@/lib/data/seed';
import type { Opportunity, PipelineStage } from '@/lib/data/types';
import { STAGE_META, compactMoney, money, shortDate } from '@/lib/metrics';

const ORDER: PipelineStage[] = [
  'new',
  'contacted',
  'site_visit',
  'estimate_sent',
  'follow_up',
  'won',
  'scheduled',
  'completed',
  'lost',
];

export default function LeadsPage() {
  const [opps, setOpps] = useState<Opportunity[]>(OPPORTUNITIES);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hotStage, setHotStage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [engineFilter, setEngineFilter] = useState<'all' | 'multifamily' | 'lighting'>('all');

  const visible = useMemo(
    () => (engineFilter === 'all' ? opps : opps.filter((o) => o.engine === engineFilter)),
    [opps, engineFilter],
  );

  const move = (id: string, stage: PipelineStage) => {
    setOpps((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              stage,
              probability:
                stage === 'won' || stage === 'scheduled'
                  ? 95
                  : stage === 'completed'
                    ? 100
                    : stage === 'lost'
                      ? 0
                      : o.probability,
            }
          : o,
      ),
    );
  };

  const totalOpen = visible
    .filter((o) => !['completed', 'lost'].includes(o.stage))
    .reduce((s, o) => s + o.value, 0);

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Sales Pipeline
          </h1>
          <p className="mt-1 text-sm text-gd-steel">
            {visible.length} opportunities · {money(totalOpen)} open · drag a card to move the deal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gd-steel" />
          {(['all', 'multifamily', 'lighting'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setEngineFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                engineFilter === f
                  ? 'border-gd-electric/45 bg-gd-electric/15 text-gd-electric'
                  : 'border-white/10 text-gd-steel hover:bg-white/5 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Both Engines' : f === 'multifamily' ? 'Engine A · Multifamily' : 'Engine B · Lighting'}
            </button>
          ))}
        </div>
      </div>

      <div data-tour="pipeline" className="overflow-x-auto pb-3">
        <div className="flex min-w-max gap-3">
          {ORDER.map((stage) => {
            const meta = STAGE_META[stage];
            const items = visible.filter((o) => o.stage === stage);
            const value = items.reduce((s, o) => s + o.value, 0);
            return (
              <div
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHotStage(stage);
                }}
                onDragLeave={() => setHotStage((s) => (s === stage ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  // Payload rides on the drag event so the drop never depends on
                  // a React state update having already flushed.
                  const id = e.dataTransfer.getData('text/plain') || dragId;
                  if (id) move(id, stage);
                  setDragId(null);
                  setHotStage(null);
                }}
                className={`w-[268px] shrink-0 rounded-xl border border-gd-line bg-gd-hull/50 p-2.5 transition-all ${
                  hotStage === stage ? 'stage-hot' : ''
                }`}
              >
                <div className="mb-2.5 px-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display text-[11px] font-extrabold uppercase tracking-[0.1em]"
                      style={{ color: meta.accent }}
                    >
                      {meta.label}
                    </span>
                    <span className="font-mono text-[11px] text-gd-steel">{items.length}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-gd-steel/70">{meta.hint}</span>
                    <span className="font-mono text-[11px] font-bold text-white">
                      {compactMoney(value)}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, ${meta.accent}, transparent)` }}
                  />
                </div>

                <div className="max-h-[calc(100vh-330px)] space-y-2 overflow-y-auto pr-0.5">
                  {items.map((o) => (
                    <article
                      key={o.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', o.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDragId(o.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setHotStage(null);
                      }}
                      onClick={() => setSelected(o)}
                      className={`gd-panel gd-panel-hover cursor-grab rounded-lg p-3 active:cursor-grabbing ${
                        dragId === o.id ? 'drag-ghost' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gd-steel/50" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold leading-tight text-white">
                            {o.customer.replace(/^\*/, '')}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gd-steel">
                            {o.engine === 'lighting' ? (
                              <Lightbulb className="h-3 w-3 shrink-0 text-gd-violet" />
                            ) : (
                              <Building2 className="h-3 w-3 shrink-0 text-gd-electric" />
                            )}
                            {o.property}
                          </p>
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-gd-chrome">
                        {o.service}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="font-display text-sm font-black text-gd-neon">
                          {money(o.value)}
                        </span>
                        <Badge tone={o.engine === 'lighting' ? 'violet' : 'electric'}>
                          {o.source}
                        </Badge>
                      </div>

                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] text-gd-steel">
                          <span>Probability</span>
                          <span className="font-mono">{o.probability}%</span>
                        </div>
                        <div className="mt-1">
                          <Progress value={o.probability} color={meta.accent} height={3} />
                        </div>
                      </div>

                      <div className="mt-2.5 border-t border-white/[0.06] pt-2">
                        <p className="truncate text-[10px] text-gd-steel">
                          <span className="font-bold uppercase tracking-wider text-gd-chrome">
                            Next:
                          </span>{' '}
                          {o.nextAction}
                        </p>
                        <p className="mt-1 flex items-center justify-between text-[10px] text-gd-steel/70">
                          <span className="truncate">{o.owner}</span>
                          <span className="shrink-0">{shortDate(o.lastContact)}</span>
                        </p>
                      </div>
                    </article>
                  ))}
                  {!items.length && (
                    <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-gd-steel/60">
                      Drop a card here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.customer.replace(/^\*/, '') ?? ''}
        subtitle={selected ? `${selected.property} · ${selected.service}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <Panel className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">Value</p>
                <p className="mt-1 font-display text-xl font-black text-gd-neon">
                  {money(selected.value)}
                </p>
              </Panel>
              <Panel className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">Probability</p>
                <p className="mt-1 font-display text-xl font-black text-white">
                  {selected.probability}%
                </p>
              </Panel>
              <Panel className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">Weighted</p>
                <p className="mt-1 font-display text-xl font-black text-gd-electric">
                  {money((selected.value * selected.probability) / 100)}
                </p>
              </Panel>
            </div>

            <div>
              <Field label="Stage" value={STAGE_META[selected.stage].label} />
              <Field label="Revenue Engine" value={selected.engine === 'lighting' ? 'Engine B — Permanent Lighting' : 'Engine A — Multifamily / Commercial'} />
              <Field label="Property" value={selected.property} />
              <Field label="Service" value={selected.service} />
              <Field label="Lead Source" value={selected.source} />
              <Field label="Assigned To" value={selected.owner} />
              <Field label="Last Contact" value={shortDate(selected.lastContact)} />
              <Field label="Next Action" value={<span className="text-gd-neon">{selected.nextAction}</span>} />
              <Field label="Notes" value={selected.notes} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="neon"><Phone className="h-3.5 w-3.5" /> Log Call</Button>
              <Button variant="primary">Build Estimate</Button>
              <Button variant="ghost">Schedule Site Visit</Button>
              <DemoAction />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gd-line bg-gd-hull/60 px-3 py-2.5 text-[11px] text-gd-steel">
              <Home className="h-3.5 w-3.5 shrink-0" />
              Moving this card between stages updates the pipeline for this session only. Demo data
              resets on reload.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
