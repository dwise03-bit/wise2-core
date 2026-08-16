'use client';

import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Receipt,
  Star,
  Wrench,
} from 'lucide-react';
import { Badge, Button, DataTable, DemoAction, Drawer, Field, Panel, SectionHead, Tabs } from '@/components/ui/kit';
import {
  CUSTOMERS,
  DOCUMENTS,
  ESTIMATES,
  FOLLOW_UPS,
  INVOICES,
  JOBS,
  OPPORTUNITIES,
  PAYMENTS,
  PROPERTIES,
  REVIEWS,
} from '@/lib/data/seed';
import type { Customer } from '@/lib/data/types';
import { estimateTotal, longDate, money, shortDate } from '@/lib/metrics';

const clean = (s: string) => s.replace(/^\*/, '');

export default function CustomersPage() {
  const [selected, setSelected] = useState<Customer | null>(null);
  const [tab, setTab] = useState('timeline');
  const [filter, setFilter] = useState('all');

  const rows =
    filter === 'all' ? CUSTOMERS : CUSTOMERS.filter((c) => c.type.toLowerCase().includes(filter));

  const cJobs = selected ? JOBS.filter((j) => j.customer === selected.name) : [];
  const cInv = selected ? INVOICES.filter((i) => i.customer === selected.name) : [];
  const cPay = selected ? PAYMENTS.filter((p) => p.customer === selected.name) : [];
  const cEst = selected ? ESTIMATES.filter((e) => e.customer === selected.name) : [];
  const cOpp = selected ? OPPORTUNITIES.filter((o) => o.customer === selected.name) : [];
  const cDocs = selected
    ? DOCUMENTS.filter((d) => selected.properties.includes(d.property))
    : [];
  const cReviews = selected
    ? REVIEWS.filter((r) => selected.properties.includes(r.property))
    : [];
  const cFollow = selected ? FOLLOW_UPS.filter((f) => f.customer === selected.name) : [];

  // Unified chronological relationship timeline
  const timeline = selected
    ? [
        ...cJobs.map((j) => ({ date: j.date, icon: Wrench, tone: '#22B8FF', title: j.service, sub: `${j.number} · ${j.property}`, amount: j.value })),
        ...cEst.map((e) => ({ date: e.sentAt ?? '2026-08-15', icon: ClipboardList, tone: '#FFB020', title: `Estimate ${e.status}`, sub: `${e.number} · ${e.property}`, amount: estimateTotal(e) })),
        ...cInv.map((i) => ({ date: i.issued, icon: Receipt, tone: '#C9D4E0', title: `Invoice ${i.status}`, sub: `${i.number} · ${i.property}`, amount: i.amount })),
        ...cPay.map((p) => ({ date: p.date, icon: CheckCircle2, tone: '#7CFF3D', title: `Payment received (${p.method})`, sub: p.invoice, amount: p.amount })),
        ...cReviews.map((r) => ({ date: r.date, icon: Star, tone: '#A66BFF', title: `${r.rating}-star review on ${r.platform}`, sub: r.property, amount: 0 })),
      ].sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Customers
          </h1>
          <p className="mt-1 text-sm text-gd-steel">
            {CUSTOMERS.length} relationships · every job, estimate, invoice, document, and review in
            one record
          </p>
        </div>
        <Tabs
          tabs={[
            { id: 'all', label: 'All', count: CUSTOMERS.length },
            { id: 'property', label: 'Property Mgmt' },
            { id: 'hoa', label: 'HOA' },
            { id: 'commercial', label: 'Commercial' },
            { id: 'residential', label: 'Residential' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <Panel data-tour="customers" className="overflow-hidden">
        <DataTable
          rows={rows}
          onRowClick={(c) => {
            setSelected(c);
            setTab('timeline');
          }}
          columns={[
            {
              key: 'name',
              head: 'Customer',
              render: (c: Customer) => (
                <div>
                  <p className="font-semibold text-white">{clean(c.name)}</p>
                  <p className="text-[11px] text-gd-steel">
                    {c.contact} · {c.city}
                  </p>
                </div>
              ),
            },
            { key: 'type', head: 'Type', render: (c: Customer) => <Badge tone={c.type === 'Residential' ? 'steel' : 'electric'}>{c.type}</Badge> },
            {
              key: 'props',
              head: 'Properties',
              render: (c: Customer) => (
                <span className="text-gd-chrome">{c.properties.length}</span>
              ),
            },
            { key: 'source', head: 'Source', render: (c: Customer) => <span className="text-[11px] text-gd-steel">{c.source}</span> },
            { key: 'since', head: 'Customer Since', render: (c: Customer) => <span className="text-gd-chrome">{longDate(c.since)}</span> },
            {
              key: 'bal',
              head: 'Open Balance',
              align: 'right',
              render: (c: Customer) => (
                <span className={c.openBalance ? 'text-gd-amber' : 'text-gd-steel'}>
                  {c.openBalance ? money(c.openBalance) : '—'}
                </span>
              ),
            },
            {
              key: 'ltv',
              head: 'Lifetime Value',
              align: 'right',
              render: (c: Customer) => (
                <span className="font-display font-black text-gd-neon">{money(c.lifetimeValue)}</span>
              ),
            },
          ]}
        />
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? clean(selected.name) : ''}
        subtitle={selected ? `${selected.contact} · ${selected.type} · Customer since ${longDate(selected.since)}` : undefined}
        width="max-w-3xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                ['Lifetime Value', money(selected.lifetimeValue), '#7CFF3D'],
                ['Open Balance', selected.openBalance ? money(selected.openBalance) : '$0', selected.openBalance ? '#FFB020' : '#C9D4E0'],
                ['Properties', String(selected.properties.length), '#22B8FF'],
                ['Rating', selected.rating ? `${selected.rating}.0 ★` : '—', '#A66BFF'],
              ].map(([l, v, c]) => (
                <Panel key={l} className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gd-steel">{l}</p>
                  <p className="mt-1 font-display text-lg font-black" style={{ color: c }}>
                    {v}
                  </p>
                </Panel>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selected.tags.map((t) => (
                <Badge key={t} tone="violet">
                  {t}
                </Badge>
              ))}
            </div>

            <Tabs
              tabs={[
                { id: 'timeline', label: 'Timeline', count: timeline.length },
                { id: 'contact', label: 'Contact' },
                { id: 'work', label: 'Work', count: cJobs.length + cEst.length },
                { id: 'money', label: 'Money', count: cInv.length },
                { id: 'docs', label: 'Docs', count: cDocs.length },
                { id: 'ai', label: 'AI Notes' },
              ]}
              value={tab}
              onChange={setTab}
            />

            {tab === 'timeline' && (
              <div className="relative space-y-3 pl-5">
                <div className="absolute inset-y-2 left-[7px] w-px bg-gd-line" />
                {timeline.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={i} className="relative">
                      <span
                        className="absolute -left-[18px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-gd-abyss"
                        style={{ background: t.tone }}
                      />
                      <div className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <div className="flex min-w-0 gap-2.5">
                          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: t.tone }} />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">{t.title}</p>
                            <p className="truncate text-[11px] text-gd-steel">{t.sub}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          {t.amount > 0 && (
                            <p className="font-mono text-xs text-gd-neon">{money(t.amount)}</p>
                          )}
                          <p className="text-[10px] text-gd-steel">{shortDate(t.date)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!timeline.length && (
                  <p className="py-6 text-center text-sm text-gd-steel">
                    No activity in the demo window.
                  </p>
                )}
              </div>
            )}

            {tab === 'contact' && (
              <div>
                <Field label="Primary Contact" value={selected.contact} />
                <Field
                  label="Phone"
                  value={
                    <span className="flex items-center gap-1.5 text-gd-electric">
                      <Phone className="h-3.5 w-3.5" /> {selected.phone}
                    </span>
                  }
                />
                <Field
                  label="Email"
                  value={
                    <span className="flex items-center gap-1.5 text-gd-electric">
                      <Mail className="h-3.5 w-3.5" /> {selected.email}
                    </span>
                  }
                />
                <Field label="Address" value={`${selected.address}, ${selected.city}`} />
                <Field label="Lead Source" value={selected.source} />
                <Field
                  label="Properties"
                  value={
                    <div className="mt-1 space-y-1.5">
                      {selected.properties.map((p) => {
                        const prop = PROPERTIES.find((x) => x.name === p);
                        return (
                          <div
                            key={p}
                            className="flex items-center gap-2 rounded border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5"
                          >
                            <Building2 className="h-3.5 w-3.5 text-gd-electric" />
                            <span className="text-sm">{p}</span>
                            {prop && (
                              <span className="ml-auto text-[11px] text-gd-steel">
                                {prop.buildings} bldg · {prop.units} units
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  }
                />
              </div>
            )}

            {tab === 'work' && (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">
                    Open Opportunities
                  </p>
                  {cOpp.length ? (
                    cOpp.map((o) => (
                      <div key={o.id} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2">
                        <div>
                          <p className="text-sm text-white">{o.service}</p>
                          <p className="text-[11px] text-gd-steel">{o.property} · {o.nextAction}</p>
                        </div>
                        <span className="font-display font-black text-gd-neon">{money(o.value)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gd-steel">None open.</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">
                    Estimates
                  </p>
                  {cEst.length ? (
                    cEst.map((e) => (
                      <div key={e.id} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2">
                        <div>
                          <p className="text-sm text-white">{e.number}</p>
                          <p className="text-[11px] text-gd-steel">{e.property} · {e.tier} package</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge tone={e.status === 'approved' ? 'neon' : e.status === 'declined' ? 'red' : 'amber'}>{e.status}</Badge>
                          <span className="font-mono text-sm text-white">{money(estimateTotal(e))}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gd-steel">No estimates.</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">
                    Jobs
                  </p>
                  {cJobs.length ? (
                    cJobs.map((j) => (
                      <div key={j.id} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2">
                        <div>
                          <p className="text-sm text-white">{j.service}</p>
                          <p className="text-[11px] text-gd-steel">{j.number} · {shortDate(j.date)}</p>
                        </div>
                        <span className="font-mono text-sm text-gd-neon">{money(j.value)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gd-steel">No jobs in the demo window.</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'money' && (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">Invoices</p>
                  {cInv.length ? cInv.map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2">
                      <div>
                        <p className="text-sm text-white">{i.number}</p>
                        <p className="text-[11px] text-gd-steel">Due {longDate(i.due)} · {i.property}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={i.status === 'paid' ? 'neon' : i.status === 'overdue' ? 'red' : 'amber'}>{i.status}</Badge>
                        <span className="font-mono text-sm text-white">{money(i.amount)}</span>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gd-steel">No invoices.</p>}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">Payments</p>
                  {cPay.length ? cPay.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2">
                      <div>
                        <p className="text-sm text-white">{p.method} · {p.invoice}</p>
                        <p className="text-[11px] text-gd-steel">{longDate(p.date)}</p>
                      </div>
                      <span className="font-mono text-sm text-gd-neon">{money(p.amount)}</span>
                    </div>
                  )) : <p className="text-sm text-gd-steel">No payments recorded.</p>}
                </div>
              </div>
            )}

            {tab === 'docs' && (
              <div className="space-y-2">
                {cDocs.length ? cDocs.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-gd-chrome" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{d.name}</p>
                      <p className="text-[11px] text-gd-steel">{d.nextAction}</p>
                    </div>
                    <Badge tone={d.status === 'stored' ? 'neon' : 'amber'}>{d.status}</Badge>
                  </div>
                )) : <p className="py-6 text-center text-sm text-gd-steel">No documents on file.</p>}
              </div>
            )}

            {tab === 'ai' && (
              <div className="space-y-3">
                <Panel className="border-gd-violet/25 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-violet">
                    WISE² Relationship Summary
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white">
                    {clean(selected.name)} has generated {money(selected.lifetimeValue)} across{' '}
                    {selected.properties.length}{' '}
                    {selected.properties.length === 1 ? 'property' : 'properties'} since{' '}
                    {longDate(selected.since)}.{' '}
                    {cOpp.length
                      ? `There ${cOpp.length === 1 ? 'is' : 'are'} ${cOpp.length} open ${cOpp.length === 1 ? 'opportunity' : 'opportunities'} worth ${money(cOpp.reduce((s, o) => s + o.value, 0))}.`
                      : 'There are no open opportunities on this relationship right now.'}{' '}
                    {selected.openBalance
                      ? `An open balance of ${money(selected.openBalance)} should be resolved before the next scheduled visit.`
                      : 'The account is current.'}
                  </p>
                </Panel>
                {cFollow.map((f) => (
                  <Panel key={f.id} className="p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{f.type}</p>
                      <Badge tone={f.priority === 'high' ? 'red' : 'amber'}>{f.priority}</Badge>
                    </div>
                    <p className="mt-1.5 text-[11px] text-gd-steel">{f.trigger}</p>
                    <p className="mt-2 rounded border border-white/[0.07] bg-white/[0.02] p-2.5 text-[11px] leading-relaxed text-gd-chrome">
                      {f.aiDraft}
                    </p>
                  </Panel>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4">
              <Button variant="neon"><Phone className="h-3.5 w-3.5" /> Call</Button>
              <Button variant="primary"><MessageSquare className="h-3.5 w-3.5" /> Text</Button>
              <Button variant="ghost"><Mail className="h-3.5 w-3.5" /> Email</Button>
              <Button variant="ghost">New Estimate</Button>
              <DemoAction label="Approval Required" />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
