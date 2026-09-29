'use client';

import { useState } from 'react';
import { Badge, DataTable, Drawer, Field, Panel, SectionHead, Tabs } from '@/components/ui/kit';
import { CREW, JOBS } from '@/lib/data/seed';
import type { Job } from '@/lib/data/types';
import { JOB_STATUS_META, longDate, money } from '@/lib/metrics';

export default function JobsPage() {
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState<Job | null>(null);

  const rows =
    tab === 'all'
      ? JOBS
      : tab === 'multifamily' || tab === 'lighting'
        ? JOBS.filter((j) => j.engine === tab)
        : JOBS.filter((j) => j.status === tab);

  const completedValue = JOBS.filter((j) => j.status === 'completed').reduce(
    (s, j) => s + j.value,
    0,
  );

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Jobs
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Every job on the board with its crew, status, property, and value.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Jobs In System', String(JOBS.length), '#22B8FF'],
          ['Completed Value', money(completedValue), '#7CFF3D'],
          ['In Progress', String(JOBS.filter((j) => j.status === 'in_progress').length), '#FFB020'],
          ['Unassigned', String(JOBS.filter((j) => j.status === 'unassigned').length), '#FF4D5E'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: JOBS.length },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'unassigned', label: 'Unassigned' },
          { id: 'needs_follow_up', label: 'Needs Follow-Up' },
          { id: 'multifamily', label: 'Engine A' },
          { id: 'lighting', label: 'Engine B' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Panel className="overflow-hidden">
        <DataTable
          rows={rows}
          onRowClick={setSelected}
          empty="No jobs in this view"
          columns={[
            {
              key: 'num',
              head: 'Job',
              render: (j: Job) => (
                <div>
                  <p className="font-mono text-xs text-white">{j.number}</p>
                  <p className="text-[11px] text-gd-steel">{longDate(j.date)}</p>
                </div>
              ),
            },
            {
              key: 'prop',
              head: 'Property / Customer',
              render: (j: Job) => (
                <div>
                  <p className="font-semibold text-white">{j.property}</p>
                  <p className="text-[11px] text-gd-steel">{j.customer.replace(/^\*/, '')}</p>
                </div>
              ),
            },
            { key: 'svc', head: 'Service', render: (j: Job) => <span className="text-gd-chrome">{j.service}</span> },
            {
              key: 'engine',
              head: 'Engine',
              render: (j: Job) => (
                <Badge tone={j.engine === 'lighting' ? 'violet' : 'electric'}>
                  {j.engine === 'lighting' ? 'B · Lighting' : 'A · Multifamily'}
                </Badge>
              ),
            },
            {
              key: 'crew',
              head: 'Crew',
              render: (j: Job) => {
                const c = CREW.find((x) => x.id === j.crewId);
                return c ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="grid h-5 w-5 place-items-center rounded text-[8px] font-black text-gd-void"
                      style={{ background: c.color }}
                    >
                      {c.initials}
                    </span>
                    <span className="text-gd-chrome">{c.name}</span>
                  </span>
                ) : (
                  <Badge tone="steel">Unassigned</Badge>
                );
              },
            },
            {
              key: 'status',
              head: 'Status',
              render: (j: Job) => (
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: JOB_STATUS_META[j.status].color }}
                >
                  {JOB_STATUS_META[j.status].label}
                </span>
              ),
            },
            {
              key: 'val',
              head: 'Value',
              align: 'right',
              render: (j: Job) => (
                <span className="font-display font-black text-gd-neon">
                  {j.value ? money(j.value) : '—'}
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.number ?? ''}
        subtitle={selected ? `${selected.property} · ${selected.service}` : undefined}
      >
        {selected && (
          <div className="space-y-4">
            <Field label="Customer" value={selected.customer.replace(/^\*/, '')} />
            <Field label="Address" value={selected.address} />
            <Field label="Date" value={longDate(selected.date)} />
            <Field label="Estimated Duration" value={`${selected.duration} hours`} />
            <Field
              label="Crew"
              value={CREW.find((c) => c.id === selected.crewId)?.name ?? 'Unassigned'}
            />
            <Field
              label="Status"
              value={
                <span style={{ color: JOB_STATUS_META[selected.status].color }}>
                  {JOB_STATUS_META[selected.status].label}
                </span>
              }
            />
            <Field label="Value" value={money(selected.value)} />
            {selected.notes && <Field label="Notes" value={selected.notes} />}
          </div>
        )}
      </Drawer>
    </div>
  );
}
