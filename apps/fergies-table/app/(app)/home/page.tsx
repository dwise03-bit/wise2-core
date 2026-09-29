'use client';

import Link from 'next/link';
import { CalendarHeart, ChevronRight, Crown, Sparkles, UtensilsCrossed } from 'lucide-react';
import { ClocheMark, GlassCard, SectionHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { MENU_ITEMS } from '@/lib/demo-data';
import { useOrders } from '@/contexts/OrderContext';

const ACTIONS = [
  { href: '/menu', label: 'Order Now', Icon: UtensilsCrossed },
  { href: '/catering', label: 'Catering', Icon: Sparkles },
  { href: '/book', label: 'Book a Table', Icon: CalendarHeart },
  { href: '/rewards', label: 'Rewards', Icon: Crown },
];

export default function HomePage() {
  const popular = MENU_ITEMS.filter((item) => item.popular);
  const { cartCount } = useOrders();

  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <header className="mb-6 flex items-center justify-between" data-tour="home-header">
        <div>
          <p className="font-script text-2xl text-fergie-rose">Welcome to</p>
          <h1 className="font-serif text-2xl font-bold">Fergie&apos;s Table</h1>
        </div>
        <ClocheMark className="h-12 w-12" />
      </header>

      <GlassCard glow className="mb-6 overflow-hidden p-0">
        <div className="flex items-stretch">
          <div className="flex-1 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-fergie-gold">Chef Fergie</p>
            <p className="mt-1 font-serif text-lg">We cook. You connect.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Home-based catering with a luxury table: flavor, warmth, and a little gold on the rim.
            </p>
            <Link href="/ai" className="mt-3 inline-flex items-center text-sm text-fergie-gold">
              Ask the concierge <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative w-28 shrink-0 bg-gradient-to-b from-fergie-royal/40 to-fergie-deep">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-3xl text-fergie-gold">F</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="mb-6 grid grid-cols-2 gap-3" data-tour="home-actions">
        {ACTIONS.map((action) => (
          <Link key={action.href} href={action.href} className="glass-panel touch-target flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fergie-royal/30 text-fergie-gold">
              <action.Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {cartCount > 0 && (
        <Link href="/cart" className="mb-6 block">
          <GlassCard gold className="flex items-center justify-between py-3">
            <p className="text-sm">You have {cartCount} item{cartCount === 1 ? '' : 's'} in your order.</p>
            <StatusPill label="Checkout" />
          </GlassCard>
        </Link>
      )}

      <SectionHeader
        title="Popular plates"
        action={
          <Link href="/menu" className="text-xs text-fergie-gold">
            Full menu
          </Link>
        }
      />
      <div className="space-y-3">
        {popular.map((item) => (
          <Link key={item.id} href="/menu">
            <GlassCard className="flex gap-3 overflow-hidden p-2">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="font-medium">{item.name}</p>
                <p className="line-clamp-1 text-xs text-white/50">{item.description}</p>
                <p className="mt-1 text-sm font-semibold text-fergie-gold">${item.price}</p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
