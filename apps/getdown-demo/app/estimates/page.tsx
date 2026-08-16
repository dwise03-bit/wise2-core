'use client';

import { useMemo, useState } from 'react';
import { Check, FileCheck2, Minus, Plus, Send, Sparkles } from 'lucide-react';
import { Badge, Button, DataTable, DemoAction, Drawer, Panel, Progress, SectionHead, Tabs } from '@/components/ui/kit';
import { ESTIMATES, PRICEBOOK } from '@/lib/data/seed';
import type { Estimate } from '@/lib/data/types';
import { estimateTotals, money, shortDate } from '@/lib/metrics';

const TIERS = {
  Good: { label: 'GOOD', blurb: 'The core scope. Gets the property clean.', accent: '#C9D4E0', mult: 1 },
  Better: { label: 'BETTER', blurb: 'Core scope plus the surfaces managers notice.', accent: '#22B8FF', mult: 1.28 },
  Best: { label: 'BEST', blurb: 'Full-property program with priority scheduling.', accent: '#7CFF3D', mult: 1.58 },
} as const;

const ADD_ONS = [
  { id: 'a1', name: 'Gutter Brightening', price: 145, unit: 'per building' },
  { id: 'a2', name: 'Rust Removal Treatment', price: 320, unit: 'per property' },
  { id: 'a3', name: 'Dumpster Corral Degrease', price: 420, unit: 'per corral' },
  { id: 'a4', name: 'Permanent Lighting — Entrance Monument', price: 2400, unit: 'per entrance' },
  { id: 'a5', name: 'Priority Scheduling (48h response)', price: 600, unit: 'per year' },
];

