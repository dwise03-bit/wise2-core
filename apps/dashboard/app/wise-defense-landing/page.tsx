import Link from 'next/link';

const programs = [
  ['PERSONAL PROTECTION', 'Purpose-built instruction for responsible, prepared citizens.'],
  ['FIREARM SAFETY', 'Safety-first education that builds confident, disciplined habits.'],
  ['FAMILY PREPAREDNESS', 'Practical plans for the people and places that matter most.'],
];

export const metadata = {
  title: 'Wise Defense L.L.C. | Train. Teach. Protect.',
  description: 'Wise Defense training, safety education, preparedness, and Safety Radar intelligence.',
};

export default function WiseDefenseLandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050607] text-zinc-100 selection:bg-red-800">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/wise-defense-landing" className="flex items-center gap-3" aria-label="Wise Defense home">
            <span className="grid h-11 w-11 place-items-center border border-amber-400/70 bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-800 text-2xl font-black italic text-black shadow-[0_0_22px_rgba(218,165,32,.18)]">W</span>
            <span>
              <span className="block text-sm font-black tracking-[.18em] text-zinc-100">WISE DEFENSE <b className="text-red-500">L.L.C.</b></span>
              <span className="block text-[9px] font-semibold tracking-[.32em] text-zinc-500">TRAIN. TEACH. PROTECT.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-[11px] font-bold tracking-[.16em] text-zinc-400 md:flex">
            <a href="#training" className="transition hover:text-white">TRAINING</a>
            <a href="#mission" className="transition hover:text-white">MISSION</a>
            <Link href="/wise-defense/dashboard" className="transition hover:text-white">SAFETY RADAR</Link>
          </nav>
          <a href="#contact" className="border border-red-600 bg-red-700 px-4 py-2 text-[10px] font-black tracking-[.16em] text-white transition hover:bg-red-600">GET STARTED</a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_42%,rgba(185,28,28,.28),transparent_22%),radial-gradient(circle_at_78%_58%,rgba(30,64,175,.18),transparent_28%),linear-gradient(115deg,#030303_20%,#080b0e_65%,#030303)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="absolute -right-24 top-10 h-[520px] w-[520px] rounded-full border border-white/10 shadow-[0_0_0_55px_rgba(255,255,255,.025),0_0_0_110px_rgba(255,255,255,.018),0_0_0_165px_rgba(255,255,255,.01)]" />
        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 border border-red-700/60 bg-red-950/40 px-3 py-2 text-[10px] font-black tracking-[.2em] text-red-300"><span className="h-2 w-2 rounded-full bg-red-500" /> WISE DEFENSE L.L.C.</p>
            <h1 className="max-w-3xl text-6xl font-black leading-[.84] tracking-[-.065em] text-zinc-100 sm:text-7xl lg:text-8xl">TRAIN.<br /><span className="text-zinc-400">TEACH.</span><br /><span className="text-red-600">PROTECT.</span></h1>
            <p className="mt-7 max-w-lg text-sm font-bold tracking-[.16em] text-red-400">EMPOWERING MINDS. PROTECTING LIVES.</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">Real education. Real training. Real preparedness. Wise Defense builds disciplined confidence through safety education, responsible protection training, and resilient community planning.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#contact" className="inline-flex items-center justify-center gap-3 border border-red-500 bg-red-700 px-6 py-4 text-xs font-black tracking-[.16em] text-white transition hover:bg-red-600">JOIN THE MOVEMENT <span>→</span></a>
              <Link href="/wise-defense/dashboard" className="inline-flex items-center justify-center gap-3 border border-zinc-600 bg-black/30 px-6 py-4 text-xs font-black tracking-[.16em] text-zinc-200 transition hover:border-zinc-300">OPEN SAFETY RADAR <span>↗</span></Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-[4/5] border border-zinc-600/60 bg-[linear-gradient(145deg,rgba(24,27,31,.98),rgba(4,5,6,.92))] p-5 shadow-[0_30px_90px_rgba(0,0,0,.55)]">
              <div className="flex h-full flex-col justify-between border border-white/10 p-6">
                <div className="flex justify-between text-[10px] font-bold tracking-[.18em] text-zinc-500"><span>WISE DEFENSE</span><span className="text-red-500">EST. 2026</span></div>
                <div className="relative mx-auto grid h-40 w-40 place-items-center rounded-full border border-red-600/50 shadow-[0_0_0_18px_rgba(220,38,38,.05),0_0_40px_rgba(220,38,38,.25)]">
                  <div className="absolute inset-5 rounded-full border border-zinc-500/50" />
                  <span className="text-7xl font-black italic text-zinc-200">W</span>
                </div>
                <div className="border-t border-white/10 pt-5"><p className="text-xl font-black leading-tight tracking-tight text-zinc-200">DISCIPLINE TODAY.</p><p className="text-xl font-black leading-tight tracking-tight text-red-500">IMPACT FOREVER.</p><p className="mt-4 text-[10px] font-semibold tracking-[.18em] text-zinc-500">POWERED BY WISE² INTELLIGENCE ENGINE</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="training" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="text-[10px] font-black tracking-[.22em] text-red-500">TRAIN WITH PURPOSE</p>
        <div className="mt-4 flex flex-col justify-between gap-8 md:flex-row md:items-end"><h2 className="max-w-2xl text-4xl font-black tracking-tight text-zinc-100 lg:text-5xl">PREPARED TODAY.<br /><span className="text-zinc-500">PROTECTED TOMORROW.</span></h2><p className="max-w-md text-sm leading-relaxed text-zinc-400">Training is built around sound judgment, lawful responsibility, and practical readiness—not fear.</p></div>
        <div className="mt-10 grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {programs.map(([title, copy], index) => <article key={title} className="bg-[#090b0e] p-7 transition hover:bg-[#101419]"><p className="text-[10px] font-black tracking-[.2em] text-red-500">0{index + 1}</p><h3 className="mt-10 text-lg font-black tracking-wide text-zinc-100">{title}</h3><p className="mt-3 text-sm leading-relaxed text-zinc-500">{copy}</p><a href="#contact" className="mt-8 inline-block text-[10px] font-black tracking-[.16em] text-zinc-300 hover:text-red-400">LEARN MORE →</a></article>)}
        </div>
      </section>

      <section id="mission" className="border-y border-zinc-800 bg-zinc-950/70"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8"><div><p className="text-[10px] font-black tracking-[.22em] text-red-500">OUR MISSION</p><h2 className="mt-4 text-4xl font-black tracking-tight text-white">KNOWLEDGE IS THE FOUNDATION OF PROTECTION.</h2></div><p className="self-end text-base leading-relaxed text-zinc-400">Wise Defense serves families, teams, and communities with practical safety education and emergency-preparedness instruction. The optional Safety Radar gives operators a clear, honest view of configured intelligence and communications systems.</p></div></section>

      <section id="contact" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-col justify-between gap-8 border border-red-900/70 bg-[linear-gradient(115deg,rgba(69,10,10,.45),rgba(9,10,12,.9))] p-8 md:flex-row md:items-center md:p-12"><div><p className="text-[10px] font-black tracking-[.22em] text-red-400">READY WHEN YOU ARE</p><h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-100">START A CONVERSATION.</h2></div><a href="mailto:info@wisedefensellc.com" className="inline-flex w-fit border border-red-500 bg-red-700 px-6 py-4 text-xs font-black tracking-[.16em] text-white transition hover:bg-red-600">CONTACT WISE DEFENSE →</a></div></section>

      <footer className="border-t border-zinc-800 px-5 py-8 text-center text-[10px] font-bold tracking-[.18em] text-zinc-600">WISE DEFENSE L.L.C. · TRAIN. TEACH. PROTECT. · POWERED BY WISE²</footer>
    </main>
  );
}
