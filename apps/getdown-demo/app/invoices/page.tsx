'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Badge, Button, DataTable, DemoAction, Panel, Progress, SectionHead, Tabs } from '@/components/ui/kit';
import { INVOICES } from '@/lib/data/seed';
import type { Invoice } from '@/lib/data/types';
import { longDate, money } from '@/lib/metrics';

export default function InvoicesPage() {
  const [tab, setTab] = useState('all');
  const rows = tab === 'all' ? INVOICES : INVOICES.filter((i) => i.status === tab);

  const billed = INVOICES.reduce((s, i) => s + i.amount, 0);
  const collected = INVOICES.reduce((s, i) => s + i.paid, 0);
  const outstanding = billed - collected;
  const overdue = INVOICES.filter((i) => i.status === 'overdue').reduce(
    (s, i) => s + (i.amount - i.paid),
    0,
  );

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Invoices
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Billed, collected, and outstanding across every property.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Total Billed', money(billed), '#22B8FF'],
          ['Collected', money(collected), '#7CFF3D'],
          ['Outstanding', money(outstanding), '#FFB020'],
          ['Past Due', money(overdue), '#FF4D5E'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      <Panel className="p-5">
        <SectionHead title="Collection Rate" sub={`${Math.round((collected / billed) * 100)}% of billed work is collected`} />
        <Progress value={(collected / billed) * 100} color="#7CFF3D" height={10} />
      </Panel>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: INVOICES.length },
          { id: 'sent', label: 'Sent' },
          { id: 'partial', label: 'Partial' },
          { id: 'paid', label: 'Paid' },
          { id: 'overdue', label: 'Overdue' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Panel className="overflow-hidden">
        <DataTable
          rows={rows}
          empty="No invoices in this view"
          columns={[
            {
              key: 'num',
              head: 'Invoice',
              render: (i: Invoice) => <span className="font-mono text-xs text-white">{i.number}</span>,
            },
            {
              key: 'cust',
              head: 'Customer / Property',
              render: (i: Invoice) => (
                <div>
                  <p className="font-semibold text-white">{i.customer.replace(/^\*/, '')}</p>
                  <p className="text-[11px] text-gd-steel">{i.property}</p>
                </div>
              ),
            },
            { key: 'iss', head: 'Issued', render: (i: Invoice) => <span className="text-gd-chrome">{longDate(i.issued)}</span> },
            {
              key: 'due',
              head: 'Due',
              render: (i: Invoice) => (
                <span className={i.status === 'overdue' ? 'text-gd-red' : 'text-gd-chrome'}>
                  {longDate(i.due)}
                </span>
              ),
            },
            {
              key: 'status',
              head: 'Status',
              render: (i: Invoice) => (
                <Badge
                  tone={
                    i.status === 'paid'
                      ? 'neon'
                      : i.status === 'overdue'
                        ? 'red'
                        : i.status === 'partial'
                          ? 'amber'
                          : 'electric'
                  }
                >
                  {i.status}
                </Badge>
              ),
            },
            {
              key: 'bal',
              head: 'Balance',
              align: 'right',
              render: (i: Invoice) => (
                <span className={i.amount - i.paid > 0 ? 'text-gd-amber' : 'text-gd-steel'}>
                  {money(i.amount - i.paid)}
                </span>
              ),
            },
            {
              key: 'amt',
              head: 'Amount',
              align: 'right',
              render: (i: Invoice) => (
                <span className="font-display font-black text-gd-neon">{money(i.amount)}</span>
              ),
            },
          ]}
        />
      </Panel>

      <Panel className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">
            <Send className="h-3.5 w-3.5" /> Send Past-Due Reminders
          </Button>
          <DemoAction label="Approval Required" />
          <span className="text-[11px] text-gd-steel">
            No invoice is emailed and no card is charged in owner demo mode.
          </span>
        </div>
      </Panel>
    </div>
  );
}
