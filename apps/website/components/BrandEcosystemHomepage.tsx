export function BrandEcosystemHomepage() {
  return (
    <main className="relative isolate min-h-screen bg-[var(--wise2-surface-0)] text-[var(--wise2-text)] font-sans">
      {/* Continuous background after the cinematic entrance, never a foreground player. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07120f]">
        <video autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-cover motion-reduce:hidden">
          <source src="/media/wise2-tunnel-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#020908]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020908]/25 via-[#020908]/60 to-[#020908]/90" />
      </div>
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-36">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8AE6AD]">WISE² Business Operating Systems</p>
        <h1 className="mt-5 text-5xl font-black leading-tight sm:text-7xl text-white">
          Intelligent tools for<br />
          <span className="text-[#8AE6AD]">real-world businesses.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#D1D5DB]">
          ONE SYSTEM. INFINITE POSSIBILITIES.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#B8C5BE]">
          Find the systems, workflows, and AI opportunities that give your business room to grow. Built for founders, operators, and builders who demand results.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a href="/ai-audit" className="inline-block bg-[#8AE6AD] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:-translate-y-0.5 hover:bg-[#B6FFD1]">
            Get a free business snapshot
          </a>
          <a href="/consulting" className="inline-block border-2 border-[#8AE6AD] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#8AE6AD] transition hover:bg-[#8AE6AD] hover:text-[#050607]">
            Explore services
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <h2 className="text-center text-4xl font-black uppercase tracking-[0.02em] text-white mb-16">
          THE WISE² ECOSYSTEM
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'AI AUTOMATION',
              desc: 'Context engines, local inference, agent routing',
              color: '#8AE6AD',
            },
            {
              title: 'CLOUD INFRASTRUCTURE',
              desc: 'Hosting, VPS, domains, backups. All connected.',
              color: '#8AE6AD',
            },
            {
              title: 'BUSINESS OPERATIONS',
              desc: 'CRM, revenue tracking, compliance, automation',
              color: '#A8B7AF',
            },
            {
              title: 'COMMUNICATIONS',
              desc: 'Discord integration, SMS, voice agents, alerts',
              color: '#8AE6AD',
            },
            {
              title: 'HARDWARE LAB',
              desc: 'K10 devices, wearables, field tech, VR',
              color: '#8AE6AD',
            },
            {
              title: 'KNOWLEDGE BASE',
              desc: 'Second brain, RAG systems, document search',
              color: '#A8B7AF',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="border border-[#8AE6AD]/30 bg-[#0B1211]/50 p-6 hover:border-[#8AE6AD] hover:bg-[#0B1211]/80 transition"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: feature.color,
              }}
            >
              <p className="text-sm font-black uppercase tracking-[0.1em]" style={{ color: feature.color }}>
                {feature.title}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#B8C5BE]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics Section */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { label: 'LIVE PROJECTS', value: '120' },
            { label: 'ACTIVE BUILDERS', value: '34' },
            { label: 'REVENUE TRACKED', value: '$2.4M+' },
            { label: 'UPTIME', value: '99.9%' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl sm:text-5xl font-black" style={{ color: i % 2 === 0 ? '#8AE6AD' : '#8AE6AD' }}>
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[#B8C5BE]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.02em] text-white mb-6">
              Built Different.
            </h3>
            <div className="space-y-4 text-base leading-7 text-[#D1D5DB]">
              <p>
                ✓ <span className="text-[#8AE6AD] font-bold">No vendor lock-in.</span> Your data, your infrastructure.
              </p>
              <p>
                ✓ <span className="text-[#8AE6AD] font-bold">One system.</span> All your business OS needs, connected.
              </p>
              <p>
                ✓ <span className="text-[#A8B7AF] font-bold">Real results.</span> Powered by 120+ live projects.
              </p>
              <p>
                ✓ <span className="text-[#8AE6AD] font-bold">AI-native.</span> Local inference, zero API costs, your models.
              </p>
            </div>
          </div>
          <div className="bg-[#0B1211] border border-[#8AE6AD]/30 p-8">
            <p className="text-sm font-black uppercase tracking-[0.1em] text-[#8AE6AD] mb-4">
              Ready to build?
            </p>
            <h4 className="text-2xl font-black text-white mb-6">
              Start with a free business audit.
            </h4>
            <p className="text-sm text-[#B8C5BE] mb-6">
              We analyze your current setup and recommend the perfect WISE² system for your business.
            </p>
            <a
              href="/ai-audit"
              className="inline-block bg-[#8AE6AD] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:bg-[#B6FFD1]"
            >
              Get Your Free Audit
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8">
        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-[0.02em] text-white mb-8">
          Building Empires.<br />
          <span className="text-[#8AE6AD]">Changing Culture.</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-[#D1D5DB] mb-12">
          Join 120+ founders, operators, and builders who trust WISE² to power their business OS.
        </p>
        <a
          href="/consulting"
          className="inline-block bg-[#A8B7AF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:bg-[#D4B37A]"
        >
          Explore All Services
        </a>
      </section>
      </div>
    </main>
  );
}
