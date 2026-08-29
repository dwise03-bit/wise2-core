'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { blakkhailBrand } from './config';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { checkoutPath, homePath, isBlackhailHost } from '@/lib/site-domains';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailHeader() {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const onBlackhailDomain = host ? isBlackhailHost(host) : false;
  const homeHref = host ? homePath(host) : '/';
  const parentHref = onBlackhailDomain
    ? `${blakkhailBrand.parentSiteUrl}${blakkhailBrand.parentPath}`
    : blakkhailBrand.parentPath;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <div
        className={`${BLAKKHAIL_LAYOUT.container} flex min-h-11 flex-wrap items-center justify-between gap-2 py-2 text-[11px] uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]`}
        style={{ backgroundColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
      >
        <span className="max-w-[70%] leading-snug sm:max-w-none">{blakkhailBrand.tagline}</span>
        <span className="hidden sm:inline" style={{ color: BLAKKHAIL.gold }}>
          {blakkhailBrand.motto}
        </span>
      </div>

      <div className={`${BLAKKHAIL_LAYOUT.container} flex items-center justify-between gap-4 py-4 sm:py-5`}>
        <Link
          href={parentHref}
          className="hidden shrink-0 text-xs font-bold uppercase tracking-wider hover:opacity-80 md:block lg:text-sm"
          style={{ color: BLAKKHAIL.steel }}
        >
          {blakkhailBrand.legalName}
        </Link>

        <Link href={homeHref} className="min-w-0 flex-1 text-center md:flex-none">
          <p className="text-[10px] uppercase tracking-[0.3em] sm:text-xs" style={{ color: BLAKKHAIL.gold }}>
            {blakkhailBrand.legalName}
          </p>
          <h1
            className="text-4xl font-black uppercase tracking-[0.1em] sm:text-5xl lg:text-6xl"
            style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
          >
            {blakkhailBrand.name}
          </h1>
        </Link>

        {host ? (
          <Link
            href={checkoutPath(host)}
            className="flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 sm:px-5 sm:py-3 sm:text-sm"
            style={{ backgroundColor: BLAKKHAIL.gold }}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">View Cart</span>
            <span className="sm:hidden">Cart</span>
          </Link>
        ) : (
          <div className="w-[88px] shrink-0 sm:w-[120px]" aria-hidden />
        )}
      </div>

      <nav className="border-t" style={{ borderColor: BLAKKHAIL.gunmetal, backgroundColor: BLAKKHAIL.gunmetal }}>
        <ul
          className={`${BLAKKHAIL_LAYOUT.container} flex gap-6 overflow-x-auto py-3 text-sm font-bold uppercase tracking-[0.12em] sm:gap-8 sm:py-4 sm:text-base`}
          style={{ color: BLAKKHAIL.steel, scrollbarWidth: 'none' }}
        >
          {BLAKKHAIL_LEGACY.nav.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} className="whitespace-nowrap hover:text-[#D6A331]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
