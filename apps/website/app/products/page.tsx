import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Products | WISE²',
  description: 'WISE² products: WISE Imp desktop companion, IMPS BYTE MINI, HVAC field tools, and WISE Defense.',
  alternates: {
    canonical: 'https://wise2.net/products',
  },
};

const products = [
  {
    href: '/cloud',
    eyebrow: 'Hosting',
    name: 'WISE² Cloud',
    description: 'Managed reseller hosting with SSL, email, backups, and automated 20i provisioning.',
  },
  {
    href: '/products/imp',
    eyebrow: 'Alpha 0.1',
    name: 'WISE Imp',
    description: 'Desktop companion for operators and client machines. Live in the browser now. Windows pet is the installable SKU.',
  },
  {
    href: '/products/imps',
    eyebrow: 'Hardware',
    name: 'IMPS BYTE MINI',
    description: 'Physical AI companion with local edge processing, voice, and a 4" touchscreen.',
  },
  {
    href: '/fieldtech',
    eyebrow: 'Field',
    name: 'WISE² HVAC',
    description: 'Technician workflow for equipment records, diagnostics, and jobsite work.',
  },
  {
    href: '/wise-defense',
    eyebrow: 'Division',
    name: 'WISE Defense',
    description: 'Training, specialized systems, and edge-intelligence presentation.',
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <section className="border-b border-white/10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
            WISE² Products
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
            Tools you can put on a machine today.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#B7C0CB]">
            Companions, field apps, and division systems that sit on the same WISE² operating layer.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.href}
              href={product.href}
              className="group min-h-64 bg-[#090C10] p-6 transition hover:bg-[#0D141A] focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8EDBFF]">
                {product.eyebrow}
              </p>
              <h2 className="mt-6 text-2xl font-black text-white">{product.name}</h2>
              <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{product.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#DCE7EF]">
                Open product
                <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
