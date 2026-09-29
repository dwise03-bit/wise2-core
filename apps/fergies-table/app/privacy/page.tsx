import Link from 'next/link';
import { ClocheMark } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { OWNER_PROFILE } from '@/lib/demo-data';

export const metadata = {
  title: "Privacy | Fergie's Table",
  description: "Privacy policy for Fergie's Table & Savôré.",
};

export default function PrivacyPage() {
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
        <p className="font-script text-2xl text-fergie-rose">Privacy</p>
        <h1 className="mt-1 font-serif text-3xl text-white">How we handle information</h1>
        <p className="mt-2 text-xs uppercase tracking-wider text-white/40">Last updated August 30, 2026</p>

        <h2 className="mt-8 font-serif text-xl text-white">Who we are</h2>
        <p className="mt-2">
          Fergie&apos;s Table &amp; Savôré ({OWNER_PROFILE.city}) operates this app and website. Contact:{' '}
          <a className="text-fergie-gold" href={`mailto:${OWNER_PROFILE.email}`}>
            {OWNER_PROFILE.email}
          </a>
          .
        </p>

        <h2 className="mt-8 font-serif text-xl text-white">What this app does</h2>
        <p className="mt-2">
          The iOS app is a companion for running the catering house: kitchen tickets, bookings, leads, quotes, and
          payments. Guest ordering and table requests are available in the same app.
        </p>

        <h2 className="mt-8 font-serif text-xl text-white">Data we collect</h2>
        <p className="mt-2">
          This version stores business demo data on the device only (orders, bookings, settings). We do not create user
          accounts, and we do not sell personal information. Booking and contact details you type stay on the device
          unless you later connect a production backend.
        </p>
        <p className="mt-2">
          The app loads the live Fergie&apos;s Table service over HTTPS from wise2.net. Menu photos may load from
          Unsplash. Those services receive standard technical data such as IP address and device type.
        </p>

        <h2 className="mt-8 font-serif text-xl text-white">Tracking</h2>
        <p className="mt-2">We do not use tracking SDKs, advertising IDs, or cross-app tracking.</p>

        <h2 className="mt-8 font-serif text-xl text-white">Deleting data</h2>
        <p className="mt-2">
          There is no cloud account to delete. Clear the app or delete it from the iPhone to remove local data.
        </p>

        <h2 className="mt-8 font-serif text-xl text-white">Children</h2>
        <p className="mt-2">The app is a business tool. It is not directed at children under 13.</p>

        <h2 className="mt-8 font-serif text-xl text-white">Changes</h2>
        <p className="mt-2">If this policy changes, we will update the date at the top of this page.</p>

        <p className="mt-10">
          <Link href="/support" className="text-fergie-gold">
            Support
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
