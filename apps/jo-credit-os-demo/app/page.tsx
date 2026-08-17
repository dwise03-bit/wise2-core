import Image from 'next/image';
import Link from 'next/link';

const businessUnits = [
  {
    name: 'Wise Shine',
    label: 'Premium detailing',
    description:
      'A precision service brand built for shine, finish, and first impressions that last.',
    accent: 'from-[#C7FF2E]/30 to-transparent',
  },
  {
    name: 'Piff City Creative Studios',
    label: 'Music and media',
    description:
      'A creative engine for sound, story, visuals, and culture-making output.',
    accent: 'from-[#B36BFF]/30 to-transparent',
  },
  {
    name: 'WISE² Business OS',
    label: 'Operating layer',
    description:
      'The system connecting the businesses, the leaders, and the daily execution that powers the brand.',
    accent: 'from-white/20 to-transparent',
  },
];

const pillars = [
  {
    title: 'Building empires',
    text: 'Create durable systems that scale beyond one offer, one team, or one season.',
  },
  {
    title: 'Changing culture',
    text: 'Push the aesthetic, the standard, and the expectation for what a modern Black-led brand can look like.',
  },
  {
    title: 'One system',
    text: 'Connect operations, storytelling, commerce, and service into a single operating core.',
  },
  {
    title: 'Together we build legacy',
    text: 'Every launch, every client win, and every product adds to something bigger than a campaign.',
  },
];

const metrics = [
  { value: '1', label: 'system' },
  { value: '3', label: 'powered businesses' },
  { value: '4', label: 'leaders' },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(199,255,46,0.18),transparent_42%),radial-gradient(circle_at_80%_18%,rgba(179,107,255,0.16),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        <div className="absolute left-[-8rem] top-1/3 h-64 w-64 rounded-full bg-[#C7FF2E]/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-1/4 h-80 w-80 rounded-full bg-[#B36BFF]/12 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#C7FF2E]">
              Atlanta, GA
              <span className="h-1 w-1 rounded-full bg-[#B36BFF]" />
              Command Center
            </div>

            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.88] tracking-[0.08em] text-white sm:text-6xl lg:text-7xl">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-[#D7DADF] to-[#8B929E]">
                WISE²
              </span>
              <span className="mt-3 block text-[#C7FF2E]">
                Business OS
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#B7BDC8] sm:text-xl">
              Building empires, changing culture. WISE² is the brand system for
              founders who want a sharper identity, stronger execution, and a
              legacy that reads like a movement.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start-your-build"
                className="inline-flex items-center justify-center rounded-full border border-[#C7FF2E]/40 bg-[#C7FF2E] px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(199,255,46,0.35)]"
              >
                Start Your Build
              </Link>
              <Link
                href="/powered-businesses"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#B36BFF]/40 hover:bg-[#B36BFF]/10"
              >
                See the Businesses
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
                >
                  <div className="text-3xl font-black uppercase tracking-[0.16em] text-[#C7FF2E]">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.3em] text-[#9BA3B1]">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(199,255,46,0.18),transparent_55%),radial-gradient(circle_at_75%_20%,rgba(179,107,255,0.18),transparent_30%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090909]/90 shadow-[0_0_90px_rgba(0,0,0,0.55)]">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#9BA3B1]">
                  <span>New Brand Identity</span>
                  <span className="text-[#C7FF2E]">Legacy mode</span>
                </div>
              </div>
              <div className="relative aspect-[1672/941] bg-black">
                <Image
                  src="/brand/wise2-brand-identity.png"
                  alt="WISE² new brand identity poster"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.86),transparent_30%),radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_28%)]" />
                <div className="pointer-events-none absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#C7FF2E]">
                    One system. Three powered businesses. Four leaders.
                  </p>
                  <p className="mt-1 text-sm text-[#E5E8EC]">
                    Together we build legacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#B36BFF]">
              Brand architecture
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
              Three businesses. One operating system.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#AAB1BC] sm:text-base">
            The poster is the promise. The homepage is the proof. Every part of
            the experience should feel like a high-trust, high-output studio for
            founders who are building something bigger than a service page.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {businessUnits.map((unit) => (
            <article
              key={unit.name}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${unit.accent} opacity-70`} />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C7FF2E]">
                  {unit.label}
                </p>
                <h3 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white">
                  {unit.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#B7BDC8]">
                  {unit.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[#070707]/90">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#C7FF2E]">
                Brand statement
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
                This is not a refresh.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#B7BDC8]">
                This is a full identity shift toward a more cinematic,
                founder-led, legacy-focused WISE². The new visual language should
                feel premium, electric, and unmistakably rooted in Atlanta.
              </p>

              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-[11px] uppercase tracking-[0.34em] text-[#9BA3B1]">
                  Primary line
                </p>
                <p className="mt-3 text-2xl font-black uppercase tracking-[0.12em] text-[#F3F5F7]">
                  Building empires. Changing culture.
                </p>
                <p className="mt-4 text-sm uppercase tracking-[0.24em] text-[#C7FF2E]">
                  Together we build legacy.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
                >
                  <h3 className="text-xl font-bold uppercase tracking-[0.08em] text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#B7BDC8]">
                    {pillar.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(199,255,46,0.12),rgba(179,107,255,0.12),rgba(255,255,255,0.03))] p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#C7FF2E]">
                Next step
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-4xl">
                Open the system.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#E0E4EA]">
                Explore the businesses, step into the studio, or start a build
                that reflects the new WISE² identity from day one.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/35 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#B36BFF]/40 hover:bg-[#B36BFF]/10"
              >
                Open the Studio
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-[#C7FF2E]/40 bg-[#C7FF2E] px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(199,255,46,0.35)]"
              >
                Command Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
