'use client';

import { useState, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  emoji: string;
  category: 'merch' | 'dtf' | '3d';
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const mockProducts: Product[] = [
  // Ready-Made (12)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `merch-${i + 1}`,
    name: `T-Shirt ${i + 1}`,
    desc: 'Premium cotton blend',
    price: 24.99 + i * 2,
    emoji: '👕',
    category: 'merch' as const,
  })),
  // DTF Templates (8)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `dtf-${i + 1}`,
    name: `DTF Design ${i + 1}`,
    desc: 'Custom print template',
    price: 12.99 + i * 1.5,
    emoji: '🎨',
    category: 'dtf' as const,
  })),
  // 3D Designs (8)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `3d-${i + 1}`,
    name: `3D Model ${i + 1}`,
    desc: 'Ready to print',
    price: 19.99 + i * 2.5,
    emoji: '🎯',
    category: '3d' as const,
  })),
];

const garments = [
  { name: 'T-Shirt', price: 0 },
  { name: 'Hoodie', price: 12 },
  { name: 'Sweatshirt', price: 10 },
  { name: 'Polo', price: 8 },
];

const materials = [
  { name: 'PLA Standard', upcharge: 0 },
  { name: 'PETG', upcharge: 5 },
  { name: 'TPU Flexible', upcharge: 8 },
  { name: 'Resin Premium', upcharge: 15 },
];

