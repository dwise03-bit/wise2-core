'use client';

import { useState, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  emoji: string;
  category: 'ready-made' | 'dtf' | '3d';
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
  specs: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

const mockProducts: Product[] = [
  // Ready-Made (12)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `ready-${i + 1}`,
    name: `Premium T-Shirt ${i + 1}`,
    desc: 'High-quality cotton blend',
    price: 24.99 + i * 2,
    emoji: '👕',
    category: 'ready-made' as const,
    images: ['🎨', '👕', '✨'],
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 50) + 10,
    inStock: true,
    description: 'Premium comfort t-shirt with custom WISE² branding',
    specs: ['100% Cotton', 'Machine Washable', 'Available in S-XXL'],
  })),
  // DTF Templates (12)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `dtf-${i + 1}`,
    name: `DTF Design Template ${i + 1}`,
    desc: 'Direct-to-fabric print',
    price: 12.99 + i * 1.5,
    emoji: '🎨',
    category: 'dtf' as const,
    images: ['🎨', '👕', '🖼️'],
    rating: 4.3 + Math.random() * 0.7,
    reviews: Math.floor(Math.random() * 40) + 5,
    inStock: true,
    description: 'Ready-to-use DTF template for custom apparel printing',
    specs: ['High Resolution', 'Color Separated', 'Commercial License'],
  })),
  // 3D Designs (12)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `3d-${i + 1}`,
    name: `3D Printed Design ${i + 1}`,
    desc: 'Ready to print model',
    price: 19.99 + i * 2.5,
    emoji: '🎯',
    category: '3d' as const,
    images: ['🎯', '🖼️', '✨'],
    rating: 4.2 + Math.random() * 0.8,
    reviews: Math.floor(Math.random() * 35) + 8,
    inStock: true,
    description: '3D-printable model with professional finish',
    specs: ['STL Format', 'Optimized for Printing', 'Scale Guide Included'],
  })),
];

const mockReviews: Record<string, Review[]> = {
  'ready-1': [
    { id: '1', author: 'Alex', rating: 5, text: 'Perfect fit and quality!', date: '2 days ago' },
    { id: '2', author: 'Jordan', rating: 4, text: 'Great shirt, fast shipping', date: '1 week ago' },
  ],
  'dtf-1': [
    { id: '1', author: 'Sam', rating: 5, text: 'Amazing design quality', date: '3 days ago' },
  ],
};

