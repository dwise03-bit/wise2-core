'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge, DataTable, DemoAction, Panel, SectionHead } from '@/components/ui/kit';
import { PAYMENTS } from '@/lib/data/seed';
import type { Payment } from '@/lib/data/types';
import { longDate, money } from '@/lib/metrics';

const METHOD_TONE: Record<string, string> = {
  ACH: '#7CFF3D',
  Card: '#22B8FF',
  Check: '#C9D4E0',
  Cash: '#FFB020',
};

export default function PaymentsPage() {
  const total = PAYMENTS.reduce((s, p) => s + p.amount, 0);
  const byMethod = (['ACH', 'Card', 'Check', 'Cash'] as const).map((m) => ({
    method: m,
    amount: PAYMENTS.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0),
  }));

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Payments
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Money collected, by method and by relationship.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Collected (MTD)', money(total), '#7CFF3D'],
          ['Payments Recorded', String(PAYMENTS.length), '#22B8FF'],
          ['Largest Payment', money(Math.max(...PAYMENTS.map((p) => p.amount))), '#A66BFF'],
          ['ACH Share', `${Math.round((byMethod[0].amount / total) * 100)}%`, '#C9D4E0'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <SectionHead title="By Method" sub="Commercial accounts settle by ACH and check" />
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMethod} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="method" stroke="#8AA0B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8AA0B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,.04)' }}
                  contentStyle={{ background: '#071322', border: '1px solid #16324D', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [money(v), 'Collected']}
                />
                <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
                  {byMethod.map((b) => (
                    <Cell key={b.method} fill={METHOD_TONE[b.method]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="overflow-hidden xl:col-span-2">
          <div className="border-b border-gd-line px-5 py-4">
            <SectionHead title="Recent Payments" />
          </div>
          <DataTable
            rows={PAYMENTS}
            columns={[
              { key: 'date', head: 'Date', render: (p: Payment) => <span className="text-gd-chrome">{longDate(p.date)}</span> },
              {
                key: 'cust',
                head: 'Customer',
                render: (p: Payment) => (
                  <span className="font-semibold text-white">{p.customer.replace(/^\*/, '')}</span>
                ),
              },
              { key: 'inv', head: 'Invoice', render: (p: Payment) => <span className="font-mono text-xs text-gd-steel">{p.invoice}</span> },
              {
                key: 'method',
                head: 'Method',
                render: (p: Payment) => (
                  <Badge tone={p.method === 'ACH' ? 'neon' : p.method === 'Card' ? 'electric' : 'steel'}>
                    {p.method}
                  </Badge>
                ),
              },
              {
                key: 'amt',
                head: 'Amount',
                align: 'right',
                render: (p: Payment) => (
                  <span className="font-display font-black text-gd-neon">{money(p.amount)}</span>
                ),
              },
            ]}
          />
        </Panel>
      </div>

      <Panel className="p-4">
        <div className="flex items-center gap-2">
          <DemoAction />
          <span className="text-[11px] text-gd-steel">
            Payment processing runs in sandbox mode. No real card, bank account, or transaction is
            involved anywhere in this demo.
          </span>
        </div>
      </Panel>
    </div>
  );
}
