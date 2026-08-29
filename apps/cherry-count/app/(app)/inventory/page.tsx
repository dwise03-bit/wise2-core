'use client';

import Link from 'next/link';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { cherryListProducts } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

type Product = (typeof DEMO_PRODUCTS)[number];

export default function InventoryPage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    cherryListProducts()
      .then((data) => {
        if (data.length > 0) {
          setProducts(
            data.map((p) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              category: p.category ?? '',
              collection: p.collection ?? '',
              retailPrice: Number(p.retailPrice),
              cost: Number(p.cost ?? 0),
              images: [],
              status: p.status,
              variants: p.variants.map((v) => ({
                id: v.id,
                size: v.size ?? 'OS',
                color: v.color ?? '',
                quantity: v.quantity,
                bin: v.bin ?? '',
                minimumStock: v.minimumStock,
              })),
            })),
          );
        }
      })
      .catch(() => {/* keep demo data */});
  }, [isAuthenticated]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()),
  );

  const totalItems = products.reduce(
    (sum, p) => sum + p.variants.reduce((s, v) => s + v.quantity, 0),
    0,
  );

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <DemoModeBanner />

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase">Inventory</h1>
          <p className="text-sm text-white/50">
            {products.length} products · {totalItems} items
          </p>
        </div>
        <Link href="/inventory/new" className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-cherry-hot shadow-glow-sm">
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, SKU, color..."
          className="w-full rounded-cherry border border-cherry-bubblegum/20 bg-cherry-soft/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-cherry-hot focus:outline-none"
        />
      </div>

      <div className="space-y-3" data-tour="inventory-list">
        {filtered.map((product) => {
          const totalQty = product.variants.reduce((s, v) => s + v.quantity, 0);
          const lowStock = product.variants.some((v) => v.quantity <= v.minimumStock);

          return (
            <Link key={product.id} href={`/inventory/${product.id}`}>
              <GlassCard className="flex gap-4 transition hover:border-cherry-hot/30">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-cherry bg-gradient-to-br from-cherry-plum to-cherry-soft text-2xl">
                  👗
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-white/50">
                        {product.category} · {product.collection}
                      </p>
                    </div>
                    {lowStock && <AlertTriangle className="h-4 w-4 shrink-0 text-cherry-red" />}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-cherry-bubblegum font-semibold">${product.retailPrice}</span>
                    <span className="text-white/40">SKU: {product.sku}</span>
                    <span className="text-white/40">{totalQty} in stock</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.variants.map((v) => (
                      <span
                        key={v.id}
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          v.quantity <= v.minimumStock
                            ? 'bg-cherry-red/20 text-cherry-red'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {v.size}/{v.color} ({v.quantity})
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
