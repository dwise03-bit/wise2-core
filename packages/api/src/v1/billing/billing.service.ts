import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(userId: string, planId: string, email: string) {
    const PLANS: Record<string, { priceId: string; trialDays: number }> = {
      STARTER: { priceId: process.env.STRIPE_STARTER_PRICE_ID || '', trialDays: 14 },
      PRO: { priceId: process.env.STRIPE_PRO_PRICE_ID || '', trialDays: 14 },
      ENTERPRISE: { priceId: '', trialDays: 30 },
    };

    const plan = PLANS[planId];
    if (!plan || !plan.priceId) {
      throw new Error('Invalid plan');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/checkout/cancel`,
      customer_email: email,
      subscription_data: {
        trial_period_days: plan.trialDays,
        metadata: { userId, planId },
      },
      metadata: { userId, planId },
    });

    return { url: session.url, sessionId: session.id };
  }

  /**
   * Fulfill subscription after successful payment
   */
  async fulfillSubscription(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (!session.subscription) {
      throw new Error('No subscription found');
    }

    const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

    // Store in database
    return {
      userId: session.metadata?.userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      planId: session.metadata?.planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  }

  /**
   * Get subscription details
   */
  async getSubscription(userId: string) {
    // Query database for subscription
    // Return subscription object with plan details
    return {
      id: 'sub_xxx',
      plan: 'PRO',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      priceMonthly: 99,
    };
  }

  /**
   * Upgrade or downgrade subscription
   */
  async updateSubscription(userId: string, newPlanId: string) {
    // Get current subscription
    // Update Stripe subscription
    // Update database
    return { success: true };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, reason?: string) {
    // Get subscription
    // Cancel in Stripe
    // Update database
    // Send cancellation email with retention offer
    return { success: true };
  }

  /**
   * Get invoices
   */
  async getInvoices(userId: string, limit: number = 12) {
    // Query database or Stripe for invoices
    return [
      {
        id: 'inv_1',
        amount: 99,
        status: 'paid',
        date: new Date(),
        pdfUrl: 'https://stripe.com/invoice.pdf',
      },
    ];
  }

  /**
   * Webhook handler for Stripe events
   */
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.onSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await this.onInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.onInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async onSubscriptionCreated(subscription: Stripe.Subscription) {
    // Log subscription creation
    // Send welcome email
  }

  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Update database with new plan
    // Send upgrade/downgrade email
  }

  private async onSubscriptionCanceled(subscription: Stripe.Subscription) {
    // Mark subscription as canceled
    // Send cancellation email
  }

  private async onInvoicePaid(invoice: Stripe.Invoice) {
    // Send invoice to customer
    // Update usage tracking
  }

  private async onInvoiceFailed(invoice: Stripe.Invoice) {
    // Send payment failed notification
    // Trigger retry logic
  }
}
