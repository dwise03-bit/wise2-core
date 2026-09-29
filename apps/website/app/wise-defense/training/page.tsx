import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'VR Training | WISE Defense',
  description: 'WISE Defense supplemental virtual training for Meta Quest with Shooters Global timer support.',
  alternates: { canonical: '/wise-defense/training' },
};

const QUEST_TRAINING_INTENT =
  'intent://wise-defense-training#Intent;scheme=wise2;package=com.wise2.xrcommandcenter;end';

const drills = [
  ['01', 'Draw fundamentals', 'Build a consistent, safe presentation from your selected carry position.'],
  ['02', 'First-shot timing', 'Use the Shooters Global start signal and measure authoritative shot times.'],
  ['03', 'Awareness decisions', 'Practice pause, assess, and de-escalation decisions in a controlled scenario.'],
];

export default function WiseDefenseTrainingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-4 py-12 text-[#F4EBDD] sm:px-6 sm:py-20">
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#39FF14]/25 bg-[radial-gradient(circle_at_top_right,rgba(57,255,20,0.18),transparent_36%),linear-gradient(135deg,#0d1210,#050505_65%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-10 lg:p-14">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(57,255,20,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.16)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative">
          <Link href="/wise-defense" className="text-xs font-black uppercase tracking-[0.24em] text-[#39FF14]">WISE Defense / Training</Link>
          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#39FF14]">Meta Quest 3S · Quest 3</p>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[0.94] sm:text-7xl">Train with intent.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#d5cbbb] sm:text-lg">
              A guided, supplemental virtual training room for fundamentals, timing, awareness, and instructor-reviewed progress.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {drills.map(([number, title, copy]) => (
              <article key={number} className="rounded-2xl border border-[#F4EBDD]/10 bg-black/25 p-5">
                <span className="text-xs font-black tracking-[0.2em] text-[#39FF14]">{number}</span>
                <h2 className="mt-4 text-lg font-black uppercase">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#c9bfaf]">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-[#39FF14]/25 bg-[#39FF14]/[0.06] p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#39FF14]">Shooter&apos;s Global link</p>
              <h2 className="mt-3 text-2xl font-black uppercase">Precision timing, inside the session.</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#c9bfaf]">
                Pair an SG Timer, SG Timer 2, or SG Timer GO through the official BLE adapter. Start signals, first-shot time, and splits are preserved as timer-authoritative events for scoring and instructor review.
              </p>
              <p className="mt-4 text-xs leading-6 text-[#a99f91]">BLE API v3.2 · offline-first session sync · reconnect handling</p>
            </div>
            <div className="rounded-2xl border border-[#F4EBDD]/10 bg-black/25 p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#39FF14]">Before you start</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#c9bfaf]">
                <li>• Use inert virtual equipment only.</li>
                <li>• Confirm a clear, supervised play area.</li>
                <li>• VR supplements—not replaces—live-fire instruction.</li>
                <li>• 18+; follow applicable laws and instructor guidance.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href={QUEST_TRAINING_INTENT} className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#39FF14] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.13em] text-[#050505] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#F4EBDD]">Launch Quest training</a>
            <Link href="/quest" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-[#F4EBDD]/20 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.13em] transition hover:border-[#39FF14]/60 hover:text-[#39FF14]">Quest setup</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
