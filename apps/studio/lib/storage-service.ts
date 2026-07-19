/**
 * Storage Service
 * Manages user, subscription, and usage data using localStorage (MVP)
 * Can be swapped with Supabase or other backends later
 */

import { UserSubscription, UsageMetrics, SubscriptionTier } from '../types/subscription';

const STORAGE_KEYS = {
  USER: 'wise2_user',
  SUBSCRIPTION: 'wise2_subscription',
  USAGE: 'wise2_usage',
  GOOGLE_ID: 'wise2_google_id',
  AVATAR: 'wise2_avatar',
};

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  googleId?: string;
  avatar?: string;
  createdAt: string;
}

/**
 * Initialize user if doesn't exist
 */
export function initializeUser(
  email: string,
  name: string,
  googleId?: string,
  avatar?: string
): StoredUser {
  const existingUser = getUser();
  if (existingUser) {
    return existingUser;
  }

  const newUser: StoredUser = {
    id: generateUserId(),
    email,
    name,
    googleId,
    avatar,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  return newUser;
}

/**
 * Get current user
 */
export function getUser(): StoredUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading user from storage:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export function updateUser(updates: Partial<StoredUser>): StoredUser | null {
  const user = getUser();
  if (!user) return null;

  const updated = { ...user, ...updates };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  return updated;
}

/**
 * Delete user (logout)
 */
export function deleteUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
  localStorage.removeItem(STORAGE_KEYS.USAGE);
  localStorage.removeItem(STORAGE_KEYS.GOOGLE_ID);
  localStorage.removeItem(STORAGE_KEYS.AVATAR);
}

/**
 * Get or create user subscription (defaults to free tier)
 */
export function getOrCreateSubscription(userId: string): UserSubscription {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading subscription from storage:', error);
  }

  const newSubscription: UserSubscription = {
    id: generateSubscriptionId(),
    userId,
    tier: 'free',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(newSubscription));
  return newSubscription;
}

/**
 * Get current subscription
 */
export function getSubscription(): UserSubscription | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading subscription from storage:', error);
    return null;
  }
}

/**
 * Update subscription (e.g., upgrade to Pro)
 */
export function updateSubscription(
  tier: SubscriptionTier,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): UserSubscription | null {
  const subscription = getSubscription();
  if (!subscription) return null;

  const updated: UserSubscription = {
    ...subscription,
    tier,
    stripeCustomerId: stripeCustomerId || subscription.stripeCustomerId,
    stripeSubscriptionId: stripeSubscriptionId || subscription.stripeSubscriptionId,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };

  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(updated));
  return updated;
}

/**
 * Get or initialize usage metrics
 */
export function getOrCreateUsage(userId: string): UsageMetrics {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading usage from storage:', error);
  }

  const newUsage: UsageMetrics = {
    userId,
    projectsCount: 0,
    storageUsedGB: 0,
    tracksCreated: 0,
    monthlyExports: 0,
    updatedAt: new Date(),
  };

  localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(newUsage));
  return newUsage;
}

/**
 * Get usage metrics
 */
export function getUsage(): UsageMetrics | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USAGE);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading usage from storage:', error);
    return null;
  }
}

/**
 * Update usage metrics
 */
export function updateUsage(updates: Partial<UsageMetrics>): UsageMetrics | null {
  const usage = getUsage();
  if (!usage) return null;

  const updated: UsageMetrics = {
    ...usage,
    ...updates,
    updatedAt: new Date(),
  };

  localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(updated));
  return updated;
}

/**
 * Increment project count
 */
export function incrementProjectCount(): void {
  const usage = getUsage();
  if (usage) {
    updateUsage({ projectsCount: usage.projectsCount + 1 });
  }
}

/**
 * Update storage used
 */
export function updateStorageUsed(deltaGB: number): void {
  const usage = getUsage();
  if (usage) {
    updateUsage({ storageUsedGB: Math.max(0, usage.storageUsedGB + deltaGB) });
  }
}

/**
 * Increment tracks created
 */
export function incrementTracksCreated(): void {
  const usage = getUsage();
  if (usage) {
    updateUsage({ tracksCreated: usage.tracksCreated + 1 });
  }
}

/**
 * Increment monthly exports
 */
export function incrementMonthlyExports(): void {
  const usage = getUsage();
  if (usage) {
    updateUsage({ monthlyExports: usage.monthlyExports + 1 });
  }
}

/**
 * Clear all auth-related data
 */
export function clearAuthData(): void {
  deleteUser();
}

/**
 * Helper: Generate unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper: Generate unique subscription ID
 */
function generateSubscriptionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
