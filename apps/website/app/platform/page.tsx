import Link from 'next/link';
import { Activity, ArrowRight, Database, Gauge, RadioTower } from 'lucide-react';

const capabilities = [
  {
    title: 'Field Operations',
    text: 'Capture site notes, measurements, photos, equipment details, and customer context where the work happens.',
    icon: Gauge,
  },
  {
    title: 'Business Records',
    text: 'Keep customers, projects, tasks, assets, and decisions connected instead of spread across disconnected tools.',
    icon: Database,
  },
  {
    title: 'AI Workflows',
    text: 'Turn raw inputs into summaries, diagnosis, next actions, and usable handoffs while preserving source context.',
    icon: Activity,
  },
  {
    title: 'Edge Systems',
    text: 'Support local devices, deployment scripts, mobile wrappers, and offline-aware workflows for real environments.',
    icon: RadioTower,
  },
];

export default function PlatformPage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <section className="border-b border-white/10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
            WISE² Core
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
            The operating layer behind the products.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#B7C0CB]">
            WISE² Core is the shared system for field data, business records, AI support, and delivery workflows. It is built around work that has to survive outside a perfect demo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="min-h-60 bg-[#090C10] p-6">
                <Icon className="h-6 w-6 text-[#8EDBFF]" aria-hidden="true" />
                <h2 className="mt-8 text-2xl font-black text-white">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="border border-white/10 bg-[#DCE7EF] p-8 text-[#050607] lg:p-10">
          <h2 className="text-3xl font-black">Designed for connected divisions, not isolated demos.</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#26313A]">
            HVAC, Defense, SoundLab, WISE Imp, client storefronts, and automation systems share the same operating discipline: capture the facts, analyze the work, and ship a usable outcome.
          </p>
          <Link
            href="/start-your-build"
            className="mt-8 inline-flex min-h-12 items-center gap-2 bg-[#050607] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#111A22] focus:outline-none focus:ring-2 focus:ring-[#050607]"
          >
            Start Your Build
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
