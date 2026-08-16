'use client';

import Link from 'next/link';

const palette = [
  { name: 'Void Black', hex: '#050505', desc: 'Primary background' },
  { name: 'Dark Steel', hex: '#0A0A0A', desc: 'Deep surface layer' },
  { name: 'Steel Panel', hex: '#161616', desc: 'Cards and panels' },
  { name: 'Chrome', hex: '#E6E8EC', desc: 'High-trust text and highlights' },
  { name: 'Neon Lime', hex: '#C7FF2E', desc: 'Primary action and energy' },
  { name: 'Studio Purple', hex: '#B36BFF', desc: 'Secondary accent' },
];

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 bg-gradient-to-b from-[#090909] to-[#050505] px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B36BFF]/30 bg-[#B36BFF]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#B36BFF]">
            WISE² united identity
          </div>
          <h1 className="mt-6 text-5xl font-black uppercase tracking-[0.15em]">
            Design System
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#B7BDC8]">
            The public system for the new brand language: cinematic, premium, black-first, with neon lime and studio purple used as deliberate signals.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-16">
        <section className="mb-20">
          <h2 className="mb-8 text-3xl font-bold uppercase tracking-[0.08em]" style={{ fontFamily: 'Orbitron', color: '#C7FF2E' }}>
            Color System
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {palette.map((color) => (
              <article key={color.hex} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 h-16 rounded-xl border border-white/10" style={{ backgroundColor: color.hex }} />
                <p className="font-bold text-white">{color.name}</p>
                <p className="font-mono text-sm text-[#9BA3B1]">{color.hex}</p>
                <p className="mt-2 text-sm text-[#B7BDC8]">{color.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-8 text-3xl font-bold uppercase tracking-[0.08em]" style={{ fontFamily: 'Orbitron', color: '#C7FF2E' }}>
            Typography
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-5xl font-black uppercase tracking-[0.15em]">WISE²</h3>
              <p className="mt-2 text-[#B7BDC8]">Orbitron for display, used sparingly and with strong letter spacing.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-lg text-white">Raleway for body copy and supporting structure. Keep it clean, readable, and confident.</p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-8 text-3xl font-bold uppercase tracking-[0.08em]" style={{ fontFamily: 'Orbitron', color: '#C7FF2E' }}>
            UI Principles
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Treat every hero like a poster: bold statement, clear hierarchy, one sharp promise.',
              'Use lime for action and purple for contrast. Avoid sprinkling both colors everywhere.',
              'Keep surfaces dark and restrained so the accents feel intentional, not noisy.',
              'Prefer uppercase shorthand for labels, but keep body copy normal and readable.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-[#B7BDC8]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-8 text-3xl font-bold uppercase tracking-[0.08em]" style={{ fontFamily: 'Orbitron', color: '#C7FF2E' }}>
            Pages
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: 'Home', href: '/' },
              { name: 'About', href: '/about' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Checkout', href: '/checkout' },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#C7FF2E]/40"
              >
                <p className="font-bold text-white">{page.name}</p>
                <p className="mt-1 text-sm text-[#B7BDC8]">{page.href}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
