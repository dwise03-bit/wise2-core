/**
 * useSubscription Hook
 *
 * Manages subscription state and provides methods for subscription management.
 *
 * Usage:
 * ```tsx
 * const { subscription, loading, error, upgrade, downgrade } = useSubscription();
 *
 * if (subscription?.plan === 'FREE') {
 *   // Show upgrade button
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

export interface Subscription {
  id: string | null;
  userId: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INACTIVE';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  generationsPerMonth: number;
  generationsUsed: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  features: string[];
}

export interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upgrade: (planId: string, successUrl: string, cancelUrl: string) => Promise<string>;
  downgrade: (planId: string) => Promise<void>;
  canGenerate: () => Promise<{
    allowed: boolean;
    remaining: number;
    resetDate: Date;
    reason?: string;
  }>;
  recordGeneration: (generationType?: string) => Promise<void>;
}

/**
 * Hook for managing subscription
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch subscription data
   */
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/billing/subscription', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh subscription data
   */
  const refresh = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  /**
   * Upgrade to a new plan
   */
  const upgrade = useCallback(
    async (
      planId: string,
      successUrl: string,
      cancelUrl: string
    ): Promise<string> => {
      try {
        const response = await fetch('/api/v1/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            planId,
            successUrl,
            cancelUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || 'Failed to create checkout session'
          );
        }

        const data = await response.json();
        return data.url || '';
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message);
        throw error;
      }
    },
    []
  );

  /**
   * Downgrade or change plan
   */
  const downgrade = useCallback(async (planId: string) => {
    try {
      const response = await fetch('/api/v1/billing/subscription/plan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update plan');
      }

      await fetchSubscription();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      throw error;
    }
  }, [fetchSubscription]);

  /**
   * Check if user can generate
   */
  const canGenerate = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/billing/can-generate', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to check generation limit');
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      throw error;
    }
  }, []);

  /**
   * Record a generation
   */
  const recordGeneration = useCallback(
    async (generationType: string = 'music') => {
      try {
        const response = await fetch('/api/v1/billing/record-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ generationType }),
        });

        if (!response.ok) {
          throw new Error('Failed to record generation');
        }

        // Refresh subscription to update counter
        await fetchSubscription();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message);
        throw error;
      }
    },
    [fetchSubscription]
  );

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refresh,
    upgrade,
    downgrade,
    canGenerate,
    recordGeneration,
  };
};

export default useSubscription;
