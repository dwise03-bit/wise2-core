/**
 * Subscription and Billing Types
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: SubscriptionLimits;
  color: string;
  badge: string;
}

export interface SubscriptionLimits {
  maxProjects: number;
  maxTracks: number;
  maxStorageGB: number;
  canExportStems: boolean;
  canLiveStream: boolean;
  canUseAdvancedEffects: boolean;
  canUseAIMusicGeneration: boolean;
  supportTier: 'none' | 'email' | 'priority' | 'discord';
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageMetrics {
  userId: string;
  projectsCount: number;
  storageUsedGB: number;
  tracksCreated: number;
  monthlyExports: number;
  updatedAt: Date;
}

export interface PricingTier {
  id: string;
  name: SubscriptionTier;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  features: PricingFeature[];
  isPopular?: boolean;
}

export interface PricingFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: Date;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  clientSecret?: string;
  url?: string;
}
