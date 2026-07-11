import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { BillingService } from './billing.service'

@Controller('api/v1/billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('subscribe')
  async subscribe(@Request() req: any, @Body() dto: any) {
    return await this.billingService.createSubscription(req.user.userId, dto.plan_id, dto.token)
  }

  @Get('subscription')
  async getSubscription(@Request() req: any) {
    return await this.billingService.getSubscription(req.user.userId)
  }

  @Get('invoices')
  async getInvoices(@Request() req: any) {
    return await this.billingService.getInvoices(req.user.userId)
  }
}
