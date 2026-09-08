import Stripe from 'stripe';
import * as crypto from 'crypto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from './billing.service';

/**
 * Stripe Webhook Handler for Customer Journey & Consulting Bookings
 * Handles subscription lifecycle events and payment intents for bookings
 */
@Injectable()
export class StripeWebhookHandler {
  private stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    private emailService: EmailService,
    private analyticsService: AnalyticsService,
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {
    const key = process.env.STRIPE_SECRET_KEY;
    this.stripe = key
      ? new Stripe(key)
      : (new Proxy({}, { get: () => { throw new Error('Stripe is not configured'); } }) as Stripe);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  /**
   * Verify webhook signature for security
   * Returns the verified event object
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
      return event;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Webhook signature verification failed: ${message}`);
    }
  }

  /**
   * Main webhook event processor
   */
  async handleEvent(event: Stripe.Event) {
    console.log('🔔 Stripe webhook received:', event.type);

    switch (event.type) {
      // Payment Intent lifecycle (for consulting bookings)
      case 'payment_intent.succeeded':
        return this.onPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);

      case 'payment_intent.payment_failed':
        return this.onPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);

      // Subscription lifecycle
      case 'customer.subscription.created':
        return this.onSubscriptionCreated(event.data.object as Stripe.Subscription);

      case 'customer.subscription.updated':
        return this.onSubscriptionUpdated(event.data.object as Stripe.Subscription);

      case 'customer.subscription.deleted':
        return this.onSubscriptionCanceled(event.data.object as Stripe.Subscription);

      // Invoice/Payment lifecycle
      case 'invoice.created':
        return this.onInvoiceCreated(event.data.object as Stripe.Invoice);

      case 'invoice.payment_succeeded':
        return this.onInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);

