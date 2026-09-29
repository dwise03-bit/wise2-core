/**
 * useSubscription Hook
 * Convenience hook for subscription and billing operations
 */

import { useCallback, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { SubscriptionTier } from '../types/subscription';
import {
  createCheckoutSession,
  getBillingPortalSession,
  cancelSubscription as apiCancelSubscription,
  reactivateSubscription as apiReactivateSubscription,
} from '../lib/stripe-service';

export interface UseSubscriptionReturn {
  tier: SubscriptionTier;
  subscription: any;
  isLoading: boolean;
  error: string | null;

  // Methods
  startCheckout: (tier: SubscriptionTier) => Promise<void>;
  openBillingPortal: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  canUseFeature: (feature: string) => boolean;
  clearError: () => void;
}

/**
 * Hook for managing subscriptions
 */
export function useSubscription(): UseSubscriptionReturn {
  const {
    tier,
    subscription,
    canUseFeature,
    upgradeToPro,
    upgradeToEnterprise,
    clearError: clearAuthError,
  } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (targetTier: SubscriptionTier) => {
      setIsLoading(true);
      setError(null);

      try {
        if (targetTier === 'free') {
          // Can't upgrade to free
          throw new Error('Cannot upgrade to free tier');
        }

        // In MVP, just update locally
        if (targetTier === 'pro') {
          await upgradeToPro();
        } else if (targetTier === 'enterprise') {
          await upgradeToEnterprise();
        }

        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Checkout failed';
        setError(message);
        setIsLoading(false);
        throw err;
      }
    },
    [upgradeToPro, upgradeToEnterprise]
  );

  const openBillingPortal = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBillingPortalSession();
      if (response.url) {
        window.open(response.url, '_blank');
      }
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open billing portal';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await apiCancelSubscription();
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cancellation failed';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const reactivateSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await apiReactivateSubscription();
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reactivation failed';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    clearAuthError();
  }, [clearAuthError]);

  return {
    tier,
    subscription,
    isLoading,
    error,
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
    canUseFeature,
    clearError,
  };
}

export default useSubscription;
