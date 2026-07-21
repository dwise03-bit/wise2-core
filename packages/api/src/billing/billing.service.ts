import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceId: string;
  generationsPerMonth: number;
  features: string[];
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger('BillingService');

  private readonly pricingTiers: Record<string, PricingTier> = {
    FREE: {
      id: 'FREE',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      stripePriceId: '',
      generationsPerMonth: 5,
      features: ['5 generations/month', 'Basic support'],
    },
    STARTER: {
      id: 'STARTER',
      name: 'Starter',
      monthlyPrice: 49,
      yearlyPrice: 490,
      stripePriceId: 'price_1234567890', // Replace with actual Stripe price ID
      generationsPerMonth: 100,
      features: ['100 generations/month', 'Email support', 'Advanced features'],
    },
    PRO: {
      id: 'PRO',
      name: 'Pro',
      monthlyPrice: 99,
      yearlyPrice: 990,
      stripePriceId: 'price_9876543210', // Replace with actual Stripe price ID
      generationsPerMonth: 1000,
      features: ['Unlimited generations', 'Priority support', 'API access'],
    },
    ENTERPRISE: {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      monthlyPrice: 299,
      yearlyPrice: 2990,
      stripePriceId: 'price_enterprise123', // Replace with actual Stripe price ID
      generationsPerMonth: 999999,
      features: [
        'Unlimited everything',
        'Dedicated support',
        'Custom integrations',
      ],
    },
  };

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private configService: ConfigService
  ) {}

  /**
   * Get available pricing tiers
   */
  getPricingTiers(): PricingTier[] {
    return Object.values(this.pricingTiers);
  }

  /**
   * Get subscription for a user
   */
  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!subscription) {
      // User not found, return free tier
      return {
        id: null,
        userId,
        plan: 'FREE',
        status: 'INACTIVE',
        generationsPerMonth: 5,
        generationsUsed: 0,
        features: this.pricingTiers.FREE.features,
      };
    }

    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      generationsPerMonth: this.pricingTiers[subscription.plan].generationsPerMonth,
      generationsUsed: subscription.generationsThisMonth,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      features: this.pricingTiers[subscription.plan].features,
    };
  }

  /**
   * Create a checkout session for upgrading plan
   */
  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    if (!this.pricingTiers[planId]) {
      throw new BadRequestException(`Invalid plan: ${planId}`);
    }

    if (planId === 'FREE') {
      throw new BadRequestException('Cannot checkout for free plan');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    let stripeCustomerId = subscription?.stripeCustomerId;

    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        userId,
        user.email,
        user.name || undefined
      );
      stripeCustomerId = customer.id;

      // Update subscription record
      if (subscription) {
        subscription = await this.prisma.subscription.update({
          where: { userId },
          data: { stripeCustomerId },
        });
      } else {
        subscription = await this.prisma.subscription.create({
          data: {
            userId,
            stripeCustomerId,
            plan: 'FREE',
            status: 'INACTIVE',
          },
        });
      }
    }

    // Create checkout session
    const stripePriceId = this.pricingTiers[planId].stripePriceId;
    const { sessionId, url } = await this.stripeService.createCheckoutSession(
      stripeCustomerId,
      stripePriceId,
      successUrl,
      cancelUrl
    );

    this.logger.log(`✅ Created checkout session for user ${userId}: ${sessionId}`);

    return {
      sessionId,
      url,
      planId,
      monthlyPrice: this.pricingTiers[planId].monthlyPrice,
    };
  }

  /**
   * Handle successful subscription from Stripe webhook
   */
  async handleSubscriptionCreated(stripeSubscription: any) {
    const customerId = stripeSubscription.customer;
    const subscriptionId = stripeSubscription.id;
    const status = stripeSubscription.status;
    const priceId = stripeSubscription.items?.data?.[0]?.price?.id;

    // Find user by Stripe customer ID
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!subscription) {
      this.logger.warn(
        `⚠️  Stripe customer ${customerId} not found in database`
      );
      return;
    }

    // Determine plan from price ID
    let planId = 'STARTER';
    for (const [key, tier] of Object.entries(this.pricingTiers)) {
      if (tier.stripePriceId === priceId) {
        planId = key;
        break;
      }
    }

    // Update subscription record
    const updatedSubscription = await this.prisma.subscription.update({
      where: { userId: subscription.userId },
      data: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        plan: planId as any,
        status: status === 'active' ? 'ACTIVE' : 'TRIALING',
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000
        ),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialEndsAt: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
      },
    });

    this.logger.log(
      `✅ Updated subscription for user ${updatedSubscription.userId}: ${planId}`
    );
  }

  /**
   * Handle subscription deletion from Stripe webhook
   */
  async handleSubscriptionDeleted(stripeSubscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(
        `⚠️  Stripe subscription ${stripeSubscriptionId} not found in database`
      );
      return;
    }

    // Update subscription record
    const updatedSubscription = await this.prisma.subscription.update({
      where: { userId: subscription.userId },
      data: {
        plan: 'FREE',
        status: 'CANCELED',
        canceledAt: new Date(),
        stripeSubscriptionId: null,
      },
    });

    this.logger.log(
      `✅ Cancelled subscription for user ${updatedSubscription.userId}`
    );
  }

  /**
   * Check if user can generate (feature gating)
   */
  async canGenerateMusic(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetDate: Date;
    reason?: string;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // New user - allow free tier
      return {
        allowed: true,
        remaining: this.pricingTiers.FREE.generationsPerMonth,
        resetDate: this.getNextResetDate(),
      };
    }

    // Check if subscription period has reset
    const now = new Date();
    if (now > subscription.lastResetDate) {
      // Reset generation count
      await this.prisma.subscription.update({
        where: { userId },
        data: {
          generationsThisMonth: 0,
          lastResetDate: now,
        },
      });
      subscription.generationsThisMonth = 0;
    }

    // Check if subscription is active
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
      return {
        allowed: false,
        remaining: 0,
        resetDate: this.getNextResetDate(),
        reason: `Subscription ${subscription.status.toLowerCase()}`,
      };
    }

    const tierLimit = this.pricingTiers[subscription.plan].generationsPerMonth;
    const remaining = Math.max(0, tierLimit - subscription.generationsThisMonth);

    return {
      allowed: remaining > 0,
      remaining,
      resetDate: this.getNextResetDate(),
      reason: remaining === 0 ? 'Monthly generation limit reached' : undefined,
    };
  }

  /**
   * Record a generation (increment usage counter)
   */
  async recordGeneration(userId: string, generationType: string = 'music') {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Create new subscription for user
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: 'FREE',
          status: 'INACTIVE',
          generationsThisMonth: 1,
        },
      });
      return;
    }

    // Check if should reset
    const now = new Date();
    if (now > subscription.lastResetDate) {
      // Reset and record
      await this.prisma.subscription.update({
        where: { userId },
        data: {
          generationsThisMonth: 1,
          lastResetDate: now,
        },
      });
    } else {
      // Increment counter
      await this.prisma.subscription.update({
        where: { userId },
        data: {
          generationsThisMonth: { increment: 1 },
        },
      });
    }

    // Log the generation for analytics
    await this.prisma.usageLog.create({
      data: {
        subscriptionId: subscription.id,
        generationType,
        creditsUsed: 1,
      },
    });
  }

  /**
   * Upgrade or downgrade plan
   */
  async updatePlan(userId: string, newPlanId: string) {
    if (!this.pricingTiers[newPlanId]) {
      throw new BadRequestException(`Invalid plan: ${newPlanId}`);
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found for user: ${userId}`);
    }

    if (newPlanId === 'FREE') {
      // Downgrade to free - cancel Stripe subscription if exists
      if (subscription.stripeSubscriptionId) {
        await this.stripeService.cancelSubscription(
          subscription.stripeSubscriptionId
        );
      }

      return await this.prisma.subscription.update({
        where: { userId },
        data: {
          plan: 'FREE',
          status: 'INACTIVE',
          stripeSubscriptionId: null,
        },
      });
    }

    // Upgrading to paid plan
    if (subscription.stripeSubscriptionId) {
      // Update existing subscription with new price
      const newPriceId = this.pricingTiers[newPlanId].stripePriceId;
      const stripeSubscription = await this.stripeService.updateSubscription(
        subscription.stripeSubscriptionId,
        newPriceId
      );

      return await this.prisma.subscription.update({
        where: { userId },
        data: {
          plan: newPlanId as any,
          stripePriceId: newPriceId,
          status: 'ACTIVE',
        },
      });
    }

    // No existing subscription - user needs to go through checkout
    throw new BadRequestException(
      'User must complete checkout to upgrade plan'
    );
  }

  /**
   * Helper to get next reset date (start of next month)
   */
  private getNextResetDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth;
  }
}
