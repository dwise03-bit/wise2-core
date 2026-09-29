'use client';

import { useState } from 'react';
import { FileText, Mail, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { Badge, Button, DataTable, DemoAction, Drawer, Field, Panel, SectionHead, Tabs } from '@/components/ui/kit';
import { DOCUMENTS, PROPERTIES } from '@/lib/data/seed';
import type { PropertyDoc } from '@/lib/data/types';
import { longDate, shortDate } from '@/lib/metrics';

const COI_STAGES = [
  { id: 'request', label: 'Property requests COI', detail: 'Manager asks for a certificate' },
  { id: 'received', label: 'Request received', detail: 'Inbox AI flags and logs it' },
  { id: 'contact', label: 'Insurance contact identified', detail: 'Kale Insurance — Alex Mullen' },
  { id: 'requested', label: 'COI requested', detail: 'Request prepared and sent' },
  { id: 'document', label: 'Document received', detail: 'Certificate arrives as PDF' },
  { id: 'matched', label: 'Property matched', detail: 'Document AI files it to the right property' },
  { id: 'notified', label: 'Manager notified', detail: 'Delivered after approval' },
  { id: 'stored', label: 'Document stored', detail: 'Attached to the property record' },
  { id: 'monitored', label: 'Expiration monitored', detail: 'Alert fires before it lapses' },
];

const STATUS_TONE: Record<string, 'neon' | 'amber' | 'red' | 'electric' | 'steel'> = {
  stored: 'neon',
  delivered: 'neon',
  matched: 'electric',
  received: 'electric',
  requested: 'amber',
  expiring: 'amber',
  expired: 'red',
};

export default function DocumentsPage() {
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState<PropertyDoc | null>(null);

  const rows =
    tab === 'all'
      ? DOCUMENTS
      : tab === 'action'
        ? DOCUMENTS.filter((d) => ['requested', 'expiring', 'received', 'expired'].includes(d.status))
        : DOCUMENTS.filter((d) => d.type === tab);

  const coiIssues = DOCUMENTS.filter(
    (d) => d.type === 'COI' && ['requested', 'expiring', 'expired'].includes(d.status),
  );

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Document Center
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          COIs, W-9s, insurance requests, contracts, proposals, and service records — the
          administrative friction around commercial property relationships, removed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Documents On File', String(DOCUMENTS.length), '#22B8FF'],
          ['COIs Needing Action', String(coiIssues.length), '#FF4D5E'],
          ['Properties Covered', String(new Set(DOCUMENTS.map((d) => d.property)).size), '#7CFF3D'],
          ['Expiring ≤ 60 days', String(DOCUMENTS.filter((d) => d.status === 'expiring').length), '#FFB020'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      {/* ── COI workflow ─────────────────────────────────── */}
      <Panel className="p-5">
        <SectionHead
          title="COI Automation Workflow"
          sub="Nine steps, tracked end to end. The purpose is to reduce administrative friction around commercial property relationships."
          right={<Badge tone="steel">Insurance: Kale Insurance · Erie Coverage · Alex Mullen</Badge>}
        />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-9">
          {COI_STAGES.map((s, i) => (
            <div key={s.id} className="rounded-lg border border-gd-line bg-white/[0.02] p-3">
              <span className="font-display text-[10px] font-black text-gd-neon">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mt-1 text-[11px] font-bold leading-tight text-white">{s.label}</p>
              <p className="mt-1 text-[10px] leading-snug text-gd-steel">{s.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      {coiIssues.length > 0 && (
        <Panel className="border-gd-red/25 bg-gd-red/[0.04] p-5">
          <SectionHead title="COI Exceptions" sub="Certificates blocking or about to block work" />
          <div className="space-y-2">
            {coiIssues.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-gd-red/20 bg-gd-red/[0.05] px-3.5 py-3"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-gd-red" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{d.property}</p>
                  <p className="text-[11px] text-gd-steel">{d.nextAction}</p>
                </div>
                <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge>
                {d.expiresAt && (
                  <span className="font-mono text-[11px] text-gd-amber">
                    exp {shortDate(d.expiresAt)}
                  </span>
                )}
                <Button variant="danger" size="sm" onClick={() => setSelected(d)}>
                  Work it
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: DOCUMENTS.length },
          { id: 'action', label: 'Needs Action' },
          { id: 'COI', label: 'COIs' },
          { id: 'W-9', label: 'W-9s' },
          { id: 'Contract', label: 'Contracts' },
          { id: 'Proposal', label: 'Proposals' },
          { id: 'Service Record', label: 'Service Records' },
          { id: 'Insurance Request', label: 'Insurance Requests' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Panel className="overflow-hidden">
        <DataTable
          rows={rows}
          onRowClick={setSelected}
          empty="No documents in this view"
          columns={[
            {
              key: 'name',
              head: 'Document',
              render: (d: PropertyDoc) => (
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-gd-chrome" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{d.name}</p>
                    <p className="text-[11px] text-gd-steel">
                      {d.type} · {d.sizeKb ? `${d.sizeKb} KB` : 'not received'}
                    </p>
                  </div>
                </div>
              ),
            },
            { key: 'prop', head: 'Property', render: (d: PropertyDoc) => <span className="text-gd-chrome">{d.property}</span> },
            { key: 'provider', head: 'Provider', render: (d: PropertyDoc) => <span className="text-[11px] text-gd-steel">{d.provider ?? '—'}</span> },
            { key: 'req', head: 'Requested', render: (d: PropertyDoc) => <span className="text-gd-chrome">{d.requestedAt ? shortDate(d.requestedAt) : '—'}</span> },
            { key: 'rec', head: 'Received', render: (d: PropertyDoc) => <span className="text-gd-chrome">{d.receivedAt ? shortDate(d.receivedAt) : '—'}</span> },
            {
              key: 'exp',
              head: 'Expires',
              render: (d: PropertyDoc) => (
                <span className={d.status === 'expiring' ? 'text-gd-amber' : 'text-gd-chrome'}>
                  {d.expiresAt ? shortDate(d.expiresAt) : '—'}
                </span>
              ),
            },
            { key: 'status', head: 'Status', render: (d: PropertyDoc) => <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge> },
          ]}
        />
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.type} · ${selected.property}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <Field label="Property" value={selected.property} />
              <Field
                label="Management Company"
                value={
                  PROPERTIES.find((p) => p.id === selected.propertyId)?.managementCompany.replace(
                    /^\*/,
                    '',
                  ) ?? '—'
                }
              />
              <Field label="Insurance Provider" value={selected.provider ?? '—'} />
              <Field label="Requested" value={selected.requestedAt ? longDate(selected.requestedAt) : '—'} />
              <Field label="Received" value={selected.receivedAt ? longDate(selected.receivedAt) : 'Not received'} />
              <Field label="Expires" value={selected.expiresAt ? longDate(selected.expiresAt) : '—'} />
              <Field label="Status" value={<Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>} />
              <Field label="Next Action" value={<span className="text-gd-neon">{selected.nextAction}</span>} />
            </div>

            <Panel className="border-gd-violet/25 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-violet">
                <Sparkles className="h-3 w-3" /> Document AI
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gd-chrome">
                {selected.type === 'COI'
                  ? `This certificate covers ${selected.property}. Document AI reads the certificate, confirms the additional-insured wording matches what the management company asked for, files it against the property record, and sets an expiration alert. It never generates or alters an insurance document.`
                  : `Document AI classified this as a ${selected.type.toLowerCase()}, matched it to ${selected.property}, and filed it to the property record. Summary and key dates are extracted for search.`}
              </p>
            </Panel>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary"><Mail className="h-3.5 w-3.5" /> Request from Kale Insurance</Button>
              <Button variant="neon"><Upload className="h-3.5 w-3.5" /> Attach Document</Button>
              <Button variant="ghost">Send to Property Manager</Button>
              <DemoAction label="Approval Required" />
            </div>
            <p className="text-[11px] leading-relaxed text-gd-steel">
              In owner demo mode no email is sent to any insurance provider or property manager, and
              no insurance or tax document is generated.
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
