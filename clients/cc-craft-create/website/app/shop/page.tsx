'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  occasion: string;
  image: string;
  description: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Personalized Drink Labels',
    price: 24.99,
    category: 'Labels',
    occasion: 'Birthday',
    image: '🥤',
    description: 'Custom drink labels for any celebration',
  },
  {
    id: 2,
    name: 'Chip Bags & Candy Wrappers',
    price: 19.99,
    category: 'Wrappers',
    occasion: 'Birthday',
    image: '🍿',
    description: 'Personalized snack packaging',
  },
  {
    id: 3,
    name: 'Water Bottle Labels',
    price: 16.99,
    category: 'Labels',
    occasion: 'Events',
    image: '💧',
    description: 'Hydration labels for guests',
  },
  {
    id: 4,
    name: 'Custom Party Package',
    price: 89.99,
    category: 'Packages',
    occasion: 'Birthday',
    image: '🎁',
    description: 'Complete party package with multiple items',
  },
  {
    id: 5,
    name: 'Memorial Bookmarks',
    price: 12.99,
    category: 'Keepsakes',
    occasion: 'Memorials',
    image: '📖',
    description: 'Lasting memories',
  },
  {
    id: 6,
    name: 'Graduation Certificates',
    price: 34.99,
    category: 'Certificates',
    occasion: 'Graduations',
    image: '🎓',
    description: 'Personalized achievement certificates',
  },
  {
    id: 7,
    name: 'Holiday Gift Tags',
    price: 14.99,
    category: 'Tags',
    occasion: 'Holidays',
    image: '🎄',
    description: 'Custom holiday tags',
  },
  {
    id: 8,
    name: 'Shower Invitation Set',
    price: 44.99,
    category: 'Invitations',
    occasion: 'Baby Shower',
    image: '👶',
    description: 'Complete invitation suite',
  },
];

export default function ShopPage() {
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'name'>('name');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Labels', 'Wrappers', 'Packages', 'Keepsakes', 'Certificates', 'Tags', 'Invitations'];
  const occasions = ['Birthday', 'Baby Shower', 'Graduations', 'Memorials', 'Holidays', 'Events'];

  // Filter and sort
  const handleFilter = () => {
    let results = mockProducts;

    if (selectedCategory) {
      results = results.filter((p) => p.category === selectedCategory);
    }

    if (selectedOccasion) {
      results = results.filter((p) => p.occasion === selectedOccasion);
    }

    if (searchTerm) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(results);
  };

  // Trigger filter on any change
  const handleCategoryChange = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    setFilteredProducts(
      mockProducts.filter((p) => {
        const categoryMatch = !newCategory || p.category === newCategory;
        const occasionMatch = !selectedOccasion || p.occasion === selectedOccasion;
        const searchMatch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && occasionMatch && searchMatch;
      })
    );
  };

  const handleOccasionChange = (occasion: string) => {
    const newOccasion = selectedOccasion === occasion ? null : occasion;
    setSelectedOccasion(newOccasion);
    setFilteredProducts(
      mockProducts.filter((p) => {
        const categoryMatch = !selectedCategory || p.category === selectedCategory;
        const occasionMatch = !newOccasion || p.occasion === newOccasion;
        const searchMatch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && occasionMatch && searchMatch;
      })
    );
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-cc-lilac py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-lora font-bold text-cc-dark mb-2">Shop All Products</h1>
            <p className="text-cc-dark">Browse our complete collection of personalized products</p>
          </div>
        </section>

        {/* Shop Layout */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="bg-cc-lilac rounded-lg p-6 h-fit">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-cc-dark mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilter();
                  }}
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-bold text-cc-dark mb-3">Category</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat}
                          onChange={() => handleCategoryChange(cat)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-cc-dark">{cat}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Occasion Filter */}
              <div className="mb-6">
                <h3 className="font-bold text-cc-dark mb-3">Occasion</h3>
                <ul className="space-y-2">
                  {occasions.map((occ) => (
                    <li key={occ}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOccasion === occ}
                          onChange={() => handleOccasionChange(occ)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-cc-dark">{occ}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-bold text-cc-dark mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    handleFilter();
                  }}
                  className="w-full px-3 py-2 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="md:col-span-3">
              <div className="mb-4 text-sm text-cc-dark">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card">
                    <div className="text-6xl text-center mb-4">{product.image}</div>
                    <h3 className="text-lg font-lora font-bold text-cc-dark mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-cc-lavender mb-2">{product.category}</p>
                    <p className="text-sm text-cc-dark mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-cc-gold font-bold text-lg">${product.price}</span>
                      <Button variant="primary" className="text-sm">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-cc-dark text-lg">No products found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
