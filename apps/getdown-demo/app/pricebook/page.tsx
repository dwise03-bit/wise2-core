'use client';

import { useState } from 'react';
import { Badge, DataTable, Panel, SectionHead, Tabs } from '@/components/ui/kit';
import { PRICEBOOK } from '@/lib/data/seed';
import type { PricebookItem } from '@/lib/data/types';
import { money } from '@/lib/metrics';

export default function PricebookPage() {
  const [tab, setTab] = useState('all');
  const categories = Array.from(new Set(PRICEBOOK.map((p) => p.category)));
  const rows = tab === 'all' ? PRICEBOOK : PRICEBOOK.filter((p) => p.category === tab);

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Pricebook
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          One rate table behind every estimate. Change it here and every future quote follows.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Services Priced', String(PRICEBOOK.length), '#22B8FF'],
          ['Categories', String(categories.length), '#C9D4E0'],
          ['Multifamily Services', String(PRICEBOOK.filter((p) => p.engine === 'multifamily').length), '#7CFF3D'],
          ['Lighting Services', String(PRICEBOOK.filter((p) => p.engine === 'lighting').length), '#A66BFF'],
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
        tabs={[{ id: 'all', label: 'All', count: PRICEBOOK.length }, ...categories.map((c) => ({ id: c, label: c }))]}
        value={tab}
        onChange={setTab}
      />

      <Panel className="overflow-hidden">
        <DataTable
          rows={rows}
          columns={[
            {
              key: 'svc',
              head: 'Service',
              render: (p: PricebookItem) => (
                <div>
                  <p className="font-semibold text-white">{p.service}</p>
                  <p className="text-[11px] text-gd-steel">{p.category}</p>
                </div>
              ),
            },
            {
              key: 'engine',
              head: 'Engine',
              render: (p: PricebookItem) => (
                <Badge tone={p.engine === 'lighting' ? 'violet' : 'electric'}>
                  {p.engine === 'lighting' ? 'B · Lighting' : 'A · Multifamily'}
                </Badge>
              ),
            },
            { key: 'unit', head: 'Unit', render: (p: PricebookItem) => <span className="text-gd-chrome">{p.unit}</span> },
            {
              key: 'crew',
              head: 'Crew Time',
              render: (p: PricebookItem) => <span className="text-gd-chrome">{p.crewHours}h</span>,
            },
            {
              key: 'min',
              head: 'Minimum',
              align: 'right',
              render: (p: PricebookItem) => <span className="text-gd-steel">{money(p.minimum)}</span>,
            },
            {
              key: 'rate',
              head: 'Rate',
              align: 'right',
              render: (p: PricebookItem) => (
                <span className="font-display font-black text-gd-neon">
                  {money(p.rate, { cents: p.rate < 10 })}
                </span>
              ),
            },
          ]}
        />
      </Panel>
    </div>
  );
}
