import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Footer } from '@/components/sencere/Footer';
import { PageHeader } from '@/components/sencere/PageHeader';
import { capabilities } from '@/lib/sencere/capabilities';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Apparel decoration, vinyl & print, sublimation, laser engraving, heat press, sewing, 3D printing, CNC fabrication, and design services from SenCere Creative LLC.',
};

export default function ServicesPage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <PageHeader
        eyebrow="What We Do"
        title="Services & Capabilities"
        description="Every service SenCere Creative LLC offers, from a single custom piece to full-scale production runs — all under one roof."
      />
      <section className="bg-[#050505] py-16">
        <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div
                key={cap.slug}
                id={cap.slug}
                className="scroll-mt-24 rounded-lg border border-[#8C6518]/30 bg-[#101010] p-7"
              >
                <cap.icon className="h-8 w-8 text-[#D6A331]" strokeWidth={1.5} aria-hidden="true" />
                <h2
                  className="mt-4 text-lg font-bold uppercase tracking-wide text-[#F7F7F7]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cap.title}
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cap.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-[#8C6518]/30 px-3 py-1 text-[11px] text-[#C8C8C8]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sencere/quote"
                  className="mt-5 flex items-center gap-1.5 text-sm font-bold text-[#D6A331] hover:gap-2.5 transition-all"
                >
                  Get a quote for this service <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