export default function ShopPage() {
  const [section, setSection] = useState<'ready-made' | 'dtf' | '3d'>('ready-made');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('rating');

  const filteredProducts = useMemo(() => {
    let products = mockProducts.filter((p) => p.category === section && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase())));

    // Sort
    if (sortBy === 'price-low') {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      products = [...products].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      products = [...products].sort((a, b) => b.rating - a.rating);
    }

    return products;
  }, [section, searchQuery, sortBy]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, category: product.category }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const calculateTotal = (subtotal: number) => {
    const tax = subtotal * 0.08;
    const shipping = 8;
    return { subtotal, tax, shipping, total: subtotal + tax + shipping };
  };
  const totals = calculateTotal(cartTotal);

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', fontFamily: "'Rajdhani', sans-serif", color: '#e6e6e6' }}>
      <style>{`
        @keyframes w2enter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes w2glow {
          0% { box-shadow: 0 0 8px rgba(57, 255, 20, 0.2); }
          50% { box-shadow: 0 0 24px rgba(57, 255, 20, 0.6); }
          100% { box-shadow: 0 0 8px rgba(57, 255, 20, 0.2); }
        }
        @keyframes w2bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(57,255,20,.1)', background: 'linear-gradient(180deg,rgba(57,255,20,.06),rgba(57,255,20,.02))', padding: '16px 32px', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '18px', color: '#39FF14', letterSpacing: '4px', fontWeight: 900 }}>WISE2</div>
            <div style={{ height: '24px', width: '1px', background: 'linear-gradient(180deg,transparent,rgba(57,255,20,.3),transparent)' }}></div>
            <div style={{ fontSize: '12px', color: '#bbb' }}>Premium Shop</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              style={{
                background: 'rgba(57,255,20,.06)',
                border: '1px solid rgba(57,255,20,.15)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#ddd',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '11px',
                width: '200px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setShowCart(!showCart)}
              style={{
                background: 'rgba(57,255,20,.06)',
                border: '1px solid rgba(57,255,20,.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#39FF14',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🛒 {cartCount}
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                background: wishlist.size > 0 ? 'rgba(255, 107, 107, 0.1)' : 'rgba(57,255,20,.06)',
                border: wishlist.size > 0 ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid rgba(57,255,20,.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: wishlist.size > 0 ? '#ff6b6b' : '#bbb',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ❤️ {wishlist.size}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', background: 'linear-gradient(135deg,#050505,#0a0a0a)', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
          {!showCart && !selectedProduct ? (
            <>
              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid rgba(57,255,20,.1)', paddingBottom: '16px', overflowX: 'auto' }}>
                {[
                  { id: 'ready-made', label: 'Ready-Made (12)' },
                  { id: 'dtf', label: 'DTF Printing (12)' },
                  { id: '3d', label: '3D Printing (12)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSection(tab.id as any)}
                    style={{
                      background: section === tab.id ? 'rgba(57,255,20,.15)' : 'transparent',
                      border: `1px solid ${section === tab.id ? 'rgba(57,255,20,.3)' : 'rgba(57,255,20,.1)'}`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: section === tab.id ? '#39FF14' : '#bbb',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>Browse Collection</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    background: 'rgba(57,255,20,.08)',
                    border: '1px solid rgba(57,255,20,.15)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ddd',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '11px',
                    outline: 'none',
                  }}
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Products Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      background: 'linear-gradient(135deg,rgba(57,255,20,.04),rgba(57,255,20,.01))',
                      border: '1px solid rgba(57,255,20,.15)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backdropFilter: 'blur(8px)',
                      animation: 'w2enter 0.8s ease',
                      transition: 'all 0.3s',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg,transparent,rgba(57,255,20,.05),transparent)',
                        animation: 'w2glow 3s ease infinite',
                        pointerEvents: 'none',
                      }}
                    ></div>

                    {/* Product Image */}
                    <div
                      style={{
                        aspectRatio: '1',
                        background: 'linear-gradient(135deg,rgba(57,255,20,.1),rgba(57,255,20,.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '64px',
                        borderBottom: '1px solid rgba(57,255,20,.1)',
                        animation: 'w2bounce 2s ease-in-out infinite',
                      }}
                    >
                      {product.emoji}
                    </div>

                    <div style={{ padding: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 700 }}>{product.name}</h3>
                      <p style={{ margin: '4px 0', fontSize: '10px', color: '#888' }}>{product.desc}</p>

                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#ffc107' }}>⭐ {product.rating.toFixed(1)}</span>
                        <span style={{ fontSize: '9px', color: '#666' }}>({product.reviews})</span>
                      </div>

                      {/* Price and Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#39FF14', fontWeight: 900, fontSize: '13px' }}>${product.price.toFixed(2)}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            style={{
                              background: wishlist.has(product.id) ? 'rgba(255, 107, 107, 0.2)' : 'rgba(57,255,20,.05)',
                              border: wishlist.has(product.id) ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid rgba(57,255,20,.1)',
                              borderRadius: '5px',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'all 0.2s',
                            }}
                          >
                            {wishlist.has(product.id) ? '❤️' : '🤍'}
                          </button>
                          <button
                            onClick={() => setSelectedProduct(product)}
                            style={{
                              background: '#39FF14',
                              color: '#050505',
                              border: 'none',
                              borderRadius: '5px',
                              flex: 1,
                              padding: '6px 8px',
                              fontSize: '9px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              transition: 'filter 0.2s',
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : showCart ? (
            /* Cart View */
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h1 style={{ margin: '0 0 24px', fontSize: '32px', fontWeight: 900, color: '#fff' }}>Shopping Cart</h1>

              {cart.length === 0 ? (
                <div style={{ background: 'rgba(57,255,20,.05)', border: '1px solid rgba(57,255,20,.15)', borderRadius: '12px', padding: '60px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '56px', marginBottom: '12px' }}>🛒</div>
                  <p style={{ fontSize: '16px', color: '#888', margin: 0 }}>Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    style={{
                      marginTop: '16px',
                      background: '#39FF14',
                      color: '#050505',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ background: 'linear-gradient(135deg,rgba(57,255,20,.04),rgba(57,255,20,.01))', border: '1px solid rgba(57,255,20,.15)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>{item.name}</div>
                          <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>${item.price.toFixed(2)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'rgba(57,255,20,.1)', border: '1px solid rgba(57,255,20,.2)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', color: '#39FF14', fontWeight: 700 }}>
                              −
                            </button>
                            <span style={{ width: '30px', textAlign: 'center', fontSize: '11px' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'rgba(57,255,20,.1)', border: '1px solid rgba(57,255,20,.2)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', color: '#39FF14', fontWeight: 700 }}>
                              +
                            </button>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}>
                            <div style={{ color: '#39FF14', fontWeight: 900, fontSize: '12px' }}>${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: 'rgba(244,67,54,.1)',
                              border: '1px solid rgba(244,67,54,.2)',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              color: '#f44336',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div style={{ background: 'linear-gradient(135deg,rgba(57,255,20,.06),rgba(57,255,20,.01))', border: '1px solid rgba(57,255,20,.15)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fff', fontWeight: 700 }}>Order Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span>Tax (8%):</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(57,255,20,.15)' }}>
                      <span>Shipping:</span>
                      <span>${totals.shipping.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#39FF14' }}>
                      <span>Total:</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => alert('Proceeding to secure checkout...')}
                      style={{
                        flex: 1,
                        background: '#39FF14',
                        color: '#050505',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Secure Checkout
                    </button>
                    <button
                      onClick={() => setShowCart(false)}
                      style={{
                        flex: 1,
                        background: 'rgba(57,255,20,.1)',
                        border: '1px solid rgba(57,255,20,.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        color: '#39FF14',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : selectedProduct ? (
            /* Product Detail View */
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: 'rgba(57,255,20,.1)',
                  border: '1px solid rgba(57,255,20,.2)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#39FF14',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginBottom: '24px',
                }}
              >
                ← Back to Products
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                {/* Product Image */}
                <div
                  style={{
                    background: 'linear-gradient(135deg,rgba(57,255,20,.08),rgba(57,255,20,.02))',
                    border: '1px solid rgba(57,255,20,.15)',
                    borderRadius: '12px',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '128px',
                  }}
                >
                  {selectedProduct.emoji}
                </div>

                {/* Product Details */}
                <div>
                  <h1 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 900, color: '#fff' }}>{selectedProduct.name}</h1>

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px', color: '#ffc107' }}>⭐ {selectedProduct.rating.toFixed(1)}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>({selectedProduct.reviews} reviews)</span>
                  </div>

                  <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#bbb', lineHeight: '1.6' }}>{selectedProduct.description}</p>

                  {/* Price */}
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#39FF14', marginBottom: '24px' }}>${selectedProduct.price.toFixed(2)}</div>

                  {/* Specs */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '12px', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Specifications</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {selectedProduct.specs.map((spec, i) => (
                        <li key={i} style={{ fontSize: '11px', color: '#ddd', marginBottom: '6px' }}>
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Add to Cart */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        alert('Added to cart!');
                      }}
                      style={{
                        flex: 1,
                        background: '#39FF14',
                        color: '#050505',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      style={{
                        background: wishlist.has(selectedProduct.id) ? 'rgba(255, 107, 107, 0.2)' : 'rgba(57,255,20,.08)',
                        border: wishlist.has(selectedProduct.id) ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid rgba(57,255,20,.15)',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        color: wishlist.has(selectedProduct.id) ? '#ff6b6b' : '#bbb',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '18px',
                      }}
                    >
                      {wishlist.has(selectedProduct.id) ? '❤️' : '🤍'}
                    </button>
                  </div>

                  {/* Reviews Section */}
                  <div style={{ borderTop: '1px solid rgba(57,255,20,.15)', paddingTop: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fff', fontWeight: 700 }}>Customer Reviews</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(mockReviews[selectedProduct.id] || []).map((review) => (
                        <div key={review.id} style={{ background: 'rgba(57,255,20,.05)', border: '1px solid rgba(57,255,20,.1)', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{review.author}</div>
                              <div style={{ fontSize: '12px', color: '#ffc107', marginTop: '2px' }}>{'⭐'.repeat(review.rating)}</div>
                            </div>
                            <div style={{ fontSize: '9px', color: '#666' }}>{review.date}</div>
                          </div>
                          <p style={{ margin: 0, fontSize: '10px', color: '#ddd' }}>{review.text}</p>
                        </div>
                      ))}
                      {(mockReviews[selectedProduct.id] || []).length === 0 && <p style={{ fontSize: '11px', color: '#666' }}>No reviews yet. Be the first to review!</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