export default function WebstorePage() {
  const [section, setSection] = useState<'merch' | 'dtf' | '3d'>('merch');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState('T-Shirt');
  const [selectedMaterial, setSelectedMaterial] = useState('PLA Standard');

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(
      (p) => p.category === section && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [section, searchQuery]);

  const addToCart = (productId: string, category: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { id: productId, name: product.name, price: product.price, quantity: 1, category }];
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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(57,255,20,.1)', background: 'linear-gradient(180deg,rgba(57,255,20,.06),rgba(57,255,20,.02))', padding: '16px 32px', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '18px', color: '#39FF14', letterSpacing: '4px', fontWeight: 900 }}>WISE2</div>
            <div style={{ height: '24px', width: '1px', background: 'linear-gradient(180deg,transparent,rgba(57,255,20,.3),transparent)' }}></div>
            <div style={{ fontSize: '12px', color: '#bbb' }}>Custom Merch</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', background: 'linear-gradient(135deg,#050505,#0a0a0a)', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
          {!showCart ? (
            <>
              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid rgba(57,255,20,.1)', paddingBottom: '16px', overflowX: 'auto' }}>
                {[
                  { id: 'merch', label: 'Ready-Made' },
                  { id: 'dtf', label: 'DTF Printing' },
                  { id: '3d', label: '3D Printing' },
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

              {/* Ready-Made Section */}
              {section === 'merch' && (
                <>
                  <h1 style={{ margin: '0 0 24px', fontSize: '32px', fontWeight: 900, color: '#fff' }}>Ready-Made Collection</h1>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
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
                        }}
                      >
                        <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg,rgba(57,255,20,.1),rgba(57,255,20,.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', borderBottom: '1px solid rgba(57,255,20,.1)' }}>
                          {product.emoji}
                        </div>
                        <div style={{ padding: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 700 }}>{product.name}</h3>
                          <p style={{ margin: '4px 0', fontSize: '10px', color: '#888' }}>{product.desc}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <span style={{ color: '#39FF14', fontWeight: 900 }}>${product.price.toFixed(2)}</span>
                            <button
                              onClick={() => addToCart(product.id, product.category)}
                              style={{
                                background: '#39FF14',
                                color: '#050505',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '5px 10px',
                                fontSize: '9px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                transition: 'filter 0.2s',
                              }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* DTF Printing Section */}
              {section === 'dtf' && (
                <>
                  <h1 style={{ margin: '0 0 24px', fontSize: '32px', fontWeight: 900, color: '#fff' }}>DTF Custom Printing</h1>
                  <p style={{ margin: '0 0 32px', fontSize: '12px', color: '#888' }}>Direct-to-Fabric printing on apparel. Choose from templates or upload your design.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    {/* Design Upload */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg,rgba(57,255,20,.04),rgba(57,255,20,.01))',
                        border: '2px dashed rgba(57,255,20,.3)',
                        borderRadius: '12px',
                        padding: '32px',
                        backdropFilter: 'blur(8px)',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎨</div>
                      <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: '#fff', fontWeight: 700 }}>Upload Your Design</h3>
                      <p style={{ margin: '0 0 16px', fontSize: '10px', color: '#888' }}>PNG, JPG, SVG • Max 10MB</p>
                      <button
                        style={{
                          background: '#39FF14',
                          color: '#050505',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '11px',
                          transition: 'filter 0.2s',
                        }}
                      >
                        Choose File
                      </button>
                    </div>

                    {/* Garment Selection */}
                    <div style={{ background: 'linear-gradient(135deg,rgba(57,255,20,.04),rgba(57,255,20,.01))', border: '1px solid rgba(57,255,20,.15)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(8px)' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '12px', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>Select Garment</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {garments.map((g) => (
                          <label key={g.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', background: 'rgba(57,255,20,.05)', border: '1px solid rgba(57,255,20,.1)', borderRadius: '6px', transition: 'all 0.3s' }}>
                            <input
                              type="radio"
                              name="dtf-garment"
                              checked={selectedGarment === g.name}
                              onChange={() => setSelectedGarment(g.name)}
                              style={{ cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>{g.name}</div>
                              <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>${g.price}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* DTF Products Grid */}
                  <h2 style={{ margin: '0 0 16px', fontSize: '14px', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Templates</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
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
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                      >
                        <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg,rgba(57,255,20,.1),rgba(57,255,20,.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', borderBottom: '1px solid rgba(57,255,20,.1)' }}>
                          {product.emoji}
                        </div>
                        <div style={{ padding: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '11px', color: '#fff', fontWeight: 700 }}>{product.name}</h4>
                          <button
                            onClick={() => addToCart(product.id, product.category)}
                            style={{
                              width: '100%',
                              background: '#39FF14',
                              color: '#050505',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '6px',
                              marginTop: '8px',
                              fontSize: '9px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              transition: 'filter 0.2s',
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 3D Printing Section */}
              {section === '3d' && (
                <>
                  <h1 style={{ margin: '0 0 24px', fontSize: '32px', fontWeight: 900, color: '#fff' }}>3D Printing Service</h1>
                  <p style={{ margin: '0 0 32px', fontSize: '12px', color: '#888' }}>Custom 3D printed products. Submit your model or choose from designs.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    {/* Model Upload */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg,rgba(57,255,20,.04),rgba(57,255,20,.01))',
                        border: '2px dashed rgba(57,255,20,.3)',
                        borderRadius: '12px',
                        padding: '32px',
                        backdropFilter: 'blur(8px)',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                      <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: '#fff', fontWeight: 700 }}>Upload 3D Model</h3>
                      <p style={{ margin: '0 0 16px', fontSize: '10px', color: '#888' }}>STL, OBJ • Max 50MB</p>
                      <button
                        style={{
                          background: '#39FF14',
                          color: '#050505',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '11px',
                          transition: 'filter 0.2s',
                        }}
                      >
                        Upload Model
                      </button>
                    </div>

                    {/* Material Selection */}
                    <div style={{ background: 'linear-gradient(135deg,rgba(57,255,20,.04),rgba(57,255,20,.01))', border: '1px solid rgba(57,255,20,.15)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(8px)' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '12px', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>Material & Finish</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {materials.map((mat) => (
                          <label key={mat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', background: 'rgba(57,255,20,.05)', border: '1px solid rgba(57,255,20,.1)', borderRadius: '6px', transition: 'all 0.3s' }}>
                            <input
                              type="radio"
                              name="material"
                              checked={selectedMaterial === mat.name}
                              onChange={() => setSelectedMaterial(mat.name)}
                              style={{ cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>{mat.name}</div>
                              <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>+${mat.upcharge}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3D Products Grid */}
                  <h2 style={{ margin: '0 0 16px', fontSize: '14px', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Designs</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
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
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                      >
                        <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg,rgba(57,255,20,.1),rgba(57,255,20,.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', borderBottom: '1px solid rgba(57,255,20,.1)' }}>
                          {product.emoji}
                        </div>
                        <div style={{ padding: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '11px', color: '#fff', fontWeight: 700 }}>{product.name}</h4>
                          <button
                            onClick={() => addToCart(product.id, product.category)}
                            style={{
                              width: '100%',
                              background: '#39FF14',
                              color: '#050505',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '6px',
                              marginTop: '8px',
                              fontSize: '9px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              transition: 'filter 0.2s',
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            /* Cart View */
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h1 style={{ margin: '0 0 24px', fontSize: '32px', fontWeight: 900, color: '#fff' }}>Shopping Cart</h1>

              {cart.length === 0 ? (
                <div style={{ background: 'rgba(57,255,20,.05)', border: '1px solid rgba(57,255,20,.15)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
                  <p style={{ fontSize: '16px', color: '#888' }}>Your cart is empty</p>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'rgba(57,255,20,.1)', border: '1px solid rgba(57,255,20,.2)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', color: '#39FF14', fontWeight: 700 }}>
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            style={{ width: '40px', textAlign: 'center', background: 'rgba(57,255,20,.08)', border: '1px solid rgba(57,255,20,.15)', borderRadius: '4px', color: '#fff', outline: 'none' }}
                          />
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'rgba(57,255,20,.1)', border: '1px solid rgba(57,255,20,.2)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', color: '#39FF14', fontWeight: 700 }}>
                            +
                          </button>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: 'rgba(244,67,54,.1)', border: '1px solid rgba(244,67,54,.2)', borderRadius: '4px', padding: '6px 12px', color: '#f44336', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>
                            Remove
                          </button>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#39FF14', fontWeight: 900 }}>${(item.price * item.quantity).toFixed(2)}</div>
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
                      onClick={() => alert('Proceeding to checkout...')}
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
                        transition: 'filter 0.2s',
                      }}
                    >
                      Proceed to Checkout
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
                        transition: 'all 0.2s',
                      }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
