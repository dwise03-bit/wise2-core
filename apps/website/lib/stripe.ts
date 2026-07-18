/**
 * Stripe Configuration and Utilities
 * Handles payment processing and subscription management
 */

import Stripe from 'stripe';

// Initialize Stripe client (server-side only)
export const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
};

// Stripe configuration with public keys and price IDs
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  pricing: {
    starter: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter_test',
      name: 'Starter',
      price: 199,
      currency: 'usd',
      interval: 'month',
      description: 'Perfect for teams getting started with WISE²',
      features: [
        'Up to 5 team members',
        'Basic brand templates',
        '10 audio productions/month',
        'Community support',
        'Basic analytics',
      ],
    },
    professional: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional_test',
      name: 'Professional',
      price: 499,
      currency: 'usd',
      interval: 'month',
      description: 'For growing businesses and creators',
      features: [
        'Up to 25 team members',
        'Advanced brand templates',
        'Unlimited audio productions',
        'Priority email support',
        'Advanced analytics & reporting',
        'Custom integrations',
        'API access',
      ],
      popular: true,
    },
    enterprise: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_test',
      name: 'Enterprise',
      price: null, // Custom pricing
      currency: 'usd',
      interval: null,
      description: 'For large-scale operations',
      features: [
        'Unlimited team members',
        'Custom brand templates',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom SLA',
        'White-label options',
        'Advanced security features',
        'On-premises deployment available',
      ],
    },
  },
};

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(
  priceId: string,
  customerId?: string,
  metadata?: Record<string, string>
) {
  if (!STRIPE_CONFIG.publishableKey) {
    throw new Error('Stripe publishable key is not configured');
  }

  // This is a client-side utility that constructs the checkout URL
  // In production, you'd typically use the @stripe/react-stripe-js library
  const checkoutUrl = new URL('https://checkout.stripe.com/pay');

  // For direct checkout creation, use the API route
  return {
    url: '/api/checkout/session',
    config: {
      priceId,
      customerId,
      metadata,
    },
  };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Get pricing plan details
 */
export function getPricingPlan(planName: keyof typeof STRIPE_CONFIG.pricing) {
  return STRIPE_CONFIG.pricing[planName];
}

/**
 * Get all pricing plans
 */
export function getAllPricingPlans() {
  return Object.entries(STRIPE_CONFIG.pricing).map(([key, plan]) => ({
    id: key,
    ...plan,
  }));
}
