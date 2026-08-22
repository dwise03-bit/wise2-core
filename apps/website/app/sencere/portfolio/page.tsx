import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Footer } from '@/components/sencere/Footer';
import { PageHeader } from '@/components/sencere/PageHeader';

const gallery = [
  { src: '/sencere/portfolio/work-01-apparel-group.png', alt: 'SenCere branded hoodie, t-shirt, cap, tumbler, mug, and engraved plaques on a wood table', wide: true },
  { src: '/sencere/portfolio/work-02-vinyl-cutter.png', alt: 'Roland vinyl cutter producing custom decals' },
  { src: '/sencere/portfolio/work-03-sublimation-printer.png', alt: 'Epson sublimation printer producing a full-color print' },
  { src: '/sencere/portfolio/work-04-sewing-machine.png', alt: 'JUKI industrial sewing machine for custom apparel construction' },
];

export const metadata: Metadata = {
  title: 'Our Work',
  description: 'A look at the custom apparel, drinkware, signage, and production equipment behind SenCere Creative LLC.',
};

export default function PortfolioPage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <PageHeader
        eyebrow="Our Work"
        title="Your Vision. Our Craft."
        description="A look inside the studio — the products we produce and the equipment we produce them with."
      />
      <section className="bg-[#050505] py-16">
        <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {gallery.map((item) => (
              <div
                key={item.src}
                className={`overflow-hidden rounded-lg border border-[#8C6518]/30 bg-[#101010] ${item.wide ? 'sm:col-span-3' : ''}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.wide ? 1600 : 500}
                  height={item.wide ? 640 : 500}
                  className="h-auto w-full object-cover"
                  sizes={item.wide ? '100vw' : '(max-width: 640px) 100vw, 33vw'}
                />
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/sencere/quote"
              className="flex items-center gap-2 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-7 py-3.5 text-sm font-bold tracking-wide text-[#0a0a0a] transition hover:brightness-110"
            >
              START YOUR PROJECT <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
