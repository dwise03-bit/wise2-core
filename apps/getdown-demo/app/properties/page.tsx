'use client';

import { useMemo, useState } from 'react';
import { Building2, FileText, Image as ImageIcon, Mail, Phone, ShieldCheck, TrendingUp } from 'lucide-react';
import { Badge, Button, DataTable, DemoAction, Drawer, Field, Panel, Progress, SectionHead, Tabs } from '@/components/ui/kit';
import { TerritoryMap, type MapMarker } from '@/components/modules/TerritoryMap';
import { DOCUMENTS, JOBS, OPPORTUNITIES, PROPERTIES } from '@/lib/data/seed';
import type { Property } from '@/lib/data/types';
import { compactMoney, longDate, money, shortDate } from '@/lib/metrics';

export default function PropertiesPage() {
  const [selected, setSelected] = useState<Property | null>(null);
  const [tab, setTab] = useState('overview');
  const [view, setView] = useState<'table' | 'map'>('table');

  const totals = useMemo(
    () => ({
      buildings: PROPERTIES.reduce((s, p) => s + p.buildings, 0),
      units: PROPERTIES.reduce((s, p) => s + p.units, 0),
      acv: PROPERTIES.reduce((s, p) => s + p.contractValue, 0),
      companies: new Set(PROPERTIES.map((p) => p.managementCompany)).size,
    }),
    [],
  );

  const markers: MapMarker[] = PROPERTIES.map((p) => ({
    id: p.id,
    label: p.name,
    sub: `${p.buildings} buildings · ${p.units} units`,
    lat: p.lat,
    lng: p.lng,
    value: p.contractValue ? `${money(p.contractValue)}/yr` : 'One-time',
    kind: p.frequency === 'One-Time' ? 'commercial' : 'recurring',
  }));

  const propJobs = selected ? JOBS.filter((j) => j.propertyId === selected.id) : [];
  const propDocs = selected ? DOCUMENTS.filter((d) => d.propertyId === selected.id) : [];
  const propOpps = selected ? OPPORTUNITIES.filter((o) => o.property === selected.name) : [];

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Commercial Properties
          </h1>
          <p className="mt-1 text-sm text-gd-steel">
            Engine A — the multifamily backbone. We don&apos;t chase houses. We maintain communities.
          </p>
        </div>
        <Tabs
          tabs={[
            { id: 'table', label: 'Portfolio' },
            { id: 'map', label: 'Territory Map' },
          ]}
          value={view}
          onChange={(v) => setView(v as 'table' | 'map')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Properties Under Management', String(PROPERTIES.length), '#22B8FF'],
          ['Buildings Serviced', String(totals.buildings), '#7CFF3D'],
          ['Residential Units', totals.units.toLocaleString(), '#A66BFF'],
          ['Annual Contract Value', money(totals.acv), '#7CFF3D'],
        ].map(([label, value, tone]) => (
          <Panel key={label} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">
              {label}
            </p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: tone }}>
              {value}
            </p>
          </Panel>
        ))}
      </div>

      {view === 'map' ? (
        <Panel className="p-4" >
          <SectionHead title="Service Territory" sub="Click a marker to open the property record" />
          <TerritoryMap
            markers={markers}
            height={520}
            onSelect={(mk) => setSelected(PROPERTIES.find((p) => p.id === mk.id) ?? null)}
          />
        </Panel>
      ) : (
        <Panel data-tour="properties" className="overflow-hidden">
          <div>
            <DataTable
              rows={PROPERTIES}
              onRowClick={(p) => {
                setSelected(p);
                setTab('overview');
              }}
              columns={[
                {
                  key: 'name',
                  head: 'Property',
                  render: (p: Property) => (
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-[11px] text-gd-steel">
                        {p.managementCompany.replace(/^\*/, '')} · {p.city}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'size',
                  head: 'Size',
                  render: (p: Property) => (
                    <span className="text-gd-chrome">
                      {p.buildings} bldg · {p.units} units
                    </span>
                  ),
                },
                {
                  key: 'freq',
                  head: 'Program',
                  render: (p: Property) => (
                    <Badge tone={p.frequency === 'One-Time' ? 'steel' : 'electric'}>
                      {p.frequency}
                    </Badge>
                  ),
                },
                {
                  key: 'coi',
                  head: 'COI',
                  render: (p: Property) => (
                    <Badge
                      tone={
                        p.coiStatus === 'Current'
                          ? 'neon'
                          : p.coiStatus === 'Expiring'
                            ? 'amber'
                            : 'red'
                      }
                    >
                      {p.coiStatus}
                    </Badge>
                  ),
                },
                {
                  key: 'next',
                  head: 'Next Service',
                  render: (p: Property) => (
                    <span className="text-gd-chrome">{shortDate(p.nextService)}</span>
                  ),
                },
                {
                  key: 'expansion',
                  head: 'Expansion',
                  render: (p: Property) => (
                    <span className="text-[11px] text-gd-violet">
                      {p.expansion.length} opportunities
                    </span>
                  ),
                },
                {
                  key: 'acv',
                  head: 'Annual Value',
                  align: 'right',
                  render: (p: Property) => (
                    <span className="font-display font-black text-gd-neon">
                      {p.contractValue ? money(p.contractValue) : '—'}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </Panel>
      )}

      {/* ── Property record ─────────────────────────────── */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={
          selected
            ? `${selected.managementCompany.replace(/^\*/, '')} · ${selected.address}, ${selected.city}`
            : undefined
        }
        width="max-w-3xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                ['Buildings', String(selected.buildings), '#22B8FF'],
                ['Units', String(selected.units), '#C9D4E0'],
                ['Contract', selected.contractValue ? compactMoney(selected.contractValue) : '—', '#7CFF3D'],
                ['Photos', String(selected.photos), '#A66BFF'],
              ].map(([l, v, c]) => (
                <Panel key={l} className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gd-steel">{l}</p>
                  <p className="mt-1 font-display text-lg font-black" style={{ color: c }}>
                    {v}
                  </p>
                </Panel>
              ))}
            </div>

            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview' },
                { id: 'services', label: 'Services', count: selected.services.length },
                { id: 'expansion', label: 'Expansion', count: selected.expansion.length },
                { id: 'jobs', label: 'History', count: propJobs.length },
                { id: 'docs', label: 'Documents', count: propDocs.length },
              ]}
              value={tab}
              onChange={setTab}
            />

            {tab === 'overview' && (
              <div>
                <Field label="Management Company" value={selected.managementCompany.replace(/^\*/, '')} />
                <Field label="Property Manager" value={selected.manager} />
                <Field
                  label="Contact"
                  value={
                    <div className="flex flex-wrap gap-4 text-gd-electric">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {selected.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {selected.email}
                      </span>
                    </div>
                  }
                />
                <Field label="Address" value={`${selected.address}, ${selected.city}`} />
                <Field
                  label="Contract Term"
                  value={`${longDate(selected.contractStart)} → ${longDate(selected.contractEnd)} · ${selected.frequency}`}
                />
                <Field label="Last Service" value={longDate(selected.lastService)} />
                <Field label="Next Service" value={<span className="text-gd-neon">{longDate(selected.nextService)}</span>} />
                <Field
                  label="COI Status"
                  value={
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-gd-neon" />
                      {selected.coiStatus}
                      {selected.coiExpires && (
                        <span className="text-gd-steel">— expires {longDate(selected.coiExpires)}</span>
                      )}
                    </span>
                  }
                />
                <Field label="Notes" value={selected.notes} />
              </div>
            )}

            {tab === 'services' && (
              <div className="space-y-2">
                {selected.services.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
                  >
                    <Building2 className="h-4 w-4 text-gd-electric" />
                    <span className="text-sm text-white">{s}</span>
                    <Badge tone="neon" className="ml-auto">
                      On Program
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {tab === 'expansion' && (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-gd-steel">
                  The objective is increasing lifetime property value rather than repeatedly
                  reacquiring customers. These are the surfaces at{' '}
                  <span className="text-white">{selected.name}</span> not yet on the program.
                </p>
                {selected.expansion.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 rounded-lg border border-gd-violet/25 bg-gd-violet/[0.06] px-3.5 py-2.5"
                  >
                    <TrendingUp className="h-4 w-4 text-gd-violet" />
                    <span className="text-sm text-white">{s}</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Build Estimate
                    </Button>
                  </div>
                ))}
                {propOpps.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">
                      Open opportunities on this property
                    </p>
                    {propOpps.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2 text-sm"
                      >
                        <span className="text-white">{o.service}</span>
                        <span className="font-display font-black text-gd-neon">
                          {money(o.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'jobs' && (
              <div className="space-y-2">
                {propJobs.length ? (
                  propJobs.map((j) => (
                    <div
                      key={j.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
                    >
                      <div>
                        <p className="text-sm text-white">{j.service}</p>
                        <p className="text-[11px] text-gd-steel">
                          {j.number} · {shortDate(j.date)}
                        </p>
                      </div>
                      <span className="font-display font-black text-gd-neon">{money(j.value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-gd-steel">
                    No jobs logged against this property in the demo window.
                  </p>
                )}
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 text-xs text-gd-steel">
                  <ImageIcon className="h-4 w-4" />
                  {selected.photos} job photos archived to this property record.
                </div>
              </div>
            )}

            {tab === 'docs' && (
              <div className="space-y-2">
                {propDocs.length ? (
                  propDocs.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-gd-chrome" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{d.name}</p>
                        <p className="text-[11px] text-gd-steel">{d.nextAction}</p>
                      </div>
                      <Badge
                        tone={
                          d.status === 'stored' || d.status === 'delivered'
                            ? 'neon'
                            : d.status === 'requested' || d.status === 'expiring'
                              ? 'amber'
                              : 'electric'
                        }
                      >
                        {d.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-gd-steel">No documents on file.</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4">
              <Button variant="neon">Schedule Service</Button>
              <Button variant="primary">Request COI</Button>
              <Button variant="ghost">Property Assessment</Button>
              <DemoAction />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
