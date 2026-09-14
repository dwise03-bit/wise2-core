import Link from 'next/link';
import { impCourses, impEvents, impTracks } from '../../data/imp-lab';

const nav = ['Classroom', 'Community', 'Calendar', 'Challenges', 'Leaderboards', 'Resources'];

export default function ImpLabPage() {
  return (
    <main className="min-h-screen bg-[#03070c] text-white">
      <header className="sticky top-0 z-20 border-b border-cyan-400/20 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
          <Link href="/" className="text-xl font-black tracking-widest">WISE² IMP LAB <span className="text-cyan-400">· COMMUNITY</span></Link>
          <nav className="hidden gap-5 text-xs font-bold uppercase tracking-wider lg:flex">
            {nav.map((item) => <a key={item} href={`#${item.toLowerCase()}`} className="text-slate-300 hover:text-cyan-300">{item}</a>)}
          </nav>
          <Link href="/contact" className="rounded-lg border border-cyan-300 px-4 py-2 text-xs font-black text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,.2)]">BOOK A SCHOOL DEMO →</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-cyan-400/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,168,255,.2),transparent_45%),radial-gradient(circle_at_80%_40%,rgba(226,60,255,.12),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <p className="mb-4 text-xs font-black tracking-[.32em] text-cyan-300">PEOPLE × EDUCATION × OPPORTUNITY</p>
            <h1 className="text-5xl font-black leading-[.9] sm:text-7xl">WISE² <span className="block text-cyan-400">IMP LAB</span></h1>
            <p className="mt-6 max-w-2xl text-xl text-slate-300">Learn. Create. Guide. Stay safe. Build as a team. One connected community for physical IMPs, AI skills and Quest XR.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="#classroom" className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-black text-black">ENTER CLASSROOM →</Link><a href="https://discord.gg/wise2" className="rounded-lg border border-cyan-400/40 px-5 py-3 text-sm font-black">Join Discord</a></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {impTracks.map((track) => <div key={track.name} className="rounded-2xl border bg-black/50 p-4" style={{ borderColor: `${track.color}88`, boxShadow: `0 0 28px ${track.color}22` }}><div className="mb-8 h-2 w-2 rounded-full" style={{ backgroundColor: track.color, boxShadow: `0 0 16px ${track.color}` }} /><h2 className="font-black" style={{ color: track.color }}>{track.name}</h2><p className="mt-2 text-xs text-slate-400">{track.role}</p></div>)}
          </div>
        </div>
      </section>

      <section id="classroom" className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-black tracking-[.25em] text-cyan-400">CLASSROOM</p><h2 className="mt-2 text-3xl font-black">Continue your IMP journey.</h2></div><span className="text-sm text-slate-400">Level 3 · 1,240 XP</span></div>
        <div className="grid gap-4 lg:grid-cols-5">{impCourses.map((course) => <article key={course.title} className="rounded-xl border border-white/10 bg-white/[.035] p-5"><span className="text-xs font-bold text-cyan-300">{course.track}</span><h3 className="mt-3 min-h-12 font-bold">{course.title}</h3><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400" style={{ width: `${course.progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{course.progress}% complete</p></article>)}</div>
      </section>

      <section id="community" className="border-y border-white/10 bg-white/[.02]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-2"><div><p className="text-xs font-black tracking-[.25em] text-fuchsia-400">COMMUNITY</p><h2 className="mt-2 text-3xl font-black">Build together. Ship real things.</h2><p className="mt-4 text-slate-400">Challenges, member projects, educator support and live IMP builds connect the Skool community to the wider WISE² ecosystem.</p><div className="mt-6 flex gap-3"><a href="https://discord.gg/wise2" className="rounded-lg border border-fuchsia-400/40 px-4 py-2 text-sm font-bold">Join Discord</a><Link href="/quest" className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-bold text-cyan-300">Quest XR →</Link></div></div>
          <div id="calendar" className="rounded-2xl border border-cyan-400/20 bg-black/40 p-5"><h3 className="font-black text-cyan-300">UPCOMING LABS</h3><div className="mt-4 space-y-3">{impEvents.map((event) => <div key={event.title} className="flex items-center gap-4 rounded-lg bg-white/[.04] p-3"><div className="w-12 text-center text-xs font-black text-cyan-400">{event.day}</div><div className="flex-1"><p className="font-bold">{event.title}</p><p className="text-xs text-slate-500">{event.time}</p></div></div>)}</div></div></div></section>

      <section id="challenges" className="mx-auto max-w-7xl px-5 py-14"><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-lime-400/30 p-6"><p className="text-xs font-black text-lime-400">WEEKLY CHALLENGE</p><h3 className="mt-2 text-xl font-black">Build an IMP skill</h3><p className="mt-2 text-sm text-slate-400">Create one useful AI workflow and share the result.</p></div><div id="leaderboards" className="rounded-xl border border-yellow-400/30 p-6"><p className="text-xs font-black text-yellow-300">LEADERBOARD</p><h3 className="mt-2 text-xl font-black">Earn XP. Unlock badges.</h3><p className="mt-2 text-sm text-slate-400">Progress through Learner, Creator, Guide, Safe and Team achievements.</p></div><div id="resources" className="rounded-xl border border-cyan-400/30 p-6"><p className="text-xs font-black text-cyan-300">RESOURCES</p><h3 className="mt-2 text-xl font-black">Physical + XR</h3><p className="mt-2 text-sm text-slate-400">IMP files, lesson plans, educator guides and Quest XR labs.</p></div></div></section>

      <footer className="border-t border-cyan-400/20 px-5 py-10 text-center"><p className="text-2xl font-black">REAL SCHOOLS. BRIGHTER FUTURES. <span className="text-lime-400">TOGETHER.</span></p><p className="mt-3 text-xs tracking-[.25em] text-slate-500">BUILT FOR REAL CLASSROOMS. REAL IMPACT.</p><a href="https://wise2.net" className="mt-5 inline-block text-sm font-bold text-cyan-300">wise2.net →</a></footer>
    </main>
  );
}
