'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { CLOUD_TAGLINE } from '@/lib/cloud-brand';
import { CloudCrownLogo } from '@/components/cloud/CloudCrownLogo';

const LINKS = [
  { href: '/cloud', label: 'Home' },
  { href: '/cloud/plans', label: 'Plans' },
  { href: '/cloud/dashboard', label: 'My services' },
];

export function CloudShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,255,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <header className="relative z-10 border-b border-white/10 bg-[#050607]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/cloud" className="flex items-center gap-3">
            <CloudCrownLogo size="md" showWordmark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-semibold text-[#B7C0CB] transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cloud/plans" className="ml-2 bg-[#4DA3FF] px-4 py-2 text-sm font-bold text-[#031018]">
              Get started
            </Link>
          </nav>
          <button
            type="button"
            className="inline-flex items-center justify-center border border-white/20 p-2 text-white md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen ? (
          <nav className="border-t border-white/10 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2 py-2 text-sm font-semibold text-[#B7C0CB] hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cloud/plans"
                className="mt-2 bg-[#4DA3FF] px-4 py-3 text-center text-sm font-bold text-[#031018]"
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
          </nav>
        ) : null}
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-[#4DA3FF]">
            {CLOUD_TAGLINE}
          </p>
          <p className="mt-3 text-center text-sm text-[#8FA0AE]">
            Piff City Infrastructure · Speed. Reliability. Security. Support.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[#8FA0AE]">
            <Link href="/cloud/acceptable-use" className="hover:text-white">
              Acceptable Use
            </Link>
            <Link href="/cloud/refunds" className="hover:text-white">
              Refunds
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <a href="mailto:support@wise2.net" className="hover:text-white">
              support@wise2.net
            </a>
            <a href="mailto:billing@wise2.net" className="hover:text-white">
              billing@wise2.net
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
