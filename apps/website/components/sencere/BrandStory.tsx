'use client';

import Link from 'next/link';

export function BrandStory() {
  return (
    <section className="relative bg-[#0f0f0f] py-16 lg:py-24">
      <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Images/Visual */}
          <div className="relative flex items-center">
            <div className="relative w-full">
              {/* Placeholder for brand story images - would normally be a photo collage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gradient-to-br from-[#E8A23A]/20 to-[#D4842F]/20 border border-[#D4842F]/30 flex items-center justify-center">
                  <span className="text-[12px] text-[#999]">Photo 1</span>
                </div>
                <div className="aspect-square bg-gradient-to-br from-[#E8A23A]/20 to-[#D4842F]/20 border border-[#D4842F]/30 flex items-center justify-center">
                  <span className="text-[12px] text-[#999]">Photo 2</span>
                </div>
                <div className="aspect-square bg-gradient-to-br from-[#E8A23A]/20 to-[#D4842F]/20 border border-[#D4842F]/30 flex items-center justify-center">
                  <span className="text-[12px] text-[#999]">Photo 3</span>
                </div>
                <div className="aspect-square bg-gradient-to-br from-[#E8A23A]/20 to-[#D4842F]/20 border border-[#D4842F]/30 flex items-center justify-center">
                  <span className="text-[12px] text-[#999]">Photo 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Narrative Text */}
          <div className="flex flex-col justify-center">
            <h2
              className="text-[28px] font-black uppercase leading-tight tracking-wider text-[#F5E6D3] sm:text-[32px]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              BUILT FROM THE STREETS.
              <br />
              <span className="bg-gradient-to-r from-[#E8A23A] via-[#D4842F] to-[#C56F24] bg-clip-text text-transparent">
                CREATED FOR THE FUTURE.
              </span>
            </h2>

            <div className="mt-8 space-y-4 text-[14px] leading-relaxed text-[#D4D4D4]">
              <p>From the block to the booth.</p>
              <p>From sketches to the screen.</p>
              <p>From the underground to the world.</p>
              <p className="font-bold text-[#F5E6D3]">This is SenCere Creative LLC.</p>
              <p className="font-bold text-[#F5E6D3]">This is our story.</p>
            </div>

            <div className="mt-8">
              <Link
                href="/sencere/about"
                className="inline-block border-2 border-[#E8A23A] px-6 py-3 text-[11px] font-black uppercase tracking-wider text-[#E8A23A] transition-all hover:bg-[#E8A23A]/10"
              >
                OUR STORY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
