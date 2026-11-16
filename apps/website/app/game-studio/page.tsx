import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WISE² Game Studio | Build Beyond Reality',
  description: 'Cinematic game development, AI-powered characters, original worlds, retro arcade, and the WISE² Gaming Arsenal.',
};

const lanes = [
  { n: '01', name: 'ORIGINAL GAME LAB', sub: 'Godot · Gameplay · Prototyping', desc: 'Original playable worlds, mechanics, levels, controller support and release engineering.', accent: 'from-cyan-500/25 to-blue-900/10' },
  { n: '02', name: 'CINEMATIC WORLDS', sub: 'Unreal · Blender · 3D', desc: 'Real-time lighting, cinematic environments, character pipelines and high-resolution visuals.', accent: 'from-violet-500/25 to-indigo-900/10' },
  { n: '03', name: 'LIVING CHARACTERS', sub: 'Hermes · Ollama · NPC AI', desc: 'Context-aware characters, dialogue and quests with rule-checked game actions.', accent: 'from-fuchsia-500/25 to-blue-900/10' },
  { n: '04', name: 'RETRO ARCADE', sub: 'N64 · RetroPie · RetroArch', desc: 'Darrin’s Kirby 64 and Zelda emulator setup, controller mapping and a separate game launcher.', accent: 'from-amber-500/20 to-rose-900/10' },
];
const links = [
  { name: 'GAME ARSENAL', href: 'https://github.com/dwise03-bit/wise2-core/tree/main/WISE2-GAME-ARSENAL', note: 'Tools, experiments and studio handoffs' },
  { name: 'DARRIN N64 HANDOFF', href: 'https://github.com/dwise03-bit/Wise2-hardware/blob/main/arcade/n64-darrin/README.md', note: 'Retro arcade setup and verification checklist' },
  { name: 'AI ARSENAL', href: 'https://github.com/dwise03-bit/wise2-core/tree/main/WISE2-AI-ARSENAL', note: 'AI integrations and research' },
  { name: 'DEV ARSENAL', href: 'https://github.com/dwise03-bit/wise2-core/tree/main/WISE2-DEV-ARSENAL', note: 'Engineering and release workflows' },
];
export default function GameStudioPage() {
  return <main className="min-h-screen overflow-hidden bg-[#02040c] text-white">
    <style>{`@keyframes drift{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-3%,5%,0) scale(1.12)}}@keyframes reveal{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}.ambient{animation:drift 18s ease-in-out infinite}.reveal{animation:reveal .9s both}.gridlines{background-image:linear-gradient(rgba(125,211,252,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,.055) 1px,transparent 1px);background-size:70px 70px}@media(prefers-reduced-motion:reduce){.ambient,.reveal{animation:none}}`}</style>
    <div className="relative isolate min-h-[95svh] overflow-hidden border-b border-cyan-300/10">
      <div aria-hidden="true" className="gridlines absolute inset-0 opacity-70"/>
      <div aria-hidden="true" className="ambient pointer-events-none absolute -right-32 -top-40 h-[750px] w-[750px] rounded-full bg-cyan-600/20 blur-[125px]"/>
      <div aria-hidden="true" className="ambient pointer-events-none absolute -bottom-72 -left-40 h-[720px] w-[720px] rounded-full bg-violet-700/25 blur-[120px]" style={{animationDelay:'-9s'}}/>
      <header className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <Link href="/" className="text-2xl font-black tracking-tight">WISE<span className="text-cyan-300">²</span><span className="ml-3 border-l border-white/20 pl-3 text-xs tracking-[.28em] text-slate-300">GAME STUDIO</span></Link>
        <nav aria-label="Studio navigation" className="flex gap-5 text-[11px] font-bold tracking-[.2em] text-slate-300"><a href="#divisions" className="hover:text-cyan-300">DIVISIONS</a><a href="#arsenal" className="hover:text-cyan-300">ARSENAL</a><a href="#roadmap" className="hover:text-cyan-300">ROADMAP</a></nav>
      </header>
      <section className="relative z-10 mx-auto flex min-h-[72svh] max-w-7xl flex-col justify-center px-6 py-20">
        <p className="reveal mb-7 text-xs font-bold tracking-[.42em] text-cyan-300">INTERACTIVE ENTERTAINMENT / WISE²</p>
        <h1 className="reveal max-w-6xl text-[clamp(4rem,11vw,10rem)] font-black leading-[.86] tracking-[-.075em]" style={{animationDelay:'.1s'}}>WE BUILD<br/><span className="bg-gradient-to-r from-cyan-200 via-blue-400 to-violet-400 bg-clip-text text-transparent">WORLDS.</span></h1>
        <p className="reveal mt-10 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-2xl" style={{animationDelay:'.2s'}}>From first playable to cinematic universe. AI-assisted creation, living characters, immersive environments and a connected gaming arsenal.</p>
        <div className="reveal mt-10 flex flex-wrap gap-3" style={{animationDelay:'.3s'}}><a href="#divisions" className="bg-cyan-300 px-7 py-4 text-xs font-black tracking-widest text-slate-950 hover:bg-white">ENTER THE STUDIO</a><a href="#arsenal" className="border border-cyan-300/50 px-7 py-4 text-xs font-black tracking-widest text-cyan-100 hover:bg-cyan-300/10">OPEN GAME ARSENAL</a></div>
        <p className="mt-20 text-[10px] tracking-[.36em] text-slate-500">CREATE / SIMULATE / PLAY / DEPLOY</p>
      </section>
    </div>
    <section id="divisions" className="mx-auto max-w-7xl px-6 py-24"><p className="text-xs font-bold tracking-[.4em] text-cyan-300">THE PRODUCTION PIPELINE</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">FOUR DIVISIONS. ONE STUDIO.</h2><div className="mt-12 grid gap-4 md:grid-cols-2">{lanes.map(l=><article key={l.n} className={`group relative min-h-[340px] overflow-hidden border border-white/10 bg-gradient-to-br ${l.accent} p-8 transition hover:-translate-y-1 hover:border-cyan-300/50 sm:p-10`}><span className="text-6xl font-black text-white/15">{l.n}</span><div className="mt-14"><p className="text-xs font-bold tracking-[.22em] text-cyan-200">{l.sub}</p><h3 className="mt-3 text-3xl font-black">{l.name}</h3><p className="mt-4 max-w-lg leading-relaxed text-slate-300">{l.desc}</p></div></article>)}</div></section>
    <section id="arsenal" className="border-y border-cyan-300/10 bg-[#070d1c]"><div className="mx-auto max-w-7xl px-6 py-24"><p className="text-xs font-bold tracking-[.4em] text-cyan-300">SOURCE CONTROL / TOOLING</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">THE GAMING ARSENAL</h2><p className="mt-5 max-w-2xl text-slate-400">The connected GitHub source of truth for studio work. Linked projects have different readiness levels; documentation does not mean playable builds are verified.</p><div className="mt-12 grid gap-4 md:grid-cols-2">{links.map(l=><a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className="group border border-cyan-300/20 bg-black/30 p-8 transition hover:border-cyan-300"><span className="text-[10px] tracking-[.3em] text-cyan-300">GITHUB / OPEN RESOURCE</span><h3 className="mt-8 text-2xl font-black">{l.name} <span aria-hidden="true" className="text-cyan-300">↗</span></h3><p className="mt-3 text-slate-400">{l.note}</p></a>)}</div></div></section>
    <section id="roadmap" className="mx-auto max-w-7xl px-6 py-24"><p className="text-xs font-bold tracking-[.4em] text-cyan-300">BUILD STATUS / NEXT MILESTONES</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">FROM CONCEPT TO PLAYABLE.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{[{t:'FOUNDATION',d:'Choose target hardware, verify engine installations and preserve the existing Gaming Hub branch.'},{t:'FIRST PLAYABLE',d:'Ship an original Godot prototype with controls, scoring, collisions and restart.'},{t:'CINEMATIC LAYER',d:'Add licensed/original 3D art, character AI, visual QA and a tested deployment.'}].map((x,i)=><article key={x.t} className="border-t border-cyan-300/40 py-7"><p className="text-xs tracking-[.3em] text-cyan-300">STAGE 0{i+1} / PLANNED</p><h3 className="mt-5 text-2xl font-black">{x.t}</h3><p className="mt-4 leading-relaxed text-slate-400">{x.d}</p></article>)}</div><p className="mt-12 text-sm text-slate-500">Retro game ROMs are not distributed in this repository. Use only authorized local game files. Production deployment and gameplay require independent verification.</p></section>
    <footer className="border-t border-white/10 px-6 py-10 text-center text-xs tracking-[.2em] text-slate-500">© WISE² GAME STUDIO · BUILD BEYOND REALITY</footer>
  </main>;
}