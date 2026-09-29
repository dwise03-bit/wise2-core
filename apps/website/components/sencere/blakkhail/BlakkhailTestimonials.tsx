'use client';

export function BlakkhailTestimonials() {
  const testimonials = [
    {
      quote: "BLAKK HAIL isn't just clothing. It's a statement. It's culture.",
      author: 'Artist Collective, ATL',
      role: 'Creative Director'
    },
    {
      quote: "Every piece tells a story. You can feel the intention in the fabric.",
      author: 'Fashion Curator',
      role: 'Smithsonian Institute'
    },
    {
      quote: "This is what authentic streetwear looks like in 2026.",
      author: 'Underground Movement',
      role: 'Creative Community'
    },
    {
      quote: "BLAKK HAIL represents everything I stand for. No compromises.",
      author: 'Artist & Activist',
      role: 'Cultural Leader'
    }
  ];

  return (
    <section className="relative bg-black py-24 sm:py-40">
      {/* Storm backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10">
        <div className="mb-20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">WHAT PEOPLE SAY</p>
          <h2
            className="mt-6 text-4xl font-black uppercase leading-tight tracking-wider text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Voices of the Movement
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-lg border border-[#8C6518]/30 bg-[#0F0F0F] p-10 transition-all duration-500 hover:border-[#D4AF37]/50 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
              data-scroll
            >
              {/* Premium accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] via-[#8C6518] to-transparent opacity-50" />

              <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-[#D4AF37]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="text-3xl text-[#D4AF37] mb-4 opacity-40">„</div>
                <p className="text-lg leading-relaxed text-white italic">
                  "{testimonial.quote}"
                </p>
                <div className="mt-8 pt-6 border-t border-[#8C6518]/20">
                  <p className="font-bold uppercase text-white text-sm">{testimonial.author}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-[#D4AF37]/70">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C6518]/60">
            BUILDING A COMMUNITY OF NO APOLOGIES
          </p>
        </div>
      </div>
    </section>
  );
}
