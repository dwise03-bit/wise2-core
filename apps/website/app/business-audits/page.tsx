import Link from 'next/link';

const auditAreas = [
  'Brand and identity',
  'Website and customer experience',
  'Marketing and customer acquisition',
  'Sales and operations',
  'AI and automation',
  'Security and compliance',
];

export default function BusinessAuditsPage() {
  return (
    <main className="min-h-screen bg-[#050a10] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-emerald-400">
          WISE² / HOME
        </Link>
        <p className="mt-16 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
          WISE² Business Audit
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight md:text-7xl">
          Audit the business. Build the machine.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
          A practical review of the opportunities, systems and next steps that
          can help your business grow.
        </p>
        <Link href="/contact" className="mt-10 inline-block rounded-md bg-emerald-400 px-7 py-4 font-bold text-black">
          Request a business audit
        </Link>
        <section className="mt-24">
          <h2 className="text-3xl font-bold">What we review</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {auditAreas.map((area) => (
              <div key={area} className="rounded-xl border border-emerald-400/20 bg-slate-900 p-6">
                <h3 className="font-semibold">{area}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
