'use client';

import Image from 'next/image';
import Link from 'next/link';

/**
 * The supplied WISE² homepage reference is identity-locked artwork and the
 * source of truth for composition. Keep it intact and provide semantic,
 * keyboard-accessible route links around the visual.
 */
export function ScrollcraftHomepage() {
  return (
    <main className="wise-reference-home bg-[#050706]">
      <div className="relative mx-auto w-full max-w-[1536px]">
        <Image
          src="/brand/wise2-home-reference.png"
          alt="WISE² United command center: four leaders, business systems, WISE² products, clients, and operating method"
          width={1536}
          height={1024}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
        <nav aria-label="WISE² homepage navigation" className="absolute inset-x-0 top-0 h-[7%]">
          <Link href="/" aria-label="WISE² home" className="absolute left-0 top-0 h-full w-[17%]" />
          <Link href="/" aria-label="Home" className="absolute left-[27%] top-0 h-full w-[8%]" />
          <Link href="/platform" aria-label="Products" className="absolute left-[35%] top-0 h-full w-[8%]" />
          <Link href="/solutions" aria-label="Solutions" className="absolute left-[44%] top-0 h-full w-[8%]" />
          <Link href="/industries" aria-label="Industries" className="absolute left-[52%] top-0 h-full w-[8%]" />
          <Link href="/work" aria-label="Our Work" className="absolute left-[60%] top-0 h-full w-[8%]" />
          <Link href="/about" aria-label="Company" className="absolute left-[68%] top-0 h-full w-[8%]" />
          <Link href="/contact" aria-label="Contact" className="absolute right-[17%] top-0 h-full w-[8%]" />
          <Link
            href="/commerce"
            aria-label="Commerce"
            className="absolute right-[3%] top-[18%] border border-[#8CFF00]/70 bg-[#050706]/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8CFF00] focus:outline-none focus:ring-2 focus:ring-[#8CFF00] sm:px-4 sm:py-2 sm:text-xs"
          >
            Commerce
          </Link>
        </nav>
        <div className="absolute inset-x-0 top-[13%] h-[17%]">
          <Link href="/start-your-build" aria-label="Book a Business Audit" className="absolute left-[42%] top-[77%] h-[23%] w-[14%]" />
          <Link href="/platform" aria-label="Explore WISE²" className="absolute left-[56%] top-[77%] h-[23%] w-[14%]" />
        </div>
        <div className="absolute inset-x-0 top-[31%] h-[43%]">
          <Link href="/products/imps" aria-label="Explore IMPS" className="absolute left-0 top-0 h-[43%] w-[24%]" />
          <Link href="/wise-defense" aria-label="Explore Defense" className="absolute left-[24%] top-0 h-[43%] w-[25%]" />
          <Link href="/soundlab" aria-label="Explore SoundLab" className="absolute left-[50%] top-0 h-[43%] w-[25%]" />
          <Link href="/products/trading" aria-label="Explore Trading" className="absolute right-0 top-0 h-[43%] w-[25%]" />
          <Link href="/fieldtech" aria-label="Explore Contractor OS" className="absolute left-0 top-[43%] h-[38%] w-[22%]" />
          <Link href="/products/imp" aria-label="Meet Lil Lizzy" className="absolute left-[22%] top-[43%] h-[38%] w-[24%]" />
          <Link href="/products/imp" aria-label="Shop Lexi's Inks" className="absolute left-[46%] top-[43%] h-[38%] w-[24%]" />
          <Link href="/work" aria-label="Partner With Us" className="absolute right-0 top-[43%] h-[38%] w-[30%]" />
        </div>
        <Link href="/start-your-build" aria-label="Book a Business Audit" className="absolute bottom-[7%] left-[55%] h-[5%] w-[14%]" />
        <Link href="/contact" aria-label="Contact Us" className="absolute bottom-[7%] left-[69%] h-[5%] w-[13%]" />
      </div>
    </main>
  );
}
