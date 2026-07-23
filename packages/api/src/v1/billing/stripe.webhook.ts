import Stripe from 'stripe';
import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { ConsultingService } from '../consulting/consulting.service';
import { PrismaService } from '@app/common/prisma.service';

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
    private consultingService: ConsultingService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
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
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
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
      const booking = await this.prisma.booking.findUnique({
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

      // Confirm booking (updates payment status)
      const confirmedBooking = await this.consultingService.confirmBooking(paymentIntent.id);

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
      const booking = await this.prisma.booking.findUnique({
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
   */
  private async onSubscriptionCreated(subscription: Stripe.Subscription) {
    console.log('✅ Subscription created:', subscription.id);

    const customerId = subscription.customer as string;
    const customer = await this.stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email;

    // TODO: Update database subscription status to 'trialing'

    // Track event
    await this.analyticsService.trackEvent({
      eventType: 'subscription_created',
      journeyStep: 'trial_started',
      metadata: {
        subscriptionId: subscription.id,
        trialEndsAt: new Date(subscription.trial_end ? subscription.trial_end * 1000 : Date.now()),
      },
    });

    // Send confirmation (welcome email was sent in checkout success handler)
    console.log('✉️  Welcome email would be sent to', email);
  }

  /**
   * Subscription updated (plan changed, billing updated, etc.)
   */
  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log('🔄 Subscription updated:', subscription.id);

    // TODO: Update database with new plan, status, billing dates

    const customerId = subscription.customer as string;
    const customer = await this.stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email;

    // Check if plan changed (upgrade/downgrade)
    // TODO: Compare with previous subscription data
    if (subscription.items.data.length > 0) {
      const planId = (subscription.items.data[0].price.product as string);
      console.log('📊 Plan updated to:', planId);

      // Send upgrade/downgrade confirmation
      if (email) {
        await this.emailService.sendUpgradeConfirmation({
          email,
          name: (customer as Stripe.Customer).name || 'User',
          oldPlan: 'PRO',
          newPlan: 'ENTERPRISE',
          newPrice: (subscription.items.data[0].price.unit_amount || 0) / 100,
        });
      }
    }

    // Track event
    await this.analyticsService.trackEvent({
      eventType: 'subscription_updated',
      metadata: {
        subscriptionId: subscription.id,
        status: subscription.status,
      },
    });
  }

  /**
   * Subscription canceled
   */
  private async onSubscriptionCanceled(subscription: Stripe.Subscription) {
    console.log('❌ Subscription canceled:', subscription.id);

    const customerId = subscription.customer as string;
    const customer = await this.stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email;

    // TODO: Update database subscription status to 'canceled'
    // TODO: Schedule workspace deletion if needed

    if (email) {
      // Send cancellation confirmation
      await this.emailService.sendCancellationConfirmation({
        email,
        name: (customer as Stripe.Customer).name || 'User',
        workspaceName: 'Your Workspace',
        cancelDate: new Date(),
      });

      // Schedule win-back email for 30 days later
      // TODO: Add to email queue with delay
    }

    // Track event
    await this.analyticsService.trackEvent({
      eventType: 'subscription_canceled',
      journeyStep: 'churn',
      metadata: {
        subscriptionId: subscription.id,
        canceledAt: new Date(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now()),
      },
    });
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

    if (email && invoice.pdf) {
      // Send invoice to customer
      await this.emailService.sendInvoice({
        email,
        invoiceId: invoice.number || invoice.id,
        amount: invoice.amount_paid || 0,
        plan: 'PRO',
        invoicePdfUrl: invoice.pdf,
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
        const booking = await this.prisma.booking.findUnique({
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
