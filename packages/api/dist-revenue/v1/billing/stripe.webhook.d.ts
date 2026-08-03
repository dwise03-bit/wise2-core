import Stripe from 'stripe';
import { EmailService } from '../email/email.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
/**
 * Stripe Webhook Handler for Customer Journey & Consulting Bookings
 * Handles subscription lifecycle events and payment intents for bookings
 */
export declare class StripeWebhookHandler {
    private emailService;
    private analyticsService;
    private prisma;
    private stripe;
    private readonly webhookSecret;
    constructor(emailService: EmailService, analyticsService: AnalyticsService, prisma: PrismaService);
    /**
     * Verify webhook signature for security
     * Returns the verified event object
     */
    verifyWebhookSignature(rawBody: string | Buffer, signature: string): Stripe.Event;
    /**
     * Main webhook event processor
     */
    handleEvent(event: Stripe.Event): Promise<void>;
    /**
     * Payment Intent succeeded - Consulting booking confirmed
     */
    private onPaymentIntentSucceeded;
    /**
     * Payment Intent failed - Booking payment retry
     */
    private onPaymentIntentFailed;
    /**
     * New subscription created (trial started)
     */
    private onSubscriptionCreated;
    /**
     * Subscription updated (plan changed, billing updated, etc.)
     */
    private onSubscriptionUpdated;
    /**
     * Subscription canceled
     */
    private onSubscriptionCanceled;
    /**
     * Invoice created (upcoming charge notification)
     */
    private onInvoiceCreated;
    /**
     * Invoice paid successfully
     */
    private onInvoicePaymentSucceeded;
    /**
     * Invoice payment failed
     */
    private onInvoicePaymentFailed;
    /**
     * Charge refunded - Handle booking refund
     */
    private onChargeRefunded;
}
//# sourceMappingURL=stripe.webhook.d.ts.map