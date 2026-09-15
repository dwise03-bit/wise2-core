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
        <div className="relative flex flex-col justify-center px-8 py-20 lg:px-20 lg:py-0 z-10 bg-black lg:bg-transparent order-1 lg:order-2">
          <div className="space-y-16 max-w-2xl">
            {/* Header */}
            <div className="animate-[fadeInUp_0.8s_ease-out]">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-gray-400 mb-8">
                The Story
              </p>
              <h2
                className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tighter"
                style={{
                  color: '#C4A369',
                  textShadow: `
                    0 4px 30px rgba(0, 0, 0, 0.9),
                    0 0 60px rgba(196, 163, 105, 0.4),
                    0 0 100px rgba(196, 163, 105, 0.15),
                    3px 3px 8px rgba(0, 0, 0, 0.8)
                  `,
                  letterSpacing: '-0.03em'
                }}
              >
                Heritage<br />Streetwear<br />Since 1994
              </h2>
            </div>

            {/* Main Narrative */}
            <div className="space-y-8 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
              <p className="text-lg sm:text-xl leading-relaxed lg:leading-loose text-gray-300 font-light tracking-wide">
                Blakk Hail was born from a vision to create authentic streetwear that tells a story. For over 30 years, we've been designing pieces that capture the essence of street culture and original fashion.
              </p>
              <p className="text-lg sm:text-xl leading-relaxed lg:leading-loose text-gray-300 font-light tracking-wide">
                Every piece in our collection carries the legacy of those who came before. We don't just make clothes—we create statements. We design for the culture. We build for the future.
              </p>
            </div>

            {/* Core Values - Premium Cards */}
            <div className="space-y-8 pt-12 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              {[
                { label: 'ORIGINAL', text: 'Designed with authenticity at the core' },
                { label: 'LEGACY', text: 'Three decades of streetwear excellence' },
                { label: 'CULTURE', text: 'Built by the community, for the community' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative pl-8 border-l-4 transition-all duration-400 hover:pl-10 hover:border-opacity-100 group"
                  style={{ borderColor: '#C4A369', borderOpacity: 0.7 }}
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ color: '#C4A369' }}>
                    {item.label}
                  </p>
                  <p className="text-gray-300 leading-relaxed text-sm font-light group-hover:text-gray-200 transition-colors">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-8 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
              <a
                href="#collection"
                className="inline-block text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 px-6 py-3"
                style={{
                  color: '#00D9FF',
                  textDecoration: 'none',
                  borderBottom: '2px solid #00D9FF',
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#00FF7F';
                  e.currentTarget.style.borderBottomColor = '#00FF7F';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 127, 0.4), 0 0 20px rgba(0, 255, 127, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#00D9FF';
                  e.currentTarget.style.borderBottomColor = '#00D9FF';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.2)';
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
