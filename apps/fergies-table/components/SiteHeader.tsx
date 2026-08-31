'use client';

import Link from 'next/link';
import { ClocheMark } from '@/components/ui';
import { useOwner } from '@/contexts/OwnerContext';

export function SiteHeader() {
  const { setRole } = useOwner();

  return (
    <header className="sticky top-0 z-30 border-b border-fergie-gold/15 bg-fergie-black/80 pt-[var(--safe-top)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <ClocheMark className="h-8 w-8" />
          <span className="font-display text-sm font-bold uppercase tracking-[0.16em] text-fergie-gold">
            Fergie&apos;s Table
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-xs uppercase tracking-[0.16em] text-white/70 sm:flex">
          <a href="#menu" className="hover:text-fergie-gold">
            Menu
          </a>
          <a href="#catering" className="hover:text-fergie-gold">
            Catering
          </a>
          <a href="#book" className="hover:text-fergie-gold">
            Book
          </a>
          <Link href="/menu" onClick={() => setRole('guest')} className="hover:text-fergie-gold">
            Order
          </Link>
        </nav>
        <Link href="/book" onClick={() => setRole('guest')} className="rounded-full bg-fergie-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-fergie-black">
          Book a table
        </Link>
      </div>
    </header>
  );
}
