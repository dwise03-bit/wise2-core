'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { PageHero } from '@/components/PageHero';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    date: string;
    total: string;
    email: string;
    demo: boolean;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const sessionId = searchParams.get('session_id');
    const isDemo = searchParams.get('demo') === 'true';

    if (!sessionId && !isDemo) return;

    setOrderDetails({
      id: isDemo ? `CC-DEMO-${Date.now()}` : `CC-${sessionId?.slice(0, 8) ?? 'ORDER'}`,
      date: new Date().toLocaleDateString(),
      total: 'See email confirmation',
      email: isDemo ? 'demo@ccraftandcreate.com' : 'customer@example.com',
      demo: isDemo,
    });
  }, [searchParams]);

  if (!mounted) return null;

  const hasOrder = searchParams.get('session_id') || searchParams.get('demo') === 'true';

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          title={hasOrder ? 'Thank You!' : 'Order Not Found'}
          subtitle={
            hasOrder
              ? 'Your order has been received and is being prepared with care.'
              : 'We could not find your order details.'
          }
        />

        <div className="max-w-2xl mx-auto px-4 py-10">
          {!hasOrder ? (
            <div className="cc-card p-8 text-center">
              <p className="text-cc-dark/70 mb-6">Please check your email for order details.</p>
              <Link href="/">
                <Button>Return Home</Button>
              </Link>
            </div>
          ) : (
            <div className="cc-card p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cc-lilac text-cc-purple flex items-center justify-center text-3xl">
                  ✓
                </div>
                <p className="text-cc-dark/80">
                  {orderDetails?.demo
                    ? 'Demo order complete — no payment was processed.'
                    : 'A confirmation email is on its way.'}
                </p>
              </div>

              <div className="bg-cc-lilac rounded-xl p-5 space-y-4 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-wide text-cc-dark/50">Order Number</p>
                  <p className="font-mono font-bold text-cc-dark">{orderDetails?.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-cc-dark/50">Order Date</p>
                  <p className="font-semibold text-cc-dark">{orderDetails?.date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-cc-dark/50">Confirmation Email</p>
                  <p className="font-semibold text-cc-dark">{orderDetails?.email}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-lora font-bold text-cc-purple mb-3">What Happens Next?</h3>
                <ol className="list-decimal list-inside space-y-2 text-cc-dark/80 text-sm">
                  <li>We review your order details and customization notes.</li>
                  <li>You receive a design proof to approve.</li>
                  <li>We create your order with care and quality.</li>
                  <li>Pickup or delivery — made with love, just for you.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/shop">
                  <Button className="w-full">Continue Shopping</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">Contact CC</Button>
                </Link>
              </div>

              <p className="text-center text-sm text-cc-dark/50 mt-6">
                Thank you for supporting CC Craft & Create Studio!
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cc-lilac" />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
