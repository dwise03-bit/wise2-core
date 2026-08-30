'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageHero } from '@/components/PageHero';
import { ProductCard } from '@/components/ProductCard';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/types';
import { DEMO_CATEGORIES, DEMO_OCCASION_FILTERS } from '@/lib/demo-data';

function ShopContent() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'name'>('name');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const occasion = searchParams.get('occasion');
    const category = searchParams.get('category');
    if (occasion) setSelectedOccasion(occasion);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedOccasion) params.set('occasion', selectedOccasion);
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      if (!data.success) throw new Error('Failed to load products');
      setProducts(data.data);
    } catch {
      setError('Unable to load products right now.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedOccasion, searchTerm]);

  useEffect(() => {
    const timer = window.setTimeout(loadProducts, searchTerm ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts, searchTerm]);

  const categories = DEMO_CATEGORIES;
  const occasions = DEMO_OCCASION_FILTERS;

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'price-low') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, sortBy]);

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

  const filterPanel = (
    <aside className="bg-cc-lilac rounded-xl p-5 md:p-6 h-fit space-y-6">
      <div>
        <label className="block text-sm font-bold text-cc-dark mb-2">Search</label>
        <input
          type="search"
          placeholder="Search products..."
          className="cc-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-bold text-cc-dark mb-3">Category</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                />
                <span>{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-cc-dark mb-3">Occasion</h3>
        <ul className="space-y-2">
          {occasions.map((occ) => (
            <li key={occ}>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="occasion"
                  checked={selectedOccasion === occ}
                  onChange={() => setSelectedOccasion(selectedOccasion === occ ? null : occ)}
                />
                <span>{occ}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="block text-sm font-bold text-cc-dark mb-2">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="cc-input"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price (Low to High)</option>
          <option value="price-high">Price (High to Low)</option>
        </select>
      </div>

      {(selectedCategory || selectedOccasion || searchTerm) ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setSelectedCategory(null);
            setSelectedOccasion(null);
            setSearchTerm('');
          }}
        >
          Clear Filters
        </Button>
      ) : null}
    </aside>
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          title="Shop All Products"
          subtitle="Browse our complete collection of personalized products for every occasion."
        />

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="md:hidden mb-4">
            <Button variant="outline" className="w-full" onClick={() => setFiltersOpen((v) => !v)}>
              {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>{filterPanel}</div>

            <div className="md:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-sm text-cc-dark">
                  Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
                </p>
                {selectedOccasion ? <span className="cc-badge">{selectedOccasion}</span> : null}
                {selectedCategory ? <span className="cc-badge">{selectedCategory}</span> : null}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="cc-card h-72 animate-pulse bg-cc-lilac/60" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-cc-dark mb-4">{error}</p>
                  <Button onClick={loadProducts}>Try Again</Button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-cc-dark mb-4">No products found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedOccasion(null);
                      setSearchTerm('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cc-lilac" />}>
      <ShopContent />
    </Suspense>
  );
}
