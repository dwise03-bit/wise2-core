'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ClipboardList,
  FileWarning,
  Lightbulb,
  Plus,
  Repeat,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { Badge, KPI, Panel, Progress, SectionHead } from '@/components/ui/kit';
import {
  CREW,
  FOLLOW_UPS,
  JOBS,
  OPPORTUNITIES,
  PROPERTIES,
  REVENUE_SERIES,
  REVIEWS,
  SOURCE_PERFORMANCE,
  TODAY,
} from '@/lib/data/seed';
import { JOB_STATUS_META, STAGE_META, compactMoney, money, ownerMetrics, pct } from '@/lib/metrics';

const m = ownerMetrics();

const hourLabel = (h: number) => {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return `${display}:${String(min).padStart(2, '0')} ${ampm}`;
};

export default function Dashboard() {
  const router = useRouter();
  const todayJobs = JOBS.filter((j) => j.date === TODAY).sort((a, b) => a.start - b.start);
  const chartData = REVENUE_SERIES.map((r) => ({
    ...r,
    total: r.recurring + r.project + r.lighting,
  }));
  const sourceSlices = SOURCE_PERFORMANCE.slice(0, 6).map((s) => ({
    name: s.source,
    value: s.leads,
  }));
  const sliceColors = ['#22B8FF', '#7CFF3D', '#A66BFF', '#FFB020', '#0E7BD1', '#C9D4E0'];

  const pipelineByStage = Object.keys(STAGE_META)
    .filter((s) => !['completed', 'lost'].includes(s))
    .map((stage) => {
      const items = OPPORTUNITIES.filter((o) => o.stage === stage);
      return {
        stage,
        count: items.length,
        value: items.reduce((s, o) => s + o.value, 0),
      };
    });

  return (
    <div className="mx-auto max-w-[1720px] space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.34em] text-gd-neon">
            Power. Precision. Clean.
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-black uppercase tracking-tight text-white">
            Business Command Center
          </h1>
          <p className="mt-1.5 text-sm text-gd-steel">
            Friday, August 15, 2026 · {todayJobs.length} jobs today · {CREW.length} crew resources ·
            territory clear
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dispatch"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gd-electric/45 bg-gd-electric/15 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gd-electric transition-all hover:bg-gd-electric/25"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Dispatch Board
          </Link>
          <Link
            href="/follow-ups"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gd-neon/45 bg-gd-neon/15 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gd-neon transition-all hover:bg-gd-neon/25"
          >
            <Repeat className="h-3.5 w-3.5" /> {FOLLOW_UPS.length} Follow-Ups Waiting
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div data-tour="kpis" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KPI label="Revenue MTD" value={money(m.revenueMtd)} delta="+18% vs last month" accent="#7CFF3D" spark={[42, 48, 45, 58, 62, 71, 68, 79]} onClick={() => router.push('/reports')} />
        <KPI label="Revenue YTD" value={money(m.revenueYtd)} delta="+34% vs last year" accent="#22B8FF" spark={[30, 38, 44, 52, 61, 70, 82, 96]} onClick={() => router.push('/reports')} />
        <KPI label="Recurring Revenue" value={`${money(m.recurringMonthly)}/mo`} note={`${money(m.recurringAnnual)} annual contract value`} accent="#7CFF3D" onClick={() => router.push('/contracts')} />
        <KPI label="Open Estimates" value={String(m.openEstimates)} note={`${money(m.estimateValue)} in play`} accent="#FFB020" onClick={() => router.push('/estimates')} />
        <KPI label="Estimate Value" value={money(m.estimateValue)} delta="+12% vs last month" accent="#FFB020" spark={[28, 34, 31, 40, 44, 41, 52, 58]} onClick={() => router.push('/estimates')} />
        <KPI label="New Leads" value={String(m.newLeads)} delta="+5 this week" accent="#22B8FF" spark={[4, 6, 5, 8, 7, 9, 11, 12]} onClick={() => router.push('/leads')} />
        <KPI label="Booked Jobs" value={String(m.bookedJobs)} note="Approved, awaiting or on schedule" accent="#7CFF3D" onClick={() => router.push('/jobs')} />
        <KPI label="Jobs Completed" value={String(m.jobsCompleted)} delta="+9 vs last month" accent="#7CFF3D" spark={[22, 28, 31, 29, 36, 41, 44, 47]} onClick={() => router.push('/jobs')} />
        <KPI label="Jobs Scheduled" value={String(m.jobsScheduled)} note="Next 14 days" accent="#22B8FF" onClick={() => router.push('/dispatch')} />
        <KPI label="Outstanding Invoices" value={money(m.outstanding)} note="2 past due" accent="#FF4D5E" onClick={() => router.push('/invoices')} />
        <KPI label="Average Ticket" value={money(m.avgTicket)} delta="+6% vs last month" accent="#A66BFF" spark={[3.1, 3.4, 3.2, 4.1, 4.4, 4.9, 5.2, 5.6]} onClick={() => router.push('/reports')} />
        <KPI label="Close Rate" value={pct(m.closeRate)} delta="+7 pts vs last quarter" accent="#7CFF3D" spark={[41, 44, 46, 45, 52, 55, 58, 62]} onClick={() => router.push('/reports')} />
      </div>

      {/* Revenue + engines */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5 xl:col-span-2">
          <SectionHead
            title="Revenue by Engine"
            sub="Recurring multifamily work is the floor. Project work and lighting ride on top of it."
            right={
              <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-gd-neon">
                  <span className="h-2 w-2 rounded-sm bg-gd-neon" /> Recurring
                </span>
                <span className="flex items-center gap-1.5 text-gd-electric">
                  <span className="h-2 w-2 rounded-sm bg-gd-electric" /> Project
                </span>
                <span className="flex items-center gap-1.5 text-gd-violet">
                  <span className="h-2 w-2 rounded-sm bg-gd-violet" /> Lighting
                </span>
              </div>
            }
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  {[
                    ['gRec', '#7CFF3D'],
                    ['gProj', '#22B8FF'],
                    ['gLight', '#A66BFF'],
                  ].map(([id, c]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="month" stroke="#8AA0B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8AA0B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#071322',
                    border: '1px solid #16324D',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#C9D4E0', fontWeight: 700 }}
                  formatter={(v: number, n: string) => [money(v), n]}
                />
                <Area type="monotone" dataKey="recurring" stackId="1" stroke="#7CFF3D" strokeWidth={1.6} fill="url(#gRec)" />
                <Area type="monotone" dataKey="project" stackId="1" stroke="#22B8FF" strokeWidth={1.6} fill="url(#gProj)" />
                <Area type="monotone" dataKey="lighting" stackId="1" stroke="#A66BFF" strokeWidth={1.6} fill="url(#gLight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gd-electric to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gd-electric">
              Engine A · Commercial Backbone
            </p>
            <h3 className="mt-1.5 font-display text-xl font-extrabold uppercase text-white">
              Multifamily
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gd-steel">
              We don&apos;t chase houses. We maintain communities.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="font-display text-2xl font-black text-white">{m.activeContracts}</p>
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">Active contracts</p>
              </div>
              <div>
                <p className="font-display text-2xl font-black text-gd-neon">
                  {compactMoney(m.recurringAnnual)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">Annual value</p>
              </div>
            </div>
            <Link
              href="/properties"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gd-electric hover:text-white"
            >
              <Building2 className="h-3.5 w-3.5" /> Open property portfolio
            </Link>
          </Panel>

          <Panel className="relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gd-violet to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gd-violet">
              Engine B · Residential / Seasonal
            </p>
            <h3 className="mt-1.5 font-display text-xl font-extrabold uppercase text-white">
              Premium Lighting
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gd-steel">
              Not a temporary kit. A permanent upgrade — running year-round.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="font-display text-2xl font-black text-white">
                  {compactMoney(m.lightingPipeline)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">Open pipeline</p>
              </div>
              <div>
                <p className="font-display text-2xl font-black text-gd-violet">6</p>
                <p className="text-[10px] uppercase tracking-wider text-gd-steel">Live campaigns</p>
              </div>
            </div>
            <Link
              href="/lighting"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gd-violet hover:text-white"
            >
              <Lightbulb className="h-3.5 w-3.5" /> Open lighting division
            </Link>
          </Panel>
        </div>
      </div>

      {/* Pipeline snapshot + today + attention */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <SectionHead title="Sales Pipeline" sub={`${money(m.pipelineValue)} open · ${money(m.weightedPipeline)} weighted`} />
          <div className="space-y-2.5">
            {pipelineByStage.map((s) => {
              const meta = STAGE_META[s.stage];
              const max = Math.max(...pipelineByStage.map((x) => x.value));
              return (
                <Link key={s.stage} href="/leads" className="block group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gd-chrome group-hover:text-white">
                      {meta.label}
                    </span>
                    <span className="font-mono text-gd-steel">
                      {s.count} · {compactMoney(s.value)}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Progress value={(s.value / max) * 100} color={meta.accent} height={5} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Today's Schedule" sub="Live crew status across the territory" />
          <div className="space-y-2">
            {todayJobs.slice(0, 7).map((j) => {
              const crew = CREW.find((c) => c.id === j.crewId);
              const st = JOB_STATUS_META[j.status];
              return (
                <Link
                  key={j.id}
                  href="/dispatch"
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 transition-colors hover:border-gd-electric/30 hover:bg-gd-electric/[0.06]"
                >
                  <span className="w-[62px] shrink-0 font-mono text-[11px] text-gd-steel">
                    {hourLabel(j.start)}
                  </span>
                  <span
                    className="h-8 w-[3px] shrink-0 rounded-full"
                    style={{ background: st.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{j.property}</p>
                    <p className="truncate text-[11px] text-gd-steel">{j.service}</p>
                  </div>
                  {crew ? (
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[9px] font-black text-gd-void"
                      style={{ background: crew.color }}
                      title={crew.name}
                    >
                      {crew.initials}
                    </span>
                  ) : (
                    <Badge tone="steel">Open</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Needs Attention" sub="What the system thinks you should touch today" />
          <div className="space-y-2">
            {[
              { icon: FileWarning, tone: '#FF4D5E', title: 'Fairgrove contract ends Aug 31', sub: '$41,600 renewal · COI also expiring', href: '/contracts' },
              { icon: AlertTriangle, tone: '#FFB020', title: 'Kingsley COI blocking fall service', sub: '$10,700 of work on hold 12 days', href: '/documents' },
              { icon: ClipboardList, tone: '#FFB020', title: '3 estimates opened, not approved', sub: '$28,900 sitting unclosed', href: '/estimates' },
              { icon: Truck, tone: '#22B8FF', title: '3 jobs unassigned today', sub: 'Riverstone punch list + 2 more', href: '/dispatch' },
              { icon: Sparkles, tone: '#7CFF3D', title: 'Ashford Place conversion ready', sub: 'One-time → $26,800 recurring program', href: '/contracts' },
              { icon: Star, tone: '#A66BFF', title: '2 reviews awaiting response', sub: 'Reputation compounding opportunity', href: '/reviews' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.title}
                  href={a.href}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-gd-electric/30 hover:bg-gd-electric/[0.06]"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: a.tone }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-snug text-white">{a.title}</p>
                    <p className="mt-0.5 text-[11px] text-gd-steel">{a.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Sources + properties + reviews */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <SectionHead title="Lead Sources" sub="Where the work actually comes from" />
          <div className="flex items-center gap-4">
            <div className="h-[168px] w-[168px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceSlices}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {sourceSlices.map((_, i) => (
                      <Cell key={i} fill={sliceColors[i % sliceColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#071322',
                      border: '1px solid #16324D',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {sourceSlices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-[11px]">
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ background: sliceColors[i % sliceColors.length] }}
                  />
                  <span className="flex-1 truncate text-gd-chrome">{s.name}</span>
                  <span className="font-mono text-gd-steel">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/reports"
            className="mt-3 inline-block text-[11px] font-bold uppercase tracking-wider text-gd-electric hover:text-white"
          >
            Full attribution report →
          </Link>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Portfolio Health" sub="Recurring properties by contract status" />
          <div className="space-y-2">
            {PROPERTIES.filter((p) => p.frequency !== 'One-Time')
              .sort((a, b) => b.contractValue - a.contractValue)
              .slice(0, 6)
              .map((p) => (
                <Link
                  key={p.id}
                  href="/properties"
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 transition-colors hover:border-gd-electric/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                    <p className="text-[11px] text-gd-steel">
                      {p.buildings} bldg · {p.units} units · {p.frequency}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-gd-neon">
                    {compactMoney(p.contractValue)}
                  </span>
                  <Badge
                    tone={p.risk === 'healthy' ? 'neon' : p.risk === 'watch' ? 'amber' : 'red'}
                  >
                    {p.risk === 'healthy' ? 'OK' : p.risk === 'watch' ? 'Watch' : 'Risk'}
                  </Badge>
                </Link>
              ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Reputation" sub={`${m.avgRating.toFixed(1)} average · ${m.reviewCount} lifetime reviews`} />
          <div className="space-y-2">
            {REVIEWS.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-semibold text-white">{r.customer}</p>
                  <span className="shrink-0 text-[11px] text-gd-amber">
                    {'★'.repeat(r.rating)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gd-steel">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/reviews"
            className="mt-3 inline-block text-[11px] font-bold uppercase tracking-wider text-gd-electric hover:text-white"
          >
            Reputation dashboard →
          </Link>
        </Panel>
      </div>

      {/* Quick actions */}
      <Panel className="p-5">
        <SectionHead title="Quick Actions" />
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'New Lead', href: '/leads', tone: '#22B8FF' },
            { label: 'Build Estimate', href: '/estimates', tone: '#FFB020' },
            { label: 'Schedule Job', href: '/dispatch', tone: '#7CFF3D' },
            { label: 'Add Property', href: '/properties', tone: '#22B8FF' },
            { label: 'Request COI', href: '/documents', tone: '#C9D4E0' },
            { label: 'Create Content', href: '/marketing', tone: '#A66BFF' },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-all hover:border-white/20 hover:bg-white/[0.06]"
            >
              <Plus className="h-4 w-4" style={{ color: a.tone }} />
              <span className="text-xs font-bold uppercase tracking-wider text-gd-chrome group-hover:text-white">
                {a.label}
              </span>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
