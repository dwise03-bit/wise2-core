'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge, DataTable, Panel, Progress, SectionHead } from '@/components/ui/kit';
import { REVENUE_SERIES, SOURCE_PERFORMANCE } from '@/lib/data/seed';
import { compactMoney, money, ownerMetrics, pct } from '@/lib/metrics';

const m = ownerMetrics();

const tooltipStyle = {
  background: '#071322',
  border: '1px solid #16324D',
  borderRadius: 10,
  fontSize: 12,
};

export default function ReportsPage() {
  const totalLeads = SOURCE_PERFORMANCE.reduce((s, x) => s + x.leads, 0);
  const totalRevenue = SOURCE_PERFORMANCE.reduce((s, x) => s + x.revenue, 0);
  const totalRecurring = SOURCE_PERFORMANCE.reduce((s, x) => s + x.recurring, 0);

  const trend = REVENUE_SERIES.map((r) => ({
    month: r.month,
    total: r.recurring + r.project + r.lighting,
    recurring: r.recurring,
  }));

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Reports &amp; Attribution
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Where the work comes from, what it is worth, and which sources build recurring revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          ['Total Leads (12mo)', String(totalLeads), '#22B8FF'],
          ['Attributed Revenue', money(totalRevenue), '#7CFF3D'],
          ['Recurring From Sources', money(totalRecurring), '#7CFF3D'],
          ['Blended Close Rate', pct(m.closeRate), '#A66BFF'],
          ['Average Ticket', money(m.avgTicket), '#FFB020'],
          ['Revenue YTD', money(m.revenueYtd), '#C9D4E0'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel className="p-5">
          <SectionHead title="Revenue Trend" sub="Total revenue against the recurring floor" />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#16324D" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#8AA0B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8AA0B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v / 1000}k`}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [money(v), n]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#22B8FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recurring" name="Recurring floor" stroke="#7CFF3D" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Revenue by Source" sub="Commercial relationships dominate the dollars" />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SOURCE_PERFORMANCE}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 58, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  stroke="#8AA0B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="source"
                  stroke="#8AA0B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,.04)' }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [money(v), 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[0, 3, 3, 0]}>
                  {SOURCE_PERFORMANCE.map((s, i) => (
                    <Cell key={i} fill={s.recurring > 20000 ? '#7CFF3D' : '#22B8FF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-gd-steel">
            Green bars are sources that produced meaningful recurring contract revenue.
          </p>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-gd-line px-5 py-4">
          <SectionHead
            title="Lead Source Attribution"
            sub="Leads, revenue, close rate, average ticket, recurring revenue, and acquisition cost by source"
          />
        </div>
        <DataTable
          rows={SOURCE_PERFORMANCE}
          columns={[
            {
              key: 'source',
              head: 'Source',
              render: (s) => <span className="font-semibold text-white">{s.source}</span>,
            },
            { key: 'leads', head: 'Leads', render: (s) => <span className="text-gd-chrome">{s.leads}</span> },
            {
              key: 'close',
              head: 'Close Rate',
              render: (s) => (
                <div className="w-28">
                  <div className="flex items-center justify-between text-[11px] text-gd-chrome">
                    <span>{s.closeRate}%</span>
                  </div>
                  <div className="mt-1">
                    <Progress value={s.closeRate} color={s.closeRate > 50 ? '#7CFF3D' : '#22B8FF'} height={4} />
                  </div>
                </div>
              ),
            },
            {
              key: 'ticket',
              head: 'Avg Ticket',
              align: 'right',
              render: (s) => <span className="text-gd-chrome">{money(s.avgTicket)}</span>,
            },
            {
              key: 'recurring',
              head: 'Recurring Generated',
              align: 'right',
              render: (s) => (
                <span className={s.recurring ? 'text-gd-neon' : 'text-gd-steel'}>
                  {s.recurring ? money(s.recurring) : '—'}
                </span>
              ),
            },
            {
              key: 'cac',
              head: 'Acquisition Cost',
              align: 'right',
              render: (s) => (
                <span className="text-gd-steel">{s.cac ? money(s.cac) : 'No spend'}</span>
              ),
            },
            {
              key: 'revenue',
              head: 'Revenue',
              align: 'right',
              render: (s) => (
                <span className="font-display font-black text-gd-neon">{compactMoney(s.revenue)}</span>
              ),
            },
          ]}
        />
        <div className="border-t border-gd-line px-5 py-3">
          <Badge tone="amber">
            Acquisition cost is a placeholder input — connect ad spend in production for true CAC
          </Badge>
        </div>
      </Panel>
    </div>
  );
}