export default function EstimatesPage() {
  const [selected, setSelected] = useState<Estimate | null>(null);
  const [tab, setTab] = useState('all');
  const [builderOpen, setBuilderOpen] = useState(false);

  const filtered = useMemo(() => {
    if (tab === 'all') return ESTIMATES;
    if (tab === 'stalled')
      return ESTIMATES.filter((e) => e.status === 'opened' && e.ageDays >= 7);
    return ESTIMATES.filter((e) => e.status === tab);
  }, [tab]);

  const openValue = ESTIMATES.filter((e) => ['sent', 'opened'].includes(e.status)).reduce(
    (s, e) => s + estimateTotals(e).total,
    0,
  );
  const stalled = ESTIMATES.filter((e) => e.status === 'opened' && e.ageDays >= 7);

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Estimates
          </h1>
          <p className="mt-1 text-sm text-gd-steel">
            {ESTIMATES.length} estimates · {money(openValue)} in play · Good / Better / Best packages
          </p>
        </div>
        <Button variant="neon" onClick={() => setBuilderOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Estimate
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Open Estimates', String(ESTIMATES.filter((e) => ['sent', 'opened'].includes(e.status)).length), '#FFB020'],
          ['Value In Play', money(openValue), '#7CFF3D'],
          ['Opened, Not Approved', String(stalled.length), '#FF4D5E'],
          ['Approved This Month', String(ESTIMATES.filter((e) => e.status === 'approved').length), '#7CFF3D'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      {stalled.length > 0 && (
        <Panel className="border-gd-red/25 bg-gd-red/[0.04] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-extrabold uppercase tracking-wider text-gd-red">
                {stalled.length} estimates opened but never approved
              </p>
              <p className="mt-1 text-xs text-gd-steel">
                {money(stalled.reduce((s, e) => s + estimateTotals(e).total, 0))} of work the
                customer already looked at. This is the highest-yield follow-up list in the system.
              </p>
            </div>
            <Button variant="danger" onClick={() => setTab('stalled')}>
              Work this list
            </Button>
          </div>
        </Panel>
      )}

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: ESTIMATES.length },
          { id: 'draft', label: 'Draft' },
          { id: 'sent', label: 'Sent' },
          { id: 'opened', label: 'Opened' },
          { id: 'stalled', label: 'Stalled 7d+', count: stalled.length },
          { id: 'approved', label: 'Approved' },
          { id: 'declined', label: 'Declined' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Panel data-tour="estimates" className="overflow-hidden">
        <DataTable
          rows={filtered}
          onRowClick={(e) => setSelected(e)}
          empty="No estimates in this view"
          columns={[
            {
              key: 'num',
              head: 'Estimate',
              render: (e: Estimate) => (
                <div>
                  <p className="font-mono text-xs text-white">{e.number}</p>
                  <p className="text-[11px] text-gd-steel">{e.owner}</p>
                </div>
              ),
            },
            {
              key: 'cust',
              head: 'Customer / Property',
              render: (e: Estimate) => (
                <div>
                  <p className="font-semibold text-white">{e.customer.replace(/^\*/, '')}</p>
                  <p className="text-[11px] text-gd-steel">{e.property}</p>
                </div>
              ),
            },
            {
              key: 'tier',
              head: 'Package',
              render: (e: Estimate) => (
                <Badge tone={e.tier === 'Best' ? 'neon' : e.tier === 'Better' ? 'electric' : 'steel'}>
                  {e.tier}
                </Badge>
              ),
            },
            {
              key: 'engine',
              head: 'Engine',
              render: (e: Estimate) => (
                <span className="text-[11px] text-gd-steel">
                  {e.engine === 'lighting' ? 'B · Lighting' : 'A · Multifamily'}
                </span>
              ),
            },
            {
              key: 'status',
              head: 'Status',
              render: (e: Estimate) => (
                <Badge
                  tone={
                    e.status === 'approved'
                      ? 'neon'
                      : e.status === 'declined'
                        ? 'red'
                        : e.status === 'draft'
                          ? 'steel'
                          : 'amber'
                  }
                >
                  {e.status}
                </Badge>
              ),
            },
            {
              key: 'age',
              head: 'Age',
              render: (e: Estimate) => (
                <span className={e.ageDays >= 7 && e.status === 'opened' ? 'text-gd-red' : 'text-gd-chrome'}>
                  {e.status === 'draft' ? '—' : `${e.ageDays}d`}
                </span>
              ),
            },
            {
              key: 'sent',
              head: 'Sent',
              render: (e: Estimate) => (
                <span className="text-gd-chrome">{e.sentAt ? shortDate(e.sentAt) : '—'}</span>
              ),
            },
            {
              key: 'total',
              head: 'Total',
              align: 'right',
              render: (e: Estimate) => (
                <span className="font-display font-black text-gd-neon">
                  {money(estimateTotals(e).total)}
                </span>
              ),
            },
          ]}
        />
      </Panel>

      {/* ── Estimate detail ─────────────────────────────── */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.number ?? ''}
        subtitle={selected ? `${selected.customer.replace(/^\*/, '')} · ${selected.property}` : undefined}
        width="max-w-2xl"
      >
        {selected && <EstimateDetail estimate={selected} />}
      </Drawer>

      {/* ── Builder ─────────────────────────────────────── */}
      <Drawer
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="Estimate Builder"
        subtitle="Select services, choose a package tier, add options, send for approval"
        width="max-w-3xl"
      >
        <EstimateBuilder />
      </Drawer>
    </div>
  );
}

function EstimateDetail({ estimate }: { estimate: Estimate }) {
  const t = estimateTotals(estimate);
  const tier = TIERS[estimate.tier];

  const track = [
    { label: 'Drafted', done: true },
    { label: 'Sent', done: !!estimate.sentAt },
    { label: 'Opened', done: !!estimate.openedAt },
    { label: 'Approved', done: !!estimate.approvedAt },
    { label: 'Converted to Job', done: !!estimate.approvedAt },
  ];

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: `${tier.accent}44`, background: `${tier.accent}0d` }}
      >
        <p className="font-display text-lg font-black uppercase tracking-wider" style={{ color: tier.accent }}>
          {tier.label} Package
        </p>
        <p className="mt-1 text-xs text-gd-steel">{tier.blurb}</p>
      </div>

      {/* Approval track */}
      <div className="flex items-center gap-1">
        {track.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center gap-1">
            <div className="flex-1">
              <div
                className={`h-1 rounded-full ${s.done ? 'bg-gd-neon' : 'bg-white/10'}`}
              />
              <p className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider ${s.done ? 'text-gd-neon' : 'text-gd-steel/60'}`}>
                {s.label}
              </p>
            </div>
            {i < track.length - 1 && <span className="text-gd-steel/30">›</span>}
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">
          Line Items
        </p>
        <div className="overflow-hidden rounded-lg border border-gd-line">
          {estimate.lines.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-3.5 py-2.5 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{l.service}</p>
                <p className="text-[11px] text-gd-steel">
                  {l.qty.toLocaleString()} {l.unit} × {money(l.rate, { cents: l.rate < 10 })}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm text-white">{money(l.qty * l.rate)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg border border-gd-line bg-gd-hull/50 p-4">
        {[
          ['Subtotal', money(t.subtotal), '#C9D4E0'],
          ...(t.discount ? [['Discount', `− ${money(t.discount)}`, '#FFB020'] as const] : []),
          ...(t.tax ? [['Tax', money(t.tax), '#C9D4E0'] as const] : []),
        ].map(([l, v, c]) => (
          <div key={l} className="flex justify-between text-sm">
            <span className="text-gd-steel">{l}</span>
            <span style={{ color: c as string }}>{v}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2.5">
          <span className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
            Total
          </span>
          <span className="font-display text-2xl font-black text-gd-neon">{money(t.total)}</span>
        </div>
        {estimate.depositPct > 0 && (
          <div className="flex justify-between pt-1 text-sm">
            <span className="text-gd-steel">Deposit due at approval ({estimate.depositPct}%)</span>
            <span className="text-gd-electric">{money(t.deposit)}</span>
          </div>
        )}
        <p className="pt-2 text-[10px] text-gd-steel/70">
          Financing / payment plan options available at checkout — placeholder for the production
          payment integration.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary"><Send className="h-3.5 w-3.5" /> Send Estimate</Button>
        <Button variant="neon"><FileCheck2 className="h-3.5 w-3.5" /> Mark Approved</Button>
        <Button variant="ghost">Convert to Job</Button>
        <DemoAction label="Approval Required" />
      </div>
      <p className="text-[11px] leading-relaxed text-gd-steel">
        In owner demo mode nothing is emailed or charged. In production, sending would deliver the
        estimate to {estimate.customer.replace(/^\*/, '')} and start the follow-up sequence.
      </p>
    </div>
  );
}

function EstimateBuilder() {
  const [tier, setTier] = useState<keyof typeof TIERS>('Better');
  const [picked, setPicked] = useState<Record<string, number>>({ pb6: 8, pb7: 5, pb10: 12000 });
  const [addOns, setAddOns] = useState<string[]>(['a1']);
  const [discount, setDiscount] = useState(0);

  const lines = Object.entries(picked)
    .map(([id, qty]) => {
      const item = PRICEBOOK.find((p) => p.id === id)!;
      return { item, qty, total: qty * item.rate };
    })
    .filter((l) => l.qty > 0);

  const base = lines.reduce((s, l) => s + l.total, 0);
  const tiered = base * TIERS[tier].mult;
  const addOnTotal = ADD_ONS.filter((a) => addOns.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const subtotal = tiered + addOnTotal;
  const total = subtotal - discount;
  const deposit = total * 0.25;

  const bump = (id: string, dir: 1 | -1) =>
    setPicked((p) => {
      const item = PRICEBOOK.find((x) => x.id === id)!;
      const step = item.rate < 5 ? 1000 : 1;
      const next = Math.max(0, (p[id] ?? 0) + dir * step);
      return { ...p, [id]: next };
    });

  return (
    <div className="space-y-5">
      {/* Tier selection */}
      <div>
        <SectionHead title="Package Tier" sub="One scope, three commitment levels" />
        <div className="grid grid-cols-3 gap-2.5">
          {(Object.keys(TIERS) as (keyof typeof TIERS)[]).map((k) => {
            const t = TIERS[k];
            const active = tier === k;
            return (
              <button
                key={k}
                onClick={() => setTier(k)}
                className="rounded-xl border p-3.5 text-left transition-all"
                style={{
                  borderColor: active ? `${t.accent}88` : 'rgba(255,255,255,.08)',
                  background: active ? `${t.accent}12` : 'rgba(255,255,255,.02)',
                }}
              >
                <p className="font-display text-sm font-black uppercase tracking-wider" style={{ color: active ? t.accent : '#C9D4E0' }}>
                  {t.label}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-gd-steel">{t.blurb}</p>
                <p className="mt-2 font-mono text-sm text-white">{money(base * t.mult)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services */}
      <div>
        <SectionHead title="Services" sub="Priced from the Get Down pricebook" />
        <div className="max-h-[280px] space-y-1.5 overflow-y-auto pr-1">
          {PRICEBOOK.map((p) => {
            const qty = picked[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                  qty > 0
                    ? 'border-gd-electric/35 bg-gd-electric/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{p.service}</p>
                  <p className="text-[10px] text-gd-steel">
                    {money(p.rate, { cents: p.rate < 10 })} / {p.unit} · min {money(p.minimum)} ·{' '}
                    {p.crewHours}h crew
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => bump(p.id, -1)}
                    className="grid h-6 w-6 place-items-center rounded border border-white/10 text-gd-steel hover:bg-white/5 hover:text-white"
                    aria-label={`Decrease ${p.service}`}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-14 text-center font-mono text-xs text-white">
                    {qty ? qty.toLocaleString() : '—'}
                  </span>
                  <button
                    onClick={() => bump(p.id, 1)}
                    className="grid h-6 w-6 place-items-center rounded border border-white/10 text-gd-steel hover:bg-white/5 hover:text-white"
                    aria-label={`Increase ${p.service}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-xs text-gd-neon">
                  {qty ? money(qty * p.rate) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <SectionHead title="Optional Add-Ons" />
        <div className="space-y-1.5">
          {ADD_ONS.map((a) => {
            const on = addOns.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => setAddOns((v) => (on ? v.filter((x) => x !== a.id) : [...v, a.id]))}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                  on ? 'border-gd-neon/35 bg-gd-neon/[0.07]' : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                    on ? 'border-gd-neon bg-gd-neon/20' : 'border-white/20'
                  }`}
                >
                  {on && <Check className="h-3 w-3 text-gd-neon" />}
                </span>
                <span className="flex-1 text-xs text-white">{a.name}</span>
                <span className="text-[10px] text-gd-steel">{a.unit}</span>
                <span className="font-mono text-xs text-gd-neon">{money(a.price)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-1.5 rounded-lg border border-gd-line bg-gd-hull/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gd-steel">Services ({TIERS[tier].label} tier)</span>
          <span className="text-white">{money(tiered)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gd-steel">Add-ons</span>
          <span className="text-white">{money(addOnTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gd-steel">Discount</span>
          <div className="flex items-center gap-2">
            {[0, 250, 500, 1000].map((d) => (
              <button
                key={d}
                onClick={() => setDiscount(d)}
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  discount === d ? 'bg-gd-amber/20 text-gd-amber' : 'text-gd-steel hover:text-white'
                }`}
              >
                {d ? `−$${d}` : 'none'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2.5">
          <span className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
            Total
          </span>
          <span className="font-display text-2xl font-black text-gd-neon">{money(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gd-steel">Deposit at approval (25%)</span>
          <span className="text-gd-electric">{money(deposit)}</span>
        </div>
        <div className="pt-2">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-gd-steel">
            Estimated crew time
          </p>
          <Progress
            value={Math.min(100, (lines.reduce((s, l) => s + l.item.crewHours, 0) / 40) * 100)}
            color="#22B8FF"
          />
          <p className="mt-1 font-mono text-[10px] text-gd-steel">
            {lines.reduce((s, l) => s + l.item.crewHours, 0)}h across{' '}
            {lines.length || 0} services
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary"><Send className="h-3.5 w-3.5" /> Send for Approval</Button>
        <Button variant="ghost">Save Draft</Button>
        <Button variant="ghost"><Sparkles className="h-3.5 w-3.5" /> AI Scope Notes</Button>
        <DemoAction />
      </div>
    </div>
  );
}
