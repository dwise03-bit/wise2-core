'use client';

export function BlakkhailHero() {
  return (
    <section className="relative bg-[#1a1a1a] py-12">
      <div className="mx-auto max-w-[1536px] px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Sidebar Navigation */}
          <div className="flex flex-col gap-8 text-center lg:text-left">
            <div>
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#D4842F]" style={{ fontFamily: 'var(--font-headers)' }}>
                Photo Shoot
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#D4D4D4]">
                Curated collection from our latest shoots
              </p>
            </div>
            <div>
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#D4842F]" style={{ fontFamily: 'var(--font-headers)' }}>
                Videos
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#D4D4D4]">
                Behind the scenes and brand films
              </p>
            </div>
          </div>

          {/* Hero Image & Featured Products */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden border-4 border-[#D4842F]">
              {/* Placeholder for hero image - would show product photography */}
              <div className="aspect-video bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[64px] font-black text-[#D4842F] opacity-20">BLAKK HAIL</div>
                  <p className="mt-4 text-[14px] uppercase tracking-wider text-[#D4D4D4]">
                    Featured Collection
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Product Grid Below */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="relative overflow-hidden border-2 border-[#D4842F]">
                  <div className="aspect-square bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[32px] font-black text-[#D4842F] opacity-30">Product {item}</div>
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
