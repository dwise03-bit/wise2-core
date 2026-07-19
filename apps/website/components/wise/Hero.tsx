import { Button } from './Button';
import { branding } from '@/data/wise2-content';

export const Hero: React.FC = () => {
  return (
    <div className="pt-32 pb-16 md:pb-32 bg-wise-bg-primary relative overflow-hidden">
      {/* Premium Animated Background Blobs */}
      <div className="absolute top-32 -left-64 w-96 h-96 bg-wise-accent-green/8 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-64 w-96 h-96 bg-wise-accent-green/8 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-wise-accent-green/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Premium Copy */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full bg-wise-accent-green/10 border border-wise-accent-green/30 backdrop-blur-sm">
                <span className="text-sm font-semibold text-wise-accent-green">✦ WISE² PLATFORM</span>
              </div>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold font-display text-wise-text-primary leading-tight">
              <span className="text-wise-accent-green">WISE²</span>
              <br />
              <span className="text-white">{branding.tagline}</span>
            </h1>
          </div>

          <p className="text-xl text-wise-text-secondary max-w-xl leading-relaxed">
            {branding.description}
          </p>

          <div className="flex gap-4 pt-4">
            <Button href="/start-your-build" variant="primary" size="lg">
              ✦ Start Your Build
            </Button>
            <Button href="/services" variant="secondary" size="lg">
              Explore Services →
            </Button>
          </div>
        </div>

        {/* Right: Premium Glassmorphic Hero Box */}
        <div className="relative h-96 md:h-full group">
          {/* Outer Glow Container */}
          <div className="absolute inset-0 rounded-3xl bg-wise-accent-green/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Main Glassmorphic Card */}
          <div className="relative h-full rounded-3xl overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/15 via-wise-bg-secondary/60 to-wise-bg-primary" />

            {/* Glass Layer */}
            <div className="absolute inset-0 backdrop-blur-xl bg-white/8 group-hover:bg-white/12 transition-all duration-500" />

            {/* Premium Border with Glow */}
            <div className="absolute inset-0 rounded-3xl border border-wise-accent-green/40 group-hover:border-wise-accent-green/60 transition-colors duration-500" />

            {/* Inner Light Reflection */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none" />

            {/* Premium Shadow Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-wise-accent-green/0 via-wise-accent-green/5 to-wise-accent-green/0 rounded-3xl blur-2xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-7xl sm:text-8xl mb-6 animate-bounce">🚚</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-wise-text-primary">
                  Premium Hero Space
                </h3>
                <p className="text-wise-text-muted text-lg">
                  Ready for truck / cityscape imagery
                </p>
                <div className="pt-4 text-wise-accent-green text-sm font-semibold">
                  ✦ Hero Image Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
