'use client';

import Link from 'next/link';
import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { CATERING_PACKAGES } from '@/lib/demo-data';

export default function CateringPage() {
  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Catering" subtitle="Curated packages" />
      <p className="mb-5 text-sm text-white/55">
        Built for dinner parties, soirées, and the kind of table people stay at late.
      </p>
      <div className="space-y-4" data-tour="catering-list">
        {CATERING_PACKAGES.map((pkg) => (
          <GlassCard key={pkg.id} className="overflow-hidden p-0" glow>
            <div className="relative h-36 w-full">
              <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-fergie-black via-fergie-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <StatusPill label={pkg.guests} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-xl">{pkg.name}</h2>
                <p className="text-sm font-semibold text-fergie-gold">From ${pkg.priceFrom}/guest</p>
              </div>
              <p className="mt-2 text-sm text-white/60">{pkg.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-fergie-rose/80">
                {pkg.includes.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
              <Link
                href={`/book?type=${encodeURIComponent(pkg.name)}`}
                className={`mt-4 w-full ${FERGIE_LAYOUT.btnPrimary}`}
              >
                Book this package
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
      <Link href="/table" className={`mt-4 w-full ${FERGIE_LAYOUT.btnGhost}`}>
        Build a custom table
      </Link>
    </div>
  );
}
