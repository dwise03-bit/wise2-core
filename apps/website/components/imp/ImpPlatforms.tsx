'use client';

export function ImpPlatforms() {
  const platforms = [
    {
      title: 'Browser',
      subtitle: 'Web App',
      description: 'Launch instantly. No install needed. Settings save locally. Works on any browser.',
      features: ['Instant launch', 'No account', 'Browser settings'],
      emoji: '🌐',
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Windows',
      subtitle: 'Desktop App',
      description: 'Install on your machine. Always on top. Transparent window. Lightweight. Tray controls.',
      features: ['Always visible', 'System tray', 'Auto-start option'],
      emoji: '💾',
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      title: 'K10 Hardware',
      subtitle: 'Physical Companion',
      description: 'Portable touchscreen device. Voice interaction. Local AI processing. WiFi connected.',
      features: ['4" display', 'Voice AI', 'Offline mode'],
      emoji: '📱',
      gradient: 'from-green-400 to-cyan-500',
    },
  ];

  return (
    <section className="relative bg-[#050607] py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[1000px] h-[400px] bg-[#00D9FF]/5 rounded-full blur-3xl -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <p className="text-sm font-bold tracking-widest text-[#00D9FF]">THREE WAYS TO COMPANION</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">Your IMP, Your Way</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Same companion. Different form. Pick what works for your workflow.</p>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((platform, idx) => (
            <div
              key={platform.title}
              className="group relative rounded-xl overflow-hidden border border-[#00D9FF]/20 hover:border-[#00D9FF]/50 bg-[#0A0E14]/50 backdrop-blur-sm hover:bg-[#0A0E14]/80 transition duration-300"
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-5 transition duration-300 pointer-events-none`}
              />

              <div className="relative p-8 space-y-6">
                {/* Icon */}
                <div className="text-5xl">{platform.emoji}</div>

                {/* Title */}
                <div>
                  <h3 className="text-2xl font-black text-white">{platform.title}</h3>
                  <p className="text-sm text-[#00D9FF] font-bold mt-1">{platform.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">{platform.description}</p>

                {/* Features */}
                <div className="space-y-2 pt-4 border-t border-[#00D9FF]/10">
                  {platform.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF]" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className="w-full mt-6 px-4 py-2 rounded-lg border border-[#00D9FF]/30 hover:border-[#00D9FF]/70 text-[#00D9FF] hover:bg-[#00D9FF]/10 font-bold text-sm transition duration-300">
                  Get Started →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ecosystem visual */}
        <div className="mt-20 p-8 rounded-xl border border-[#00D9FF]/20 bg-[#0A0E14]/50 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-widest text-[#00D9FF]">UNIFIED EXPERIENCE</p>
              <p className="text-white font-bold">One identity across all platforms</p>
              <p className="text-sm text-gray-400">Same personality, same settings, same companion—whether you're on web, desktop, or hardware.</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-widest text-[#00D9FF]">LOCAL FIRST</p>
              <p className="text-white font-bold">Your data stays with you</p>
              <p className="text-sm text-gray-400">No cloud required. All settings and preferences stored locally. You own your companion.</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-widest text-[#00D9FF]">INSTANT SETUP</p>
              <p className="text-white font-bold">Zero configuration needed</p>
              <p className="text-sm text-gray-400">Launch instantly. No accounts, no passwords, no waiting. Your IMP is ready right now.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
