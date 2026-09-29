/**
 * useAuth Hook
 * Convenience hook that wraps useAuthContext
 * Provides backwards compatibility and cleaner API
 */

import { useAuthContext } from '../context/AuthContext';
import { StoredUser } from '../lib/storage-service';
import { SubscriptionTier, UserSubscription } from '../types/subscription';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn {
  user: StoredUser | null;
  subscription: UserSubscription | null;
  tier: SubscriptionTier;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  clearError: () => void;
  isCheckingAuth: boolean;
  canUseFeature: (feature: string) => boolean;
}

/**
 * Custom hook for authentication
 * Wraps useAuthContext for convenient access
 */
export function useAuth(): UseAuthReturn {
  const {
    user,
    subscription,
    tier,
    isAuthenticated,
    isLoading,
    error,
    logout,
    clearError,
    canUseFeature,
  } = useAuthContext();

  return {
    user,
    subscription,
    tier,
    isAuthenticated,
    isLoading,
    error,
    logout,
    clearError,
    isCheckingAuth: isLoading,
    canUseFeature: (feature: string) => {
      // Map feature names to tier limits keys
      const featureMap: Record<string, keyof typeof TIER_LIMITS.free> = {
        export_stems: 'canExportStems',
        live_stream: 'canLiveStream',
        advanced_effects: 'canUseAdvancedEffects',
        ai_music: 'canUseAIMusicGeneration',
      };
      const mappedFeature = featureMap[feature];
      if (mappedFeature) {
        return canUseFeature(mappedFeature);
      }
      return false;
    },
  };
}

/**
 * Import TIER_LIMITS for feature checking
 */
import { TIER_LIMITS } from '../lib/subscription-config';
