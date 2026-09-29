import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';
import { BrandWordmark } from '@/components/ui';
import { LIZZY_LAYOUT, LIZZY_NAV } from '@/lib/brand-tokens';

export function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="border-y border-lizzy-yellow/20 bg-lizzy-deep">
        <div className={`${LIZZY_LAYOUT.container} flex flex-col items-center justify-between gap-5 py-8 sm:flex-row`}>
          <p className="text-center font-display text-xl font-black uppercase tracking-wide text-lizzy-yellow sm:text-left">
            Show your style. Join the Boom.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/boompopsters" className={LIZZY_LAYOUT.btnPrimary}>
              Join the Boom!
            </Link>
            <a href="https://instagram.com" className="grid h-10 w-10 place-items-center rounded-full border border-white/15" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://youtube.com" className="grid h-10 w-10 place-items-center rounded-full border border-white/15" aria-label="YouTube">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className={`${LIZZY_LAYOUT.container} flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between`}>
        <BrandWordmark size="sm" />
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
          {LIZZY_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-lizzy-cyan">
              {item.label}
            </Link>
          ))}
          <Link href="/privacy" className="hover:text-lizzy-cyan">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-lizzy-cyan">
            Terms
          </Link>
        </nav>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
          © 2026 Lil Lizzy · Powered by WISE²
        </p>
      </div>
    </footer>
  );
}
