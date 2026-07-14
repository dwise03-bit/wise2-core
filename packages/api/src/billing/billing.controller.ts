import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  async checkout(@Body() data: { planId: string }, @Request() req: any) {
    const userId = req.user?.sub || 'test-user';
    return await this.billingService.createCheckoutSession(userId, data.planId);
  }

  @Post('webhook')
  async handleWebhook(@Body() data: any) {
    return await this.billingService.handleStripeWebhook(data);
  }

  @Get('subscription')
  async getSubscription(@Request() req: any) {
    const userId = req.user?.sub || 'test-user';
    return await this.billingService.getSubscription(userId);
  }
}
