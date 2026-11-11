import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WISE² Game Studio | Build Beyond Reality',
  description: 'WISE² Game Studio — game development, AI simulation, cinematic worlds, and the open-source gaming arsenal.',
};

const divisions = [
  { number: '01', title: 'GAME DEVELOPMENT', description: 'Prototype, build, and ship immersive interactive experiences.', tags: ['GAMEPLAY', 'ENGINEERING', 'TOOLS'] },
  { number: '02', title: 'AI & SIMULATION', description: 'Explore intelligent characters, adaptive systems, and simulation workflows.', tags: ['AGENTS', 'NPC SYSTEMS', 'SIMULATION'] },
  { number: '03', title: '3D CINEMATICS', description: 'Create atmospheric worlds, visual storytelling, and real-time scenes.', tags: ['3D', 'MOTION', 'REAL TIME'] },
];
const arsenal = [
  { name: 'GAME ARSENAL', href: 'https://github.com/dwise03-bit/wise2-core/tree/main/WISE2-GAME-ARSENAL', desc: 'Gaming tools and experiments' },
  { name: 'DEV ARSENAL', href: 'https://github.com/dwise03-bit/wise2-core/tree/main/WISE2-DEV-ARSENAL', desc: 'Developer tools and resources' },
  { name: 'AI ARSENAL', href: 'https://github.com/dwise03-bit/wise2-core/tree/main/WISE2-AI-ARSENAL', desc: 'AI tooling and integrations' },
];
export default function GameStudioPage() {
 return <main className="min-h-screen bg-[#030712] text-white" style={{fontFamily:'Arial, sans-serif'}}>
  <style>{`@keyframes pulseGlow{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.65;transform:scale(1.1)}}.game-glow{animation:pulseGlow 9s ease-in-out infinite}.game-grid{background-image:linear-gradient(rgba(59,130,246,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.08) 1px,transparent 1px);background-size:56px 56px}.game-card{transition:transform .25s,border-color .25s}.game-card:hover{transform:translateY(-5px);border-color:#38bdf8}`}</style>
  <div className="relative isolate overflow-hidden">
   <div aria-hidden="true" className="game-grid absolute inset-0 opacity-50"/>
   <div aria-hidden="true" className="game-glow pointer-events-none absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-blue-600/25 blur-[110px]"/>
   <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
    <Link href="/" className="text-2xl font-black tracking-tight text-white">WISE<span className="text-cyan-400">²</span><span className="ml-3 text-xs font-medium tracking-[.25em] text-slate-400">GAME STUDIO</span></Link>
    <nav className="flex items-center gap-5 text-xs font-bold tracking-widest text-slate-300"><a href="#divisions" className="hover:text-cyan-300">DIVISIONS</a><a href="#arsenal" className="hover:text-cyan-300">ARSENAL</a><a href="#projects" className="hidden hover:text-cyan-300 sm:inline">PROJECTS</a></nav>
   </header>
   <section className="relative z-10 mx-auto flex min-h-[650px] max-w-7xl flex-col justify-center px-6 pb-24 pt-20">
    <p className="mb-7 text-xs font-bold tracking-[.45em] text-cyan-400">WISE² INTERACTIVE ENTERTAINMENT DIVISION</p>
    <h1 className="max-w-5xl text-6xl font-black leading-[.95] tracking-tight sm:text-8xl">BUILD<br/><span className="bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-500 bg-clip-text text-transparent">BEYOND</span><br/>REALITY.</h1>
    <p className="mt-9 max-w-xl text-lg leading-relaxed text-slate-300">A creative command center for game development, AI-powered experiences, simulation, and cinematic worlds.</p>
    <div className="mt-10 flex flex-wrap gap-4"><a href="#divisions" className="rounded-sm bg-cyan-400 px-7 py-4 text-xs font-black tracking-widest text-slate-950 hover:bg-white">EXPLORE THE STUDIO</a><a href="#arsenal" className="rounded-sm border border-cyan-400/40 px-7 py-4 text-xs font-black tracking-widest text-cyan-200 hover:border-cyan-200">OPEN ARSENAL</a></div>
    <p className="mt-16 text-xs tracking-[.3em] text-slate-500">DESIGN / DEVELOP / SIMULATE / DEPLOY</p>
   </section>
  </div>
  <section id="divisions" className="mx-auto max-w-7xl px-6 py-24"><p className="text-xs font-bold tracking-[.4em] text-cyan-400">OUR CAPABILITIES</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">THE STUDIO DIVISIONS</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{divisions.map(d=><article key={d.number} className="game-card rounded-lg border border-blue-400/20 bg-slate-900/70 p-8"><span className="text-5xl font-black text-blue-500/50">{d.number}</span><h3 className="mt-12 text-2xl font-black">{d.title}</h3><p className="mt-4 min-h-24 leading-relaxed text-slate-400">{d.description}</p><div className="flex flex-wrap gap-2">{d.tags.map(t=><span key={t} className="border border-cyan-500/30 px-2 py-1 text-[10px] tracking-widest text-cyan-300">{t}</span>)}</div></article>)}</div></section>
  <section id="arsenal" className="border-y border-blue-400/20 bg-[#071227]"><div className="mx-auto max-w-7xl px-6 py-24"><p className="text-xs font-bold tracking-[.4em] text-cyan-400">SOURCE CONTROL / OPEN TOOLING</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">THE ARSENAL</h2><p className="mt-5 max-w-2xl text-slate-400">Explore the WISE² GitHub project resources. Directory availability and tool readiness require independent verification.</p><div className="mt-12 grid gap-4 md:grid-cols-3">{arsenal.map(a=><a key={a.name} href={a.href} target="_blank" rel="noopener noreferrer" className="game-card group rounded-lg border border-cyan-400/20 bg-black/30 p-7"><span className="text-xs tracking-[.3em] text-cyan-400">GITHUB / REPOSITORY</span><h3 className="mt-8 text-2xl font-black">{a.name} <span aria-hidden="true" className="text-cyan-400">↗</span></h3><p className="mt-3 text-slate-400">{a.desc}</p></a>)}</div></div></section>
  <section id="projects" className="mx-auto max-w-7xl px-6 py-24"><p className="text-xs font-bold tracking-[.4em] text-cyan-400">EXPERIMENTAL CONCEPTS</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">PROJECT LAB</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{['OPEN WORLD SYSTEMS','AI CHARACTER LAB','ARCADE EXPERIENCE'].map((p,i)=><article key={p} className="game-card relative flex min-h-72 flex-col justify-end overflow-hidden rounded-lg border border-blue-400/20 bg-gradient-to-br from-slate-900 via-blue-950 to-black p-7"><div className="absolute right-5 top-5 text-xs tracking-widest text-cyan-400">CONCEPT 0{i+1}</div><h3 className="text-2xl font-black">{p}</h3><p className="mt-3 text-sm text-slate-400">Exploration stage — not a released game.</p></article>)}</div></section>
  <footer className="border-t border-blue-400/20 px-6 py-10 text-center text-xs tracking-widest text-slate-500">© WISE² GAME STUDIO · <a href="https://github.com/dwise03-bit/wise2-core" className="text-cyan-400">GITHUB</a></footer>
 </main>;
}
