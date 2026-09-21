'use client';

export function BlakkhailPhilosophy() {
  return (
    <section className="relative bg-black py-20 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <div className="mb-16 border-l-2 border-[#D4AF37] pl-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">OUR FOUNDATION</p>
          <h2
            className="mt-6 text-4xl font-black uppercase leading-tight tracking-wider text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Built on Legacy<br />
            Grounded in Purpose
          </h2>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#C8C8C8]">
            BLAKK HAIL isn't just apparel. It's a movement rooted in Atlanta energy, street culture, and uncompromising vision.
            Every piece carries the weight of intention — designed for those who refuse to apologize for who they are.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: '⚔️',
              title: 'Control',
              desc: 'You command your narrative. No corporate apologies, no softened edges.'
            },
            {
              icon: '🔥',
              title: 'Authenticity',
              desc: 'Crafted from real culture, real stories, real Atlanta streets. Not manufactured trends.'
            },
            {
              icon: '🌙',
              title: 'Defiance',
              desc: 'Built for those who create on their terms. Who lead, not follow.'
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-lg border border-[#8C6518]/30 bg-[#0F0F0F] p-8 transition-all duration-500 hover:border-[#D4AF37]/50 hover:bg-[#141414]"
              data-scroll
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#D4AF37]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="text-4xl mb-4">{pillar.icon}</div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-[#D4AF37]">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#A8A8A8]">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-[#8C6518]/20 pt-12">
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.25em] text-[#8C6518]/60">
            EST. 1994 — ATLANTA HERITAGE — SINCE THE BEGINNING
          </p>
        </div>
      </div>
    </section>
  );
}
