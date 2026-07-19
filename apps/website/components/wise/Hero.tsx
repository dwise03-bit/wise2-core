import { Button } from './Button';
import { branding } from '@/data/wise2-content';

export const Hero: React.FC = () => {
  return (
    <div className="pt-20 pb-16 md:pb-24 bg-wise-bg-primary relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-wise-accent-green/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-40 w-80 h-80 bg-wise-accent-green/5 rounded-full blur-3xl animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Copy */}
        <div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-wise-text-primary leading-tight mb-6">
            <span className="text-wise-accent-green">WISE²</span>
            <br />
            {branding.tagline}
          </h1>
          <p className="text-lg text-wise-text-muted mb-8 max-w-xl">
            {branding.description}
          </p>
          <div className="flex gap-4">
            <Button href="/intake" variant="primary" size="lg">
              Start Your Project
            </Button>
            <Button href="/services" variant="secondary" size="lg">
              Explore Services
            </Button>
          </div>
        </div>

        {/* Right: Hero Image Placeholder with Glassmorphism */}
        <div className="relative h-96 md:h-full rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/10 via-wise-bg-secondary to-wise-bg-primary" />

          {/* Glassmorphism Effect */}
          <div className="absolute inset-0 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all" />

          {/* Border Glow */}
          <div className="absolute inset-0 rounded-3xl border border-wise-accent-green-border shadow-2xl shadow-wise-accent-green/20 hover:shadow-wise-accent-green/40 transition-shadow" />

          {/* Content */}
          <div className="relative inset-0 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">🚚</div>
              <p className="text-wise-text-primary font-bold mb-2">Premium Hero Space</p>
              <p className="text-sm text-wise-text-muted">Ready for truck / cityscape imagery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
