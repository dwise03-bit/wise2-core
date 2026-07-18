import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller('v1/billing/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger('StripeWebhookController');

  constructor(
    private stripeService: StripeService,
    private billingService: BillingService
  ) {}

  /**
   * POST /api/v1/billing/webhook/stripe
   * Handle Stripe webhook events
   *
   * Stripe sends webhook notifications for events like:
   * - payment_intent.succeeded - Payment successful
   * - customer.subscription.created - New subscription
   * - customer.subscription.updated - Subscription updated
   * - customer.subscription.deleted - Subscription cancelled
   * - invoice.payment_succeeded - Invoice paid
   * - invoice.payment_failed - Invoice payment failed
   */
  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<any>,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: boolean }> {
    try {
      if (!signature) {
        throw new BadRequestException('Missing stripe-signature header');
      }

      // Get the raw body for signature verification
      const payload = request.rawBody?.toString() || JSON.stringify(request.body);

      // Verify the signature
      const isValid = this.stripeService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        this.logger.warn('❌ Invalid Stripe webhook signature');
        throw new BadRequestException('Invalid signature');
      }

      // Parse the event
      const event =
        typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

      // Log the event
      this.logger.log(`📢 Received Stripe webhook: ${event.type}`);

      // Handle specific events with database updates
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.billingService.handleSubscriptionCreated(
            event.data.object
          );
          break;

        case 'customer.subscription.deleted':
          await this.billingService.handleSubscriptionDeleted(
            event.data.object.id
          );
          break;

        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
          // Handle invoice events
          break;

        default:
          this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
      }

      // Also notify Stripe service for logging
      await this.stripeService.handleWebhookEvent(event);

      this.logger.log(`✅ Processed Stripe webhook: ${event.type}`);
      return { received: true };
    } catch (error) {
      this.logger.error(
        `❌ Failed to process webhook: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException(
        `Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    this.logger.log(`💳 Payment intent succeeded: ${paymentIntent.id}`);

    if (paymentIntent.metadata?.userId) {
      const userId = paymentIntent.metadata.userId;
      this.logger.log(`   User: ${userId}, Amount: ${paymentIntent.amount / 100}`);
      // Additional processing can be added here
    }
  }
}
