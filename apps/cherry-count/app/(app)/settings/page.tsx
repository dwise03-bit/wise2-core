'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_PHONE_CONFIG } from '@/lib/demo-data';

export default function SettingsPage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">Settings</h1>
        <p className="text-sm text-white/50">Brand, notifications, and integrations</p>
      </header>

      <SectionHeader title="Brand" />
      <GlassCard className="mb-6 space-y-3">
        <div>
          <label className="text-xs text-white/50">Business Name</label>
          <input
            defaultValue="Brianna's Boutique"
            className="mt-1 w-full rounded-cherry border border-cherry-bubblegum/20 bg-cherry-soft/60 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-white/50">Tagline</label>
          <input
            defaultValue="Track It. Pack It. Profit."
            className="mt-1 w-full rounded-cherry border border-cherry-bubblegum/20 bg-cherry-soft/60 px-3 py-2 text-sm"
          />
        </div>
      </GlassCard>

      <SectionHeader title="Notifications" />
      <GlassCard className="mb-6 space-y-3 text-sm">
        <label className="flex items-center justify-between">
          <span>Low stock alerts</span>
          <input type="checkbox" defaultChecked className="accent-cherry-hot" />
        </label>
        <label className="flex items-center justify-between">
          <span>Pop-up packing reminders</span>
          <input type="checkbox" defaultChecked className="accent-cherry-hot" />
        </label>
        <label className="flex items-center justify-between">
          <span>Cherry AI daily briefing</span>
          <input type="checkbox" defaultChecked className="accent-cherry-hot" />
        </label>
      </GlassCard>

      <SectionHeader title="Integrations" />
      <GlassCard className="mb-6">
        <Link href="/phone" className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-medium">
              <Phone className="h-4 w-4 text-cherry-lavender" />
              WISE² AI Phone
            </p>
            <p className="mt-1 text-sm text-white/50">
              {DEMO_PHONE_CONFIG.phoneNumber} · Cherry answers calls & captures leads
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase text-emerald-300">
            Live
          </span>
        </Link>
      </GlassCard>

      <GlassCard>
        <p className="text-sm text-white/70">Square · Shopify · QuickBooks</p>
        <p className="mt-2 text-xs text-white/40">Payment and accounting integrations — coming next</p>
      </GlassCard>
    </div>
  );
}
