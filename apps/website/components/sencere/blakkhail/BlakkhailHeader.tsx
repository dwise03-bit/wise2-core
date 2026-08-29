'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { blakkhailBrand } from './config';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { checkoutPath, isBlackhailHost } from '@/lib/site-domains';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailHeader() {
  const [host, setHost] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const onBlackhailDomain = host ? isBlackhailHost(host) : false;
  const parentHref = onBlackhailDomain
    ? `${blakkhailBrand.parentSiteUrl}${blakkhailBrand.parentPath}`
    : blakkhailBrand.parentPath;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.jetBlack }}
    >
      <div
        className={`${BLAKKHAIL_LAYOUT.container} flex items-center justify-between gap-2 py-2 sm:gap-3`}
        style={{ backgroundColor: BLAKKHAIL.gunmetal }}
      >
        <Link
          href={parentHref}
          className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] hover:opacity-80 sm:text-xs sm:tracking-[0.2em]"
          style={{ color: BLAKKHAIL.gold }}
        >
          {blakkhailBrand.legalName}
        </Link>

        <span
          className="hidden text-center text-[10px] uppercase tracking-[0.16em] sm:inline sm:text-xs"
          style={{ color: BLAKKHAIL.steel }}
        >
          {blakkhailBrand.tagline}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex min-h-11 items-center justify-center gap-2 rounded-sm border px-3 md:hidden"
            style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold, backgroundColor: BLAKKHAIL.jetBlack }}
            aria-expanded={menuOpen}
            aria-controls="blakkhail-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            <span className="text-xs font-bold uppercase tracking-[0.14em]">
              {menuOpen ? 'Close' : 'Menu'}
            </span>
          </button>

          {host ? (
            <Link
              href={checkoutPath(host)}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold uppercase tracking-wide text-black sm:gap-2 sm:px-4"
              style={{ backgroundColor: BLAKKHAIL.gold }}
            >
              <ShoppingCart size={18} aria-hidden />
              <span className="hidden sm:inline">Cart</span>
              <span className="sr-only sm:hidden">Cart</span>
            </Link>
          ) : (
            <span className="w-11" aria-hidden />
          )}
        </div>
      </div>

      {/* Desktop nav */}
      <nav
        className="hidden border-t md:block"
        style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.jetBlack }}
        aria-label="Main navigation"
      >
        <ul
          className={`${BLAKKHAIL_LAYOUT.container} flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-3 lg:gap-x-8`}
        >
          {BLAKKHAIL_LEGACY.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center text-sm font-bold uppercase tracking-[0.12em] hover:opacity-90 lg:text-base"
                style={{ color: BLAKKHAIL.gold }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav
          id="blakkhail-mobile-menu"
          className="border-t md:hidden"
          style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.jetBlack }}
          aria-label="Mobile navigation"
        >
          <ul className={`${BLAKKHAIL_LAYOUT.container} flex flex-col py-2`}>
            {BLAKKHAIL_LEGACY.nav.map((item) => (
              <li key={item.href} className="border-b" style={{ borderColor: BLAKKHAIL.gunmetal }}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center text-base font-bold uppercase tracking-[0.14em]"
                  style={{ color: BLAKKHAIL.gold }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
