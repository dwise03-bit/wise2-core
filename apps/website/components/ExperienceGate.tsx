'use client';

type ExperienceGateProps = {
  onChoose: (mode: 'station' | 'hive') => void;
};

export function ExperienceGate({ onChoose }: ExperienceGateProps) {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#070806] px-5 py-6 text-[#fff9eb] sm:px-10 sm:py-9">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_50%_5%,rgba(227,168,47,.16),transparent_26%),linear-gradient(30deg,transparent_48%,rgba(231,181,75,.045)_49%,rgba(231,181,75,.045)_51%,transparent_52%)] [background-size:auto,48px_84px]" />
      <div className="pointer-events-none absolute -left-28 top-1/3 h-80 w-80 rounded-full bg-[#dd9e2e]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-[#38ad81]/10 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-2xl font-black tracking-[.18em] text-[#f7c65d]">WISE²</p>
          <p className="mt-1 text-[10px] uppercase tracking-[.29em] text-white/60">Two minds. One vision.</p>
        </div>
        <p className="hidden text-right text-[10px] uppercase tracking-[.24em] text-[#eacb88]/70 sm:block">Choose your way in</p>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100svh-125px)] max-w-6xl flex-col justify-center py-10">
        <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[.42em] text-[#eebd55]">Welcome to the world of WISE²</p>
        <h1 className="mx-auto max-w-3xl text-center text-4xl font-black leading-[.95] tracking-[-.045em] sm:text-6xl">How do you want to experience the vision?</h1>
        <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-6 text-white/65">One studio. Two distinct arrivals. Choose the energy that meets you where you are.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <button type="button" onClick={() => onChoose('hive')} className="group relative min-h-[330px] overflow-hidden rounded-2xl border border-[#d49a36]/45 bg-[radial-gradient(circle_at_50%_28%,rgba(238,175,53,.24),transparent_22%),linear-gradient(145deg,#24180b,#100e0a_62%,#080908)] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-[#ffd778] hover:shadow-[0_24px_70px_rgba(211,145,27,.24)] focus:outline-none focus:ring-2 focus:ring-[#ffcd62] sm:p-9">
            <div className="absolute -right-12 -top-12 h-56 w-56 rotate-12 opacity-30 [background-image:linear-gradient(30deg,transparent_48%,#f6bf47_49%,#f6bf47_51%,transparent_52%)] [background-size:42px_72px]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between"><span className="text-[10px] font-bold uppercase tracking-[.32em] text-[#f1c761]">01 · The Hive</span><span className="text-3xl text-[#f6c653]">⬡</span></div>
              <div><h2 className="text-3xl font-black tracking-tight text-[#fff4cf] sm:text-4xl">The Hive</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#eadcbd]/70">Elegant strategy, soulful creation, and systems built to move a serious vision forward.</p></div>
              <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#f6c653]">Enter the Hive <b className="text-lg transition-transform group-hover:translate-x-1">→</b></span>
            </div>
          </button>

          <button type="button" onClick={() => onChoose('station')} className="group relative min-h-[330px] overflow-hidden rounded-2xl border border-[#51d98e]/35 bg-[linear-gradient(145deg,#071b16,#081210_55%,#050706)] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-[#78ffb2] hover:shadow-[0_24px_70px_rgba(20,184,125,.18)] focus:outline-none focus:ring-2 focus:ring-[#75ffb1] sm:p-9">
            <div className="absolute inset-x-0 bottom-0 h-36 opacity-30 [background-image:linear-gradient(90deg,transparent,rgba(90,255,169,.45),transparent)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between"><span className="text-[10px] font-bold uppercase tracking-[.32em] text-[#75eeb0]">02 · The Station</span><span className="text-3xl text-[#70f9ae]">⌁</span></div>
              <div><h2 className="text-3xl font-black tracking-tight text-[#e9fff2] sm:text-4xl">The Station</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#c7e8d7]/65">A cinematic New York descent into creative systems, culture, motion, and the unexpected.</p></div>
              <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#75eeb0]">Take the train <b className="text-lg transition-transform group-hover:translate-x-1">→</b></span>
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}

export function HiveArrival({ onBack }: { onBack: () => void }) {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#080806] px-5 py-6 text-[#fff9eb] sm:px-10 sm:py-9">
      <video className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/hive/core-pulse.mp4" type="video/mp4" /></video>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,6,.55),rgba(8,8,6,.84)_72%,#080806)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_50%_28%,rgba(237,178,56,.2),transparent_28%),linear-gradient(30deg,transparent_48%,rgba(237,178,56,.055)_49%,rgba(237,178,56,.055)_51%,transparent_52%)] [background-size:auto,48px_84px]" />
      <header className="relative z-10 flex items-center justify-between"><div><p className="text-2xl font-black tracking-[.18em] text-[#f7c65d]">WISE²</p><p className="mt-1 text-[10px] uppercase tracking-[.29em] text-white/60">The Hive</p></div><button type="button" onClick={onBack} className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f0ca77] hover:text-white">← Change experience</button></header>
      <section className="relative z-10 mx-auto flex min-h-[calc(100svh-125px)] max-w-5xl flex-col items-center justify-center text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.42em] text-[#eebd55]">Strategy · Soul · Systems</p>
        <div className="my-7 grid h-24 w-28 place-items-center rounded-[32%] border border-[#f3c758]/70 bg-[#231606]/90 text-5xl text-[#ffd66b] shadow-[0_0_75px_rgba(231,170,47,.35)]">W²</div>
        <h1 className="max-w-3xl text-5xl font-black leading-[.92] tracking-[-.055em] text-[#fff4d2] sm:text-7xl">Welcome to the Hive.</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[#e8dbc1]/70 sm:text-base">Where refined creative direction meets the infrastructure to make it real. Build the brand. Shape the system. Let it work beautifully.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3"><a href="#hive-services" className="rounded-full bg-[#f2bf55] px-6 py-3 text-xs font-black uppercase tracking-[.16em] text-[#1a1105]">Explore the chambers</a><a href="/contact" className="rounded-full border border-[#e8c470]/60 px-6 py-3 text-xs font-black uppercase tracking-[.16em] text-[#f5dd9f]">Start a conversation</a></div>
        <div id="hive-services" className="mt-14 grid w-full gap-3 text-left sm:grid-cols-3"><MotionChamber label="CLARITY" title="Brand & positioning" source="/hive/chambers.mp4" /><MotionChamber label="CRAFT" title="Cinematic digital work" source="/hive/bee-flybys.mp4" /><MotionChamber label="MOMENTUM" title="Automation & operations" source="/hive/energy-signals.mp4" /></div>
      </section>
    </main>
  );
}

function MotionChamber({ label, title, source }: { label: string; title: string; source: string }) {
  return <div className="group relative min-h-36 overflow-hidden rounded-xl border border-[#d69d39]/30 bg-[#100d09]/80 p-5"><video className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-55" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src={source} type="video/mp4" /></video><div className="absolute inset-0 bg-gradient-to-t from-[#100d09]/90 to-[#100d09]/20" /><div className="relative"><p className="text-[10px] font-bold tracking-[.18em] text-[#f0c35c]">{label}</p><p className="mt-2 text-sm text-white/90">{title}</p></div></div>;
}
