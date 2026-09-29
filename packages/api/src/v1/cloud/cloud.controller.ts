import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { CloudPlanId } from './cloud.types';

@Controller('v1/cloud')
export class CloudController {
  constructor(private readonly cloudService: CloudService) {}

  @Get('health')
  async health() {
    return this.cloudService.getProviderHealth();
  }

  @Get('launch-status')
  async launchStatus() {
    return this.cloudService.getLaunchStatus();
  }

  @Get('plans')
  getPlans() {
    return { plans: this.cloudService.getPlans() };
  }

  @Post('checkout')
  async createCheckout(
    @Body()
    body: {
      planId: CloudPlanId;
      email: string;
      domainName: string;
      successUrl?: string;
      cancelUrl?: string;
    },
  ) {
    try {
      return await this.cloudService.createCheckout(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      throw new BadRequestException(message);
    }
  }

  @Post('portal')
  async createPortal(@Body() body: { email: string; returnUrl?: string }) {
    try {
      return await this.cloudService.createPortalSession(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Portal session failed';
      throw new BadRequestException(message);
    }
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    try {
      return this.cloudService.getOrder(id);
    } catch (error) {
      throw new BadRequestException('Cloud order not found');
    }
  }

  @Get('services')
  getServices(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return { services: this.cloudService.getServices(email) };
  }
}
