'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        setCart(JSON.parse(cartData));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3E8FF', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#6D2DBD',
            marginBottom: '10px',
            fontFamily: 'Lora, serif',
          }}>
            Order Review
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Review your items and complete payment
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              Your cart is empty
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: '#6D2DBD',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
            {/* Cart Items */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#6D2DBD',
                marginBottom: '20px',
              }}>
                Cart Items ({cart.length})
              </h2>

              {cart.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #eee',
                    marginBottom: '15px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#29233D' }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginTop: '5px',
                    }}>
                      Qty: {item.quantity || 1} × ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#D4AF37',
                      minWidth: '80px',
                      textAlign: 'right',
                    }}>
                      ${(item.price * (item.quantity || 1)).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      style={{
                        backgroundColor: '#fee',
                        color: '#c33',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              height: 'fit-content',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#6D2DBD',
                marginBottom: '20px',
              }}>
                Order Summary
              </h3>

              <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Tax (8%)</span>
                  <span style={{ fontWeight: '600' }}>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#29233D' }}>
                  Total
                </span>
                <span style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#D4AF37',
                }}>
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#999' : '#6D2DBD',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Processing...' : 'Complete Purchase'}
              </button>

              <p style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '15px',
                textAlign: 'center',
              }}>
                💳 Powered by Stripe
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
