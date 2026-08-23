'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { LoginButton } from './LoginButton';

const navLinks = [
  { href: '/#services', label: 'Services' },
  { href: '/#why-wise', label: 'Why Wise' },
  { href: '/#special', label: 'Special' },
  { href: '/field-tech', label: 'Field Tech App' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#contact', label: 'Contact' },
];

export function SiteHeader({ activeHref }: { activeHref?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 mx-auto max-w-7xl px-5 py-5 md:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" onClick={() => setOpen(false)}>
          <p className="font-display text-2xl font-black uppercase tracking-[0.12em]">
            WISE<span className="text-wise-blue">2</span>
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-wise-cyan">
            HVAC Solutions
          </p>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.16em] text-wise-mute xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap transition hover:text-white ${
                activeHref === link.href ? 'text-white' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:inline-block">
            <LoginButton />
          </div>
          <Link
            href="/#contact"
            className="hidden rounded-full border border-wise-blue/40 bg-wise-blue px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-neon transition hover:-translate-y-0.5 md:inline-flex"
          >
            Schedule Service
          </Link>
          <a
            href="tel:3367090472"
            className="hidden items-center gap-2 text-sm font-black tracking-[0.08em] text-white lg:inline-flex"
          >
            <Phone className="h-4 w-4 text-wise-cyan" />
            336 709 0472
          </a>
          <a
            href="tel:3367090472"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white md:hidden"
            aria-label="Call 336 709 0472"
          >
            <Phone className="h-4 w-4 text-wise-cyan" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-wise-cyan/35 hover:bg-wise-cyan/10 xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="wise-panel mt-4 flex flex-col gap-1 p-3 xl:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-2xl px-4 py-3.5 text-sm font-bold uppercase tracking-[0.14em] transition ${
                activeHref === link.href
                  ? 'bg-wise-blue/10 text-white'
                  : 'text-wise-mute hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-full border border-wise-blue/40 bg-wise-blue px-5 py-3.5 text-sm font-black uppercase tracking-[0.16em] text-white shadow-neon"
          >
            Schedule Service
          </Link>
        </nav>
      )}
    </header>
  );
}
