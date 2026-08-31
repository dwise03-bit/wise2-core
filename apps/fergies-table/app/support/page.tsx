import Link from 'next/link';
import { ClocheMark } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { OWNER_PROFILE } from '@/lib/demo-data';

export const metadata = {
  title: "Support | Fergie's Table",
  description: "Support for Fergie's Table & Savôré.",
};

export default function SupportPage() {
  return (
    <div className={`${FERGIE_LAYOUT.page} smoke-bg`}>
      <header className="border-b border-fergie-gold/15 px-4 py-4">
        <Link href="/" className="mx-auto flex max-w-2xl items-center gap-2">
          <ClocheMark className="h-8 w-8" />
          <span className="font-display text-sm font-bold uppercase tracking-[0.16em] text-fergie-gold">
            Fergie&apos;s Table
          </span>
        </Link>
      </header>
      <article className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed text-white/75">
        <p className="font-script text-2xl text-fergie-rose">We&apos;re here</p>
        <h1 className="mt-1 font-serif text-3xl text-white">Support</h1>
        <p className="mt-4">
          For bookings, catering, or the Fergie&apos;s Table app, reach Chef Fergie directly.
        </p>
        <p className="mt-6 text-fergie-gold">{OWNER_PROFILE.phone}</p>
        <p>
          <a className="text-fergie-gold" href={`mailto:${OWNER_PROFILE.email}`}>
            {OWNER_PROFILE.email}
          </a>
        </p>
        <p className="mt-2 text-white/55">
          {OWNER_PROFILE.business} · {OWNER_PROFILE.city}
        </p>
        <p className="mt-2 text-white/55">{OWNER_PROFILE.hours}</p>
        <p className="mt-10">
          <Link href="/privacy" className="text-fergie-gold">
            Privacy
          </Link>
          {' · '}
          <Link href="/" className="text-fergie-gold">
            Website
          </Link>
        </p>
      </article>
    </div>
  );
}
