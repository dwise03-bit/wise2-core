import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { PageHero } from '@/components/PageHero';
import { DEMO_GALLERY } from '@/lib/demo-data';

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          title="Gallery"
          subtitle="A showcase of custom creations made with love for families, businesses, and community events."
        />

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_GALLERY.map((item) => (
              <article key={item.title} className="cc-card overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-cc-lilac via-white to-cc-lavender/40 flex items-center justify-center text-6xl group-hover:scale-[1.02] transition-transform">
                  {item.emoji}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cc-purple mb-1">
                    {item.category}
                  </p>
                  <h2 className="text-lg font-lora font-bold text-cc-dark">{item.title}</h2>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-cc-dark/80 mb-4">Ready to create your own custom design?</p>
            <Link href="/contact">
              <Button>Start Your Order</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
