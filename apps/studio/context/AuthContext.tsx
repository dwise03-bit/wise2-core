'use client';

/**
 * AuthContext
 * Global authentication and subscription state management
 * Integrates Google OAuth and Stripe subscription data
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { SubscriptionTier, UserSubscription } from '../types/subscription';
import {
  getUser,
  updateUser,
  initializeUser,
  clearAuthData,
  getOrCreateSubscription,
  updateSubscription,
  getOrCreateUsage,
  StoredUser,
} from '../lib/storage-service';
import { TIER_LIMITS, getTierLimits } from '../lib/subscription-config';

export interface AuthContextType {
  user: StoredUser | null;
  subscription: UserSubscription | null;
  tier: SubscriptionTier;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  loginWithGoogle: (profile: GoogleProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<StoredUser>) => Promise<void>;

  // Subscription methods
  upgradeToPro: () => Promise<void>;
  upgradeToEnterprise: () => Promise<void>;
  cancelSubscription: () => Promise<void>;

  // Feature checking
  canUseFeature: (feature: keyof typeof TIER_LIMITS.free) => boolean;
  getTierLimits: () => (typeof TIER_LIMITS)[SubscriptionTier];
  getRemainingLimit: (feature: 'projects' | 'storage' | 'tracks') => number;

  // Helpers
  clearError: () => void;
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      const storedSub = getOrCreateSubscription(storedUser.id);
      setSubscription(storedSub);
    } else {
      // Auto-login demo user for showcase/testing
      const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('wise2_demo_mode') === 'true';
      if (isDemoMode) {
        const demoUser = initializeUser(
          'demo@wise2.app',
          'Demo User',
          'demo-user-' + Math.random().toString(36).slice(2),
          undefined
        );
        setUser(demoUser);
        const demoSub = getOrCreateSubscription(demoUser.id);
        setSubscription(demoSub);
      }
    }
    setIsHydrated(true);
    setIsLoading(false);
  }, []);

  const loginWithGoogle = useCallback(
    async (profile: GoogleProfile) => {
      setIsLoading(true);
      setError(null);

      try {
        // Initialize or update user with Google profile
        const newUser = initializeUser(
          profile.email,
          profile.name,
          profile.id,
          profile.picture
        );
        setUser(newUser);

        // Initialize subscription if doesn't exist
        const sub = getOrCreateSubscription(newUser.id);
        setSubscription(sub);
        getOrCreateUsage(newUser.id);

        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      clearAuthData();
      setUser(null);
      setSubscription(null);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const updateUserProfile = useCallback(
    async (updates: Partial<StoredUser>) => {
      if (!user) return;

      setIsLoading(true);
      try {
        const updated = updateUser(updates);
        if (updated) {
          setUser(updated);
        }
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        setError(message);
        setIsLoading(false);
        throw err;
      }
    },
    [user]
  );

  const upgradeToPro = useCallback(async () => {
    if (!subscription) return;

    try {
      const updated = updateSubscription('pro');
      if (updated) {
        setSubscription(updated);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upgrade failed';
      setError(message);
      throw err;
    }
  }, [subscription]);

  const upgradeToEnterprise = useCallback(async () => {
    if (!subscription) return;

    try {
      const updated = updateSubscription('enterprise');
      if (updated) {
        setSubscription(updated);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upgrade failed';
      setError(message);
      throw err;
    }
  }, [subscription]);

  const cancelSubscription = useCallback(async () => {
    if (!subscription) return;

    try {
      const updated = updateSubscription('free');
      if (updated) {
        setSubscription(updated);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cancellation failed';
      setError(message);
      throw err;
    }
  }, [subscription]);

  const tier = subscription?.tier || 'free';

  const canUseFeature = useCallback(
    (feature: keyof typeof TIER_LIMITS.free) => {
      const limits = TIER_LIMITS[tier];
      const value = limits[feature];

      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'number') {
        return value > 0;
      }
      if (typeof value === 'string') {
        return value !== 'none';
      }
      return false;
    },
    [tier]
  );

  const getTierLimitsFunc = useCallback(() => {
    return TIER_LIMITS[tier];
  }, [tier]);

  const getRemainingLimit = useCallback(
    (feature: 'projects' | 'storage' | 'tracks') => {
      const limits = TIER_LIMITS[tier];
      switch (feature) {
        case 'projects':
          return limits.maxProjects;
        case 'storage':
          return limits.maxStorageGB;
        case 'tracks':
          return limits.maxTracks;
        default:
          return 0;
      }
    },
    [tier]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    subscription,
    tier,
    isAuthenticated: !!user,
    isLoading: !isHydrated || isLoading,
    error,
    loginWithGoogle,
    logout,
    updateUserProfile,
    upgradeToPro,
    upgradeToEnterprise,
    cancelSubscription,
    canUseFeature,
    getTierLimits: getTierLimitsFunc,
    getRemainingLimit,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 */
export function useAuthContext(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
