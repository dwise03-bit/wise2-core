/**
 * Subscription Configuration
 * Defines pricing tiers, features, and limits for all subscription levels
 */

import { SubscriptionTier, PricingTier, SubscriptionLimits } from '../types/subscription';

/**
 * Subscription tier limits
 */
export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxProjects: 5,
    maxTracks: 2,
    maxStorageGB: 1,
    canExportStems: false,
    canLiveStream: false,
    canUseAdvancedEffects: false,
    canUseAIMusicGeneration: false,
    supportTier: 'none',
  },
  pro: {
    maxProjects: 100,
    maxTracks: 32,
    maxStorageGB: 100,
    canExportStems: true,
    canLiveStream: true,
    canUseAdvancedEffects: true,
    canUseAIMusicGeneration: false,
    supportTier: 'email',
  },
  enterprise: {
    maxProjects: 1000,
    maxTracks: 128,
    maxStorageGB: 1000,
    canExportStems: true,
    canLiveStream: true,
    canUseAdvancedEffects: true,
    canUseAIMusicGeneration: true,
    supportTier: 'discord',
  },
};

/**
 * Pricing tiers for display
 */
export const PRICING_TIERS: PricingTier[] = [
  {
    id: process.env.NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID || 'free',
    name: 'free',
    displayName: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: '5 projects/month', included: true },
      { name: 'Basic recording', included: true },
      { name: '2 tracks max', included: true },
      { name: 'Standard effects', included: true },
      { name: '1 GB storage', included: true },
      { name: 'Export STEMS', included: false },
      { name: 'Live streaming', included: false },
      { name: 'Advanced effects', included: false },
      { name: 'AI music generation', included: false },
    ],
  },
  {
    id: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID || 'pro',
    name: 'pro',
    displayName: 'Pro',
    description: 'For serious creators',
    monthlyPrice: 29,
    yearlyPrice: 290,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      { name: 'Unlimited projects', included: true },
      { name: 'Advanced recording', included: true },
      { name: '32 tracks max', included: true },
      { name: 'Advanced effects', included: true },
      { name: '100 GB storage', included: true },
      { name: 'Export STEMS', included: true },
      { name: 'Live streaming', included: true },
      { name: 'Priority support (email)', included: true },
      { name: 'AI music generation', included: false },
    ],
    isPopular: true,
  },
  {
    id: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRODUCT_ID || 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'Complete audio production suite',
    monthlyPrice: 99,
    yearlyPrice: 990,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      { name: 'Unlimited everything', included: true },
      { name: 'Professional-grade tools', included: true },
      { name: '128 tracks max', included: true },
      { name: 'All effects included', included: true },
      { name: '1000 GB storage', included: true },
      { name: 'Export STEMS', included: true },
      { name: 'Live streaming', included: true },
      { name: 'Priority support (Discord)', included: true },
      { name: 'AI music generation', included: true },
    ],
  },
];

/**
 * Get pricing tier by subscription tier
 */
export function getPricingTier(tier: SubscriptionTier): PricingTier {
  const pricing = PRICING_TIERS.find((t) => t.name === tier);
  if (!pricing) {
    return PRICING_TIERS[0]; // Default to free
  }
  return pricing;
}

/**
 * Get subscription limits for tier
 */
export function getTierLimits(tier: SubscriptionTier): SubscriptionLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if feature is available in tier
 */
export function isFeatureAvailable(tier: SubscriptionTier, feature: keyof SubscriptionLimits): boolean {
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
}

/**
 * Get tier color for UI display
 */
export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return '#888888'; // Gray
    case 'pro':
      return '#39FF14'; // Neon Green
    case 'enterprise':
      return '#FFD700'; // Gold
    default:
      return '#888888';
  }
}

/**
 * Get tier badge emoji
 */
export function getTierBadge(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return '✨';
    case 'pro':
      return '⚡';
    case 'enterprise':
      return '👑';
    default:
      return '✨';
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Check if user has hit any limits
 */
export function checkLimits(
  tier: SubscriptionTier,
  currentUsage: {
    projectsCount?: number;
    tracksInProject?: number;
    storageUsedGB?: number;
    monthlyExports?: number;
  }
): { isAtLimit: boolean; limitExceeded?: string } {
  const limits = TIER_LIMITS[tier];

  if (
    currentUsage.projectsCount !== undefined &&
    currentUsage.projectsCount >= limits.maxProjects
  ) {
    return {
      isAtLimit: true,
      limitExceeded: `Project limit (${limits.maxProjects}) reached`,
    };
  }

  if (
    currentUsage.tracksInProject !== undefined &&
    currentUsage.tracksInProject >= limits.maxTracks
  ) {
    return {
      isAtLimit: true,
      limitExceeded: `Track limit (${limits.maxTracks}) reached per project`,
    };
  }

  if (
    currentUsage.storageUsedGB !== undefined &&
    currentUsage.storageUsedGB >= limits.maxStorageGB
  ) {
    return {
      isAtLimit: true,
      limitExceeded: `Storage limit (${limits.maxStorageGB}GB) reached`,
    };
  }

  if (
    currentUsage.monthlyExports !== undefined &&
    currentUsage.monthlyExports >= 100 &&
    tier === 'free'
  ) {
    return {
      isAtLimit: true,
      limitExceeded: 'Monthly export limit reached',
    };
  }

  return { isAtLimit: false };
}
