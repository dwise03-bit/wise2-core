'use client';

import {
  Building2,
  DollarSign,
  Repeat,
  Truck,
  UserCheck,
  UserMinus,
  Users,
  Wrench,
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge, Panel, Progress, SectionHead } from '@/components/ui/kit';
import { CREW, JOBS, PROPERTIES, REVENUE_SERIES } from '@/lib/data/seed';
import { compactMoney, money, ownerMetrics, pct } from '@/lib/metrics';

const m = ownerMetrics();

const LOOP = [
  { icon: Building2, label: 'Win Property', detail: 'A signed program, not a one-time job' },
  { icon: DollarSign, label: 'Secure Revenue', detail: 'Contract value is committed before spend' },
  { icon: Truck, label: 'Add Equipment / Help', detail: 'Capacity follows contracts — never ahead' },
  { icon: Wrench, label: 'Train Crew', detail: 'The standard is taught, not improvised' },
  { icon: UserMinus, label: 'Owner Steps Out', detail: 'You stop being the bottleneck' },
  { icon: UserCheck, label: 'Crew Operates', detail: 'The system runs without you on site' },
  { icon: Repeat, label: 'Win Next Property', detail: 'Capacity is free to sell again' },
];

export default function GrowthPage() {
  const bookedHours = CREW.reduce((s, c) => s + c.hoursBooked, 0);
  const capacityHours = CREW.reduce((s, c) => s + c.hoursCapacity, 0);
  const revenuePerCrew = Math.round(m.revenueMtd / CREW.length);
  const commercialValue = PROPERTIES.reduce((s, p) => s + p.contractValue, 0);

  const projected = REVENUE_SERIES.slice(-6).map((r) => ({
    month: r.month,
    booked: r.recurring + r.project,
    lighting: r.lighting,
  }));

  // The decision rule: hire when secured recurring work outruns crew capacity.
  const utilization = (bookedHours / capacityHours) * 100;
  const hireSignal = utilization > 80;

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
          Controlled Growth Loop
        </h1>
        <p className="mt-1.5 text-sm text-gd-steel">
          Built to maintain. Engineered to grow. Capacity expands only as properties are secured.
        </p>
      </div>

      {/* ── The loop ─────────────────────────────────────── */}
      <Panel data-tour="growth" className="p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {LOOP.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="relative">
                <div className="gd-panel h-full rounded-xl p-4 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-gd-electric/40 bg-gd-electric/10">
                    <Icon className="h-5 w-5 text-gd-electric" />
                  </div>
                  <p className="mt-2.5 font-display text-[11px] font-black uppercase leading-tight tracking-wider text-white">
                    {s.label}
                  </p>
                  <p className="mt-1.5 text-[10px] leading-snug text-gd-steel">{s.detail}</p>
                </div>
                {i < LOOP.length - 1 && (
                  <span className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 font-display text-lg text-gd-neon xl:block">
                    ›
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-lg border border-gd-neon/25 bg-gd-neon/[0.05] px-4 py-3">
          {[
            'Capacity follows contracts.',
            'We do NOT buy equipment before work is secured.',
            'Grow in increments.',
            'Repeat.',
          ].map((r) => (
            <span key={r} className="text-xs font-semibold text-gd-neon">
              ✓ {r}
            </span>
          ))}
        </div>
      </Panel>

      {/* ── Decision numbers ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {[
          ['Crew Capacity', `${capacityHours}h / wk`, '#22B8FF'],
          ['Booked Workload', `${bookedHours}h / wk`, '#7CFF3D'],
          ['Utilization', pct(utilization), utilization > 80 ? '#FF4D5E' : '#7CFF3D'],
          ['Pipeline Value', compactMoney(m.pipelineValue), '#A66BFF'],
          ['Recurring Revenue', `${compactMoney(m.recurringMonthly)}/mo`, '#7CFF3D'],
          ['Revenue Per Crew', compactMoney(revenuePerCrew), '#22B8FF'],
          ['Commercial Contract Value', compactMoney(commercialValue), '#C9D4E0'],
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
        {/* Hire signal */}
        <Panel className={`p-5 ${hireSignal ? 'border-gd-amber/30' : 'border-gd-neon/25'}`}>
          <SectionHead
            title="Growth Signal"
            sub="Does the data justify another person or another truck?"
          />
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: hireSignal ? 'rgba(255,176,32,.35)' : 'rgba(124,255,61,.3)',
              background: hireSignal ? 'rgba(255,176,32,.07)' : 'rgba(124,255,61,.05)',
            }}
          >
            <p
              className="font-display text-sm font-black uppercase tracking-wider"
              style={{ color: hireSignal ? '#FFB020' : '#7CFF3D' }}
            >
              {hireSignal ? 'Approaching capacity' : 'Capacity available'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gd-chrome">
              {hireSignal
                ? `Crews are at ${pct(utilization)} of weekly capacity with ${money(m.pipelineValue)} in the pipeline. If ${money(m.weightedPipeline)} of weighted pipeline converts, the current crew cannot absorb it. The rule holds: secure the contract first, then add the helper.`
                : `Crews are at ${pct(utilization)} of weekly capacity. There is room to sell into the existing crew before adding cost.`}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {CREW.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-2 text-gd-chrome">
                    <span
                      className="grid h-5 w-5 place-items-center rounded text-[8px] font-black text-gd-void"
                      style={{ background: c.color }}
                    >
                      {c.initials}
                    </span>
                    {c.name}
                  </span>
                  <span className="font-mono text-gd-steel">
                    {c.hoursBooked}/{c.hoursCapacity}h
                  </span>
                </div>
                <div className="mt-1">
                  <Progress
                    value={(c.hoursBooked / c.hoursCapacity) * 100}
                    color={c.hoursBooked / c.hoursCapacity > 0.85 ? '#FF4D5E' : c.color}
                    height={4}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Projected workload */}
        <Panel className="p-5 xl:col-span-2">
          <SectionHead
            title="Projected Workload"
            sub="Secured recurring + project revenue versus the lighting division"
          />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projected} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#8AA0B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8AA0B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,.04)' }}
                  contentStyle={{
                    background: '#071322',
                    border: '1px solid #16324D',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(v: number, n: string) => [money(v), n]}
                />
                <Bar dataKey="booked" name="Cleaning" fill="#7CFF3D" radius={[3, 3, 0, 0]} />
                <Bar dataKey="lighting" name="Lighting" fill="#A66BFF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Jobs completed (YTD)', String(m.jobsCompleted)],
              ['Average ticket', money(m.avgTicket)],
              ['Close rate', pct(m.closeRate)],
              ['Jobs on the board today', String(JOBS.filter((j) => j.date === '2026-08-15').length)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">{l}</p>
                <p className="mt-1 font-display text-base font-black text-white">{v}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <SectionHead title="The Get Down Difference" sub="What the system is protecting" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ['Proven Multifamily Experience', Users],
            ['Professional Crews & Equipment', Truck],
            ['Reliable Communication', Repeat],
            ['Cleaner Properties', Building2],
            ['Long-Term Partnerships', UserCheck],
          ].map(([label, Icon]) => {
            const I = Icon as typeof Users;
            return (
              <div
                key={label as string}
                className="rounded-xl border border-gd-line bg-white/[0.02] p-4 text-center"
              >
                <I className="mx-auto h-5 w-5 text-gd-neon" />
                <p className="mt-2 font-display text-[11px] font-black uppercase leading-tight tracking-wider text-white">
                  {label as string}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <Badge tone="neon">Built to maintain. Engineered to grow.</Badge>
        </div>
      </Panel>
    </div>
  );
}
