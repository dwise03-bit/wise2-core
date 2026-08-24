import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Footer } from '@/components/sencere/Footer';
import { PageHeader } from '@/components/sencere/PageHeader';
import { company } from '@/lib/sencere/config';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with SenCere Creative LLC in Atlanta, Georgia — or request a custom quote directly.',
};

export default function ContactPage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <PageHeader eyebrow="Get In Touch" title="Contact Us" />
      <section className="bg-[#050505] py-16">
        <div className="mx-auto grid max-w-[1536px] grid-cols-1 gap-8 px-6 sm:px-10 lg:grid-cols-2">
          <div className="space-y-4">
            <a
              href={`tel:${company.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-4 rounded-lg border border-[#8C6518]/30 bg-[#101010] p-6 transition hover:border-[#D6A331]"
            >
              <Phone className="h-6 w-6 text-[#D6A331]" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#888]">CALL US</p>
                <p className="text-sm font-semibold text-[#F7F7F7]">{company.phone}</p>
              </div>
            </a>
            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-4 rounded-lg border border-[#8C6518]/30 bg-[#101010] p-6 transition hover:border-[#D6A331]"
            >
              <Mail className="h-6 w-6 text-[#D6A331]" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#888]">EMAIL US</p>
                <p className="text-sm font-semibold text-[#F7F7F7]">{company.email}</p>
              </div>
            </a>
            <div className="flex items-center gap-4 rounded-lg border border-[#8C6518]/30 bg-[#101010] p-6">
              <MapPin className="h-6 w-6 text-[#D6A331]" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#888]">STUDIO LOCATION</p>
                <p className="text-sm font-semibold text-[#F7F7F7]">{company.location}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-lg border border-[#8C6518]/30 bg-[#101010] p-8 text-center">
            <h2
              className="text-xl font-bold uppercase tracking-wide text-[#F7F7F7]"
              style={{ fontFamily: 'var(--font-headers)' }}
            >
              Ready to start a project?
            </h2>
            <p className="mt-2 text-sm text-[#888]">
              Tell us what you need and we&apos;ll put together a custom quote.
            </p>
            <Link
              href="/sencere/quote"
              className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-7 py-3.5 text-sm font-bold tracking-wide text-[#0a0a0a] transition hover:brightness-110"
            >
              GET A CUSTOM QUOTE <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
