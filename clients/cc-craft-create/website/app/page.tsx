'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { SectionHeading } from '@/components/SectionHeading';
import { ProductCard } from '@/components/ProductCard';
import { Toast } from '@/components/Toast';
import { useCart } from '@/contexts/CartContext';
import {
  DEMO_ORDER_PROCESS,
  DEMO_OCCASIONS,
  DEMO_STATS,
  DEMO_TESTIMONIALS,
} from '@/lib/demo-data';
import type { Product } from '@/lib/types';

const VALUE_PROPS = [
  { icon: '🖨️', title: 'High-Quality Printing', desc: 'Vibrant colors and sharp details on every order.' },
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Quick delivery without sacrificing quality.' },
  { icon: '❤️', title: 'Made with Love', desc: 'Every detail designed with care and purpose.' },
  { icon: '📍', title: 'Local & Community Driven', desc: 'Pickup, delivery, and bulk orders available.' },
];

const SPECIALTIES = [
  'Custom Party Packages',
  'Personalized Drink Labels',
  'Chip Bags & Candy Wrappers',
  'Water Bottle Labels',
  'Memorial & Keepsake Items',
  'Business & Brand Products',
  'Church & Community Event Products',
  'Teacher & Nurse Appreciation Gifts',
];

export default function Home() {
  const { addItem } = useCart();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setFeatured(data.data.slice(0, 4));
        }
      })
      .catch(() => setFeatured([]));
  }, []);

  const handleAddToCart = (product: Product) => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price);
    addItem({
      product_id: product.id,
      name: product.name,
      price,
      category: product.category,
    });
    setToast(`${product.name} added to cart`);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-cc-lilac via-white to-white px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <p className="text-xs md:text-sm font-poppins font-bold uppercase tracking-[0.2em] text-cc-purple mb-3">
                THE MATHIS: C + C = WISE
              </p>
              <p className="text-sm text-cc-dark/70 mb-4">
                When It Comes to Crafting and Creating
              </p>
              <h1 className="text-3xl md:text-5xl font-lora font-bold text-cc-purple leading-tight mb-4">
                Crafted for the Moment. Created for the Memory.
              </h1>
              <p className="font-script text-2xl md:text-3xl text-cc-gold mb-4">
                You Dream It. I&apos;ll Create It!
              </p>
              <p className="text-base md:text-lg text-cc-dark/90 mb-8 max-w-xl mx-auto lg:mx-0">
                Custom products for every occasion, every person, every purpose. Every detail is
                designed with love, care, and purpose — because every moment deserves to be special.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto">
                    Order Yours Today
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    About CC
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-cc-gold/40">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-cc-purple">{DEMO_STATS.happyCustomers}+</p>
                  <p className="text-xs md:text-sm font-semibold text-cc-dark">Happy Customers</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-cc-purple">{DEMO_STATS.productsOffered}</p>
                  <p className="text-xs md:text-sm font-semibold text-cc-dark">Product Lines</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-cc-purple">{DEMO_STATS.avgTurnaroundDays}d</p>
                  <p className="text-xs md:text-sm font-semibold text-cc-dark">Avg Turnaround</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl border-4 border-cc-gold bg-gradient-to-br from-cc-purple via-cc-lavender to-cc-lilac shadow-2xl flex flex-col items-center justify-center text-white p-8">
                <span className="text-7xl font-lora font-bold mb-4">CC</span>
                <p className="font-script text-3xl text-cc-gold text-center">Craft & Create Studio</p>
                <p className="text-sm text-center mt-4 text-white/90">
                  Nurse. Entrepreneur. Creator. Purpose Driven.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHeading eyebrow="Featured" title="Best-Selling Collections" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} compact />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/shop">
                <Button variant="secondary">Shop All Products</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20 bg-gradient-to-br from-cc-purple to-purple-800 text-white">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Why Choose CC Craft & Create?"
              subtitle="Professional custom products made with care, quality, and attention to every detail."
              light
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUE_PROPS.map((item) => (
                <div key={item.title} className="text-center p-4">
                  <p className="text-4xl mb-3" aria-hidden>{item.icon}</p>
                  <h3 className="text-lg font-lora font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-cc-lilac">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHeading eyebrow="How It Works" title="Simple 5-Step Process" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {DEMO_ORDER_PROCESS.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cc-gold text-cc-dark flex items-center justify-center text-xl font-bold shadow-md">
                    {step.step}
                  </div>
                  <h3 className="font-lora font-bold text-cc-dark mb-2">{step.title}</h3>
                  <p className="text-sm text-cc-dark/70">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20 bg-cc-lilac">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Shop by Occasion" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {DEMO_OCCASIONS.map((occasion) => (
                <Link
                  key={occasion.slug}
                  href={`/shop?occasion=${encodeURIComponent(occasion.title)}`}
                  className="cc-card p-5 text-center hover:-translate-y-1"
                >
                  <p className="text-3xl mb-2" aria-hidden>{occasion.emoji}</p>
                  <p className="text-sm font-semibold text-cc-dark">{occasion.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="What We Specialize In" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cc-lilac rounded-2xl border border-cc-lavender p-6 md:p-8">
              {SPECIALTIES.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="text-cc-gold font-bold text-xl" aria-hidden>✓</span>
                  <span className="font-semibold text-cc-dark">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20 bg-white border-t border-cc-lavender/30">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Happy Customers" subtitle="Real celebrations. Real memories." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DEMO_TESTIMONIALS.map((review) => (
                <blockquote key={review.name} className="cc-card p-6">
                  <p className="text-cc-dark/90 mb-4">&ldquo;{review.quote}&rdquo;</p>
                  <footer className="text-sm">
                    <p className="font-bold text-cc-purple">{review.name}</p>
                    <p className="text-cc-dark/60">{review.occasion}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20 bg-gradient-to-br from-cc-dark to-cc-purple text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-lora font-bold mb-4">
              Your Dream. Our Creation.
            </h2>
            <p className="text-cc-lilac text-lg mb-8">
              Start your custom order today — personalized just for you, made with love.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto">Start Your Order</Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-cc-gold text-white hover:bg-white/10">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </>
  );
}
