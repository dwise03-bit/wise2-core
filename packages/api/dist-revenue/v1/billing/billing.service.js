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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
let BillingService = class BillingService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2023-10-16',
        });
    }
    /**
     * Create a Stripe checkout session for subscription
     */
    async createCheckoutSession(userId, planId, email) {
        const PLANS = {
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
    async fulfillSubscription(sessionId) {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        if (!session.subscription) {
            throw new Error('No subscription found');
        }
        const subscription = await this.stripe.subscriptions.retrieve(session.subscription);
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
    async getSubscription(userId) {
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
    async updateSubscription(userId, newPlanId) {
        // Get current subscription
        // Update Stripe subscription
        // Update database
        return { success: true };
    }
    /**
     * Cancel subscription
     */
    async cancelSubscription(userId, reason) {
        // Get subscription
        // Cancel in Stripe
        // Update database
        // Send cancellation email with retention offer
        return { success: true };
    }
    /**
     * Get invoices
     */
    async getInvoices(userId, limit = 12) {
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
    async handleWebhook(event) {
        switch (event.type) {
            case 'customer.subscription.created':
                await this.onSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.onSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.onSubscriptionCanceled(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.onInvoicePaid(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.onInvoiceFailed(event.data.object);
                break;
        }
    }
    async onSubscriptionCreated(subscription) {
        // Log subscription creation
        // Send welcome email
    }
    async onSubscriptionUpdated(subscription) {
        // Update database with new plan
        // Send upgrade/downgrade email
    }
    async onSubscriptionCanceled(subscription) {
        // Mark subscription as canceled
        // Send cancellation email
    }
    async onInvoicePaid(invoice) {
        // Send invoice to customer
        // Update usage tracking
    }
    async onInvoiceFailed(invoice) {
        // Send payment failed notification
        // Trigger retry logic
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BillingService);
//# sourceMappingURL=billing.service.js.map