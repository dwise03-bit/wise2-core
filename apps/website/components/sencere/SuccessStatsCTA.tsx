import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { marketingStats, company } from '@/lib/sencere/config';

const stats = [
  { value: marketingStats.projectsCompleted, label: 'Projects Completed' },
  { value: marketingStats.equipment, label: 'Equipment & Machines' },
  { value: marketingStats.turnaround, label: 'Turnaround Times' },
  { value: marketingStats.quality, label: 'Quality Guaranteed' },
];

export function SuccessStatsCTA() {
  return (
    <section className="bg-[#080808] py-6">
      <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
        <div className="grid grid-cols-1 divide-y divide-[#8C6518]/30 overflow-hidden rounded-xl border border-[#8C6518]/30 bg-[#101010] lg:grid-cols-[minmax(0,26%)_minmax(0,42%)_minmax(0,32%)] lg:divide-x lg:divide-y-0">
          {/* Built for your success */}
          <div className="flex items-center gap-4 p-6">
            <Image
              src="/sencere/logo/sencere-icon-mark.png"
              alt=""
              width={48}
              height={46}
              className="h-11 w-auto shrink-0"
              aria-hidden="true"
            />
            <div>
              <h3
                className="text-sm font-bold uppercase tracking-wide text-[#F7F7F7]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Built For Your Success
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#888]">
                From a single custom item to full-scale production, we have the tools,
                experience, and systems to bring your vision to life.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4 lg:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-2xl font-bold text-[#D6A331] sm:text-3xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#888]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-center gap-3 p-6">
            <h3
              className="text-sm font-bold uppercase tracking-wide text-[#D6A331]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ready To Start Your Project?
            </h3>
            <p className="text-xs text-[#888]">Let&apos;s build something amazing together.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sencere/quote"
                className="flex items-center gap-1.5 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-5 py-2.5 text-xs font-bold tracking-wide text-[#0a0a0a] transition hover:brightness-110"
              >
                GET A QUOTE <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <a
                href={`tel:${company.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-1.5 rounded-md border border-[#D6A331] px-5 py-2.5 text-xs font-bold tracking-wide text-[#F7F7F7] transition hover:bg-[#D6A331]/10"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" /> BOOK A CALL
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
