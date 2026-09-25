import Link from "next/link";

const IconBuild = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5A2.25 2.25 0 008.25 22.5h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25h-2.25m-7.5 11.25h7.5M10.5 7.5h3" />
  </svg>
);

const IconAutomate = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconScale = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h6V3H3v10zm8 0h6V5h-6v8zm8-8v8h6V5h-6z" />
  </svg>
);

const IconNetwork = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12a3 3 0 100-6 3 3 0 000 6zm0 0c4.97 0 9 2.686 9 6v1H0v-1c0-3.314 4.03-6 9-6zm9-12a3 3 0 100-6 3 3 0 000 6zm-15 0a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-[#f6f0e4] sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-center py-12 lg:py-20">
        {/* Header */}
        <div className="mb-16 flex items-center justify-between border-b border-white/8 pb-6 lg:mb-24">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#d8a43a]/30 to-[#d8a43a]/0 blur-lg" />
              <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#d8a43a]/30 bg-[#d8a43a]/8 text-lg font-bold text-[#d8a43a] backdrop-blur-sm">
                W²
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wider text-[#f6f0e4]">WISE²</p>
              <p className="text-xs tracking-widest text-[#7d7770]">Command Center</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[#7d7770] sm:flex">
            <span
              className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
              aria-label="System status indicator"
            />
            <span>Systems online</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid items-end gap-12 lg:gap-16 lg:grid-cols-[1.3fr_0.7fr] mb-20">
          <section className="space-y-8">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#d8a43a] uppercase mb-4">The operating layer for what's next</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
                Move the whole business
                <span className="block text-[#d8a43a] mt-2">as one.</span>
              </h1>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#b5aea6]">
              WISE² brings brand, CRM, automation, content, and intelligence into one calm control surface—so every action compounds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d8a43a] to-[#c89a2d] px-8 py-3 text-sm font-semibold text-[#050505] transition-all duration-300 hover:shadow-lg hover:shadow-[#d8a43a]/25 hover:scale-105"
              >
                Enter the command center
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/demo"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-8 py-3 text-sm font-semibold text-[#f6f0e4] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20"
              >
                Explore demo
                <span className="text-[#d8a43a]">→</span>
              </Link>
              <Link
                href="/demo/admin"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#1177ff]/20 bg-[#1177ff]/[0.04] px-8 py-3 text-sm font-semibold text-[#f6f0e4] backdrop-blur-sm transition-all duration-300 hover:bg-[#1177ff]/[0.08] hover:border-[#1177ff]/40"
              >
                Admin demo
                <span className="text-[#1177ff]">→</span>
              </Link>
            </div>
          </section>

          {/* Side Cards */}
          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Live Network Card */}
            <div className="group relative rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-gradient-to-br hover:from-white/[0.12] hover:to-white/[0.04]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-widest text-[#7d7770] uppercase">Live Network</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-300">ONLINE</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#f6f0e4]">One source of truth.</h3>
                  <p className="mt-3 text-sm leading-6 text-[#8b8680]">Your Mac, GPU, VPS, and AI surfaces unified and observable.</p>
                </div>
              </div>
            </div>

            {/* Start Anywhere Card */}
            <div className="group relative rounded-2xl border border-[#1177ff]/15 bg-gradient-to-br from-[#1177ff]/[0.08] to-[#1177ff]/[0.02] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#1177ff]/30 hover:bg-gradient-to-br hover:from-[#1177ff]/[0.12] hover:to-[#1177ff]/[0.04]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
              <div className="relative space-y-4">
                <p className="text-xs font-semibold tracking-widest text-[#79b3ff] uppercase">Start Anywhere</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    aria-label="Build"
                    className="group/btn relative rounded-lg border border-white/8 bg-white/[0.03] px-3 py-4 text-xs font-semibold text-[#8b8680] transition-all duration-300 hover:bg-white/[0.08] hover:border-[#d8a43a]/30 flex items-center justify-center gap-2"
                  >
                    <IconBuild />
                    Build
                  </button>
                  <button
                    type="button"
                    aria-label="Automate"
                    className="group/btn relative rounded-lg border border-white/8 bg-white/[0.03] px-3 py-4 text-xs font-semibold text-[#8b8680] transition-all duration-300 hover:bg-white/[0.08] hover:border-[#1177ff]/30 flex items-center justify-center gap-2"
                  >
                    <IconAutomate />
                    Automate
                  </button>
                  <button
                    type="button"
                    aria-label="Scale"
                    className="group/btn relative rounded-lg border border-white/8 bg-white/[0.03] px-3 py-4 text-xs font-semibold text-[#8b8680] transition-all duration-300 hover:bg-white/[0.08] hover:border-emerald-400/30 flex items-center justify-center gap-2"
                  >
                    <IconScale />
                    Scale
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Capabilities */}
        <div className="space-y-4 border-t border-white/8 pt-12 lg:pt-16">
          <p className="text-xs font-semibold tracking-widest text-[#7d7770] uppercase">Integrated Capabilities</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: IconNetwork, label: "Brand systems" },
              { icon: IconAutomate, label: "Customer intelligence" },
              { icon: IconBuild, label: "Agent workflows" },
              { icon: IconScale, label: "GPU infrastructure" }
            ].map((item, idx) => (
              <div key={idx} className="group relative rounded-lg border border-white/8 bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-[#d8a43a]">
                    <item.icon />
                  </div>
                  <span className="text-sm font-medium text-[#8b8680] group-hover:text-[#f6f0e4] transition-colors">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
