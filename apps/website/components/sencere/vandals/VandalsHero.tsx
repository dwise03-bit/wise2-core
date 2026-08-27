'use client';

export function VandalsHero() {
  return (
    <section className="relative bg-[#1a1a1a] py-12">
      <div className="mx-auto max-w-[1536px] px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left Sidebar */}
          <div className="flex flex-col gap-8 text-center lg:text-left">
            <div>
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#5B2D7F]" style={{ fontFamily: 'var(--font-headers)' }}>
                Rebellion
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#D4D4D4]">
                Limited. Uncensored. Unapologetic.
              </p>
            </div>
            <div>
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#5B2D7F]" style={{ fontFamily: 'var(--font-headers)' }}>
                Art
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#D4D4D4]">
                Where culture meets the underground.
              </p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="lg:col-span-4">
            <div className="relative overflow-hidden border-2 border-[#5B2D7F]">
              {/* Hero Image */}
              <div className="aspect-video bg-gradient-to-br from-[#2a1a3a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[64px] font-black text-[#5B2D7F] opacity-20">VANDALS</div>
                  <p className="mt-4 text-[14px] uppercase tracking-wider text-[#D4D4D4]">
                    The Underground Movement
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Releases */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="relative overflow-hidden border-2 border-[#5B2D7F]">
                  <div className="aspect-square bg-gradient-to-br from-[#2a1a3a] to-[#1a1a1a] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[32px] font-black text-[#5B2D7F] opacity-30">Release {item}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
