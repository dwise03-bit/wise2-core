import Link from 'next/link';
import { TEAM_APPS, teamAppDownloadPath } from '@/lib/team-apps';

const statusStyles = {
  live: 'border-[#55E6A5]/40 bg-[#55E6A5]/10 text-[#72F0B7]',
  beta: 'border-[#8EDBFF]/40 bg-[#8EDBFF]/10 text-[#8EDBFF]',
  dev: 'border-[#D8A84E]/40 bg-[#D8A84E]/10 text-[#EBC56F]',
};

export default function AppsPage() {
  return (
    <main className="min-h-screen bg-[#050607] pb-24 pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden border border-[#1b4b70] bg-[#07111b] px-6 py-12 sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(70,180,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(70,180,255,.25)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-[#8EDBFF]/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-[#8EDBFF]">WISE² App Store · Command Launcher</p>
              <h1 className="text-4xl font-black leading-[0.94] tracking-[-0.05em] sm:text-7xl">Every WISE² surface. One launch point.</h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-[#B7C0CB] sm:text-lg">Launch web workspaces and install current team builds without leaving the WISE² operating layer.</p>
            </div>
            <div className="border border-[#55E6A5]/25 bg-black/40 p-6">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em]"><span className="text-[#8FA0AE]">Catalog</span><span className="text-[#72F0B7]">Published</span></div>
              <div className="mt-5 text-6xl font-black tracking-[-0.06em]">{String(TEAM_APPS.length).padStart(2, '0')}</div>
              <p className="mt-2 text-sm text-[#8FA0AE]">Connected systems across web, iPhone, Android, and Quest.</p>
            </div>
          </div>
        </section>
        <section className="mt-10" aria-labelledby="apps-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8FA0AE]">Connected surfaces</p><h2 id="apps-heading" className="mt-2 text-2xl font-black">Choose where the work happens</h2></div>
            <div className="flex gap-2 text-[10px] font-black uppercase tracking-[0.16em]"><span className="border border-[#55E6A5]/30 px-2 py-1 text-[#72F0B7]">Live</span><span className="border border-[#8EDBFF]/30 px-2 py-1 text-[#8EDBFF]">Beta</span><span className="border border-[#D8A84E]/30 px-2 py-1 text-[#EBC56F]">Dev</span></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TEAM_APPS.map((app, index) => (
              <article key={app.id} className="group relative flex min-h-[340px] flex-col overflow-hidden border border-white/10 bg-[#0A0E12] p-6 transition hover:-translate-y-1 hover:border-[#8EDBFF]/55 hover:shadow-[0_20px_60px_rgba(0,0,0,.45)]">
                <div className="absolute right-4 top-2 text-7xl font-black tracking-[-0.08em] text-white/[0.035]">{String(index + 1).padStart(2, '0')}</div>
                <div className="relative flex items-center justify-between gap-3"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8FA0AE]">{app.category}</span><span className={`border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusStyles[app.status]}`}>{app.status}</span></div>
                <div className="relative mt-8"><h3 className="text-2xl font-black tracking-tight">{app.name}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#8FA0AE]">{app.tagline}</p><p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[#D8A84E]">Version {app.version}</p></div>
                <div className="relative mt-auto space-y-2 pt-7">
                  {app.builds.map((build) => (
                    <a key={build.filename} href={teamAppDownloadPath(build.filename)} className="flex min-h-11 items-center justify-between border border-white/15 bg-black/20 px-4 text-sm font-bold text-[#DCE7EF] transition hover:border-[#8EDBFF] hover:bg-[#8EDBFF]/10 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"><span>{build.label}</span><span className="ml-3 text-[10px] font-normal text-[#8FA0AE]">{build.minOs}</span></a>
                  ))}                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {app.webUrl && <Link href={app.webUrl} className="inline-flex min-h-10 items-center justify-center border border-[#8EDBFF]/35 px-3 text-xs font-bold text-[#8EDBFF] transition hover:bg-[#8EDBFF]/10 hover:text-white">Open workspace ↗</Link>}
                    {app.commandUrl && <Link href={app.commandUrl} className="inline-flex min-h-10 items-center justify-center border border-[#55E6A5]/35 px-3 text-xs font-bold text-[#72F0B7] transition hover:bg-[#55E6A5]/10 hover:text-white">Launch Command →</Link>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 border border-white/10 bg-[#080B0E] p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#D8A84E]">Direct install layer</p><h2 className="mt-2 text-xl font-black">Existing download routes stay locked.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#8FA0AE]">Published builds continue to use the canonical <code className="text-[#8EDBFF]">/downloads/apps/&lt;filename&gt;</code> path so current links and field installs do not break.</p></div>
          <Link href="/platform" className="inline-flex min-h-11 items-center justify-center border border-[#8EDBFF]/40 px-5 text-sm font-black text-[#8EDBFF] transition hover:bg-[#8EDBFF]/10 hover:text-white">WISE² Platform →</Link>
        </section>

        <p className="mt-10 text-sm text-[#8FA0AE]">Need a build enabled for your team? Contact <a className="text-[#8EDBFF]" href="mailto:hello@wise2.net">hello@wise2.net</a>.</p>
      </div>
    </main>
  );
}
