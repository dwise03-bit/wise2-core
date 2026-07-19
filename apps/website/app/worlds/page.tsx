import { Navigation, Footer } from '@/components/wise';

export default function WorldsPage() {
  const worlds = [
    {
      name: 'SoundLabs',
      description: 'Professional music production and audio engineering studio.',
      features: ['DAW Features', 'Audio Effects', 'Beat Making', 'Mixing'],
      icon: '🎵',
    },
    {
      name: 'Live Studio',
      description: 'Real-time streaming and live broadcast platform.',
      features: ['HD Streaming', 'Chat', 'Analytics', 'Monetization'],
      icon: '🔴',
    },
    {
      name: 'Jingle Lab',
      description: 'Create custom jingles, intros, and audio branding.',
      features: ['Templates', 'AI Generation', 'Customization', 'Export'],
      icon: '✨',
    },
  ];

  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              Our <span className="text-wise-accent-green">Worlds</span>
            </h1>
            <p className="text-xl text-wise-text-secondary max-w-3xl mx-auto">
              Explore the complete WISE² ecosystem of creative tools and platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {worlds.map((world) => (
              <div
                key={world.name}
                className="bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-8 hover:border-wise-accent-green/60 transition-all"
              >
                <div className="text-6xl mb-4">{world.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{world.name}</h3>
                <p className="text-wise-text-secondary mb-6">{world.description}</p>
                <div className="space-y-2">
                  {world.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="text-wise-accent-green">✓</span>
                      <span className="text-wise-text-secondary text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
