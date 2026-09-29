'use client';

import { CheckCircle2, MapPin, QrCode, ShoppingBag } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_CONTAINERS, DEMO_NEXT_EVENT, DEMO_PACKING, DEMO_STATS } from '@/lib/demo-data';

export default function PopUpModePage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6">
        <span className="rounded-full bg-cherry-hot px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          Live Mode
        </span>
        <h1 className="mt-2 font-serif text-2xl font-bold">{DEMO_NEXT_EVENT.name}</h1>
        <p className="text-sm text-white/50">{DEMO_NEXT_EVENT.venue}</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <GlassCard className="text-center" glow>
          <p className="text-xs text-white/50">Today&apos;s Sales</p>
          <p className="text-2xl font-bold text-cherry-hot">${DEMO_STATS.todaySales}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-white/50">Items Sold</p>
          <p className="text-2xl font-bold">23</p>
        </GlassCard>
      </div>

      <SectionHeader title="Event Checklist" />
      <div className="mb-6 space-y-2">
        {['Setup display', 'Test QR codes', 'Count starting inventory', 'Open for sales'].map(
          (step, i) => (
            <GlassCard key={step} className="flex items-center gap-3 py-3">
              <CheckCircle2 className={`h-5 w-5 ${i < 3 ? 'text-cherry-hot' : 'text-white/20'}`} />
              <span className={i < 3 ? 'text-white/80' : 'text-white/40'}>{step}</span>
            </GlassCard>
          ),
        )}
      </div>

      <SectionHeader title="Quick Scan" />
      <button className={`mb-6 w-full ${CHERRY_LAYOUT.btnPrimary}`}>
        <QrCode className="mr-2 h-5 w-5" />
        Scan QR / Barcode
      </button>

      <SectionHeader title="Bin Locations" />
      <div className="space-y-2">
        {DEMO_CONTAINERS.map((c) => (
          <GlassCard key={c.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-cherry bg-cherry-hot/20">
              <MapPin className="h-5 w-5 text-cherry-hot" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-white/50">{c.description}</p>
            </div>
            <QrCode className="h-4 w-4 text-white/30" />
          </GlassCard>
        ))}
      </div>

      <button className={`mt-6 w-full ${CHERRY_LAYOUT.btnGhost}`}>
        <ShoppingBag className="mr-2 h-4 w-4" />
        Record Sale
      </button>
    </div>
  );
}
