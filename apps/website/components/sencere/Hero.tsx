import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Crown, Zap, Globe, Lock } from 'lucide-react';

const trustPoints = [
  {
    icon: Crown,
    title: 'CREATOR OWNED',
    body: 'SenCere Creative LLC\n100% Independent.',
  },
  {
    icon: Zap,
    title: 'EXCLUSIVE DROPS',
    body: 'Limited Rare.\nNever Mass Produced.',
  },
  {
    icon: Zap,
    title: 'PREMIUM QUALITY',
    body: 'Built to Last.\nMade to Represent.',
  },
  {
    icon: Globe,
    title: 'GLOBAL SHIPPING',
    body: 'We Ship Worldwide.\nStay Connected.',
  },
  {
    icon: Lock,
    title: 'SECURE CHECKOUT',
    body: 'Shop Safe.\nPay Securely.',
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1a1a1a]">
      <div className="mx-auto max-w-[1536px] px-6 py-12 sm:px-10 lg:py-20">
        {/* Main grid: left text, right rabbit + art */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left: Copy & CTAs */}
          <div className="flex flex-col justify-center">
            <h1
              className="text-[2.8rem] font-black uppercase leading-[1.0] tracking-tighter sm:text-[3.2rem] lg:text-[3.5rem]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="block text-[#F5E6D3]">SENCERE</span>
              <span className="block bg-gradient-to-r from-[#E8A23A] via-[#D4842F] to-[#C56F24] bg-clip-text text-transparent">
                CREATIVE
              </span>
              <span className="block text-[#F5E6D3]">LLC</span>
            </h1>

            <p className="mt-6 text-[13px] font-bold uppercase tracking-widest text-[#E8A23A]">
              OWN THE CULTURE. CREATE THE FUTURE.
            </p>

            <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-[#D4D4D4]">
              SenCere Creative LLC is more than a brand. It's a lifestyle, a family, a movement. From
              the streets to the future — we build, create and inspire.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/sencere/products"
                className="flex items-center gap-2 rounded-none bg-[#E8A23A] px-6 py-3 text-sm font-black tracking-wide text-[#1a1a1a] uppercase transition hover:bg-[#D4842F]"
              >
                SHOP NOW
                <Crown className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/sencere/collections"
                className="flex items-center gap-2 rounded-none border-2 border-[#E8A23A] px-6 py-3 text-sm font-black tracking-wide text-[#F5E6D3] uppercase transition hover:bg-[#E8A23A]/10"
              >
                EXPLORE THE COLLECTION
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Trust points grid - 5 columns on desktop, 2 on mobile */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-[#D4842F]/30 pt-8 lg:grid-cols-5 lg:gap-3">
              {trustPoints.map((point, idx) => (
                <div key={point.title} className="flex flex-col items-start gap-2">
                  <point.icon className="h-5 w-5 text-[#E8A23A]" aria-hidden="true" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#F5E6D3]">
                    {point.title}
                  </p>
                  <p className="whitespace-pre-line text-[10px] leading-tight text-[#999]">{point.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Rabbit artwork with decorative elements */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Rabbit image - from master reference adapted color poster */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1a1a1a]">
                <Image
                  src="/sencere-assets/piff-city-rabbit-hero.png"
                  alt="PIFF CITY RABBIT - Three-eyed signature character by SenCere Creative LLC"
                  fill
                  className="object-cover object-center"
                  priority
                  quality={95}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                />
              </div>

              {/* Decorative overlay elements */}
              <div className="absolute -right-4 -top-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#E8A23A] bg-[#1a1a1a]/80 text-center">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#E8A23A]">
                    SENCERE
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#999]">
                    CREATIVE
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#E8A23A]">
                    PIFF CITY
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
