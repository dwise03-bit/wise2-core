import type { Metadata } from 'next';
import Link from 'next/link';
import { wise2Content } from '@/data/wise2-content';
import {
  digitalTwinAutonomyLevels,
  digitalTwinClones,
  digitalTwinConsentTypes,
  digitalTwinHero,
  digitalTwinPackages,
} from '@/lib/digital-twin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'WISE² Digital Twin™ | Clone Your Knowledge, Voice, and Sales Process',
  description:
    'Build a tenant-scoped AI version of your business that creates content, responds to leads, and supports customers 24/7 with approval-aware automation.',
  alternates: {
    canonical: '/services/digital-twin',
  },
  openGraph: {
    title: 'WISE² Digital Twin™',
    url: '/services/digital-twin',
    description:
      'Clone your knowledge. Clone your voice. Clone your sales process. Scale without adding more of you.',
    images: [
      {
        url: '/digital-twin-hero.png',
        width: 1128,
        height: 1408,
        alt: 'WISE² Digital Twin campaign artwork',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² Digital Twin™',
    description:
      'Clone your knowledge. Clone your voice. Clone your sales process.',
    images: ['/digital-twin-hero.png'],
  },
};

export default function DigitalTwinPage() {
  const { adsPlaceholderData } = wise2Content;

  return (
    <div className="min-h-screen bg-[#050505] text-[#F4EBDD]">
        <section className="relative overflow-hidden border-b border-[#39FF14]/15 px-6 pb-20 pt-28">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(circle at top, rgba(57,255,20,0.16), transparent 34%), linear-gradient(135deg, #0b0b0b 0%, #050505 55%, #11161d 100%)',
            }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full border border-[#39FF14]/40 bg-[#39FF14]/10 px-4 py-2 text-xs font-black tracking-[0.3em] text-[#39FF14]">
                {digitalTwinHero.eyebrow}
              </div>
              <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.95] text-[#F4EBDD] md:text-7xl">
                {digitalTwinHero.headline}
              </h1>
              <p className="mt-6 max-w-3xl text-xl font-semibold text-[#39FF14] md:text-2xl">
                {digitalTwinHero.subheadline}
              </p>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#ddd3c2]">
                {digitalTwinHero.supportingCopy}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/services/digital-twin/pricing"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#39FF14] px-8 py-4 text-base font-black uppercase tracking-[0.18em] text-[#050505] shadow-[0_0_35px_rgba(57,255,20,0.28)] transition hover:brightness-110"
                >
                  {digitalTwinHero.primaryCta}
                </Link>
                <Link
                  href="/services/digital-twin/how-it-works"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#F4EBDD]/30 bg-white/[0.03] px-8 py-4 text-base font-bold uppercase tracking-[0.12em] text-[#F4EBDD] transition hover:border-[#39FF14]/55 hover:text-[#39FF14]"
                >
                  {digitalTwinHero.secondaryCta}
                </Link>
              </div>
              <div className="mt-8 inline-flex rotate-[-2deg] bg-[#8B3F23] px-5 py-3 text-xl font-black uppercase tracking-[0.14em] text-[#F4EBDD] shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
                {digitalTwinHero.slogan}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] border border-[#39FF14]/20 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.12),transparent_65%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-[#F4EBDD]/15 bg-[#111111] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <img
                  src="/digital-twin-hero.png"
                  alt="WISE² Digital Twin hero artwork"
                  className="h-auto w-full rounded-[1.5rem] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#39FF14]/10 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">The Bottleneck</p>
              <h2 className="mt-3 text-4xl font-black uppercase text-[#F4EBDD] md:text-5xl">
                Your expertise should not be trapped inside your calendar.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#d1c7b7]">
                When every sales answer, customer response, follow-up, and message requires the owner, the owner becomes the bottleneck. WISE² Digital Twin turns approved knowledge and communication patterns into reusable AI systems attached to the tenant that purchased them.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {['Sales answers', 'Customer responses', 'Marketing content', 'Follow-up', 'Decision support', 'Operational memory'].map((item) => (
                <div key={item} className="rounded-3xl border border-[#F4EBDD]/10 bg-white/[0.03] px-6 py-7 text-lg font-semibold text-[#F4EBDD]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Six Clones</p>
                <h2 className="mt-3 text-4xl font-black uppercase text-[#F4EBDD] md:text-5xl">One operational system.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#b7ad9d]">
                Gritty on the surface, clean underneath. Marketing moments carry the campaign energy while the actual operating model stays usable and approval-aware.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {digitalTwinClones.map((clone) => (
                <article
                  key={clone.id}
                  className="rounded-[1.75rem] border border-[#39FF14]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-7"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-black uppercase tracking-[0.3em] text-[#39FF14]">{clone.number}</span>
                    <span className="rounded-full border border-[#F4EBDD]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#F4EBDD]/80">
                      {clone.tagline}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase text-[#F4EBDD]">{clone.title}</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {clone.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="rounded-full border border-[#F4EBDD]/12 bg-black/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#ddd3c2]"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#39FF14]/10 bg-[#0a0d0c] px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Autonomy</p>
              <h2 className="mt-3 text-3xl font-black uppercase text-[#F4EBDD]">No unrestricted automation.</h2>
              <div className="mt-8 space-y-4">
                {digitalTwinAutonomyLevels.map((level) => (
                  <div key={level.id} className="rounded-2xl border border-[#F4EBDD]/10 bg-black/25 p-5">
                    <p className="font-black uppercase text-[#F4EBDD]">{level.label}</p>
                    <p className="mt-2 text-sm leading-7 text-[#c9bfaf]">{level.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Consent + Safety</p>
              <h2 className="mt-3 text-3xl font-black uppercase text-[#F4EBDD]">Every likeness and communication surface stays permission-based.</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {digitalTwinConsentTypes.map((item) => (
                  <div key={item} className="rounded-2xl border border-[#39FF14]/14 bg-[#111] px-4 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#F4EBDD]">
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-[#bfb5a6]">
                Voice cloning, avatar creation, sales communications, and customer communications can be granted, revoked, audited, and limited per tenant.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#39FF14]/10 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.75rem] border border-[#39FF14]/20 bg-[linear-gradient(180deg,rgba(57,255,20,0.08),rgba(255,255,255,0.03))] p-8">
                <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Ads System</p>
                <h2 className="mt-3 text-4xl font-black uppercase text-[#F4EBDD] md:text-5xl">
                  {adsPlaceholderData.headline}
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d1c7b7]">
                  {adsPlaceholderData.subheading}
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {adsPlaceholderData.channels.map((channel) => (
                    <span
                      key={channel}
                      className="rounded-full border border-[#F4EBDD]/12 bg-black/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#ddd3c2]"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {adsPlaceholderData.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-[1.5rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-6">
                      <div className="text-3xl font-black uppercase text-[#39FF14]">{metric.value}</div>
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b3a999]">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {adsPlaceholderData.offers.map((offer) => (
                    <article key={offer.id} className="rounded-[1.5rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-6">
                      <h3 className="text-xl font-black uppercase text-[#F4EBDD]">{offer.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[#c5bcad]">{offer.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Packages</p>
                <h2 className="mt-3 text-4xl font-black uppercase text-[#F4EBDD] md:text-5xl">Choose the build path.</h2>
              </div>
              <Link href="/services/digital-twin/pricing" className="text-sm font-black uppercase tracking-[0.18em] text-[#39FF14]">
                View full pricing →
              </Link>
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
              {digitalTwinPackages.map((pkg) => (
                <div key={pkg.id} className="rounded-[1.75rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-black uppercase text-[#F4EBDD]">{pkg.name}</h3>
                    <span className="rounded-full bg-[#39FF14]/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#39FF14]">
                      {pkg.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-[#c5bcad]">{pkg.summary}</p>
                  <div className="mt-6 text-3xl font-black uppercase text-[#39FF14]">
                    {pkg.price ? `$${pkg.price.toLocaleString()}` : 'Custom'}
                  </div>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#b3a999]">{pkg.cadence}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
    </div>
  );
}
