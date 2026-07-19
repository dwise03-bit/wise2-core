import { Navigation, Footer } from '@/components/wise';

export default function ServicesPage() {
  const services = [
    {
      title: 'Strategy & Consulting',
      description: 'Expert guidance on vision, market positioning, and go-to-market strategy.',
      icon: '🎯',
      features: ['Market Analysis', 'Positioning', 'Roadmap Planning', 'Competitor Research'],
    },
    {
      title: 'Brand Design',
      description: 'Complete branding packages including identity, visual design, and brand guidelines.',
      icon: '🎨',
      features: ['Logo Design', 'Brand Identity', 'Visual Guidelines', 'Brand Strategy'],
    },
    {
      title: 'Web & App Development',
      description: 'Full-stack development for web applications, mobile apps, and platforms.',
      icon: '💻',
      features: ['Frontend Dev', 'Backend API', 'Mobile Apps', 'DevOps'],
    },
    {
      title: 'Content & Copywriting',
      description: 'Professional copywriting for marketing, sales, and brand communication.',
      icon: '✍️',
      features: ['Copywriting', 'Content Strategy', 'SEO Content', 'Launch Copy'],
    },
    {
      title: 'Audio & Music Production',
      description: 'Professional audio engineering, music production, and sound design.',
      icon: '🎵',
      features: ['Music Production', 'Audio Engineering', 'Sound Design', 'Mixing & Mastering'],
    },
    {
      title: 'Launch & Growth',
      description: 'End-to-end launch management and growth strategy execution.',
      icon: '🚀',
      features: ['Launch Planning', 'PR & Marketing', 'Growth Hacking', 'Analytics'],
    },
  ];

  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              Our <span className="text-wise-accent-green">Services</span>
            </h1>
            <p className="text-xl text-wise-text-secondary max-w-3xl mx-auto">
              End-to-end solutions from strategy to launch and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-wise-bg-secondary border-2 border-wise-accent-green/20 rounded-3xl p-8 hover:border-wise-accent-green/60 hover:bg-wise-accent-green/5 transition-all"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-wise-text-secondary text-sm mb-6">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="text-wise-accent-green text-xs">●</span>
                      <span className="text-wise-text-secondary text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-wise-text-secondary mb-8 max-w-2xl mx-auto">
              Let's discuss your project and find the perfect package for your needs.
            </p>
            <a
              href="/contact"
              className="inline-block px-12 py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold hover:brightness-110 transition-all"
            >
              Contact Us →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
