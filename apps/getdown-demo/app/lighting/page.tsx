'use client';

import { useState } from 'react';
import { CalendarRange, Lightbulb, Ruler, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge, Button, DemoAction, Drawer, Field, Panel, Progress, SectionHead } from '@/components/ui/kit';
import { CAMPAIGNS, LIGHTING } from '@/lib/data/seed';
import type { LightingOpportunity } from '@/lib/data/types';
import { compactMoney, longDate, money } from '@/lib/metrics';

const STAGES: { id: LightingOpportunity['stage']; label: string; accent: string }[] = [
  { id: 'lead', label: 'Lighting Lead', accent: '#22B8FF' },
  { id: 'site_assessment', label: 'Site Assessment', accent: '#A66BFF' },
  { id: 'proposal', label: 'Proposal', accent: '#FFB020' },
  { id: 'design_selection', label: 'Color / Design Selection', accent: '#FF7AD9' },
  { id: 'scheduled', label: 'Installation Scheduled', accent: '#5EE0A8' },
  { id: 'installed', label: 'Installed', accent: '#7CFF3D' },
];

export default function LightingPage() {
  const [opps, setOpps] = useState(LIGHTING);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null);
  const [selected, setSelected] = useState<LightingOpportunity | null>(null);

  const pipeline = opps.filter((o) => o.stage !== 'installed').reduce((s, o) => s + o.price, 0);
  const totalFeet = opps.reduce((s, o) => s + o.linearFeet, 0);

  const move = (id: string, stage: LightingOpportunity['stage']) =>
    setOpps((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-gd-violet">
          Engine B · Residential / Seasonal Division
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-black uppercase tracking-tight text-white">
          Premium Permanent Lighting
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Architectural-quality installations. Not a temporary kit — a permanent upgrade, sold
          year-round across six campaigns.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ['Open Pipeline', money(pipeline), '#A66BFF'],
          ['Opportunities', String(opps.filter((o) => o.stage !== 'installed').length), '#22B8FF'],
          ['Linear Feet Quoted', totalFeet.toLocaleString(), '#C9D4E0'],
          ['Installs Scheduled', String(opps.filter((o) => o.stage === 'scheduled').length), '#5EE0A8'],
          ['Live Campaigns', String(CAMPAIGNS.length), '#7CFF3D'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      {/* ── Campaigns ───────────────────────────────────── */}
      <Panel className="p-5">
        <SectionHead
          title="Seasonal Campaigns"
          sub="Premeditated success — film early, edit early, build pages, schedule before demand arrives."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {CAMPAIGNS.map((c) => (
            <div
              key={c.name}
              className="group overflow-hidden rounded-xl border border-gd-line transition-all hover:border-white/25"
            >
              <div className="relative h-24" style={{ background: c.tone }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-2 left-3 font-display text-xs font-black uppercase tracking-wider text-white">
                  {c.name}
                </p>
              </div>
              <div className="space-y-2 p-3">
                <p className="text-[10px] leading-snug text-gd-steel">{c.window}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gd-steel">Pipeline</span>
                  <span className="font-mono text-gd-neon">{compactMoney(c.pipeline)}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-gd-steel">
                    <span>Booked</span>
                    <span className="font-mono">
                      {c.booked} / {c.target}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Progress value={(c.booked / c.target) * 100} color="#A66BFF" height={3} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-gd-steel">
          The lighting division operates year-round — security and accent lighting carry the months
          between holidays.
        </p>
      </Panel>

      {/* ── Pipeline ────────────────────────────────────── */}
      <div data-tour="lighting" className="overflow-x-auto pb-3">
        <div className="flex min-w-max gap-3">
          {STAGES.map((s) => {
            const items = opps.filter((o) => o.stage === s.id);
            return (
              <div
                key={s.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHot(s.id);
                }}
                onDragLeave={() => setHot((x) => (x === s.id ? null : x))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain') || dragId;
                  if (id) move(id, s.id);
                  setDragId(null);
                  setHot(null);
                }}
                className={`w-[264px] shrink-0 rounded-xl border border-gd-line bg-gd-hull/50 p-2.5 ${
                  hot === s.id ? 'stage-hot' : ''
                }`}
              >
                <div className="mb-2.5 px-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display text-[11px] font-extrabold uppercase tracking-[0.1em]"
                      style={{ color: s.accent }}
                    >
                      {s.label}
                    </span>
                    <span className="font-mono text-[11px] text-gd-steel">{items.length}</span>
                  </div>
                  <div
                    className="mt-1.5 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, ${s.accent}, transparent)` }}
                  />
                </div>
                <div className="space-y-2">
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
                        setHot(null);
                      }}
                      onClick={() => setSelected(o)}
                      className={`gd-panel gd-panel-hover cursor-grab rounded-lg p-3 active:cursor-grabbing ${
                        dragId === o.id ? 'drag-ghost' : ''
                      }`}
                    >
                      <p className="truncate text-[13px] font-bold text-white">
                        {o.customer.replace(/^\*/, '')}
                      </p>
                      <p className="truncate text-[11px] text-gd-steel">
                        {o.property} · {o.city}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-display text-sm font-black text-gd-violet">
                          {money(o.price)}
                        </span>
                        {o.linearFeet > 0 && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-gd-steel">
                            <Ruler className="h-3 w-3" /> {o.linearFeet} lf
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <Badge tone="violet">{o.campaign}</Badge>
                      </div>
                    </article>
                  ))}
                  {!items.length && (
                    <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-gd-steel/60">
                      Drop here
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
        subtitle={selected ? `${selected.property} · ${selected.city}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Install Price', money(selected.price), '#A66BFF'],
                ['Linear Feet', selected.linearFeet ? `${selected.linearFeet} lf` : '—', '#22B8FF'],
                ['Stage', STAGES.find((s) => s.id === selected.stage)?.label ?? '', '#7CFF3D'],
              ].map(([l, v, c]) => (
                <Panel key={l} className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gd-steel">{l}</p>
                  <p className="mt-1 font-display text-base font-black" style={{ color: c }}>
                    {v}
                  </p>
                </Panel>
              ))}
            </div>
            <div>
              <Field label="Seasonal Campaign Source" value={selected.campaign} />
              <Field label="Lead Source" value={selected.source} />
              <Field label="Materials" value={selected.materials} />
              <Field
                label="Warranty"
                value={
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-gd-neon" /> {selected.warranty}
                  </span>
                }
              />
              <Field label="Install Date" value={selected.installDate ? longDate(selected.installDate) : 'Not scheduled'} />
              <Field label="Crew" value={selected.crew ?? 'Not assigned'} />
              <Field
                label="Upsell Opportunities"
                value={
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selected.upsell.map((u) => (
                      <Badge key={u} tone="neon">
                        {u}
                      </Badge>
                    ))}
                  </div>
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary"><CalendarRange className="h-3.5 w-3.5" /> Schedule Assessment</Button>
              <Button variant="neon"><Sparkles className="h-3.5 w-3.5" /> Generate Design Mock-Up</Button>
              <Button variant="ghost"><Lightbulb className="h-3.5 w-3.5" /> Send Proposal</Button>
              <DemoAction />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
