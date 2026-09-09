'use client';

import { BLAKKHAIL } from './brand-tokens';

export function BlakkhailStory() {
  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: BLAKKHAIL.jetBlack }}>
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-3xl -mr-48" />

      <div className="relative z-10 mx-auto max-w-[1000px] px-6">
        {/* Story header */}
        <div className="mb-16 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: BLAKKHAIL.gold }}>
            THE STORY
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-8 leading-tight" style={{ color: 'white' }}>
            Heritage<br />Streetwear<br />Since 1994
          </h2>
        </div>

        {/* Story content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Main narrative */}
          <div className="space-y-6 opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: BLAKKHAIL.steel }}>
              Blakk Hail was born from a vision to create authentic streetwear that tells a story. For over 30 years, we've been designing pieces that capture the essence of street culture and original fashion.
            </p>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: BLAKKHAIL.steel }}>
              Every piece in our collection carries the legacy of those who came before. We don't just make clothes—we create statements. We design for the culture. We build for the future.
            </p>
          </div>

          {/* Right - Key values */}
          <div className="space-y-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
            {[
              { label: 'ORIGINAL', text: 'Designed with authenticity at the core' },
              { label: 'LEGACY', text: 'Three decades of streetwear excellence' },
              { label: 'CULTURE', text: 'Built by the community, for the community' }
            ].map((item, idx) => (
              <div key={idx} className="border-l-2 pl-6" style={{ borderColor: BLAKKHAIL.gold }}>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: BLAKKHAIL.gold }}>
                  {item.label}
                </p>
                <p style={{ color: BLAKKHAIL.steel }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 h-px" style={{ backgroundColor: `${BLAKKHAIL.gold}22` }} />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
