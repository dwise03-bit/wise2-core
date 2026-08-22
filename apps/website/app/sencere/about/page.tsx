import type { Metadata } from 'next';
import { ShieldCheck, Lightbulb, Cog, Handshake } from 'lucide-react';
import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Footer } from '@/components/sencere/Footer';
import { PageHeader } from '@/components/sencere/PageHeader';
import { WisePoweredBadge } from '@/components/sencere/WisePoweredBadge';

const values = [
  { icon: ShieldCheck, title: 'Quality', body: 'Premium materials & finishes on every job, every time.' },
  { icon: Lightbulb, title: 'Creativity', body: 'Unique designs and custom solutions built around your brand.' },
  { icon: Cog, title: 'Reliability', body: 'On time. Every time. No surprises, no missed deadlines.' },
  { icon: Handshake, title: 'Partnership', body: 'Your success is our success — we grow with our clients.' },
];

export const metadata: Metadata = {
  title: 'About',
  description: 'SenCere Creative LLC is a full-service creative production studio in Atlanta, Georgia, powered by WISE².',
};

export default function AboutPage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <PageHeader eyebrow="About Us" title="Ideas To Reality." />
      <section className="bg-[#050505] py-16">
        <div className="mx-auto grid max-w-[1536px] grid-cols-1 gap-12 px-6 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm leading-relaxed text-[#C8C8C8]">
              SenCere Creative LLC is a full-service creative production studio specializing in
              custom apparel, printing, fabrication, and design. We bring your ideas to life with
              high-quality materials, advanced equipment, and unmatched attention to detail —
              whether it&apos;s a single shirt, a custom sign, or a full production run.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#C8C8C8]">
              Every job runs on{' '}
              <span className="font-semibold text-[#D6A331]">WISE² business systems</span> — from
              quote to production to delivery — so the studio stays organized as it scales,
              without losing the personal attention custom work needs.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-lg border border-[#8C6518]/30 bg-[#101010] px-5 py-4">
              <span className="text-xs font-semibold tracking-wide text-[#888]">POWERED BY</span>
              <WisePoweredBadge size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="rounded-lg border border-[#8C6518]/30 bg-[#101010] p-6">
                <value.icon className="h-6 w-6 text-[#D6A331]" strokeWidth={1.5} aria-hidden="true" />
                <h2
                  className="mt-3 text-sm font-bold uppercase tracking-wide text-[#F7F7F7]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {value.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-[#888]">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
