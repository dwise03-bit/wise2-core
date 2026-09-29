'use client';

import { QrCode } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_CONTAINERS } from '@/lib/demo-data';

export default function PackSmartPage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">Pack Smart</h1>
        <p className="text-sm text-white/50">Scan → Know → Move → Sell</p>
      </header>

      <GlassCard className="mb-6 text-center" glow>
        <QrCode className="mx-auto mb-3 h-12 w-12 text-cherry-hot" />
        <p className="font-medium">Scan any container QR code</p>
        <p className="mt-1 text-sm text-white/50">Instantly see what&apos;s inside</p>
        <button className={`mt-4 ${CHERRY_LAYOUT.btnPrimary}`}>Open Scanner</button>
      </GlassCard>

      <SectionHeader title="Your Containers" />
      <div className="space-y-3">
        {DEMO_CONTAINERS.map((c) => (
          <GlassCard key={c.id} className="relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: c.color === 'Hot Pink' ? '#FF2E88' : c.color === 'Royal Plum' ? '#7A2EFF' : '#C0C0C0' }}
            />
            <div className="pl-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{c.name}</p>
                <span className="text-[10px] uppercase text-white/40">{c.type}</span>
              </div>
              <p className="mt-1 text-sm text-cherry-bubblegum">{c.description}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                <QrCode className="h-3 w-3" />
                {c.qrCode}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
