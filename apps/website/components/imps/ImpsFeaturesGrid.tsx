'use client';

export function ImpsFeaturesGrid() {
  const features = [
    {
      title: 'AI ASSISTANT',
      description: 'Ask questions, get answers and trigger automations.',
      icon: '🤖',
    },
    {
      title: 'LEARN & GROW',
      description: 'Tutoring, learning tools, translation and expandable knowledge experiences.',
      icon: '📚',
    },
    {
      title: 'SMART HOME HUB',
      description: 'Control compatible devices and automations.',
      icon: '🏠',
    },
    {
      title: 'SECURE & PRIVATE',
      description: 'Support local processing and privacy-focused workflows.',
      icon: '🔐',
    },
    {
      title: 'CREATOR TOOL',
      description: 'Capture ideas, create content and interact with WISE² creator systems.',
      icon: '✨',
    },
    {
      title: 'FULLY CUSTOMIZABLE',
      description: 'Open platform architecture for expanding applications and integrations.',
      icon: '⚙️',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white">
            BUILT FOR
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">YOUR WORLD</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            From productivity to play, IMP goes with you.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 sm:p-8 bg-gradient-to-br from-blue-950/20 to-black border border-blue-500/20 hover:border-blue-400/50 rounded-xl transition duration-300 hover:bg-blue-950/30"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-base sm:text-lg font-black tracking-wide text-blue-400 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-blue-950/20 border border-blue-500/30 rounded-lg text-center">
          <p className="text-sm text-gray-400">
            Some features are <span className="text-blue-400 font-semibold">currently available</span>, others are on the <span className="text-blue-400 font-semibold">product roadmap</span>. Check documentation for current capabilities.
          </p>
        </div>
      </div>
    </section>
  );
}
