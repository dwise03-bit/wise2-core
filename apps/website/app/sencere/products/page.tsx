import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shirt, Coffee, Award, Package } from 'lucide-react';
import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Footer } from '@/components/sencere/Footer';
import { PageHeader } from '@/components/sencere/PageHeader';

const productGroups = [
  {
    icon: Shirt,
    title: 'Custom Apparel',
    items: ['Hoodies', 'T-Shirts', 'Hats & Caps', 'Jackets', 'Uniforms'],
  },
  {
    icon: Coffee,
    title: 'Drinkware & Everyday Gear',
    items: ['Tumblers', 'Mugs', 'Water Bottles', 'Keychains'],
  },
  {
    icon: Award,
    title: 'Signage & Engraved Goods',
    items: ['Wood Plaques', 'Acrylic Signs', 'Metal Tags', 'Custom Awards'],
  },
  {
    icon: Package,
    title: 'Promotional & Corporate',
    items: ['Branded Packaging', 'Corporate Gifts', 'Event Merch', 'Bulk Promo Items'],
  },
];

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Custom apparel, drinkware, engraved signage, and promotional products produced in-house by SenCere Creative LLC.',
};

export default function ProductsPage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <PageHeader
        eyebrow="What We Make"
        title="Products"
        description="Every product SenCere Creative LLC produces is decorated, printed, or fabricated in-house — built to your specs, at the quantity you need."
      />
      <section className="bg-[#050505] py-16">
        <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {productGroups.map((group) => (
              <div key={group.title} className="rounded-lg border border-[#8C6518]/30 bg-[#101010] p-7">
                <group.icon className="h-8 w-8 text-[#D6A331]" strokeWidth={1.5} aria-hidden="true" />
                <h2
                  className="mt-4 text-lg font-bold uppercase tracking-wide text-[#F7F7F7]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm text-[#C8C8C8]">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[#D6A331]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/sencere/quote"
              className="flex items-center gap-2 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-7 py-3.5 text-sm font-bold tracking-wide text-[#0a0a0a] transition hover:brightness-110"
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
