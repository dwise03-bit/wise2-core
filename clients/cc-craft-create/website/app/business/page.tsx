import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { PageHero } from '@/components/PageHero';
import { DEMO_BUSINESS_SERVICES } from '@/lib/demo-data';

export default function BusinessPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          title="Business & Brand Products"
          subtitle="Elevate your brand with custom packaging, event materials, and corporate gifting."
          variant="purple"
        />

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {DEMO_BUSINESS_SERVICES.map((service) => (
              <article key={service.title} className="cc-card p-6">
                <h2 className="text-xl font-lora font-bold text-cc-purple mb-3">{service.title}</h2>
                <p className="text-cc-dark/80">{service.description}</p>
              </article>
            ))}
          </div>

          <div className="bg-cc-lilac rounded-2xl border border-cc-lavender p-8 text-center">
            <h2 className="text-3xl font-lora font-bold text-cc-dark mb-4">Bulk & Custom Orders</h2>
            <p className="text-cc-dark/80 mb-6 max-w-2xl mx-auto">
              Schools, churches, nonprofits, and businesses trust CC for volume orders with fast
              turnaround and personal service.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button>Request a Quote</Button>
              </Link>
              <Link href="/shop?category=Business">
                <Button variant="outline">Shop Business Products</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
