'use client';

import Link from 'next/link';
import {
  Bot,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  Quote,
  Sparkles,
  Users,
} from 'lucide-react';
import { GlassCard, PageHeader, Wise2Badge } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { OWNER_PROFILE, PROFILE, REWARDS } from '@/lib/demo-data';
import { useOwner } from '@/contexts/OwnerContext';

const BUSINESS_LINKS = [
  { href: '/business', label: 'Business dashboard', desc: 'Leads, revenue, and the week ahead', Icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', desc: 'New inquiries and booked events', Icon: Users },
  { href: '/quotes', label: 'Quotes', desc: 'Proposals waiting on a yes', Icon: Quote },
  { href: '/calendar', label: 'Calendar', desc: 'Service dates and tastings', Icon: CalendarDays },
  { href: '/ai', label: 'AI Concierge', desc: 'Plan menus and events', Icon: Bot },
  { href: '/table', label: 'Build a table', desc: 'Guest count and occasion', Icon: Sparkles },
];

export default function ProfilePage() {
  const { isOwner, setRole } = useOwner();
  const person = isOwner ? OWNER_PROFILE : PROFILE;

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title={isOwner ? 'Chef Fergie' : 'Profile'} subtitle={isOwner ? 'Owner' : 'Your seat'} />

      <GlassCard glow className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fergie-royal to-fergie-gold font-display text-xl text-white">
          {isOwner ? 'F' : 'G'}
        </div>
        <div>
          <p className="font-serif text-xl">{person.name}</p>
          <p className="text-xs text-white/50">{person.email}</p>
          {isOwner ? (
            <p className="text-xs text-fergie-gold">{OWNER_PROFILE.business}</p>
          ) : (
            <p className="text-xs text-fergie-gold">
              {REWARDS.tier} member · since {PROFILE.memberSince}
            </p>
          )}
        </div>
      </GlassCard>

      {isOwner ? (
        <Link href="/business" onClick={() => setRole('owner')} className={`mb-6 w-full ${FERGIE_LAYOUT.btnPrimary}`}>
          Back to Command
        </Link>
      ) : (
        <Link href="/business" onClick={() => setRole('owner')} className={`mb-6 w-full ${FERGIE_LAYOUT.btnGold}`}>
          I&apos;m Chef Fergie
        </Link>
      )}

      <GlassCard className="mb-6">
        <p className="text-xs uppercase tracking-wider text-fergie-rose/70">Payment</p>
        <p className="mt-2 text-sm">Visa ···· 4242</p>
        <p className="text-xs text-white/40">Demo card on file</p>
      </GlassCard>

      <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-fergie-rose/70">Business OS</p>
      <div className="space-y-2">
        {BUSINESS_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setRole('owner')}>
            <GlassCard className="flex items-center gap-4 py-4 transition hover:border-fergie-gold/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-fergie bg-fergie-royal/25 text-fergie-gold">
                <link.Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium">{link.label}</p>
                <p className="text-xs text-white/50">{link.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30" />
            </GlassCard>
          </Link>
        ))}
      </div>

      <Wise2Badge className="mt-8 text-center" />
    </div>
  );
}
