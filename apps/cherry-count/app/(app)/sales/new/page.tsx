'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_BEST_SELLERS } from '@/lib/demo-data';

const PAYMENT_METHODS = ['Cash', 'Card', 'Cash App', 'Venmo', 'Square'];

export default function NewSalePage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <Link
        href="/sales"
        className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Sales
      </Link>

      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">Record Sale</h1>
        <p className="text-sm text-white/50">Fast checkout at the pop-up</p>
      </header>

      <SectionHeader title="Quick Add" />
      <div className="mb-6 space-y-2">
        {DEMO_BEST_SELLERS.slice(0, 3).map((item) => (
          <GlassCard key={item.name} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-white/50">Size {item.size}</p>
            </div>
            <button className="rounded-full bg-cherry-hot/20 px-3 py-1 text-xs font-semibold text-cherry-hot">
              Add
            </button>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="space-y-4">
        <div>
          <label className="text-xs text-white/50">Payment Method</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                className="rounded-full border border-cherry-bubblegum/20 px-3 py-1.5 text-xs transition hover:border-cherry-hot hover:text-cherry-hot"
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className={`w-full ${CHERRY_LAYOUT.btnPrimary}`}>
          Complete Sale · $70.00
        </button>
      </GlassCard>
    </div>
  );
}
