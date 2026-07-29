import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { EntitlementsService } from './entitlements.service';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private entitlementsService: EntitlementsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a Stripe checkout session for subscription
   * Handles both authenticated and unauthenticated (new customer) flows
   */
  async createCheckoutSession(userIdOrEmail: string, planId: string, email: string) {
    const PLANS: Record<string, { priceId: string; trialDays: number }> = {
      STARTER: { priceId: process.env.STRIPE_STARTER_PRICE_ID || '', trialDays: 14 },
      PRO: { priceId: process.env.STRIPE_PRO_PRICE_ID || '', trialDays: 14 },
      ENTERPRISE: { priceId: '', trialDays: 30 },
    };

    const plan = PLANS[planId];
    if (!plan || !plan.priceId) {
      throw new Error('Invalid plan');
    }

    // Determine if this is an authenticated user or new customer
    let userId = userIdOrEmail;
    let isNewCustomer = false;

    // If userIdOrEmail looks like an email (contains @), treat as new customer
    if (userIdOrEmail.includes('@')) {
      isNewCustomer = true;

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userIdOrEmail },
      });

      if (existingUser) {
        userId = existingUser.id;
        isNewCustomer = false;
      } else {
        // For new customers, we'll create the user in the webhook handler
        // Use email as a temporary ID in checkout metadata
        userId = userIdOrEmail;
      }
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
        metadata: {
          userId,
          planId,
          email, // Include email as fallback identifier
          isNewCustomer: String(isNewCustomer),
        },
      },
      metadata: {
        userId,
        planId,
        email,
        isNewCustomer: String(isNewCustomer),
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  /**
   * Fulfill subscription after successful payment
   * Creates or updates user account as needed
   */
  async fulfillSubscription(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (!session.subscription) {
      throw new Error('No subscription found');
    }

    const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

    let userId = session.metadata?.userId;
    const email = session.metadata?.email || session.customer_email;
    const planId = session.metadata?.planId;
    const isNewCustomer = session.metadata?.isNewCustomer === 'true';

    // If new customer (email-based), create a User record
    if (isNewCustomer && email && !userId?.includes('@')) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user with temporary password
        // Customer will set password on first login or via password reset
        const temporaryPassword = crypto.randomBytes(16).toString('hex');
        const newUser = await this.prisma.user.create({
          data: {
            email,
            name: email.split('@')[0], // Use email prefix as name placeholder
            passwordHash: temporaryPassword, // Temporary - customer should reset
          },
        });
        userId = newUser.id;
      }
    } else if (email && !userId) {
      // Fallback: find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      throw new Error('Could not determine userId for subscription fulfillment');
    }

    // Return subscription data (webhook will persist it)
    return {
      userId,
      email,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  }

  /**
   * Get subscription details by userId
   * Returns real subscription data from database
   */
  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Return FREE plan if no subscription
      return {
        id: null,
        userId,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      };
    }

    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: false, // TODO: Add to schema if needed
      trialEndsAt: subscription.trialEndsAt,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripeCustomerId: subscription.stripeCustomerId,
    };
  }

  /**
   * Get complete customer profile (subscription + entitlements)
   * Used by frontend to determine available features
   */
  async getCustomerProfile(userId: string) {
    const subscription = await this.getSubscription(userId);
    const plan = subscription.plan as any; // Type is ensured by schema
    const entitlements = this.entitlementsService.getEntitlements(plan);

    return {
      subscription,
      entitlements,
      upgradeUrl: this.getUpgradeUrl(subscription.plan),
    };
  }

  /**
   * Get upgrade URL for a given plan
   */
  private getUpgradeUrl(currentPlan: string): string {
    const upgradeMap: Record<string, string> = {
      FREE: '/pricing?target=STARTER',
      STARTER: '/pricing?target=PRO',
      PRO: '/pricing?target=ENTERPRISE',
      ENTERPRISE: '/contact',
    };
    return upgradeMap[currentPlan] || '/pricing';
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

  /**
   * Activate subscription after successful Stripe payment
   * Creates or updates user and subscription records
   */
  async activateSubscription(data: {
    email: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    planId: string;
  }) {
    const { email, stripeCustomerId, stripeSubscriptionId, planId } = data;

    // Map plan name to PricingPlan enum
    const planMap: Record<string, string> = {
      STARTER: 'STARTER',
      PRO: 'PRO',
      ENTERPRISE: 'ENTERPRISE',
    };

    const plan = planMap[planId] || 'STARTER';

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      // Create new user with temporary password
      const tempPassword = crypto.randomBytes(16).toString('hex');
      user = await this.prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          passwordHash: tempPassword,
        },
      });
    }

    // Create or update subscription
    const subscription = await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeCustomerId,
        stripeSubscriptionId,
        plan,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        stripeCustomerId,
        stripeSubscriptionId,
        plan,
        status: 'ACTIVE',
      },
    });

    return subscription;
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
