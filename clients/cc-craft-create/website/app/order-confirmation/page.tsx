'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');
    setSessionId(id);

    if (!id) {
      setLoading(false);
      return;
    }

    const mockOrder = {
      id: `ord_${id?.slice(0, 8)}`,
      date: new Date().toLocaleDateString(),
      total: '$123.45',
      email: 'customer@example.com',
      status: 'confirmed',
    };

    setOrderDetails(mockOrder);
    localStorage.removeItem('cart');
    setLoading(false);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3E8FF', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Processing your order...</p>
          </div>
        ) : !sessionId ? (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '28px',
              color: '#c33',
              marginBottom: '15px',
              fontFamily: 'Lora, serif',
            }}>
              ⚠️ Order Not Found
            </h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              We couldn't find your order. Please check your email for order details.
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: '#6D2DBD',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Return Home
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✓</div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#6D2DBD',
              marginBottom: '10px',
              fontFamily: 'Lora, serif',
            }}>
              Thank You!
            </h1>

            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '30px',
            }}>
              Your order has been confirmed and is being prepared.
            </p>

            <div style={{
              backgroundColor: '#F3E8FF',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              textAlign: 'left',
            }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                  Order Number
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#29233D',
                  fontFamily: 'monospace',
                }}>
                  {orderDetails?.id}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                  Order Date
                </div>
                <div style={{ fontSize: '16px', color: '#29233D', fontWeight: '500' }}>
                  {orderDetails?.date}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                  Confirmation Email
                </div>
                <div style={{ fontSize: '16px', color: '#29233D', fontWeight: '500' }}>
                  {orderDetails?.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                  Total Amount
                </div>
                <div style={{
                  fontSize: '24px',
                  color: '#D4AF37',
                  fontWeight: 'bold',
                }}>
                  {orderDetails?.total}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              textAlign: 'left',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#6D2DBD',
                marginBottom: '10px',
              }}>
                What Happens Next?
              </h3>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                <li style={{ marginBottom: '8px' }}>We'll send a confirmation email</li>
                <li style={{ marginBottom: '8px' }}>Your custom items will be carefully crafted</li>
                <li style={{ marginBottom: '8px' }}>You'll receive tracking info when it ships</li>
                <li>Enjoy your personalized creation!</li>
              </ol>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  backgroundColor: '#6D2DBD',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Continue Shopping
              </button>
              <button
                onClick={() => window.location.href = 'mailto:hello@ccraftandcreate.com'}
                style={{
                  backgroundColor: 'white',
                  color: '#6D2DBD',
                  border: '2px solid #6D2DBD',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Contact Us
              </button>
            </div>

            <p style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '20px',
            }}>
              ❤️ Thank you for supporting CC Craft & Create Studio!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
