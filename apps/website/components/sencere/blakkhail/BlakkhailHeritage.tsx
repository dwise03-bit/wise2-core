'use client';

export function BlakkhailHeritage() {
  const timeline = [
    { year: '1994', title: 'The Foundation', desc: 'BLAKK HAIL born from Atlanta streets. Raw energy. Unfiltered vision.' },
    { year: '2008', title: 'Cultural Movement', desc: 'Evolved into a symbol of authentic streetwear. Collaborated with artists, musicians, creators.' },
    { year: '2016', title: 'National Recognition', desc: 'BLAKK HAIL pieces in galleries. Museum acquisitions. Streetwear becomes art.' },
    { year: '2024', title: 'Global Impact', desc: 'From ATL to the world. Heritage meets future. Legacy continues.' },
    { year: '2026', title: 'No Apologies Era', desc: 'Full creative control. Uncompromised vision. TAKE CONTROL.' }
  ];

  return (
    <section className="relative bg-black py-24 sm:py-40">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">32 YEARS OF EVOLUTION</p>
          <h2
            className="mt-6 text-4xl font-black uppercase leading-tight tracking-wider text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A Legacy Unbroken
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#D4AF37] via-[#8C6518] to-transparent" />

          {/* Timeline items */}
          <div className="space-y-16">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-12 ${idx % 2 === 0 ? 'flex-row-reverse' : ''}`}
                data-scroll
              >
                <div className="flex-1" />

                <div className="relative flex flex-1 flex-col">
                  {/* Center dot */}
                  <div className="absolute left-1/2 top-6 h-4 w-4 -translate-x-1/2 rounded-full bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.6)]" />

                  {/* Content card */}
                  <div className="group overflow-hidden rounded-lg border border-[#8C6518]/30 bg-[#0F0F0F] p-8 transition-all duration-500 hover:border-[#D4AF37]/50">
                    <p className="text-2xl font-black text-[#D4AF37] tracking-wider">{item.year}</p>
                    <h3 className="mt-3 text-xl font-bold uppercase text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-[#A8A8A8]">{item.desc}</p>

                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#D4AF37]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C6518]/60">
            FROM ATLANTA TO THE WORLD — THE JOURNEY CONTINUES
          </p>
        </div>
      </div>
    </section>
  );
}
