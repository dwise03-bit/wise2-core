'use client';

/**
 * BillingPortalButton Component
 * Button to access Stripe billing portal for subscription management
 */

import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { getBillingPortalSession } from '../../lib/stripe-service';

interface BillingPortalButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function BillingPortalButton({ variant = 'secondary', size = 'md' }: BillingPortalButtonProps) {
  const { subscription, tier } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for paid tiers
  if (tier === 'free' || subscription?.status !== 'active') {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBillingPortalSession();
      if (response.url) {
        window.open(response.url, '_blank');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open billing portal';
      setError(message);
      console.error('Billing portal error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700',
    ghost: 'text-gray-400 hover:text-gray-300',
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          rounded font-medium transition-all
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            Loading...
          </>
        ) : (
          '💳 Manage Billing'
        )}
      </button>
      {error && (
        <div className="mt-2 text-xs text-red-400">{error}</div>
      )}
    </>
  );
}

export default BillingPortalButton;
