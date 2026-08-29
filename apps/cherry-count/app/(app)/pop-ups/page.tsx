'use client';

import Link from 'next/link';
import { Calendar, MapPin, Plus } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_NEXT_EVENT, DEMO_PACKING } from '@/lib/demo-data';

export default function PopUpsPage() {
  const packedCount = DEMO_PACKING.filter((p) => p.status === 'PACKED').length;

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase">Pop-Ups</h1>
          <p className="text-sm text-white/50">Plan, pack, and go live</p>
        </div>
        <Link href="/pop-ups/new" className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-cherry-hot shadow-glow-sm">
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <GlassCard className="mb-6" glow data-tour="popups-event">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-cherry-hot/20 px-2 py-0.5 text-[10px] font-bold uppercase text-cherry-hot">
            {DEMO_NEXT_EVENT.status}
          </span>
        </div>
        <h2 className="font-serif text-xl font-bold">{DEMO_NEXT_EVENT.name}</h2>
        <div className="mt-2 space-y-1 text-sm text-white/60">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cherry-hot" />
            {new Date(DEMO_NEXT_EVENT.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cherry-hot" />
            {DEMO_NEXT_EVENT.venue}
          </p>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-white/50">Packing Progress</span>
            <span className="text-cherry-hot font-semibold">
              {packedCount}/{DEMO_PACKING.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cherry-hot to-cherry-red"
              style={{ width: `${(packedCount / DEMO_PACKING.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link href="/pop-ups/mode" className={`flex-1 text-center ${CHERRY_LAYOUT.btnPrimary}`}>
            Pop-Up Mode
          </Link>
          <Link href="/pop-ups/pack" className={`flex-1 text-center ${CHERRY_LAYOUT.btnGhost}`}>
            Pack Smart
          </Link>
        </div>
      </GlassCard>

      <SectionHeader title="Packing Checklist" />
      <div className="space-y-2">
        {DEMO_PACKING.map((item) => (
          <GlassCard key={item.item} className="flex items-center gap-3 py-3">
            <div
              className={`h-5 w-5 rounded-full border-2 ${
                item.status === 'PACKED'
                  ? 'border-cherry-hot bg-cherry-hot'
                  : 'border-white/20'
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.item}</p>
              <p className="text-xs text-white/50">
                {item.bin} · Qty {item.qty}
              </p>
            </div>
            <span
              className={`text-[10px] uppercase font-bold ${
                item.status === 'PACKED' ? 'text-cherry-hot' : 'text-white/30'
              }`}
            >
              {item.status.replace('_', ' ')}
            </span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
