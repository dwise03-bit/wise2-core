import { Navigation, Footer } from '@/components/wise';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              About <span className="text-wise-accent-green">WISE²</span>
            </h1>
            <p className="text-xl text-wise-text-secondary">
              Organized Chaos Command Center for creative entrepreneurs.
            </p>
          </div>

          <div className="space-y-16">
            <section className="bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-wise-text-secondary leading-relaxed">
                WISE² is built for creators, builders, and entrepreneurs who want to turn their ideas into reality. We provide the tools, guidance, and support needed to navigate the journey from concept to successful launch and beyond.
              </p>
            </section>

            <section className="bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">What We Do</h2>
              <p className="text-wise-text-secondary leading-relaxed mb-6">
                We combine technology, design, and strategy to help you build, launch, and scale. Whether you need a complete branding package, a custom web platform, or expert guidance on growth—we've got you covered.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Design', 'Development', 'Strategy'].map((item) => (
                  <div
                    key={item}
                    className="p-4 bg-wise-accent-green/10 border border-wise-accent-green/30 rounded-xl text-center"
                  >
                    <p className="text-white font-bold">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-6">Our Process</h2>
              <div className="space-y-4">
                {[
                  { phase: 'Idea', desc: 'Define your vision and goals.' },
                  { phase: 'Strategy', desc: 'Build a comprehensive roadmap.' },
                  { phase: 'Build', desc: 'Execute with excellence.' },
                  { phase: 'Launch', desc: 'Go public and gain traction.' },
                  { phase: 'Multiply', desc: 'Scale and optimize for growth.' },
                ].map((item) => (
                  <div key={item.phase} className="flex gap-4">
                    <div className="text-wise-accent-green font-bold min-w-24">{item.phase}</div>
                    <div className="text-wise-text-secondary">{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="text-center">
              <p className="text-wise-text-secondary mb-8">Ready to start your journey?</p>
              <a
                href="/start-your-build"
                className="inline-block px-12 py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold hover:brightness-110 transition-all"
              >
                ✦ Start Your Build
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
