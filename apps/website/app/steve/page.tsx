import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Uncle Steve | Wise Konnections Demo | WISE²',
  description: 'A WISE² concept preview for Wise Konnections: education, strategy, and community connection.',
};

const areas = [
  { number: '01', title: 'Education & Guidance', body: 'A welcoming place to explore consulting, mentorship, and resources for school and community initiatives.' },
  { number: '02', title: 'Community Konnections', body: 'Bring people, organizations, and opportunities together with a clear, purposeful digital experience.' },
  { number: '03', title: 'Consultation', body: 'A simple path for visitors to learn about the vision and start a conversation.' },
];

export default function SteveDemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] text-[#F5F7F6]">
      <section className="relative isolate flex min-h-[78vh] items-center border-b border-emerald-200/10 px-6 py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_25%,rgba(36,108,82,0.24),transparent_48%),linear-gradient(130deg,#050607,#0b1413_60%,#050607)]" />
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <Link href="/" className="text-sm font-extrabold tracking-[.23em] text-[#8AE6AD]">WISE² <span className="font-normal text-white/50">/ PRESENTS</span></Link>
            <p className="mt-16 text-xs font-bold uppercase tracking-[.32em] text-[#8AE6AD]">A concept preview for Uncle Steve</p>
            <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">Wise <span className="text-[#8AE6AD]">Konnections</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Where education, purpose, and community come together. Rooted in experience. Built for meaningful connections.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#vision" className="rounded-md bg-[#8AE6AD] px-6 py-3 text-sm font-bold text-[#07110D] transition hover:bg-[#B6FFD1]">Explore the vision ↓</a>
              <Link href="/contact" className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#8AE6AD]">Connect with WISE² ↗</Link>
            </div>
          </div>
          <div className="relative flex min-h-[360px] items-center justify-center rounded-2xl border border-emerald-200/15 bg-[radial-gradient(circle_at_50%_35%,#1b3530,#090d0d_68%)] p-8 shadow-[0_40px_100px_rgba(0,0,0,.5)]" aria-label="Abstract yin and yang inspired concept artwork">
            <div className="absolute inset-5 rounded-xl border border-white/10" />
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-[#A7D6BD]/35 bg-[conic-gradient(from_180deg,#c5d3cf_0deg,#e5e9e7_175deg,#13261f_181deg,#07110e_355deg)] shadow-[0_0_80px_rgba(102,201,153,.13)]">
              <div className="absolute left-[46%] top-[13%] h-5 w-5 rounded-full bg-[#152821]" />
              <div className="absolute bottom-[13%] right-[46%] h-5 w-5 rounded-full bg-[#EBEEEB]" />
            </div>
            <div className="absolute bottom-9 text-center text-xs uppercase tracking-[.26em] text-white/65">Balance • Wisdom • Konnection</div>
          </div>
        </div>
      </section>
      <section id="vision" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[.28em] text-[#8AE6AD]">The vision</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold sm:text-5xl">A modern presence. A timeless purpose.</h2>
        <p className="mt-5 max-w-3xl leading-8 text-white/65">This preview explores a professional digital home with a restrained, martial-arts-inspired sense of balance. Imagery, programs, biography, and booking details will be finalized with Uncle Steve's approval.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {areas.map((area) => <article key={area.number} className="rounded-xl border border-emerald-200/15 bg-[#0C1513] p-7 shadow-[0_20px_60px_rgba(0,0,0,.2)]">
            <span className="text-xs font-bold tracking-[.2em] text-[#8AE6AD]">{area.number}</span>
            <h3 className="mt-7 text-xl font-bold">{area.title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/65">{area.body}</p>
          </article>)}
        </div>
      </section>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/55">WISE² · Two minds. One vision. · Concept demonstration, not a live booking service.</footer>
    </main>
  );
}
