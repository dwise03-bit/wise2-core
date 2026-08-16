import { PublicFooter } from '@/components/navigation';

export default function AboutPage() {
  return (
    <>
      <main className="bg-[#050505] min-h-screen pt-32 pb-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C7FF2E]/30 bg-[#C7FF2E]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#C7FF2E]">
              Atlanta-built / Founder-led
            </div>
            <h1 className="mt-6 text-6xl md:text-7xl font-black uppercase tracking-[0.08em] text-white mb-6">
              About <span className="text-[#C7FF2E]">WISE²</span>
            </h1>
            <p className="text-xl text-[#B7BDC8]">
              The business OS behind Wise Shine, Piff City, and the legacy systems that connect the brand.
            </p>
          </div>

          <div className="space-y-16">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-[#B7BDC8] leading-relaxed">
                WISE² exists to help ambitious founders build a brand that looks like a movement and runs like a system. We combine identity, operations, and execution into one legacy-minded platform.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-12">
              <h2 className="text-3xl font-bold text-white mb-4">What We Do</h2>
              <p className="text-[#B7BDC8] leading-relaxed mb-6">
                We shape the look, language, and operating structure of WISE² and its powered businesses. The goal is simple: make the brand feel premium, consistent, and built to last.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Identity', 'Operations', 'Culture'].map((item) => (
                  <div
                    key={item}
                    className="p-4 bg-[#C7FF2E]/10 border border-[#C7FF2E]/20 rounded-xl text-center"
                  >
                    <p className="text-white font-bold">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-12">
              <h2 className="text-3xl font-bold text-white mb-6">Our Process</h2>
              <div className="space-y-4">
                {[
                  { phase: 'Vision', desc: 'Clarify the identity and the business story.' },
                  { phase: 'System', desc: 'Unify the brand architecture and core operations.' },
                  { phase: 'Build', desc: 'Design the public-facing experience and rollout.' },
                  { phase: 'Launch', desc: 'Put the identity in front of the market.' },
                  { phase: 'Legacy', desc: 'Keep iterating until the brand becomes durable.' },
                ].map((item) => (
                  <div key={item.phase} className="flex gap-4">
                    <div className="text-[#C7FF2E] font-bold min-w-24">{item.phase}</div>
                    <div className="text-[#B7BDC8]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="text-center">
              <p className="text-[#B7BDC8] mb-8">Ready to start your build?</p>
              <a
                href="/start-your-build"
                className="inline-block px-12 py-4 bg-[#C7FF2E] text-black rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Start Your Build
              </a>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
