'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Stripe from 'stripe';
import { CheckCircle } from 'lucide-react';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '', {
  apiVersion: '2023-10-16',
});

interface SessionData {
  customer_email?: string;
  payment_status: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session found');
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sencere/session/${sessionId}`);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setSession(data);
        }
      } catch (err) {
        setError('Failed to fetch order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0369A1] mx-auto mb-4"></div>
          <p className="font-montserrat text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-cormorant text-4xl font-bold text-white mb-4">
            {error || 'Order Not Found'}
          </h1>
          <p className="font-montserrat text-gray-400 mb-6">
            We couldn&apos;t find your order. Please check your email or contact support.
          </p>
          <a
            href="/sencere/products"
            className="inline-block px-8 py-3 bg-[#0369A1] text-white rounded-lg font-montserrat font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-12 border border-gray-800 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="font-cormorant text-4xl font-bold text-white mb-2">
            Order Confirmed!
          </h1>
          
          <p className="font-montserrat text-gray-400 mb-8">
            Thank you for your order. A confirmation email has been sent to{' '}
            <span className="text-white font-semibold">{session.customer_email}</span>
          </p>

          <div className="bg-[#0F172A] rounded-lg p-6 mb-8 border border-gray-800">
            <p className="font-montserrat text-sm text-gray-400 mb-2">Order Status</p>
            <p className="font-montserrat text-xl font-semibold text-green-500 capitalize">
              {session.payment_status === 'paid' ? 'Payment Successful' : session.payment_status}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <p className="font-montserrat text-gray-400">
              We&apos;re processing your order and will send you shipping updates via email.
            </p>
            <p className="font-montserrat text-sm text-gray-500">
              Typical turnaround time is 3-5 business days.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <a
              href="/sencere/products"
              className="px-8 py-3 bg-[#0369A1] text-white rounded-lg font-montserrat font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </a>
            <a
              href="/sencere"
              className="px-8 py-3 bg-gray-800 text-white rounded-lg font-montserrat font-semibold hover:bg-gray-700 transition-colors"
            >
              Back Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
