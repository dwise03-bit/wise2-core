'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, QrCode } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = DEMO_PRODUCTS.find((p) => p.id === params.id) ?? DEMO_PRODUCTS[0];

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <Link href="/inventory" className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Inventory
      </Link>

      <div className="mb-6 flex h-48 items-center justify-center rounded-cherry-lg bg-gradient-to-br from-cherry-plum via-cherry-soft to-cherry-black text-6xl">
        👗
      </div>

      <h1 className="font-serif text-2xl font-bold">{product.name}</h1>
      <p className="mt-1 text-sm text-white/50">
        {product.category} · {product.collection} · SKU {product.sku}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <GlassCard className="text-center">
          <p className="text-xs text-white/50">Retail</p>
          <p className="text-lg font-bold text-cherry-hot">${product.retailPrice}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-white/50">Cost</p>
          <p className="text-lg font-bold">${product.cost}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-white/50">Profit</p>
          <p className="text-lg font-bold text-cherry-lavender">
            ${product.retailPrice - product.cost}
          </p>
        </GlassCard>
      </div>

      <SectionHeader title="Variants" className="mt-6" />
      <div className="space-y-2">
        {product.variants.map((v) => (
          <GlassCard key={v.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {v.size} / {v.color}
              </p>
              <p className="flex items-center gap-1 text-xs text-white/50">
                <MapPin className="h-3 w-3" /> {v.bin}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${v.quantity <= v.minimumStock ? 'text-cherry-red' : 'text-white'}`}>
                {v.quantity}
              </p>
              <p className="text-[10px] text-white/40">in stock</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button className={`flex-1 ${CHERRY_LAYOUT.btnPrimary}`}>Adjust Stock</button>
        <button className="touch-target flex items-center justify-center rounded-full border border-cherry-bubblegum/30 px-4">
          <QrCode className="h-5 w-5 text-cherry-hot" />
        </button>
      </div>
    </div>
  );
}
