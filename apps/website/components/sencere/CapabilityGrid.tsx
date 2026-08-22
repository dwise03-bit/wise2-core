import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { capabilities } from '@/lib/sencere/capabilities';

export function CapabilityGrid() {
  return (
    <section className="bg-[#050505] py-16">
      <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
        <div className="mb-10 flex items-center justify-center gap-4">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D6A331]" />
          <h2
            className="text-center text-2xl font-bold uppercase tracking-[0.1em] text-[#D6A331] sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Our Capabilities
          </h2>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D6A331]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-9">
          {capabilities.map((cap) => (
            <div
              key={cap.slug}
              className="group flex flex-col rounded-lg border border-[#8C6518]/30 bg-[#101010] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#D6A331] hover:bg-[#151515]"
            >
              <cap.icon className="h-7 w-7 text-[#D6A331]" aria-hidden="true" strokeWidth={1.5} />
              <h3 className="mt-4 text-[13px] font-bold uppercase leading-tight tracking-wide text-[#F7F7F7]">
                {cap.title}
              </h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-[#888]">
                {cap.items.join(' · ')}
              </p>
              <Link
                href={`/sencere/services#${cap.slug}`}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-[#D6A331] transition group-hover:gap-2"
              >
                Learn More <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
