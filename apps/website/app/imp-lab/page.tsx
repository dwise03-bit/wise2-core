import Link from 'next/link';
import { impCourses, impEvents, impTracks } from '../../data/imp-lab';

const nav = ['IMPs', 'Schools', 'IMP Lab', 'Quest XR', 'Safety', 'Resources'];
const modules = [
  ['MIXED REALITY', 'Place your IMPs in the real world. Classrooms, labs, homes — anywhere.', 'cyan'],
  ['EDUCATOR DASHBOARD', 'Manage classroom activity, IMP status and learning progress.', 'blue'],
  ['STEM + CREATIVE LAB', 'Design, build and create real-world projects with AI.', 'lime'],
  ['SOCIAL + WELLNESS', 'A supportive space to connect and find approved resources.', 'fuchsia'],
  ['TEAM + LEADERSHIP', 'Build leadership, collaboration and stronger school culture.', 'yellow'],
] as const;

export default function ImpLabPage() {
  return <main className="min-h-screen bg-[#02060b] text-white selection:bg-cyan-400 selection:text-black">
    <header className="sticky top-0 z-40 border-b border-cyan-400/20 bg-[#02060b]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="text-xl font-black tracking-widest">WISE² <span className="text-cyan-400">IMP LAB</span></Link>
        <nav className="hidden gap-5 text-[11px] font-black uppercase tracking-wider xl:flex">{nav.map(x => <a key={x} href={`#${x.toLowerCase().replaceAll(' ','-')}`} className="text-slate-400 transition hover:text-cyan-300">{x}</a>)}</nav>
        <Link href="/contact" className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-black shadow-[0_0_30px_rgba(34,211,238,.3)]">BOOK A SCHOOL DEMO →</Link>
      </div>
    </header>

    <section id="imp-lab" className="relative overflow-hidden border-b border-cyan-400/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(0,168,255,.22),transparent_34%),radial-gradient(circle_at_20%_65%,rgba(140,255,0,.08),transparent_28%),radial-gradient(circle_at_80%_65%,rgba(226,60,255,.1),transparent_28%)]" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-14 lg:py-20">
        <div className="mx-auto max-w-4xl text-center"><p className="text-xs font-black tracking-[.34em] text-cyan-300">PEOPLE × EDUCATION × OPPORTUNITY</p><h1 className="mt-4 text-5xl font-black leading-[.88] sm:text-7xl lg:text-8xl">WISE² <span className="block text-cyan-400">IMP LAB</span></h1><p className="mt-5 text-lg font-bold text-slate-300">AI COMPANIONS FOR SCHOOLS</p><p className="mt-2 text-sm font-black tracking-[.22em]"><span className="text-blue-400">LEARN</span> · <span className="text-lime-400">CREATE</span> · <span className="text-red-400">GUIDE</span> · <span className="text-fuchsia-400">SAFE</span> · <span className="text-yellow-300">TEAM</span></p></div>
        <div id="imps" className="mt-12 grid gap-3 md:grid-cols-5">{impTracks.map((track, i) => <a key={track.name} href={track.href} className="group relative overflow-hidden rounded-2xl border bg-black/60 p-5 text-center transition hover:-translate-y-2" style={{borderColor:`${track.color}66`,boxShadow:`0 0 35px ${track.color}16`}}><div className="mx-auto mb-5 flex h-28 w-24 items-center justify-center rounded-[28px] border-2 bg-black text-4xl font-black transition group-hover:scale-105" style={{borderColor:track.color,color:track.color,boxShadow:`0 0 28px ${track.color}44`}}>W²</div><p className="text-xs font-black" style={{color:track.color}}>{track.name.toUpperCase()}</p><p className="mt-2 text-xs leading-5 text-slate-400">{track.role}</p><span className="mt-4 inline-block text-[10px] font-black tracking-widest text-slate-500">IMP 0{i+1}</span></a>)}</div>
        <div className="mt-10 flex flex-wrap justify-center gap-3"><a href="#schools" className="rounded-lg bg-cyan-400 px-6 py-3 text-sm font-black text-black">STEP INTO THE FUTURE →</a><Link href="/quest" className="rounded-lg border border-cyan-400/40 px-6 py-3 text-sm font-black text-cyan-200">ENTER QUEST XR</Link></div>
      </div>
    </section>

    <section id="quest-xr" className="border-b border-white/10 bg-[#050b12]"><div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-10 lg:grid-cols-[1fr_320px]"><div className="rounded-3xl border border-cyan-400/20 bg-[radial-gradient(circle_at_50%_0%,rgba(0,168,255,.16),transparent_60%)] p-7"><p className="text-xs font-black tracking-[.25em] text-cyan-300">META QUEST 3S · PHYSICAL + VIRTUAL</p><h2 className="mt-3 text-3xl font-black">One world. Five IMPs. Infinite possibilities.</h2><p className="mt-3 max-w-3xl text-slate-400">Step inside IMP Lab, bring digital twins into your real classroom with Mixed Reality, and connect physical IMPs to the same WISE² learning ecosystem.</p></div><div className="grid gap-2">{['School Mode','IMP Lab','Command Center','Mixed Reality','Device Fleet','Analytics'].map((x,i)=><div key={x} className="rounded-xl border border-cyan-400/20 bg-black/50 px-4 py-3"><span className="mr-3 text-cyan-400">0{i+1}</span><b>{x}</b></div>)}</div></div></section>

    <section id="schools" className="mx-auto max-w-[1500px] px-5 py-14"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{modules.map(([title,copy,tone])=><article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className={`mb-8 h-1 w-12 rounded-full bg-${tone}-400`} /><h3 className="font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p></article>)}</div></section>

    <section id="classroom" className="border-y border-white/10 bg-white/[.02]"><div className="mx-auto max-w-[1500px] px-5 py-14"><div className="mb-7"><p className="text-xs font-black tracking-[.25em] text-cyan-400">CLASSROOM</p><h2 className="mt-2 text-3xl font-black">Continue your IMP journey.</h2></div><div className="grid gap-4 lg:grid-cols-5">{impCourses.map(course=><article key={course.title} className="rounded-xl border border-white/10 bg-black/40 p-5"><span className="text-xs font-bold text-cyan-300">{course.track}</span><h3 className="mt-3 min-h-12 font-bold">{course.title}</h3><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400" style={{width:`${course.progress}%`}} /></div><p className="mt-2 text-xs text-slate-500">{course.progress}% complete</p></article>)}</div></div></section>

    <section id="resources" className="mx-auto grid max-w-[1500px] gap-6 px-5 py-14 lg:grid-cols-2"><div><p className="text-xs font-black tracking-[.25em] text-fuchsia-400">COMMUNITY + RESOURCES</p><h2 className="mt-2 text-3xl font-black">Real skills. Real support. Brighter futures.</h2><p className="mt-4 text-slate-400">Challenges, educator support, physical IMP builds and Quest XR labs connect the school community to the wider WISE² ecosystem.</p><div className="mt-6 flex gap-3"><a href="https://discord.gg/wise2" className="rounded-lg border border-fuchsia-400/40 px-4 py-2 text-sm font-bold">Join Discord</a><Link href="/quest" className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-bold text-cyan-300">Quest XR →</Link></div></div><div className="rounded-2xl border border-cyan-400/20 bg-black/40 p-5"><h3 className="font-black text-cyan-300">UPCOMING LABS</h3><div className="mt-4 space-y-3">{impEvents.map(event=><div key={event.title} className="flex items-center gap-4 rounded-lg bg-white/[.04] p-3"><div className="w-12 text-center text-xs font-black text-cyan-400">{event.day}</div><div><p className="font-bold">{event.title}</p><p className="text-xs text-slate-500">{event.time}</p></div></div>)}</div></div></section>

    <section id="safety" className="border-t border-white/10"><div className="mx-auto grid max-w-[1500px] gap-4 px-5 py-12 md:grid-cols-4">{[['3D PRINTABLE','Build. Customize. Scale.'],['VOICE CONTROL','Talk to your IMPs.'],['REAL-TIME SYNC','Physical ↔ Virtual.'],['SCHOOL READY','Secure. Scalable. Flexible.']].map(([a,b])=><div key={a} className="rounded-xl border border-cyan-400/15 p-5"><p className="text-xs font-black text-cyan-300">{a}</p><p className="mt-2 text-sm text-slate-400">{b}</p></div>)}</div></section>

    <footer className="border-t border-cyan-400/20 px-5 py-12 text-center"><p className="text-3xl font-black">REAL SCHOOLS. <span className="text-lime-400">BRIGHTER FUTURES.</span></p><p className="mt-3 text-sm text-slate-400">Same technology. A brighter generation.</p><Link href="/contact" className="mt-6 inline-block rounded-lg bg-cyan-400 px-7 py-3 text-sm font-black text-black shadow-[0_0_28px_rgba(34,211,238,.25)]">BOOK A SCHOOL DEMO →</Link></footer>
  </main>;
}
