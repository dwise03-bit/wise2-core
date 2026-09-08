import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WISE² XR for Meta Quest',
  description: 'Open the WISE² Digital Twin command room on Meta Quest.',
  alternates: { canonical: '/quest' },
};

const QUEST_INTENT = 'intent://digital-twin#Intent;scheme=wise2;package=com.wise2.xrcommandcenter;end';

export default function QuestPage({
  searchParams,
}: {
  searchParams?: { surface?: string };
}) {
  const isDigitalTwin = searchParams?.surface === 'digital-twin';

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-4 py-16 text-[#F4EBDD] sm:px-6 sm:py-24">
      <section className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#39FF14]/25 bg-[radial-gradient(circle_at_top_right,rgba(57,255,20,0.18),transparent_38%),linear-gradient(135deg,#0d1210,#050505_62%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-10 lg:p-14">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(57,255,20,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.18)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#39FF14]">Meta Quest 3 / 3S</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-[0.94] sm:text-6xl">WISE² XR command room.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#d5cbbb] sm:text-lg">
            {isDigitalTwin
              ? 'Your Digital Twin context is ready to hand off to the WISE² XR command room.'
              : 'Open WISE² operational surfaces as a spatial command room on your Quest headset.'}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a
              href={QUEST_INTENT}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#39FF14] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.13em] text-[#050505] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#F4EBDD]"
            >
              Open WISE² XR
            </a>
            <Link
              href="/wise-defense/training"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-[#39FF14]/40 bg-[#39FF14]/[0.06] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.13em] text-[#39FF14] transition hover:bg-[#39FF14]/[0.12] focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
            >
              WISE Defense Training
            </Link>
            <Link
              href="/services/digital-twin"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-[#F4EBDD]/20 bg-black/20 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.13em] text-[#F4EBDD] transition hover:border-[#39FF14]/60 hover:text-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
            >
              Return to Digital Twin
            </Link>
          </div>

          <div className="mt-10 grid gap-3 text-sm leading-7 text-[#c9bfaf] sm:grid-cols-3">
            <p className="rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-4"><span className="block text-xs font-black uppercase tracking-[0.14em] text-[#39FF14]">01</span>Install the WISE² XR build on Quest.</p>
            <p className="rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-4"><span className="block text-xs font-black uppercase tracking-[0.14em] text-[#39FF14]">02</span>Open this page in the Quest Browser.</p>
            <p className="rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-4"><span className="block text-xs font-black uppercase tracking-[0.14em] text-[#39FF14]">03</span>Choose Open WISE² XR to hand off this command surface.</p>
          </div>

          <p className="mt-8 text-xs leading-6 text-[#a99f91]">
            The headset receives only the requested screen context. Tenant data, permissions, and actions remain authenticated and approval-gated in WISE².
          </p>
        </div>
      </section>
    </main>
  );
}
