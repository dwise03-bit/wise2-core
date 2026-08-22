import type { Metadata } from 'next';
import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Footer } from '@/components/sencere/Footer';
import { PageHeader } from '@/components/sencere/PageHeader';
import { QuoteForm } from '@/components/sencere/QuoteForm';

export const metadata: Metadata = {
  title: 'Get A Quote',
  description: 'Start your custom project with SenCere Creative LLC — tell us what you need and get a quote.',
};

export default function QuotePage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <PageHeader
        eyebrow="Get A Custom Quote"
        title="Start Your Project"
        description="Tell us about your project and we'll follow up with pricing, timeline, and next steps."
      />
      <section className="bg-[#050505] py-16">
        <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
          <QuoteForm />
        </div>
      </section>
      <Footer />
    </>
  );
}
