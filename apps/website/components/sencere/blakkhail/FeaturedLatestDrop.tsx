'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

export function FeaturedLatestDrop() {
  const [products, setProducts] = useState<Product[]>([]);
  const shopPhotos = BLAKKHAIL_LEGACY.assets.shopPhotos;

  useEffect(() => {
    // Fetch latest products from storefront API (public endpoint)
    // Nginx proxies /api/storefront/ to admin backend
    fetch('/api/storefront/latest-products?limit=3')
      .then(res => res.json())
      .catch(err => {
        console.log('Storefront API not available');
        return [];
      })
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="relative bg-black py-20 lg:py-32 overflow-hidden">
      {/* Cinematic background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-black to-black opacity-90" />

      {/* Animated accent lines */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-[#E8A23A]/20 via-transparent to-transparent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-[#E8A23A]/20 via-transparent to-transparent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 lg:mb-24"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-4">
            FEATURED COLLECTION
          </p>
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-wider text-white">
              BLAKKHAIL
            </h2>
            <span className="text-2xl lg:text-4xl font-light text-[#E8A23A]">Latest Drop</span>
          </div>
          <p className="text-lg text-[#A8A8A8] max-w-2xl">
            Heritage streetwear. Original fashion. Take control.
          </p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/sencere/blakkhail/product/${product.id}`}
                className="group block overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a] mb-6">
                  <Image
                    src={shopPhotos[index % shopPhotos.length]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#E8A23A]">
                    NEW RELEASE
                  </p>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#E8A23A] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#A8A8A8] line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                    <p className="text-lg font-bold text-[#E8A23A]">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </p>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50 group-hover:text-[#E8A23A] transition-colors">
                      Shop →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 lg:mt-24 text-center"
        >
          <Link
            href="/sencere/blakkhail"
            className="inline-flex items-center gap-3 bg-[#E8A23A] text-black px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#f5b347] transition-colors"
          >
            Explore Full Collection
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
