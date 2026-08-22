import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Shield, Clock, Headphones } from 'lucide-react';
import { WisePoweredBadge } from './WisePoweredBadge';

const trustPoints = [
  {
    icon: Shield,
    title: 'PREMIUM QUALITY',
    body: 'Top-tier equipment\n& materials',
  },
  {
    icon: Clock,
    title: 'FAST TURNAROUND',
    body: 'On-time delivery,\nevery time',
  },
  {
    icon: Headphones,
    title: 'DEDICATED SUPPORT',
    body: "We're with you every\nstep of the way",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#050505]">
      <div className="mx-auto grid max-w-[1536px] grid-cols-1 gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] lg:gap-6 lg:py-16">
        {/* Left: copy */}
        <div className="flex flex-col justify-center">
          <h1
            className="text-[2.4rem] font-bold uppercase leading-[1.05] tracking-tight sm:text-[2.75rem] lg:text-[2.85rem] xl:text-[3.1rem]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="block text-[#F7F7F7]">Ideas Into Reality.</span>
            <span className="block bg-gradient-to-r from-[#F1C65A] via-[#D6A331] to-[#8C6518] bg-clip-text text-transparent">
              We Create. We Produce.
            </span>
            <span className="block text-[#F7F7F7]">You Grow.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#C8C8C8]">
            SenCere Creative LLC is your full-service creative and production partner. From
            concept to customer, we deliver{' '}
            <span className="font-semibold text-[#D6A331]">premium quality</span> products that
            make your brand stand out and your business{' '}
            <span className="font-semibold text-[#D6A331]">grow</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/sencere/quote"
              className="flex items-center gap-2 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-7 py-3.5 text-sm font-bold tracking-wide text-[#0a0a0a] transition hover:brightness-110"
            >
              GET A CUSTOM QUOTE
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sencere/services"
              className="flex items-center gap-2 rounded-md border border-[#D6A331] px-7 py-3.5 text-sm font-bold tracking-wide text-[#F7F7F7] transition hover:bg-[#D6A331]/10"
            >
              EXPLORE SERVICES
              <ArrowRight className="h-4 w-4 text-[#D6A331]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[#8C6518]/30 pt-6 sm:grid-cols-3">
            {trustPoints.map((point, idx) => (
              <div
                key={point.title}
                className={`flex items-start gap-3 ${idx > 0 ? 'sm:border-l sm:border-[#8C6518]/30 sm:pl-6' : ''}`}
              >
                <point.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#D6A331]" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-bold tracking-wide text-[#F7F7F7]">{point.title}</p>
                  <p className="whitespace-pre-line text-xs text-[#888]">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: product/equipment studio composition */}
        <div className="relative flex flex-col justify-center">
          <div className="relative overflow-hidden rounded-xl border border-[#8C6518]/40 bg-[#0d0d0d]">
            <Image
              src="/sencere/hero/hero-product-collage.png"
              alt="SenCere Creative LLC branded apparel, drinkware, and production equipment including a Roland vinyl cutter, Epson sublimation printer, industrial heat press, and JUKI sewing machine"
              width={1600}
              height={686}
              className="h-auto w-full object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <div className="flex flex-col items-start gap-2 border-t border-[#8C6518]/40 bg-[#0a0a0a] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#F7F7F7]">
                POWERED BY <WisePoweredBadge size="sm" />
              </div>
              <p className="text-[11px] font-semibold leading-tight tracking-wide text-[#D6A331] sm:text-right">
                SMART SYSTEMS.
                <br className="hidden sm:block" /> STRONGER BUSINESSES.
                <br className="hidden sm:block" /> SCALABLE GROWTH.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
