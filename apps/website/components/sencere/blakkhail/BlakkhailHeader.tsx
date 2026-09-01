'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { blakkhailBrand } from './config';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { checkoutPath, isBlackhailHost } from '@/lib/site-domains';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';

export function BlakkhailHeader() {
  const [host, setHost] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
  const storefrontPath = host ? (isBlackhailHost(host) ? '/' : '/sencere/blakkhail') : '/sencere/blakkhail';
  const isProductPage = pathname?.includes('/products/') ?? false;

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.jetBlack }}>
      <div
        className={`${BLAKKHAIL_LAYOUT.container} flex items-center justify-between gap-2 py-3 sm:py-4`}
      >
        <Link
          href={parentHref}
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity group"
        >
          {/* Combined Logo Container */}
          <div className="relative flex items-center">
            {/* SenCere Logo */}
            <div className="relative z-10">
              <Image
                src={BLAKKHAIL_LEGACY.assets.logo}
                alt="SenCere Creative rabbit logo"
                width={72}
                height={74}
                className="h-12 w-12 object-contain sm:h-16 sm:w-16 transition-transform duration-300 group-hover:scale-110"
                priority
              />
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                style={{ backgroundColor: BLAKKHAIL.gold, filter: 'blur(12px)' }}
              />
            </div>

            {/* BLAKK HAIL Text Badge */}
            <div
              className="ml-1 px-2 py-1 sm:ml-2 sm:px-3 sm:py-1.5 border-2 transform transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
              style={{
                borderColor: BLAKKHAIL.gold,
                backgroundColor: 'rgba(212, 175, 55, 0.05)'
              }}
            >
              <span
                className="text-xs font-black uppercase tracking-widest sm:text-sm"
                style={{ color: BLAKKHAIL.gold }}
              >
                Blakk<br className="sm:hidden" /> Hail
              </span>
            </div>
          </div>

          <span
            className="hidden text-[9px] uppercase tracking-[0.25em] md:block ml-2"
            style={{ color: BLAKKHAIL.steel }}
          >
            Since {blakkhailBrand.established}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="flex min-h-10 items-center justify-center gap-2 border px-3 md:hidden"
            style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            aria-expanded={menuOpen}
            aria-controls="blakkhail-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>

          {host ? (
            <Link
              href={checkoutPath(host)}
              className="flex min-h-10 min-w-10 items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider border"
              style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            >
              <ShoppingCart size={16} aria-hidden />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          ) : (
            <span className="w-10" aria-hidden />
          )}
        </div>
      </div>

      {/* Desktop nav */}
      <nav
        className="hidden border-t md:block"
        style={{ borderColor: BLAKKHAIL.darkGold }}
        aria-label="Main navigation"
      >
        <ul
          className={`${BLAKKHAIL_LAYOUT.container} flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-4 lg:gap-x-8`}
        >
          {BLAKKHAIL_LEGACY.nav.map((item) => (
            <li key={item.href}>
                <Link
                href={isProductPage && item.href.startsWith('#') ? `${storefrontPath}${item.href}` : item.href}
                className="flex min-h-10 items-center text-sm font-semibold uppercase tracking-wide hover:text-opacity-60 transition-opacity"
                style={{ color: BLAKKHAIL.steel }}
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
          style={{ borderColor: BLAKKHAIL.neutral200 }}
          aria-label="Mobile navigation"
        >
          <ul className={`${BLAKKHAIL_LAYOUT.container} flex flex-col py-2`}>
            {BLAKKHAIL_LEGACY.nav.map((item) => (
              <li key={item.href} className="border-b" style={{ borderColor: BLAKKHAIL.neutral200 }}>
                <Link
                  href={isProductPage && item.href.startsWith('#') ? `${storefrontPath}${item.href}` : item.href}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center text-base font-semibold uppercase tracking-wide"
                  style={{ color: BLAKKHAIL.steel }}
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
