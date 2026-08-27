import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const principles = [
  'Start with the real workflow before designing the interface.',
  'Use AI to clarify work, not hide weak process behind buzzwords.',
  'Preserve evidence: source notes, measurements, decisions, and deployment history.',
  'Ship systems that can be used by operators, technicians, artists, and founders.',
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
            About WISE²
          </p>
          <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">
            Built from field work, client work, and the need for one better system.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#B7C0CB]">
            WISE² exists because real businesses do not operate like clean pitch-deck diagrams. They have customer calls, job notes, equipment data, creative deadlines, deployments, invoices, and decisions scattered everywhere.
          </p>
          <p className="mt-4 text-base leading-8 text-[#B7C0CB]">
            The company builds software and AI workflows around that mess: capture what is true, make it useful, and turn it into the next action.
          </p>
        </div>
        <div className="relative min-h-[34rem] overflow-hidden border border-white/10 bg-black">
          <Image
            src="/uploads/darrin-real.jpg"
            alt="WISE² team portrait"
            fill
            className="object-cover object-center opacity-90"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,7,0.84),rgba(5,6,7,0.05))]" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-sm leading-7 text-[#DCE7EF]">
              The site uses real available WISE² people and product assets where possible. Missing proof stays marked as a requirement, not invented content.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0A0E12]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              Operating principles
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              Practical before theatrical.
            </h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle} className="flex gap-4 bg-[#090C10] p-6">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#8EDBFF]" aria-hidden="true" />
                <p className="text-base leading-7 text-[#C8D0D9]">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black leading-tight">Where WISE² is going.</h2>
          <p className="mt-5 text-base leading-8 text-[#B7C0CB]">
            The roadmap is a connected ecosystem: WISE² Core as the operating layer, WISE² HVAC for diagnostics and field service, WISE Defense for training systems, SoundLab for creative infrastructure, and client work that proves the system can ship.
          </p>
          <Link
            href="/work"
            className="mt-8 inline-flex min-h-12 items-center gap-2 border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#8EDBFF]/70 hover:bg-[#8EDBFF]/10 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
          >
            See the work
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
