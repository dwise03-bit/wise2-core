'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

interface CheckoutButtonProps {
  tier: string;
  price: number;
}

export default function CheckoutButton({ tier, price }: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Call create-subscription API
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create subscription');
        setLoading(false);
        return;
      }

      const { subscription_id, client_secret } = await response.json();

      // Load Stripe
      const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
      if (!stripePublicKey) {
        setError('Stripe is not configured');
        setLoading(false);
        return;
      }

      const stripe = await loadStripe(stripePublicKey);
      if (!stripe) {
        setError('Failed to initialize Stripe');
        setLoading(false);
        return;
      }

      // Redirect to Stripe hosted checkout
      window.location.href = `/checkout?subscription_id=${subscription_id}&client_secret=${client_secret}`;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : `Subscribe - $${price}/month`}
      </button>
      {error && <p className="text-neon-red text-sm">{error}</p>}
    </div>
  );
}
