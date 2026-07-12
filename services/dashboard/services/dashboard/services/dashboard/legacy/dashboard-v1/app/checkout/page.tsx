'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

function CheckoutContentInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'cancelled' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const subscriptionId = searchParams?.get('subscription_id');
    const clientSecret = searchParams?.get('client_secret');

    if (!subscriptionId || !clientSecret) {
      setStatus('error');
      setMessage('Missing payment information. Please try again.');
      return;
    }

    const timer = setTimeout(() => {
      setStatus('success');
      setMessage('Your subscription is now active!');
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 bg-gray-900">
      <div className="max-w-md w-full">
        {status === 'processing' && (
          <div className="bg-black rounded-2xl p-8 text-center border border-gray-800">
            <div className="mb-6">
              <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Processing Payment</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Please don't close this page...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-black rounded-2xl p-8 text-center border border-green-200">
            <div className="mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-gray-400 mb-6">
              Your subscription is now active. You have access to all premium features including 1-on-1 coaching, personalized drills, and priority support.
            </p>
            <div className="space-y-3">
              <Link href="/dashboard">
                <button className="w-full btn-primary">Go to Dashboard</button>
              </Link>
              <Link href="/booking">
                <button className="w-full btn-secondary">Book a Session</button>
              </Link>
            </div>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="bg-black rounded-2xl p-8 text-center border border-gray-800">
            <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-gray-400 mb-6">Your subscription was not completed. No charges were made.</p>
            <Link href="/pricing">
              <button className="w-full btn-primary">Return to Pricing</button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-black rounded-2xl p-8 text-center border border-red-200">
            <div className="mb-6">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Error</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link href="/pricing">
              <button className="w-full btn-primary">Try Again</button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function CheckoutContent() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <CheckoutContentInner />
    </Suspense>
  );
}

export default function CheckoutPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 h-16 flex items-center">
        <Link href="/" className="text-xl font-bold text-white">
          Wise Defense
        </Link>
      </header>

      <CheckoutContent />
    </main>
  );
}
