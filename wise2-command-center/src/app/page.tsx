import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-[#f6f0e4] sm:px-6 lg:px-10">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(17,119,255,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(216,164,58,0.18),transparent_22%),linear-gradient(180deg,rgba(10,10,12,0.98),rgba(5,5,5,1))]"
        aria-hidden="true"
      />
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col justify-center py-8 lg:py-12">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#d8a43a]/40 bg-[#d8a43a]/10 text-lg font-semibold text-[#d8a43a]">W²</span>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#f6f0e4]">WISE²</p>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#a9a39a]">Command Center</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[#a9a39a] sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Systems operational</div>
        </div>
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#d8a43a]">The operating layer for what&apos;s next</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] md:text-7xl lg:text-[6.6rem]">
              Move the whole business <span className="text-[#d8a43a]">as one.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#b5aea6] md:text-lg">
              WISE² brings brand, CRM, automation, content, and intelligence into one calm control surface—so every action compounds.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-[linear-gradient(135deg,#d8a43a,#a36f10)] px-6 py-3 text-sm font-semibold text-[#050505] transition hover:opacity-90"
            >
              Enter the command center <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/demo"
              className="rounded-full border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-semibold text-[#f6f0e4] transition hover:border-[rgba(216,164,58,0.3)]"
            >
              Explore the WISE² demo
            </Link>
            <Link
              href="/demo/admin"
              className="rounded-full border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-semibold text-[#f6f0e4] transition hover:border-[rgba(17,119,255,0.3)]"
            >
              Open admin demo
            </Link>
            </div>
          </section>
          <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.2em] text-[#a9a39a]">Live network</span><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[0.65rem] text-emerald-300">ONLINE</span></div>
              <p className="mt-8 text-3xl font-semibold tracking-tight">One source of truth.</p>
              <p className="mt-2 text-sm leading-6 text-[#a9a39a]">Your Mac, GPU, VPS, and AI surfaces—connected and observable.</p>
            </div>
            <div className="rounded-2xl border border-[#1177ff]/25 bg-[#1177ff]/[0.06] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#79b3ff]">Start anywhere</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-[#b5aea6]"><span className="rounded-lg border border-white/10 px-2 py-3">Build</span><span className="rounded-lg border border-white/10 px-2 py-3">Automate</span><span className="rounded-lg border border-white/10 px-2 py-3">Scale</span></div>
            </div>
          </aside>
        </div>
        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.18em] text-[#817b74]"><span>Brand systems</span><span>Customer intelligence</span><span>Agent workflows</span><span>GPU-native infrastructure</span></div>
      </div>
    </main>
  );
}
