import { Controller, Post, Body, Headers, Logger, RawBodyRequest, Req, BadRequestException } from '@nestjs/common'
import { StripeService } from './stripe.service'

@Controller('v1/billing/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger('StripeWebhookController')

  constructor(private stripeService: StripeService) {}

  /**
   * POST /api/v1/billing/webhook/stripe
   * Handle Stripe webhook events
   *
   * Stripe sends webhook notifications for events like:
   * - customer.subscription.updated
   * - customer.subscription.deleted
   * - invoice.payment_succeeded
   * - invoice.payment_failed
   */
  @Post('stripe')
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<any>,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: boolean }> {
    try {
      if (!signature) {
        throw new BadRequestException('Missing stripe-signature header')
      }

      // Get the raw body for signature verification
      const payload = request.rawBody?.toString() || JSON.stringify(request.body)

      // Verify the signature
      const isValid = this.stripeService.verifyWebhookSignature(payload, signature)
      if (!isValid) {
        this.logger.warn('❌ Invalid Stripe webhook signature')
        throw new BadRequestException('Invalid signature')
      }

      // Parse the event
      const event = typeof request.body === 'string' ? JSON.parse(request.body) : request.body

      // Log the event
      this.logger.log(`📢 Received Stripe webhook: ${event.type}`)

      // Handle the event
      await this.stripeService.handleWebhookEvent(event)

      this.logger.log(`✅ Processed Stripe webhook: ${event.type}`)
      return { received: true }
    } catch (error) {
      this.logger.error(`❌ Failed to process webhook: ${error instanceof Error ? error.message : String(error)}`)
      throw new BadRequestException(`Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
