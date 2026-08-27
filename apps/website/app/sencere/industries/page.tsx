import type { Metadata } from 'next';
import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Footer } from '@/components/sencere/Footer';
import { PageHeader } from '@/components/sencere/PageHeader';
import { industries } from '@/lib/sencere/industries';

const details: Record<string, string> = {
  'Apparel & Brands': 'Full apparel runs, brand launches, and reorder programs with consistent quality every batch.',
  Contractors: 'Durable branded workwear, signage, and vehicle/equipment decals built to hold up on the job.',
  'Schools & Teams': 'Spirit wear, team uniforms, and event merchandise with fast turnaround for game day.',
  'Events & Promotions': 'On-demand promotional products and short-run merch for conferences, festivals, and pop-ups.',
  'Small Businesses': 'Affordable custom branding — from your first hundred units to full-scale production.',
};

export const metadata: Metadata = {
  title: 'Industries',
  description: 'Industries SenCere Creative LLC serves: apparel brands, contractors, schools & teams, events, and small businesses.',
};

export default function IndustriesPage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <PageHeader
        eyebrow="Who We Serve"
        title="Built For Every Industry"
        description="From a single custom piece to full-scale production, SenCere partners with businesses across every industry."
      />
      <section className="bg-[#050505] py-16">
        <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <div key={industry.label} className="rounded-lg border border-[#8C6518]/30 bg-[#101010] p-7">
                <industry.icon className="h-8 w-8 text-[#D6A331]" strokeWidth={1.5} aria-hidden="true" />
                <h2
                  className="mt-4 text-lg font-bold uppercase tracking-wide text-[#F7F7F7]"
                  style={{ fontFamily: 'var(--font-headers)' }}
                >
                  {industry.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#C8C8C8]">{details[industry.label]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
