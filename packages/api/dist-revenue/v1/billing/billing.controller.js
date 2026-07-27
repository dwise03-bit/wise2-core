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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const email_service_1 = require("../email/email.service");
const workspaces_service_1 = require("../workspaces/workspaces.service");
const analytics_service_1 = require("../analytics/analytics.service");
const stripe_webhook_1 = require("./stripe.webhook");
let BillingController = class BillingController {
    constructor(billingService, emailService, workspacesService, analyticsService, stripeWebhookHandler) {
        this.billingService = billingService;
        this.emailService = emailService;
        this.workspacesService = workspacesService;
        this.analyticsService = analyticsService;
        this.stripeWebhookHandler = stripeWebhookHandler;
    }
    /**
     * POST /v1/billing/checkout
     * Create a Stripe checkout session for subscription
     */
    async createCheckout(body) {
        try {
            const { url, sessionId } = await this.billingService.createCheckoutSession(body.email, // Will be userId after auth
            body.planId, body.email);
            // Track event
            await this.analyticsService.trackEvent({
                eventType: 'checkout_session_created',
                journeyStep: 'checkout',
                metadata: { planId: body.planId, sessionId },
            });
            return { url, sessionId };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Checkout failed: ${message}`);
        }
    }
    /**
     * POST /v1/billing/success
     * Handle successful payment and provision workspace
     */
    async handleCheckoutSuccess(body) {
        try {
            // Fulfill subscription
            const subscriptionData = await this.billingService.fulfillSubscription(body.sessionId);
            if (!subscriptionData.userId) {
                throw new Error('User ID not found in subscription metadata');
            }
            // Create workspace
            const workspace = await this.workspacesService.createWorkspace(subscriptionData.userId, {
                name: 'My Workspace',
                urlSlug: `workspace-${Date.now()}`,
                subscriptionId: subscriptionData.stripeSubscriptionId,
            });
            // Track event
            await this.analyticsService.trackEvent({
                userId: subscriptionData.userId,
                eventType: 'subscription_created',
                journeyStep: 'payment_success',
                metadata: { planId: subscriptionData.planId },
            });
            return {
                success: true,
                subscriptionId: subscriptionData.stripeSubscriptionId,
                workspaceId: workspace.id,
                inviteLink: workspace.inviteLink,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Checkout success handling failed: ${message}`);
        }
    }
    /**
     * GET /v1/billing/subscription/:subscriptionId
     * Get subscription details
     */
    async getSubscription(subscriptionId) {
        try {
            const subscription = await this.billingService.getSubscription(subscriptionId);
            return subscription;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fetch subscription: ${message}`);
        }
    }
    /**
     * PUT /v1/billing/subscription/:subscriptionId/plan
     * Upgrade or downgrade subscription
     */
    async updateSubscriptionPlan(subscriptionId, body) {
        try {
            const result = await this.billingService.updateSubscription(subscriptionId, body.planId);
            // Send confirmation email
            await this.emailService.sendUpgradeConfirmation({
                email: 'user@example.com', // Would come from subscription
                name: 'User',
                oldPlan: 'PRO',
                newPlan: 'ENTERPRISE',
                newPrice: 0,
            });
            // Track event
            await this.analyticsService.trackEvent({
                eventType: 'subscription_updated',
                journeyStep: 'plan_change',
                metadata: { planId: body.planId },
            });
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update subscription: ${message}`);
        }
    }
    /**
     * POST /v1/billing/subscription/:subscriptionId/cancel
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, body) {
        try {
            const result = await this.billingService.cancelSubscription(subscriptionId, body?.reason);
            // Send cancellation email
            await this.emailService.sendCancellationConfirmation({
                email: 'user@example.com',
                name: 'User',
                workspaceName: 'My Workspace',
                cancelDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            // Track event
            await this.analyticsService.trackEvent({
                eventType: 'subscription_cancelled',
                journeyStep: 'cancellation',
                metadata: { reason: body?.reason },
            });
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to cancel subscription: ${message}`);
        }
    }
    /**
     * GET /v1/billing/subscription/:subscriptionId/invoices
     * Get invoices for subscription
     */
    async getInvoices(subscriptionId) {
        try {
            const invoices = await this.billingService.getInvoices(subscriptionId);
            return { invoices };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fetch invoices: ${message}`);
        }
    }
    /**
     * POST /v1/billing/webhook
     * Handle Stripe webhooks with signature verification
     *
     * This endpoint receives and processes Stripe webhook events:
     * - Payment Intent events (booking confirmations/failures)
     * - Subscription lifecycle events
     * - Invoice and charge events
     *
     * Security: Webhook signature is verified against STRIPE_WEBHOOK_SECRET
     */
    async handleStripeWebhook(req, signature) {
        try {
            if (!signature) {
                throw new common_1.BadRequestException('Missing stripe-signature header');
            }
            // Verify webhook signature for security
            const rawBody = req.rawBody;
            if (!rawBody) {
                throw new common_1.BadRequestException('Missing request body');
            }
            const event = this.stripeWebhookHandler.verifyWebhookSignature(rawBody, signature);
            // Process the verified event
            await this.stripeWebhookHandler.handleEvent(event);
            return { received: true, eventType: event.type };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Webhook handling error:', message);
            throw new common_1.BadRequestException(message);
        }
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('success'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "handleCheckoutSuccess", null);
__decorate([
    (0, common_1.Get)('subscription/:subscriptionId'),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Put)('subscription/:subscriptionId/plan'),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateSubscriptionPlan", null);
__decorate([
    (0, common_1.Post)('subscription/:subscriptionId/cancel'),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('subscription/:subscriptionId/invoices'),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(400),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "handleStripeWebhook", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('v1/billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService,
        email_service_1.EmailService,
        workspaces_service_1.WorkspacesService,
        analytics_service_1.AnalyticsService,
        stripe_webhook_1.StripeWebhookHandler])
], BillingController);
//# sourceMappingURL=billing.controller.js.map