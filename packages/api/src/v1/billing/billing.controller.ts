import { Controller, Post, Get, Put, Body, Param, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { EmailService } from '../email/email.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { StripeWebhookHandler } from './stripe.webhook';

@Controller('v1/billing')
export class BillingController {
  constructor(
    private billingService: BillingService,
    private emailService: EmailService,
    private workspacesService: WorkspacesService,
    private analyticsService: AnalyticsService,
    private stripeWebhookHandler: StripeWebhookHandler,
  ) {}

  /**
   * POST /v1/billing/checkout
   * Create a Stripe checkout session for subscription
   */
  @Post('checkout')
  async createCheckout(
    @Body() body: {
      planId: string;
      email: string;
      fullName: string;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    try {
      const { url, sessionId } = await this.billingService.createCheckoutSession(
        body.email, // Will be userId after auth
        body.planId,
        body.email,
      );

      // Track event
      await this.analyticsService.trackEvent({
        eventType: 'checkout_session_created',
        journeyStep: 'checkout',
        metadata: { planId: body.planId, sessionId },
      });

      return { url, sessionId };
    } catch (error) {
      throw new Error(`Checkout failed: ${error.message}`);
    }
  }

  /**
   * POST /v1/billing/success
   * Handle successful payment and provision workspace
   */
  @Post('success')
  async handleCheckoutSuccess(
    @Body() body: { sessionId: string },
  ) {
    try {
      // Fulfill subscription
      const subscriptionData = await this.billingService.fulfillSubscription(body.sessionId);

      // Get user email (from Stripe session)
      const userEmail = subscriptionData.email; // Would come from Stripe

      // Create workspace
      const workspace = await this.workspacesService.createWorkspace(
        subscriptionData.userId,
        {
          name: 'My Workspace',
          urlSlug: `workspace-${Date.now()}`,
          subscriptionId: subscriptionData.id,
        },
      );

      // Send welcome email
      await this.emailService.sendWelcomeEmail({
        email: userEmail,
        name: subscriptionData.fullName || 'User',
        workspaceName: workspace.name,
        workspaceUrl: workspace.urlSlug,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
        subscriptionId: subscriptionData.id,
        workspaceId: workspace.id,
        inviteLink: workspace.inviteLink,
      };
    } catch (error) {
      throw new Error(`Checkout success handling failed: ${error.message}`);
    }
  }

  /**
   * GET /v1/billing/subscription/:subscriptionId
   * Get subscription details
   */
  @Get('subscription/:subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    try {
      const subscription = await this.billingService.getSubscription(subscriptionId);
      return subscription;
    } catch (error) {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }
  }

  /**
   * PUT /v1/billing/subscription/:subscriptionId/plan
   * Upgrade or downgrade subscription
   */
  @Put('subscription/:subscriptionId/plan')
  async updateSubscriptionPlan(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { planId: string },
  ) {
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
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  /**
   * POST /v1/billing/subscription/:subscriptionId/cancel
   * Cancel subscription
   */
  @Post('subscription/:subscriptionId/cancel')
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body?: { reason?: string },
  ) {
    try {
      const result = await this.billingService.cancelSubscription(
        subscriptionId,
        body?.reason,
      );

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
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * GET /v1/billing/subscription/:subscriptionId/invoices
   * Get invoices for subscription
   */
  @Get('subscription/:subscriptionId/invoices')
  async getInvoices(
    @Param('subscriptionId') subscriptionId: string,
  ) {
    try {
      const invoices = await this.billingService.getInvoices(subscriptionId);
      return { invoices };
    } catch (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
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
  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      if (!signature) {
        return { error: 'Missing stripe-signature header', received: false };
      }

      // Verify webhook signature for security
      const rawBody = req.rawBody;
      const event = this.stripeWebhookHandler.verifyWebhookSignature(rawBody, signature);

      // Process the verified event
      await this.stripeWebhookHandler.handleEvent(event);

      return { received: true, eventType: event.type };
    } catch (error) {
      console.error('❌ Webhook handling error:', error.message);
      // Return 200 OK even on error to prevent webhook retries
      // Errors are logged for debugging
      return { received: true, error: error.message };
    }
  }
}
