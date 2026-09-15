'use client';

import Image from 'next/image';
import { BLAKKHAIL } from './brand-tokens';

export function BlakkhailStory() {
  return (
    <section id="about" className="relative w-full overflow-hidden bg-black">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(196, 163, 105, 0.15) 0%, transparent 60%)'
      }} />

      {/* Split Layout - Image + Content */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:min-h-auto">
        {/* Left - Premium Image */}
        <div className="relative h-96 lg:h-full min-h-[400px] overflow-hidden order-2 lg:order-1">
          <Image
            src="/sencere-assets/blakkhail/story-hero-4k.jpg"
            alt="Blakk Hail Heritage"
            fill
            className="object-cover"
            quality={100}
            priority
          />
          
          {/* Image Overlay - Subtle Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </div>

        {/* Right - Premium Content */}
        <div className="relative flex flex-col justify-center px-8 py-16 lg:px-16 lg:py-0 z-10 bg-black lg:bg-transparent order-1 lg:order-2">
          <div className="space-y-12 max-w-2xl">
            {/* Header */}
            <div className="animate-[fadeInUp_0.8s_ease-out]">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">
                The Story
              </p>
              <h2
                className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-tight tracking-tighter"
                style={{
                  color: '#C4A369',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
                }}
              >
                Heritage<br />Streetwear<br />Since 1994
              </h2>
            </div>

            {/* Main Narrative */}
            <div className="space-y-6 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
              <p className="text-lg sm:text-xl leading-relaxed text-gray-300 font-light">
                Blakk Hail was born from a vision to create authentic streetwear that tells a story. For over 30 years, we've been designing pieces that capture the essence of street culture and original fashion.
              </p>
              <p className="text-lg sm:text-xl leading-relaxed text-gray-300 font-light">
                Every piece in our collection carries the legacy of those who came before. We don't just make clothes—we create statements. We design for the culture. We build for the future.
              </p>
            </div>

            {/* Core Values - Premium Cards */}
            <div className="space-y-6 pt-8 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              {[
                { label: 'ORIGINAL', text: 'Designed with authenticity at the core' },
                { label: 'LEGACY', text: 'Three decades of streetwear excellence' },
                { label: 'CULTURE', text: 'Built by the community, for the community' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative pl-6 border-l-2 transition-all duration-300 hover:pl-8"
                  style={{ borderColor: '#C4A369' }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C4A369' }}>
                    {item.label}
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
              <a
                href="#collection"
                className="inline-block text-sm font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  color: '#00D9FF',
                  textDecoration: 'none',
                  borderBottom: '2px solid #00D9FF',
                  paddingBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#00FF7F';
                  e.currentTarget.style.borderBottomColor = '#00FF7F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#00D9FF';
                  e.currentTarget.style.borderBottomColor = '#00D9FF';
                }}
              >
                Explore Collection →
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
