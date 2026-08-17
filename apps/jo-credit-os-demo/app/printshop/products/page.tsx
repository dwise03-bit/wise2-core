'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Box, Printer, Palette, ShoppingCart } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: '3d', name: '3D Printed' },
  { id: 'dtf', name: 'DTF Transfers' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'design', name: 'Design Services' },
];

const PRODUCTS = [
  { id: '1', name: 'Packout Monitor Mount', category: '3d', price: 45, desc: 'Custom 3D-printed monitor mount for Milwaukee Packout. Locks securely, designed for Kobra X.', materials: 'PLA / PETG', turnaround: '3 days', featured: true },
  { id: '2', name: 'Router Wall Mount', category: '3d', price: 22, desc: 'Wall-mountable router holder with cable routing and ventilation. Fits most consumer routers.', materials: 'PLA', turnaround: '2 days', featured: false },
  { id: '3', name: 'Raspberry Pi 5 Case', category: '3d', price: 18, desc: 'Ventilated case with mounting tabs. Fits Pi 5 with active cooler.', materials: 'PLA / PETG', turnaround: '2 days', featured: false },
  { id: '4', name: 'Cable Management Clips (10pk)', category: '3d', price: 12, desc: 'Adhesive-backed cable clips. Channels for 1–4 cables per clip.', materials: 'PLA', turnaround: '1 day', featured: false },
  { id: '5', name: 'Custom Logo Transfer', category: 'dtf', price: 5, desc: 'Your logo printed as a DTF transfer. Ready to heat-press on any fabric.', materials: 'DTF Film', turnaround: '3 days', featured: true },
  { id: '6', name: 'Gang Sheet 22×32"', category: 'dtf', price: 48, desc: 'Pack multiple designs on a 22×32" gang sheet. Maximum value for bulk transfers.', materials: 'DTF Film', turnaround: '2 days', featured: true },
  { id: '7', name: 'Branded T-Shirt', category: 'apparel', price: 28, desc: 'Custom DTF-printed t-shirt with your design. Premium blank + professional press.', materials: 'Cotton Blend', turnaround: '5 days', featured: false },
  { id: '8', name: 'Branded Hoodie', category: 'apparel', price: 45, desc: 'Custom hoodie with DTF transfer. Front or back placement. Multiple colors.', materials: 'Cotton/Poly Blend', turnaround: '5 days', featured: false },
  { id: '9', name: 'CAD Design Service', category: 'design', price: 45, desc: 'Custom OpenSCAD or CadQuery design from your sketches or ideas. 1-hour minimum.', materials: 'N/A', turnaround: '3 days', featured: false },
  { id: '10', name: 'Artwork Cleanup', category: 'design', price: 15, desc: 'Background removal, resolution upscaling, and print-ready preparation.', materials: 'N/A', turnaround: '1 day', featured: false },
];

export default function ProductsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = PRODUCTS.filter(p => filter === 'all' || p.category === filter);

  return (
    <div className="min-h-screen bg-[#030504] text-white">
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/printshop" className="text-[#8D98A5] hover:text-white text-sm mb-4 inline-block">&larr; Back to Print Shop</Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Products & Services</h1>
          <p className="text-[#BFC4C9] mb-8">Ready-to-order products and custom services. All made in-house.</p>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  filter === cat.id
                    ? 'bg-[#72FF3B]/15 text-[#72FF3B] border border-[#72FF3B]/30'
                    : 'bg-[#111815] text-[#8D98A5] border border-[#BFC4C9]/10 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="rounded-xl border border-[#BFC4C9]/10 bg-[#111815] overflow-hidden hover:border-[#72FF3B]/30 transition-all group">
                  <div className="h-36 bg-[#0A120E] flex items-center justify-center relative">
                    {product.category === '3d' && <Box className="w-10 h-10 text-[#27C7FF]/20" />}
                    {product.category === 'dtf' && <Printer className="w-10 h-10 text-[#72FF3B]/20" />}
                    {product.category === 'apparel' && <ShoppingCart className="w-10 h-10 text-purple-400/20" />}
                    {product.category === 'design' && <Palette className="w-10 h-10 text-orange-400/20" />}
                    {product.featured && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-[#72FF3B] text-black rounded">FEATURED</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold mb-1 group-hover:text-[#72FF3B] transition-colors">{product.name}</h3>
                    <p className="text-xs text-[#8D98A5] mb-3 line-clamp-2">{product.desc}</p>
                    <div className="flex items-center justify-between text-xs text-[#8D98A5] mb-3">
                      <span>{product.materials}</span>
                      <span>{product.turnaround}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#72FF3B]">${product.price}</span>
                      <Link href="/printshop/quote" className="flex items-center gap-1 text-xs text-[#27C7FF] hover:underline">
                        Get Quote <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
