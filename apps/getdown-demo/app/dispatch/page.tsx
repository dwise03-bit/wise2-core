'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, MapPin, Users } from 'lucide-react';
import { Badge, DemoAction, Panel, Progress, SectionHead } from '@/components/ui/kit';
import { TerritoryMap, type MapMarker } from '@/components/modules/TerritoryMap';
import { CREW, JOBS, TODAY } from '@/lib/data/seed';
import type { Job } from '@/lib/data/types';
import { JOB_STATUS_META, money } from '@/lib/metrics';

const DAY_START = 6;
const DAY_END = 19;
const HOURS = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);

const label = (h: number) => {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const ampm = hr >= 12 ? 'p' : 'a';
  const d = hr % 12 === 0 ? 12 : hr % 12;
  return min ? `${d}:${String(min).padStart(2, '0')}${ampm}` : `${d}${ampm}`;
};

export default function DispatchPage() {
  const [jobs, setJobs] = useState<Job[]>(JOBS.filter((j) => j.date === TODAY));
  const [dragId, setDragId] = useState<string | null>(null);
  const [hotCrew, setHotCrew] = useState<string | null>(null);
  const [selected, setSelected] = useState<Job | null>(null);

  const unassigned = jobs.filter((j) => j.crewId === null);
  const assign = (jobId: string, crewId: string) =>
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, crewId, status: j.status === 'unassigned' ? 'traveling' : j.status }
          : j,
      ),
    );

  const markers: MapMarker[] = useMemo(
    () =>
      jobs.map((j) => ({
        id: j.id,
        label: j.property,
        sub: j.service,
        lat: j.lat,
        lng: j.lng,
        value: j.value ? money(j.value) : undefined,
        kind:
          j.status === 'completed'
            ? 'completed'
            : j.status === 'in_progress' || j.status === 'arrived'
              ? 'in_progress'
              : j.crewId
                ? 'scheduled'
                : 'lead',
      })),
    [jobs],
  );

  const bookedValue = jobs.reduce((s, j) => s + j.value, 0);

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Schedule &amp; Dispatch
          </h1>
          <p className="mt-1 text-sm text-gd-steel">
            Friday, August 15 · {jobs.length} jobs · {unassigned.length} unassigned ·{' '}
            {money(bookedValue)} on the board
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="amber">Drag an unassigned job onto a crew row</Badge>
          <DemoAction label="Demo Dispatch" />
        </div>
      </div>

      <div data-tour="dispatch" className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* ── Unassigned queue ─────────────────────────── */}
        <Panel className="p-4 xl:col-span-3">
          <SectionHead title="Unassigned" sub={`${unassigned.length} jobs need a crew`} />
          <div className="space-y-2">
            {unassigned.map((j) => (
              <article
                key={j.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', j.id);
                  e.dataTransfer.effectAllowed = 'move';
                  setDragId(j.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setHotCrew(null);
                }}
                onClick={() => setSelected(j)}
                className={`gd-panel gd-panel-hover cursor-grab rounded-lg p-3 active:cursor-grabbing ${
                  dragId === j.id ? 'drag-ghost' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold leading-tight text-white">{j.property}</p>
                  <span className="shrink-0 font-mono text-[10px] text-gd-steel">{j.number}</span>
                </div>
                <p className="mt-1 text-[11px] text-gd-steel">{j.service}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] text-gd-chrome">
                    <Clock className="h-3 w-3" /> {j.duration}h est.
                  </span>
                  <span className="font-display text-sm font-black text-gd-neon">
                    {money(j.value)}
                  </span>
                </div>
                {j.notes.startsWith('BLOCKED') && (
                  <div className="mt-2 flex items-start gap-1.5 rounded border border-gd-red/30 bg-gd-red/10 px-2 py-1.5">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-gd-red" />
                    <span className="text-[10px] leading-snug text-gd-red">{j.notes}</span>
                  </div>
                )}
              </article>
            ))}
            {!unassigned.length && (
              <div className="rounded-lg border border-dashed border-gd-neon/25 px-3 py-8 text-center text-xs text-gd-neon/70">
                Every job today has a crew.
              </div>
            )}
          </div>
        </Panel>

        {/* ── Crew timeline ────────────────────────────── */}
        <Panel className="overflow-hidden p-4 xl:col-span-6">
          <SectionHead
            title="Crew Timeline"
            sub="Workload, travel, and capacity for today"
            right={
              <span className="flex items-center gap-1.5 text-[11px] text-gd-steel">
                <Users className="h-3.5 w-3.5" /> {CREW.length} resources
              </span>
            }
          />

          {/* Hour ruler */}
          <div className="mb-1.5 flex pl-[132px]">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center font-mono text-[9px] text-gd-steel/60">
                {label(h)}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {CREW.map((c) => {
              const crewJobs = jobs.filter((j) => j.crewId === c.id);
              const booked = crewJobs.reduce((s, j) => s + j.duration, 0);
              return (
                <div
                  key={c.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setHotCrew(c.id);
                  }}
                  onDragLeave={() => setHotCrew((s) => (s === c.id ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    // Read the payload off the drag event so the drop does not
                    // depend on a React state update having already flushed.
                    const id = e.dataTransfer.getData('text/plain') || dragId;
                    if (id) assign(id, c.id);
                    setDragId(null);
                    setHotCrew(null);
                  }}
                  className={`flex items-stretch gap-2 rounded-lg border p-1.5 transition-all ${
                    hotCrew === c.id
                      ? 'border-gd-neon/60 bg-gd-neon/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.015]'
                  }`}
                >
                  <div className="w-[124px] shrink-0 px-1.5 py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[9px] font-black text-gd-void"
                        style={{ background: c.color }}
                      >
                        {c.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-white">{c.name}</p>
                        <p className="truncate text-[9px] text-gd-steel">{c.role}</p>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <Progress
                        value={(booked / 10) * 100}
                        color={booked > 8 ? '#FF4D5E' : c.color}
                        height={3}
                      />
                      <p className="mt-1 font-mono text-[9px] text-gd-steel">
                        {booked}h booked today
                      </p>
                    </div>
                  </div>

                  <div className="relative min-h-[52px] flex-1 rounded-md bg-gd-void/60">
                    {HOURS.map((h, i) => (
                      <div
                        key={h}
                        className="absolute inset-y-0 border-l border-white/[0.04]"
                        style={{ left: `${(i / HOURS.length) * 100}%` }}
                      />
                    ))}
                    {crewJobs.map((j) => {
                      const left = ((j.start - DAY_START) / HOURS.length) * 100;
                      const width = (j.duration / HOURS.length) * 100;
                      const st = JOB_STATUS_META[j.status];
                      return (
                        <button
                          key={j.id}
                          onClick={() => setSelected(j)}
                          className="absolute inset-y-1 overflow-hidden rounded-md border px-2 py-1 text-left transition-all hover:z-10 hover:scale-[1.02]"
                          style={{
                            left: `${Math.max(0, left)}%`,
                            width: `${Math.min(100 - left, width)}%`,
                            background: `${st.color}22`,
                            borderColor: `${st.color}66`,
                          }}
                          title={`${j.property} — ${j.service}`}
                        >
                          <p
                            className="truncate text-[10px] font-bold leading-tight"
                            style={{ color: st.color }}
                          >
                            {j.property}
                          </p>
                          <p className="truncate text-[9px] leading-tight text-gd-steel">
                            {st.label} · {j.duration}h
                          </p>
                        </button>
                      );
                    })}
                    {!crewJobs.length && (
                      <div className="grid h-full place-items-center text-[10px] uppercase tracking-wider text-gd-steel/40">
                        Available — drop a job here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 border-t border-white/[0.06] pt-3">
            {Object.entries(JOB_STATUS_META).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 text-[10px] text-gd-steel">
                <span className="h-2 w-2 rounded-sm" style={{ background: v.color }} />
                {v.label}
              </span>
            ))}
          </div>
        </Panel>

        {/* ── Map ──────────────────────────────────────── */}
        <div className="space-y-4 xl:col-span-3">
          <Panel className="p-4">
            <SectionHead
              title="Territory"
              right={
                <span className="flex items-center gap-1 text-[11px] text-gd-steel">
                  <MapPin className="h-3.5 w-3.5" /> live
                </span>
              }
            />
            <TerritoryMap
              markers={markers}
              height={360}
              onSelect={(mk) => setSelected(jobs.find((j) => j.id === mk.id) ?? null)}
            />
          </Panel>

          {selected && (
            <Panel className="p-4">
              <SectionHead title="Job Detail" />
              <p className="font-display text-base font-extrabold text-white">
                {selected.property}
              </p>
              <p className="mt-0.5 text-xs text-gd-steel">{selected.customer.replace(/^\*/, '')}</p>
              <div className="mt-3 space-y-2 text-xs">
                {[
                  ['Job #', selected.number],
                  ['Service', selected.service],
                  ['Address', selected.address],
                  ['Window', `${label(selected.start)} — ${label(selected.start + selected.duration)}`],
                  ['Crew', CREW.find((c) => c.id === selected.crewId)?.name ?? 'Unassigned'],
                  ['Value', money(selected.value)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-white/[0.05] pb-1.5">
                    <span className="text-gd-steel">{k}</span>
                    <span className="text-right text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Badge
                  tone={
                    selected.status === 'completed'
                      ? 'neon'
                      : selected.status === 'needs_follow_up'
                        ? 'red'
                        : 'electric'
                  }
                >
                  {JOB_STATUS_META[selected.status].label}
                </Badge>
              </div>
              {selected.notes && (
                <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-[11px] leading-relaxed text-gd-steel">
                  {selected.notes}
                </p>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
