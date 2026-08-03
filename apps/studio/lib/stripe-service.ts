/**
 * Stripe Service
 * Client-side utilities for Stripe integration
 * Server-side endpoints handle sensitive operations
 */

import { CheckoutSessionResponse, SubscriptionTier } from '../types/subscription';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Create a checkout session for upgrading subscription
 */
export async function createCheckoutSession(
  tier: SubscriptionTier,
  billingPeriod: 'monthly' | 'yearly' = 'monthly'
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({
      tier,
      billingPeriod,
      successUrl: process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL,
      cancelUrl: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

/**
 * Get customer billing portal session
 */
export async function getBillingPortalSession(): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/v1/stripe/billing-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get billing portal');
  }

  return response.json();
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus() {
  const response = await fetch(`${API_BASE_URL}/v1/stripe/subscription-status`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get subscription status');
  }

  return response.json();
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/v1/stripe/cancel-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  return response.json();
}

/**
 * Reactivate cancelled subscription
 */
export async function reactivateSubscription(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/v1/stripe/reactivate-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to reactivate subscription');
  }

  return response.json();
}

/**
 * Handle Stripe webhook (server-side, but documenting for reference)
 * Backend should handle: invoice.payment_succeeded, customer.subscription.updated, etc.
 */
export function handleWebhookEvent(event: any) {
  // This is handled server-side
  // Events trigger subscription updates in database
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Initialize Stripe Elements (called from component)
 */
export function initializeStripe() {
  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublicKey) {
    console.error('Stripe public key not configured');
    return null;
  }
  return stripePublicKey;
}
