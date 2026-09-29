'use client';

export function ImpFeatures() {
  const features = [
    {
      title: 'Always Watching',
      description: 'Stay aware. Your IMP monitors your workflow and adapts to your presence.',
      icon: '👁️',
      details: ['Presence aware', 'Activity tracking', 'Status responsive'],
    },
    {
      title: 'Quick Access',
      description: 'Commands, notes, and tools within arm\'s reach on your desktop.',
      icon: '⚡',
      details: ['Instant commands', 'Quick notes', 'System tools'],
    },
    {
      title: 'No Friction Setup',
      description: 'Zero configuration. No accounts. No waiting. Launch and go.',
      icon: '🚀',
      details: ['No signup', 'No login', 'No waiting'],
    },
    {
      title: 'Local Everything',
      description: 'All data stays on your machine. Your settings, your data, your control.',
      icon: '🔒',
      details: ['Local storage', 'No cloud sync', 'You own your data'],
    },
    {
      title: 'Companion Personality',
      description: 'Horns. Cyan eyes. Black hoodie. Spade tail. A personality you\'ll recognize.',
      icon: '✨',
      details: ['Locked identity', 'Pose art', 'Memorable design'],
    },
    {
      title: 'Cross-Platform',
      description: 'Web app, Windows install, K10 hardware—same companion everywhere.',
      icon: '🌍',
      details: ['Browser launch', 'Desktop app', 'Hardware edition'],
    },
  ];

  return (
    <section className="relative bg-[#050607] py-20 overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 w-[800px] h-[400px] bg-[#00D9FF]/5 rounded-full blur-3xl -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <p className="text-sm font-bold tracking-widest text-[#00D9FF]">WHAT SETS IMP APART</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">Built for Your Workflow</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">More than a pet. A companion built into your daily work.</p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl overflow-hidden border border-[#00D9FF]/20 hover:border-[#00D9FF]/50 bg-[#0A0E14]/50 backdrop-blur-sm hover:bg-[#0A0E14]/80 transition duration-300 p-8"
            >
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/0 to-[#00FF7F]/0 group-hover:from-[#00D9FF]/5 group-hover:to-[#00FF7F]/5 transition duration-300 pointer-events-none" />

              <div className="relative space-y-4">
                {/* Icon */}
                <div className="text-4xl">{feature.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-black text-white">{feature.title}</h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>

                {/* Details */}
                <div className="space-y-2 pt-4 border-t border-[#00D9FF]/10">
                  {feature.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="w-1 h-1 rounded-full bg-[#00D9FF]" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
