import Link from 'next/link';
import { TEAM_APPS, teamAppDownloadPath } from '@/lib/team-apps';

export default function AppsPage() {
  return (
    <main className="min-h-screen bg-[#050607] pb-24 pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden border border-white/10 bg-[#0A0E12] px-6 py-12 sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#8EDBFF]/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#8EDBFF]">WISE² team apps</p>
              <h1 className="max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.04em] sm:text-7xl">One operating system. Every surface.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#B7C0CB] sm:text-lg">The connected tools your team uses in the field, at the desk, and inside Hermes. Download a build or open the workspace that keeps the work moving.</p>
            </div>
            <div className="relative min-h-56 overflow-hidden border border-[#8EDBFF]/25 bg-[#050607]">
              <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: "url('/brand/wise2-command-center.jpg')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050607] via-[#050607]/45 to-transparent" />
              <div className="relative flex min-h-56 flex-col justify-between p-5 text-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.22em] text-[#8EDBFF]">Live operating layer</span><span className="flex items-center gap-2 text-xs text-[#DCE7EF]"><span className="h-2 w-2 rounded-full bg-[#55E6A5] shadow-[0_0_12px_#55E6A5]" />Online</span></div><div><p className="text-2xl font-black tracking-tight text-white">Field signal strong.</p><p className="mt-1 max-w-xs text-xs leading-5 text-[#B7C0CB]">One context engine across cloud, edge, desktop, and mobile.</p></div></div>
            </div>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="apps-heading">
          <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-4"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8FA0AE]">Connected surfaces</p><h2 id="apps-heading" className="mt-2 text-2xl font-bold">Choose where the work happens</h2></div><span className="hidden text-sm text-[#8FA0AE] sm:block">{TEAM_APPS.length} published systems</span></div>
          <div className="divide-y divide-white/10 border-y border-white/10">{TEAM_APPS.map((app, index) => <article key={app.id} className="grid gap-6 py-7 lg:grid-cols-[64px_1fr_360px] lg:items-center"><div className="text-2xl font-black text-[#D8A84E]">{String(index + 1).padStart(2, '0')}</div><div><h3 className="text-xl font-bold">{app.name}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#8FA0AE]">{app.tagline}</p></div><div className="space-y-2">{app.builds.map((build) => <a key={build.filename} href={teamAppDownloadPath(build.filename)} className="flex min-h-11 items-center justify-between border border-white/15 px-4 text-sm font-bold text-[#DCE7EF] transition hover:border-[#8EDBFF] hover:bg-[#8EDBFF]/10 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"><span>{build.label}</span><span className="ml-4 text-xs font-normal text-[#8FA0AE]">{build.minOs}</span></a>)}{app.webUrl && <Link href={app.webUrl} className="inline-flex min-h-10 items-center px-1 text-sm font-semibold text-[#8EDBFF] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]">Open web workspace ↗</Link>}</div></article>)}</div>
        </section>
        <p className="mt-10 text-sm text-[#8FA0AE]">Need a build enabled for your team? Contact <a className="text-[#8EDBFF]" href="mailto:hello@wise2.net">hello@wise2.net</a>.</p>
      </div>
    </main>
  );
}
