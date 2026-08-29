'use client';

import { Download, FileText } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';

const REPORTS = [
  { title: 'Sales Summary', desc: 'Revenue, profit, and units by period' },
  { title: 'Inventory Valuation', desc: 'On-hand value and low-stock items' },
  { title: 'Pop-Up Performance', desc: 'Event sales vs. packing efficiency' },
  { title: 'Customer Insights', desc: 'VIP spend and demand signals' },
];

export default function ReportsPage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">Reports</h1>
        <p className="text-sm text-white/50">Export summaries for your records</p>
      </header>

      <div className="space-y-3">
        {REPORTS.map((report) => (
          <GlassCard key={report.title} className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-cherry bg-cherry-hot/15">
              <FileText className="h-5 w-5 text-cherry-hot" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{report.title}</p>
              <p className="text-xs text-white/50">{report.desc}</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-cherry-hot/30 px-3 py-1.5 text-xs text-cherry-hot"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Scheduled" />
      <GlassCard>
        <p className="text-sm text-white/70">Weekly sales digest — Sundays at 8:00 AM</p>
        <p className="mt-1 text-xs text-white/40">Demo preview — email delivery coming soon</p>
      </GlassCard>
    </div>
  );
}
