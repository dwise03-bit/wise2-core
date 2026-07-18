/**
 * StripeCheckout Component
 *
 * Handles Stripe checkout flow for subscription upgrades.
 *
 * Usage:
 * ```tsx
 * <StripeCheckout
 *   planId="STARTER"
 *   onSuccess={handleSuccess}
 *   onCancel={handleCancel}
 * />
 * ```
 */

import React, { useState } from 'react';

export interface StripeCheckoutProps {
  planId: string;
  planName?: string;
  monthlyPrice?: number;
  onSuccess?: (sessionId: string) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  isLoading?: boolean;
  className?: string;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planId,
  planName,
  monthlyPrice,
  onSuccess,
  onCancel,
  onError,
  isLoading = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the success and cancel URLs
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${baseUrl}/billing/success`;
      const cancelUrl = `${baseUrl}/billing/cancel`;

      // Call backend to create checkout session
      const response = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('No checkout URL returned from server');
      }

      // Redirect to Stripe checkout
      if (onSuccess) {
        onSuccess(data.sessionId);
      }

      window.location.href = data.url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);

      if (onError) {
        onError(error);
      }

      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`stripe-checkout ${className}`}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {planName && monthlyPrice !== undefined && (
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg">{planName}</h3>
            <p className="text-2xl font-bold mt-2">
              ${monthlyPrice}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </p>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? 'Processing...' : 'Upgrade Now'}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Secure payment powered by Stripe
      </p>
    </div>
  );
};

export default StripeCheckout;
