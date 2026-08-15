'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutButtonProps {
  priceId: string;
  planName: string;
  buttonText?: string;
  className?: string;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Stripe Checkout Button Component
 * Initiates checkout session and redirects to Stripe
 */
export function StripeCheckoutButton({
  priceId,
  planName,
  buttonText = 'Get Started',
  className = '',
  onSuccess,
  onError,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          metadata: {
            planName,
            source: 'website_pricing',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        onSuccess?.(data.sessionId);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Checkout failed';
      onError?.(message);
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleCheckout}
      disabled={loading}
      className={`flex items-center justify-center gap-2 font-bold transition-all duration-300 ${className} ${
        loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
      }`}
      whileHover={{ scale: loading ? 1 : 1.05 }}
      whileTap={{ scale: loading ? 1 : 0.95 }}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </motion.button>
  );
}

export default StripeCheckoutButton;
