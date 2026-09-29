import { PublicFooter } from '@/components/navigation';

export default function ProcessPage() {
  const phases = [
    {
      phase: 1,
      name: 'Idea',
      icon: '💡',
      description: 'Define your vision, identify the problem you\'re solving, and clarify your unique value proposition.',
      duration: '2-4 weeks',
      deliverables: ['Vision Statement', 'Market Research', 'Competitive Analysis'],
    },
    {
      phase: 2,
      name: 'Strategy',
      icon: '🎯',
      description: 'Build a strategic blueprint with market positioning, target audience, and go-to-market plan.',
      duration: '3-6 weeks',
      deliverables: ['Strategy Document', 'Brand Guidelines', 'Marketing Plan'],
    },
    {
      phase: 3,
      name: 'Build',
      icon: '🔨',
      description: 'Execute your vision through design, development, content creation, and quality assurance.',
      duration: '4-12 weeks',
      deliverables: ['Design Assets', 'Working Platform', 'Content Library'],
    },
    {
      phase: 4,
      name: 'Launch',
      icon: '🚀',
      description: 'Go public with marketing campaigns, PR, community building, and launch events.',
      duration: '2-4 weeks',
      deliverables: ['Launch Campaign', 'PR Materials', 'Social Content'],
    },
    {
      phase: 5,
      name: 'Multiply',
      icon: '📈',
      description: 'Scale and optimize through performance analytics, user feedback, and market expansion.',
      duration: 'Ongoing',
      deliverables: ['Analytics Dashboard', 'Growth Roadmap', 'Optimization Reports'],
    },
  ];

  return (
    <>
      <main className="bg-[#050505] min-h-screen pt-32 pb-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B36BFF]/30 bg-[#B36BFF]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#B36BFF]">
              Brand rollout
              </div>
              <h1 className="mt-6 text-6xl md:text-7xl font-black uppercase tracking-[0.08em] text-white mb-6">
              Our <span className="text-[#C7FF2E]">Process</span>
              </h1>
            <p className="text-xl text-[#B7BDC8] max-w-3xl mx-auto">
              Five deliberate phases to move from concept to a branded operating system with real momentum.
            </p>
          </div>

          <div className="space-y-12">
            {phases.map((p) => (
              <div
                key={p.phase}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-12 hover:border-[#C7FF2E]/40 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="text-6xl mb-4">{p.icon}</div>
                    <div className="text-[#C7FF2E] font-bold text-lg">Phase {p.phase}</div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-3xl font-bold text-white mb-2">{p.name}</h3>
                    <p className="text-[#B7BDC8] mb-6">{p.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-[#9BA3B1] mb-2">TIMELINE</p>
                        <p className="text-white font-semibold">{p.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#9BA3B1] mb-2">DELIVERABLES</p>
                        <ul className="space-y-1">
                          {p.deliverables.map((d) => (
                            <li key={d} className="text-[#B7BDC8] text-sm flex items-center gap-2">
                              <span className="text-[#C7FF2E]">✓</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <p className="text-[#B7BDC8] mb-8">Ready to open the system?</p>
            <a
              href="/start-your-build"
              className="inline-block px-12 py-4 bg-[#C7FF2E] text-black rounded-lg font-bold hover:brightness-110 transition-all"
            >
              Start Your Build →
            </a>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
