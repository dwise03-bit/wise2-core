import { Navigation, Footer } from '@/components/wise';

export default function WorkPage() {
  const projects = [
    {
      title: 'SoundLabs Platform',
      category: 'Product Design & Development',
      description: 'Complete music production platform with DAW features and collaborative tools.',
      icon: '🎵',
      featured: true,
    },
    {
      title: 'Live Streaming Studio',
      category: 'Real-Time Broadcast Platform',
      description: 'HD streaming platform with integrated chat, analytics, and monetization.',
      icon: '🔴',
      featured: true,
    },
    {
      title: 'Brand Strategy & Design',
      category: 'Brand Development',
      description: 'Complete rebrand including identity, visual system, and guidelines.',
      icon: '🎨',
      featured: false,
    },
    {
      title: 'Web Platform Development',
      category: 'Full-Stack Development',
      description: 'Next.js frontend with NestJS backend API and PostgreSQL database.',
      icon: '💻',
      featured: false,
    },
    {
      title: 'Audio Engineering Suite',
      category: 'Audio Production',
      description: 'Professional audio effects library and mixing tools.',
      icon: '🎧',
      featured: false,
    },
    {
      title: 'Launch Campaign',
      category: 'Marketing & Growth',
      description: 'Multi-channel launch strategy with PR, social media, and content marketing.',
      icon: '🚀',
      featured: false,
    },
  ];

  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              Our <span className="text-wise-accent-green">Work</span>
            </h1>
            <p className="text-xl text-wise-text-secondary max-w-3xl mx-auto">
              Projects we're proud of. Problems we've solved. Results we've delivered.
            </p>
          </div>

          {featured.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-white mb-8">Featured Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featured.map((project) => (
                  <div
                    key={project.title}
                    className="bg-gradient-to-br from-wise-accent-green/20 to-wise-accent-green/5 border-2 border-wise-accent-green/40 rounded-3xl p-12 hover:border-wise-accent-green/60 transition-all"
                  >
                    <div className="text-6xl mb-6">{project.icon}</div>
                    <p className="text-wise-accent-green font-bold text-sm mb-2">{project.category}</p>
                    <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
                    <p className="text-wise-text-secondary">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Other Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {others.map((project) => (
                  <div
                    key={project.title}
                    className="bg-wise-bg-secondary border-2 border-wise-accent-green/20 rounded-2xl p-8 hover:border-wise-accent-green/40 transition-all"
                  >
                    <div className="text-4xl mb-4">{project.icon}</div>
                    <p className="text-wise-accent-green text-xs font-bold mb-2">{project.category}</p>
                    <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-sm text-wise-text-secondary">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 text-center bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Interested in working together?</h2>
            <p className="text-wise-text-secondary mb-8 max-w-2xl mx-auto">
              Let's discuss your project and create something amazing.
            </p>
            <a
              href="/contact"
              className="inline-block px-12 py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold hover:brightness-110 transition-all"
            >
              Get In Touch →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
