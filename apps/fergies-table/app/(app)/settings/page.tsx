'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard, PageHeader } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { OWNER_PROFILE } from '@/lib/demo-data';

export default function SettingsPage() {
  const [hours, setHours] = useState(OWNER_PROFILE.hours);
  const [phone, setPhone] = useState(OWNER_PROFILE.phone);
  const [alerts, setAlerts] = useState({ orders: true, leads: true, payments: true });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(
      'fergie-settings',
      JSON.stringify({ hours, phone, alerts }),
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Settings" subtitle="Her house, her rules" />

      <GlassCard glow className="mb-4">
        <p className="font-serif text-xl">{OWNER_PROFILE.name}</p>
        <p className="text-sm text-fergie-gold">{OWNER_PROFILE.business}</p>
        <p className="text-xs text-white/50">
          {OWNER_PROFILE.email} · {OWNER_PROFILE.city}
        </p>
      </GlassCard>

      <label className="mb-1 block text-xs uppercase tracking-wider text-fergie-rose/70">Service hours</label>
      <input
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        className="mb-4 w-full rounded-fergie border border-fergie-gold/20 bg-black/40 p-3 text-sm"
      />

      <label className="mb-1 block text-xs uppercase tracking-wider text-fergie-rose/70">Business phone</label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="mb-4 w-full rounded-fergie border border-fergie-gold/20 bg-black/40 p-3 text-sm"
      />

      <p className="mb-2 text-xs uppercase tracking-wider text-fergie-rose/70">Alerts</p>
      <GlassCard className="mb-5 space-y-3">
        {(
          [
            ['orders', 'Kitchen tickets'],
            ['leads', 'New leads'],
            ['payments', 'Payments due'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between text-sm">
            {label}
            <input
              type="checkbox"
              checked={alerts[key]}
              onChange={(e) => setAlerts((prev) => ({ ...prev, [key]: e.target.checked }))}
              className="h-4 w-4 accent-fergie-gold"
            />
          </label>
        ))}
      </GlassCard>

      <button type="button" onClick={save} className={`w-full ${FERGIE_LAYOUT.btnPrimary}`}>
        {saved ? 'Saved' : 'Save settings'}
      </button>
      <p className="mt-6 text-center text-[11px] text-white/35">
        <Link href="/privacy" className="hover:text-fergie-gold">
          Privacy
        </Link>
        {' · '}
        <Link href="/support" className="hover:text-fergie-gold">
          Support
        </Link>
      </p>
    </div>
  );
}
