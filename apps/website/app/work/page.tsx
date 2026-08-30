import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MonitorSmartphone } from 'lucide-react';

const projects = [
  {
    title: 'Sencere Studios storefront',
    category: 'Client commerce system',
    description:
      'A visual storefront and brand surface for custom apparel, vinyl, sublimation, and product work.',
    image: '/sencere/portfolio/work-01-apparel-group.png',
    href: '/sencere',
  },
  {
    title: 'WISE² HVAC field tech',
    category: 'Field operations app',
    description:
      'A technician workflow for equipment records, job context, diagnostics, and mobile deployment.',
    image: '/brand/wise2-hero-united-mobile.webp',
    href: '/fieldtech',
  },
  {
    title: 'WISE Defense Nightwing',
    category: 'Division identity and edge system',
    description:
      'A darker WISE² division for training, specialized systems, and edge-intelligence presentation.',
    image: '/wise-defense/instructors/AC400CE5-BD5C-4598-B24B-B1820CB8ACC2_1_105_c.jpeg',
    href: '/wise-defense',
  },
  {
    title: 'WISE Imp desktop companion',
    category: 'Product',
    description:
      'Live browser companion and Windows desktop pet. Locked glossy black/cyan identity. No account.',
    image: '/products/wise-imp.png',
    href: '/products/imp',
  },
];

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <section className="border-b border-white/10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
            Client Work
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
            Visible artifacts from systems WISE² is building.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#B7C0CB]">
            This page favors proof over polish theater: actual routes, product surfaces, brand assets, field technology, and client work already present in the WISE² ecosystem.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="group overflow-hidden border border-white/10 bg-[#090C10] transition duration-200 hover:-translate-y-1 hover:border-[#8EDBFF]/40 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
            >
              <div className="relative aspect-[4/3] bg-black">
                <Image
                  src={project.image}
                  alt={`${project.title} project artifact`}
                  fill
                  className={
                    project.href === '/products/imp'
                      ? 'object-contain p-8'
                      : 'object-cover transition duration-500 group-hover:scale-[1.03]'
                  }
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8EDBFF]">
                  {project.category}
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">{project.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{project.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#DCE7EF]">
                  Open project
                  <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="border border-white/10 bg-[#0A0E12] p-8 lg:p-10">
          <MonitorSmartphone className="h-7 w-7 text-[#8EDBFF]" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-black">Evidence still needed for full case studies.</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#B7C0CB]">
            Verified outcomes, client quotes, launch dates, revenue impact, and operational metrics should be added only when the WISE² team can confirm them.
          </p>
        </div>
      </section>
    </main>
  );
}
