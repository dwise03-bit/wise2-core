import { Navigation, Footer } from '@/components/wise';

export default function StartYourBuildPage() {
  const stages = [
    { phase: 1, name: 'Idea', icon: '💡', description: 'Define your vision and identify the problem you\'re solving' },
    { phase: 2, name: 'Strategy', icon: '🎯', description: 'Build your strategic blueprint with market positioning' },
    { phase: 3, name: 'Build', icon: '🔨', description: 'Execute and bring your vision to life' },
    { phase: 4, name: 'Launch', icon: '🚀', description: 'Go public and create momentum in the market' },
    { phase: 5, name: 'Multiply', icon: '📈', description: 'Scale, optimize, and build sustainable growth' },
  ];

  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              START YOUR <span className="text-wise-accent-green">BUILD</span>
            </h1>
            <p className="text-xl text-wise-text-secondary max-w-3xl mx-auto">
              Transform your vision through five strategic phases: Idea, Strategy, Build, Launch, and Multiply
            </p>
          </div>

          {/* Stage Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-20">
            {stages.map((stage) => (
              <div
                key={stage.phase}
                className="p-6 rounded-2xl bg-wise-bg-secondary border-2 border-wise-accent-green/40 hover:border-wise-accent-green/60 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="text-5xl mb-3">{stage.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2">{stage.name}</h3>
                <p className="text-xs text-wise-text-muted">Phase {stage.phase} of 5</p>
                <p className="text-sm text-wise-text-secondary mt-3">{stage.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center py-16 px-8 bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to transform your vision?</h3>
            <p className="text-wise-text-secondary mb-8 max-w-2xl mx-auto">
              Each phase builds on the last. Start with your idea and watch it grow into something extraordinary.
            </p>
            <button className="px-12 py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 shadow-lg">
              ✦ Begin Your Build Journey
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
