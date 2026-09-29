'use client';

import Link from 'next/link';
import {
  Banknote,
  Bot,
  ChevronRight,
  ClipboardList,
  Play,
  Settings,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { GlassCard, PageHeader, Wise2Badge } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { useOwner } from '@/contexts/OwnerContext';
import { useFergieTour } from '@/contexts/TourContext';

const LINKS = [
  { href: '/quotes', label: 'Quotes', desc: 'Draft, send, and close proposals', Icon: ClipboardList },
  { href: '/payments', label: 'Payments', desc: 'Collected, deposits, and dues', Icon: Banknote },
  { href: '/menu-board', label: 'Menu board', desc: 'Turn plates on or sold out', Icon: UtensilsCrossed },
  { href: '/ai', label: 'Business AI', desc: 'Menus, pricing, and event planning', Icon: Bot },
  { href: '/settings', label: 'Settings', desc: 'Hours, phone, and alerts', Icon: Settings },
];

export default function MorePage() {
  const { setRole } = useOwner();
  const { start } = useFergieTour();

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="More" subtitle="The rest of the house" />
      <button type="button" onClick={start} className="mb-5 w-full">
        <GlassCard className="flex items-center gap-4 py-4 transition hover:border-fergie-gold/40">
          <span className="flex h-10 w-10 items-center justify-center rounded-fergie bg-fergie-gold/15 text-fergie-gold">
            <Play className="h-5 w-5" />
          </span>
          <div className="flex-1 text-left">
            <p className="font-medium">Voice tour</p>
            <p className="text-xs text-white/50">Savôré speaks. WISE² walks the house.</p>
          </div>
          <Sparkles className="h-4 w-4 text-fergie-gold" />
        </GlassCard>
      </button>
      <div className="space-y-2">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
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

      <Link
        href="/home"
        onClick={() => setRole('guest')}
        className="mt-5 block"
      >
        <GlassCard className="flex items-center gap-4 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-fergie bg-fergie-gold/15 text-fergie-gold">
            <Store className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-medium">Preview guest app</p>
            <p className="text-xs text-white/50">See what customers order and book</p>
          </div>
          <Sparkles className="h-4 w-4 text-fergie-gold" />
        </GlassCard>
      </Link>

      <Wise2Badge className="mt-8 text-center" />
      <p className="mt-4 text-center text-[11px] text-white/35">
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
