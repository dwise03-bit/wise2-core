export function BrandEcosystemHomepage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white font-sans">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-36">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">WISE² Business Operating Systems</p>
        <h1 className="mt-5 text-5xl font-black leading-tight sm:text-7xl text-white">
          Intelligent tools for<br />
          <span className="text-[#00FF7F]">real-world businesses.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#D1D5DB]">
          ONE SYSTEM. INFINITE POSSIBILITIES.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#B7C0CB]">
          Find the systems, workflows, and AI opportunities that give your business room to grow. Built for founders, operators, and builders who demand results.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a href="/ai-audit" className="inline-block bg-[#00D9FF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:-translate-y-0.5 hover:bg-[#39FF14]">
            Get a free business snapshot
          </a>
          <a href="/consulting" className="inline-block border-2 border-[#00D9FF] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#00D9FF] transition hover:bg-[#00D9FF] hover:text-[#050607]">
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
              color: '#00D9FF',
            },
            {
              title: 'CLOUD INFRASTRUCTURE',
              desc: 'Hosting, VPS, domains, backups. All connected.',
              color: '#00FF7F',
            },
            {
              title: 'BUSINESS OPERATIONS',
              desc: 'CRM, revenue tracking, compliance, automation',
              color: '#C4A369',
            },
            {
              title: 'COMMUNICATIONS',
              desc: 'Discord integration, SMS, voice agents, alerts',
              color: '#00D9FF',
            },
            {
              title: 'HARDWARE LAB',
              desc: 'K10 devices, wearables, field tech, VR',
              color: '#00FF7F',
            },
            {
              title: 'KNOWLEDGE BASE',
              desc: 'Second brain, RAG systems, document search',
              color: '#C4A369',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="border border-[#00D9FF]/30 bg-[#0a0f1a]/50 p-6 hover:border-[#00D9FF] hover:bg-[#0a0f1a]/80 transition"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: feature.color,
              }}
            >
              <p className="text-sm font-black uppercase tracking-[0.1em]" style={{ color: feature.color }}>
                {feature.title}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#B7C0CB]">{feature.desc}</p>
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
              <p className="text-4xl sm:text-5xl font-black" style={{ color: i % 2 === 0 ? '#00D9FF' : '#00FF7F' }}>
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[#B7C0CB]">
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
                ✓ <span className="text-[#00D9FF] font-bold">No vendor lock-in.</span> Your data, your infrastructure.
              </p>
              <p>
                ✓ <span className="text-[#00FF7F] font-bold">One system.</span> All your business OS needs, connected.
              </p>
              <p>
                ✓ <span className="text-[#C4A369] font-bold">Real results.</span> Powered by 120+ live projects.
              </p>
              <p>
                ✓ <span className="text-[#00D9FF] font-bold">AI-native.</span> Local inference, zero API costs, your models.
              </p>
            </div>
          </div>
          <div className="bg-[#0a0f1a] border border-[#00D9FF]/30 p-8">
            <p className="text-sm font-black uppercase tracking-[0.1em] text-[#00FF7F] mb-4">
              Ready to build?
            </p>
            <h4 className="text-2xl font-black text-white mb-6">
              Start with a free business audit.
            </h4>
            <p className="text-sm text-[#B7C0CB] mb-6">
              We analyze your current setup and recommend the perfect WISE² system for your business.
            </p>
            <a
              href="/ai-audit"
              className="inline-block bg-[#00D9FF] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:bg-[#39FF14]"
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
          <span className="text-[#00FF7F]">Changing Culture.</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-[#D1D5DB] mb-12">
          Join 120+ founders, operators, and builders who trust WISE² to power their business OS.
        </p>
        <a
          href="/consulting"
          className="inline-block bg-[#C4A369] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#050607] transition hover:bg-[#D4B37A]"
        >
          Explore All Services
        </a>
      </section>
    </main>
  );
}
