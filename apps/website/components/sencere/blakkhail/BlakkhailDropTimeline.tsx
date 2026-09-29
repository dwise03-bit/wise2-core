'use client';

export function BlakkhailDropTimeline() {
  const drops = [
    { season: 'Spring 2026', name: 'Genesis Drop', status: 'Coming Soon', desc: 'The beginning. Hand-distressed graphics. Limited 200 pieces.' },
    { season: 'Summer 2026', name: 'Heat Wave Collection', status: 'Pre-Order', desc: 'Atlanta summer energy captured. Utility layers meet streetwear.' },
    { season: 'Fall 2026', name: 'Nocturnal Series', status: 'Announced', desc: 'Dark, intricate designs. Collaboration with underground artists.' },
    { season: 'Winter 2026', name: 'Legacy Exclusive', status: 'VIP Only', desc: 'Annual limited release. Members only. Numbered. Hand-signed.' }
  ];

  return (
    <section className="relative bg-black py-24 sm:py-40 overflow-hidden">
      {/* Storm background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10">
        <div className="mb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">UPCOMING RELEASES</p>
          <h2
            className="mt-6 text-4xl font-black uppercase leading-tight tracking-wider text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Drop Schedule
          </h2>
          <p className="mt-6 max-w-2xl text-[#A8A8A8]">
            Mark your calendar. Each drop is limited. Each piece is intentional. No restocks, no excuses.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {drops.map((drop, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-lg border border-[#8C6518]/40 bg-gradient-to-br from-[#15120c] to-[#0F0F0F] p-8 transition-all duration-500 hover:border-[#D4AF37]/70 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
              data-scroll
            >
              {/* Hover glow */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#D4AF37]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/70">{drop.season}</p>
                    <h3 className="mt-3 text-2xl font-black uppercase text-white">{drop.name}</h3>
                  </div>
                  <span className="inline-block rounded-full border border-[#D4AF37]/50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {drop.status}
                  </span>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-[#A8A8A8]">{drop.desc}</p>
                <button className="mt-6 px-6 py-2 rounded-lg border border-[#D4AF37]/30 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black">
                  Notify Me
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-[#8C6518]/20 pt-12 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6518]/60">
            Limited. Intentional. No Apologies.
          </p>
        </div>
      </div>
    </section>
  );
}
