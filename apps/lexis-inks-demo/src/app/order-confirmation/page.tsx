'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('id');
  const [order, setOrder] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (orderId && typeof window !== 'undefined') {
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = orders.find((o: any) => o.id === orderId);
        setOrder(foundOrder || {
          id: orderId,
          name: 'Guest',
          email: 'guest@example.com',
          totalPrice: 0,
          status: 'new',
          penColor: 'navy',
          topper: 'crystal',
          theme: 'classic',
          quantity: 1,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [orderId]);

  if (!mounted) {
    return <div className="bg-navy min-h-screen" />;
  }

  if (!order) {
    return (
      <main className="bg-navy min-h-screen flex items-center justify-center p-4 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Order Confirmation</h1>
          <p className="text-silver-dark mt-4">No order found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-navy min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-cyan to-blue rounded-lg p-8 text-navy mb-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-2">Thank You!</h1>
          <p className="text-lg opacity-90">Your custom pen order has been received.</p>
        </div>

        <div className="bg-navy-light rounded-lg p-8 border border-navy-light text-white mb-8">
          <h2 className="text-2xl font-bold mb-6 text-cyan">Order Details</h2>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-navy">
            <div>
              <p className="text-sm text-silver-dark mb-1">Order ID</p>
              <p className="font-mono text-cyan font-bold">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-silver-dark mb-1">Status</p>
              <p className="capitalize text-blue font-bold">{order.status || 'new'}</p>
            </div>
            <div>
              <p className="text-sm text-silver-dark mb-1">Customer</p>
              <p>{order.name || 'Guest'}</p>
            </div>
            <div>
              <p className="text-sm text-silver-dark mb-1">Total Amount</p>
              <p className="text-cyan font-bold text-lg">${(order.totalPrice || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-silver-dark mb-2">Pen Specifications</p>
              <div className="bg-navy rounded p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-silver-dark">Color:</span>
                  <span className="capitalize">{order.penColor || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver-dark">Topper:</span>
                  <span className="capitalize">{order.topper || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver-dark">Theme:</span>
                  <span className="capitalize">{order.theme || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver-dark">Quantity:</span>
                  <span>{order.quantity || 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="flex-1 px-6 py-4 bg-blue hover:bg-blue-light text-white rounded-lg font-bold text-center transition">
            Back to Home
          </Link>
          <Link href="/dashboard" className="flex-1 px-6 py-4 border-2 border-cyan hover:bg-cyan/10 text-cyan rounded-lg font-bold text-center transition">
            Owner Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={<div className="bg-navy min-h-screen" />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
