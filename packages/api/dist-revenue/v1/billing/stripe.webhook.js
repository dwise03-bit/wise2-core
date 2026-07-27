"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookHandler = void 0;
const stripe_1 = __importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const email_service_1 = require("../email/email.service");
const analytics_service_1 = require("../analytics/analytics.service");
const prisma_service_1 = require("../../prisma/prisma.service");
/**
 * Stripe Webhook Handler for Customer Journey & Consulting Bookings
 * Handles subscription lifecycle events and payment intents for bookings
 */
let StripeWebhookHandler = class StripeWebhookHandler {
    constructor(emailService, analyticsService, prisma) {
        this.emailService = emailService;
        this.analyticsService = analyticsService;
        this.prisma = prisma;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '');
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    }
    /**
     * Verify webhook signature for security
     * Returns the verified event object
     */
    verifyWebhookSignature(rawBody, signature) {
        if (!this.webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        try {
            const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
            return event;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${message}`);
        }
    }
    /**
     * Main webhook event processor
     */
    async handleEvent(event) {
        console.log('🔔 Stripe webhook received:', event.type);
        switch (event.type) {
            // Payment Intent lifecycle (for consulting bookings)
            case 'payment_intent.succeeded':
                return this.onPaymentIntentSucceeded(event.data.object);
            case 'payment_intent.payment_failed':
                return this.onPaymentIntentFailed(event.data.object);
            // Subscription lifecycle
            case 'customer.subscription.created':
                return this.onSubscriptionCreated(event.data.object);
            case 'customer.subscription.updated':
                return this.onSubscriptionUpdated(event.data.object);
            case 'customer.subscription.deleted':
                return this.onSubscriptionCanceled(event.data.object);
            // Invoice/Payment lifecycle
            case 'invoice.created':
                return this.onInvoiceCreated(event.data.object);
            case 'invoice.payment_succeeded':
                return this.onInvoicePaymentSucceeded(event.data.object);
            case 'invoice.payment_failed':
                return this.onInvoicePaymentFailed(event.data.object);
            case 'charge.refunded':
                return this.onChargeRefunded(event.data.object);
            default:
                console.log('⚠️  Unhandled webhook event:', event.type);
        }
    }
    /**
     * Payment Intent succeeded - Consulting booking confirmed
     */
    async onPaymentIntentSucceeded(paymentIntent) {
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
        }
        catch (error) {
            console.error('❌ Error processing payment_intent.succeeded:', error);
            // Don't throw - webhook must return 200 OK
        }
    }
    /**
     * Payment Intent failed - Booking payment retry
     */
    async onPaymentIntentFailed(paymentIntent) {
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
        }
        catch (error) {
            console.error('❌ Error processing payment_intent.payment_failed:', error);
            // Don't throw - webhook must return 200 OK
        }
    }
    /**
     * New subscription created (trial started)
     */
    async onSubscriptionCreated(subscription) {
        console.log('✅ Subscription created:', subscription.id);
        const customerId = subscription.customer;
        const customer = await this.stripe.customers.retrieve(customerId);
        const email = customer.email;
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
    async onSubscriptionUpdated(subscription) {
        console.log('🔄 Subscription updated:', subscription.id);
        // TODO: Update database with new plan, status, billing dates
        const customerId = subscription.customer;
        const customer = await this.stripe.customers.retrieve(customerId);
        const email = customer.email;
        // Check if plan changed (upgrade/downgrade)
        // TODO: Compare with previous subscription data
        if (subscription.items.data.length > 0) {
            const planId = subscription.items.data[0].price.product;
            console.log('📊 Plan updated to:', planId);
            // Send upgrade/downgrade confirmation
            if (email) {
                await this.emailService.sendUpgradeConfirmation({
                    email,
                    name: customer.name || 'User',
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
    async onSubscriptionCanceled(subscription) {
        console.log('❌ Subscription canceled:', subscription.id);
        const customerId = subscription.customer;
        const customer = await this.stripe.customers.retrieve(customerId);
        const email = customer.email;
        // TODO: Update database subscription status to 'canceled'
        // TODO: Schedule workspace deletion if needed
        if (email) {
            // Send cancellation confirmation
            await this.emailService.sendCancellationConfirmation({
                email,
                name: customer.name || 'User',
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
    async onInvoiceCreated(invoice) {
        console.log('📄 Invoice created:', invoice.id);
        // TODO: Store invoice in database
    }
    /**
     * Invoice paid successfully
     */
    async onInvoicePaymentSucceeded(invoice) {
        console.log('💳 Invoice payment succeeded:', invoice.id);
        const customerId = invoice.customer;
        const customer = await this.stripe.customers.retrieve(customerId);
        const email = customer.email;
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
    async onInvoicePaymentFailed(invoice) {
        console.log('⚠️  Invoice payment failed:', invoice.id);
        const customerId = invoice.customer;
        const customer = await this.stripe.customers.retrieve(customerId);
        const email = customer.email;
        // TODO: Update invoice status to 'failed' in database
        // TODO: Track retry attempts
        const attemptNumber = (invoice.attempt_count || 1);
        if (email) {
            // Send payment failed warning with escalating urgency
            await this.emailService.sendPaymentFailedWarning({
                email,
                name: customer.name || 'User',
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
    async onChargeRefunded(charge) {
        console.log('💰 Charge refunded:', charge.id);
        try {
            // Try to find a booking associated with this charge via payment intent
            const paymentIntentId = charge.payment_intent;
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
        }
        catch (error) {
            console.error('❌ Error processing charge.refunded:', error);
            // Don't throw - webhook must return 200 OK
        }
    }
};
exports.StripeWebhookHandler = StripeWebhookHandler;
exports.StripeWebhookHandler = StripeWebhookHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        analytics_service_1.AnalyticsService,
        prisma_service_1.PrismaService])
], StripeWebhookHandler);
//# sourceMappingURL=stripe.webhook.js.map