      case 'invoice.payment_failed':
        return this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice);

      case 'charge.refunded':
        return this.onChargeRefunded(event.data.object as Stripe.Charge);

      default:
        console.log('⚠️  Unhandled webhook event:', event.type);
    }
  }

  /**
   * Payment Intent succeeded - Consulting booking confirmed
   */
  private async onPaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('✅ Payment Intent succeeded:', paymentIntent.id);

    try {
      // Find booking by payment intent ID
      const booking = await this.prisma.booking.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: {
          consultant: true,
          user: true,
          service: true,
        },
      });

      if (!booking) {
        console.warn('⚠️  No booking found for payment intent:', paymentIntent.id);
        return;
      }

      // TODO: Confirm booking (updates payment status) - consulting feature deferred
      // In P0 revenue candidate, consulting booking confirmation is not included

      // Send booking confirmation email to user
      if (booking.user?.email) {
        await this.emailService.sendBookingConfirmation({
          email: booking.user.email,
          name: booking.user.name || 'User',
          consultantName: booking.consultant.name,
          serviceName: booking.service.name,
          startTime: booking.startTime,
          duration: booking.durationHours,
          amount: booking.totalPrice,
          meetingLink: booking.meetingLink || 'https://wise2.io/meeting/' + booking.id,
        });
      }

      // Send booking confirmation email to consultant
      if (booking.consultant?.email) {
        await this.emailService.sendConsultantBookingNotification({
          email: booking.consultant.email,
          name: booking.consultant.name,
          clientName: booking.user?.name || 'Client',
          clientEmail: booking.user?.email || 'unknown',
          serviceName: booking.service.name,
          startTime: booking.startTime,
          duration: booking.durationHours,
          amount: booking.totalPrice,
        });
      }

      // TODO: Create Google Calendar event for user
      // TODO: Create Google Calendar event for consultant
      // const calendarService = new GoogleCalendarService();
      // await calendarService.createEvent({
      //   userId: booking.userId,
      //   title: `${booking.service.name} with ${booking.consultant.name}`,
      //   startTime: booking.startTime,
      //   endTime: booking.endTime,
      //   description: booking.notes,
      //   attendees: [booking.user.email, booking.consultant.email],
      // });

      // Track event
      await this.analyticsService.trackEvent({
        eventType: 'booking_confirmed',
        journeyStep: 'payment_succeeded',
        metadata: {
          bookingId: booking.id,
          consultantId: booking.consultantId,
          serviceId: booking.serviceId,
          amount: booking.totalPrice,
        },
      });

    } catch (error) {
      console.error('❌ Error processing payment_intent.succeeded:', error);
      // Don't throw - webhook must return 200 OK
    }
  }

  /**
   * Payment Intent failed - Booking payment retry
   */
  private async onPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('❌ Payment Intent failed:', paymentIntent.id);

    try {
      // Find booking by payment intent ID
      const booking = await this.prisma.booking.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: {
          user: true,
          service: true,
          consultant: true,
        },
      });

      if (!booking) {
        console.warn('⚠️  No booking found for payment intent:', paymentIntent.id);
        return;
      }

      // Mark booking payment as failed
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'failed',
        },
      });

      // Get user email from booking
      if (booking.user?.email) {
        // Send payment retry email with link
        await this.emailService.sendPaymentRetryEmail({
          email: booking.user.email,
          name: booking.user.name || 'User',
          serviceName: booking.service.name,
          consultantName: booking.consultant.name,
          startTime: booking.startTime,
          retryLink: `https://wise2.io/bookings/${booking.id}/payment-retry`,
          failureReason: paymentIntent.last_payment_error?.message || 'Payment declined',
        });
      }

      // Track event
      await this.analyticsService.trackEvent({
        eventType: 'booking_payment_failed',
        metadata: {
          bookingId: booking.id,
          paymentIntentId: paymentIntent.id,
          failureCode: paymentIntent.last_payment_error?.code,
          failureMessage: paymentIntent.last_payment_error?.message,
        },
      });

    } catch (error) {
      console.error('❌ Error processing payment_intent.payment_failed:', error);
      // Don't throw - webhook must return 200 OK
    }
  }

  /**
   * New subscription created (trial started)
   * Maps Stripe subscription back to internal User/Subscription record
   */
  private async onSubscriptionCreated(subscription: Stripe.Subscription) {
    console.log('✅ Subscription created:', subscription.id);

    try {
      const customerId = subscription.customer as string;
      const customer = await this.stripe.customers.retrieve(customerId);
      const email = (customer as Stripe.Customer).email;
      const metadataUserId = subscription.metadata?.userId;
      const fullName = subscription.metadata?.fullName || (customer as Stripe.Customer).name || undefined;
      const planId = subscription.metadata?.planId as string;
      const billingCycle = subscription.metadata?.billingCycle as 'monthly' | 'annual' | undefined;

      if (!email && !metadataUserId) {
        console.warn('⚠️  Missing email or userId in subscription metadata:', {
          subscriptionId: subscription.id,
          email,
          userId: metadataUserId,
        });
        return;
      }

      // Map Stripe price to internal plan
      const priceId = subscription.items.data[0]?.price?.id;
      const plan = this.mapPriceIdToPlan(priceId, planId);

      let user = metadataUserId
        ? await this.prisma.user.findFirst({
            where: {
              OR: [{ id: metadataUserId }, { email: metadataUserId }],
            },
          })
        : null;

      if (!user && email) {
        user = await this.prisma.user.findUnique({
          where: { email },
        });
      }

      if (!user && email) {
        const temporaryPassword = crypto.randomBytes(16).toString('hex');
        user = await this.prisma.user.create({
          data: {
            email,
            name: fullName || email.split('@')[0],
            passwordHash: temporaryPassword,
            role: 'CUSTOMER',
          },
        });
      }

      if (!user) {
        console.warn('⚠️  Unable to resolve or create user for subscription:', subscription.id);
        return;
      }

      // Create or update subscription record
      await this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          status: 'TRIALING',
          plan,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : undefined,
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          status: 'TRIALING',
          plan,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : undefined,
        },
      });

      console.log('✅ Subscription persisted:', { userId: user.id, subscriptionId: subscription.id, billingCycle });

      // Track event
      await this.analyticsService.trackEvent({
        eventType: 'subscription_created',
        journeyStep: 'trial_started',
        userId: user.id,
        metadata: {
          subscriptionId: subscription.id,
          plan,
          trialEndsAt: new Date(subscription.trial_end ? subscription.trial_end * 1000 : Date.now()),
          billingCycle,
        },
      });
    } catch (error) {
      console.error('❌ Error processing subscription.created:', error);
      // Don't throw - webhook must return 200 OK
    }
  }

  /**
   * Map Stripe price ID to internal PricingPlan enum
   */
  private mapPriceIdToPlan(priceId: string | undefined, fallbackPlanId?: string): 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' {
    // Map Stripe price IDs to plans
    const PRICE_TO_PLAN: Record<string, 'STARTER' | 'PRO' | 'ENTERPRISE'> = {
      [process.env.STRIPE_STARTER_PRICE_ID || '']: 'STARTER',
      [process.env.STRIPE_PRO_PRICE_ID || '']: 'PRO',
      [process.env.STRIPE_ENTERPRISE_PRICE_ID || '']: 'ENTERPRISE',
    };

    if (priceId && PRICE_TO_PLAN[priceId]) {
      return PRICE_TO_PLAN[priceId];
    }

    // Fallback to metadata plan ID
    if (fallbackPlanId === 'STARTER' || fallbackPlanId === 'PRO' || fallbackPlanId === 'ENTERPRISE') {
      return fallbackPlanId;
    }

    return 'STARTER'; // Safe default
  }

  /**
   * Subscription updated (plan changed, billing updated, etc.)
   */
  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log('🔄 Subscription updated:', subscription.id);

    try {
      const customerId = subscription.customer as string;
      const customer = await this.stripe.customers.retrieve(customerId);
      const email = (customer as Stripe.Customer).email;

      // Find subscription by Stripe ID
      const existingSubscription = await this.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
        include: { user: true },
      });

      if (!existingSubscription) {
        console.warn('⚠️  No subscription found for Stripe ID:', subscription.id);
        return;
      }

      // Map new plan
      const priceId = subscription.items.data[0]?.price?.id;
      const plan = this.mapPriceIdToPlan(priceId, undefined);

      // Update subscription status (may have transitioned from trialing to active, etc.)
      const statusMap: Record<string, any> = {
        trialing: 'TRIALING',
        active: 'ACTIVE',
        past_due: 'PAST_DUE',
        canceled: 'CANCELED',
        incomplete: 'INACTIVE',
        incomplete_expired: 'INACTIVE',
        paused: 'INACTIVE',
      };

      const newStatus = statusMap[subscription.status] || 'ACTIVE';

      await this.prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan,
          stripePriceId: priceId,
          status: newStatus,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        },
      });

      console.log('✅ Subscription updated:', { subscriptionId: subscription.id, plan: plan, status: newStatus });

      // Send confirmation email if plan changed
      if (email && existingSubscription.plan !== plan) {
        await this.emailService.sendUpgradeConfirmation({
          email,
          name: (customer as Stripe.Customer).name || 'User',
          oldPlan: existingSubscription.plan,
          newPlan: plan,
          newPrice: (subscription.items.data[0]?.price?.unit_amount || 0) / 100,
        });
      }

      // Track event
      await this.analyticsService.trackEvent({
        eventType: 'subscription_updated',
        userId: existingSubscription.userId,
        journeyStep: 'plan_changed',
        metadata: {
          subscriptionId: subscription.id,
          status: newStatus,
          plan,
        },
      });
    } catch (error) {
      console.error('❌ Error processing subscription.updated:', error);
      // Don't throw - webhook must return 200 OK
    }
  }

  /**
   * Subscription canceled
   */
  private async onSubscriptionCanceled(subscription: Stripe.Subscription) {
    console.log('❌ Subscription canceled:', subscription.id);

    try {
      const customerId = subscription.customer as string;
      const customer = await this.stripe.customers.retrieve(customerId);
      const email = (customer as Stripe.Customer).email;

      // Find subscription by Stripe ID
      const existingSubscription = await this.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
        include: { user: true },
      });

      if (!existingSubscription) {
        console.warn('⚠️  No subscription found for Stripe ID:', subscription.id);
        return;
      }

      // Update subscription status to canceled
      await this.prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : new Date(),
        },
      });

      console.log('✅ Subscription canceled:', { subscriptionId: subscription.id, userId: existingSubscription.userId });

      if (email) {
        // Send cancellation confirmation
        await this.emailService.sendCancellationConfirmation({
          email,
          name: (customer as Stripe.Customer).name || 'User',
          workspaceName: 'Your Workspace',
          cancelDate: new Date(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now()),
        });

        // TODO: Schedule win-back email for 30 days later
        // This would require an email queue with delay support
      }

      // Track event
      await this.analyticsService.trackEvent({
        eventType: 'subscription_canceled',
        userId: existingSubscription.userId,
        journeyStep: 'churn',
        metadata: {
          subscriptionId: subscription.id,
          canceledAt: new Date(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now()),
          plan: existingSubscription.plan,
        },
      });
    } catch (error) {
      console.error('❌ Error processing subscription.canceled:', error);
      // Don't throw - webhook must return 200 OK
    }
  }

  /**
   * Invoice created (upcoming charge notification)
   */
  private async onInvoiceCreated(invoice: Stripe.Invoice) {
    console.log('📄 Invoice created:', invoice.id);
    // TODO: Store invoice in database
  }

  /**
   * Invoice paid successfully
   */
  private async onInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('💳 Invoice payment succeeded:', invoice.id);

    const customerId = invoice.customer as string;
    const customer = await this.stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email;

    // TODO: Update invoice status to 'paid' in database

    if (email && invoice.hosted_invoice_url) {
      // Send invoice to customer
      await this.emailService.sendInvoice({
        email,
        invoiceId: invoice.number || invoice.id,
        amount: invoice.amount_paid || 0,
        plan: 'PRO',
        invoicePdfUrl: invoice.hosted_invoice_url,
        dueDate: new Date(invoice.due_date ? invoice.due_date * 1000 : Date.now()),
      });
    }

    // Track event
    await this.analyticsService.trackEvent({
      eventType: 'invoice_paid',
      metadata: {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
      },
    });
  }

  /**
   * Invoice payment failed
   */
  private async onInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log('⚠️  Invoice payment failed:', invoice.id);

    const customerId = invoice.customer as string;
    const customer = await this.stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email;

    // TODO: Update invoice status to 'failed' in database
    // TODO: Track retry attempts

    const attemptNumber = (invoice.attempt_count || 1);

    if (email) {
      // Send payment failed warning with escalating urgency
      await this.emailService.sendPaymentFailedWarning({
        email,
        name: (customer as Stripe.Customer).name || 'User',
        retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        attempt: attemptNumber,
      });
    }

    // Final attempt: suspend workspace access
    if (attemptNumber >= 3) {
      console.log('🚫 Suspending workspace access due to payment failure');
      // TODO: Set workspace.suspended = true
    }

    // Track event
    await this.analyticsService.trackEvent({
      eventType: 'invoice_payment_failed',
      metadata: {
        invoiceId: invoice.id,
        attemptNumber,
      },
    });
  }

  /**
   * Charge refunded - Handle booking refund
   */
  private async onChargeRefunded(charge: Stripe.Charge) {
    console.log('💰 Charge refunded:', charge.id);

    try {
      // Try to find a booking associated with this charge via payment intent
      const paymentIntentId = charge.payment_intent as string;

      if (paymentIntentId) {
        const booking = await this.prisma.booking.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
          include: {
            user: true,
            service: true,
            consultant: true,
          },
        });

        if (booking) {
          // Mark booking as refunded
          await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'refunded',
            },
          });

          // Send refund confirmation email to user
          if (booking.user?.email) {
            await this.emailService.sendRefundConfirmation({
              email: booking.user.email,
              name: booking.user.name || 'User',
              bookingId: booking.id,
              serviceName: booking.service.name,
              consultantName: booking.consultant.name,
              refundAmount: charge.amount_refunded / 100, // Convert from cents
              refundDate: new Date(),
            });
          }

          // Track event
          await this.analyticsService.trackEvent({
            eventType: 'booking_refunded',
            metadata: {
              bookingId: booking.id,
              chargeId: charge.id,
              refundAmount: charge.amount_refunded,
            },
          });

          return;
        }
      }

      // If no booking found, track as subscription/general refund
      await this.analyticsService.trackEvent({
        eventType: 'charge_refunded',
        metadata: {
          chargeId: charge.id,
          paymentIntentId,
          amount: charge.amount_refunded,
        },
      });

    } catch (error) {
      console.error('❌ Error processing charge.refunded:', error);
      // Don't throw - webhook must return 200 OK
    }
  }
}
