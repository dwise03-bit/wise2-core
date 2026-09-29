import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request, BadRequestException, Logger } from '@nestjs/common';
import { StripeService, StripeCustomer, StripeSubscription, StripeInvoice } from './stripe.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('v1/billing')
@UseGuards(AuthGuard('jwt'))
export class BillingController {
  private readonly logger = new Logger('BillingController');

  constructor(private stripeService: StripeService) {}

  /**
   * POST /api/v1/billing/customer
   * Create a Stripe customer for the authenticated user
   */
  @Post('customer')
  async createCustomer(
    @Request() req: any,
    @Body() body: { name?: string }
  ): Promise<{ customer: StripeCustomer }> {
    try {
      const customer = await this.stripeService.createCustomer(
        req.user.id,
        req.user.email,
        body.name || req.user.firstName
      );
      this.logger.log(`📝 Customer created for user ${req.user.id}`);
      return { customer };
    } catch (error) {
      throw new BadRequestException(`Failed to create customer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET /api/v1/billing/customer/:customerId
   * Get Stripe customer details
   */
  @Get('customer/:customerId')
  async getCustomer(@Param('customerId') customerId: string): Promise<{ customer: StripeCustomer }> {
    try {
      const customer = await this.stripeService.getCustomer(customerId);
      return { customer };
    } catch (error) {
      throw new BadRequestException(`Failed to get customer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * POST /api/v1/billing/subscribe
   * Create a subscription for a customer
   */
  @Post('subscribe')
  async createSubscription(
    @Request() req: any,
    @Body() body: { customerId: string; priceId: string; trialDays?: number }
  ): Promise<{ subscription: StripeSubscription }> {
    try {
      if (!body.customerId || !body.priceId) {
        throw new BadRequestException('customerId and priceId are required');
      }

      const subscription = await this.stripeService.createSubscription(
        body.customerId,
        body.priceId,
        body.trialDays
      );
      this.logger.log(`💳 Subscription created for customer ${body.customerId}`);
      return { subscription };
    } catch (error) {
      throw new BadRequestException(`Failed to create subscription: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET /api/v1/billing/subscription/:subscriptionId
   * Get subscription details
   */
  @Get('subscription/:subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string): Promise<{ subscription: StripeSubscription }> {
    try {
      const subscription = await this.stripeService.getSubscription(subscriptionId);
      return { subscription };
    } catch (error) {
      throw new BadRequestException(`Failed to get subscription: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * PATCH /api/v1/billing/subscription/:subscriptionId
   * Update subscription (e.g., change plan)
   */
  @Patch('subscription/:subscriptionId')
  async updateSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { newPriceId: string }
  ): Promise<{ subscription: StripeSubscription }> {
    try {
      if (!body.newPriceId) {
        throw new BadRequestException('newPriceId is required');
      }

      const subscription = await this.stripeService.updateSubscription(subscriptionId, body.newPriceId);
      this.logger.log(`📝 Subscription updated: ${subscriptionId}`);
      return { subscription };
    } catch (error) {
      throw new BadRequestException(`Failed to update subscription: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * DELETE /api/v1/billing/subscription/:subscriptionId
   * Cancel subscription
   */
  @Delete('subscription/:subscriptionId')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string): Promise<{ subscription: StripeSubscription }> {
    try {
      const subscription = await this.stripeService.cancelSubscription(subscriptionId);
      this.logger.log(`❌ Subscription cancelled: ${subscriptionId}`);
      return { subscription };
    } catch (error) {
      throw new BadRequestException(`Failed to cancel subscription: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET /api/v1/billing/invoices/:customerId
   * Get invoices for a customer
   */
  @Get('invoices/:customerId')
  async getInvoices(
    @Param('customerId') customerId: string
  ): Promise<{ invoices: StripeInvoice[] }> {
    try {
      const invoices = await this.stripeService.getInvoices(customerId);
      return { invoices };
    } catch (error) {
      throw new BadRequestException(`Failed to get invoices: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * GET /api/v1/billing/status
   * Get Stripe integration status
   */
  @Get('status')
  getStatus(): any {
    return this.stripeService.getStatus();
  }
}
