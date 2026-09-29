import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { PageHero } from '@/components/PageHero';
import { DEMO_OCCASIONS } from '@/lib/demo-data';

export default function OccasionsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          title="Browse by Occasion"
          subtitle="From birthdays to memorials, CC creates custom products that honor every moment."
        />

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_OCCASIONS.map((occasion) => (
              <article key={occasion.slug} className="cc-card p-6 flex flex-col">
                <p className="text-5xl mb-4" aria-hidden>{occasion.emoji}</p>
                <h2 className="text-xl font-lora font-bold text-cc-dark mb-2">{occasion.title}</h2>
                <p className="text-sm text-cc-dark/70 mb-5 flex-1">{occasion.description}</p>
                <Link href={`/shop?occasion=${encodeURIComponent(occasion.title)}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Shop {occasion.title}
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
