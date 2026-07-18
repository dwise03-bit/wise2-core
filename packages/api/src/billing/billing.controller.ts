import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller('v1/billing')
export class BillingController {
  private readonly logger = new Logger('BillingController');

  constructor(private readonly billingService: BillingService) {}

  /**
   * GET /api/v1/billing/pricing
   * Get available pricing tiers
   */
  @Get('pricing')
  @ApiOperation({ summary: 'Get available pricing tiers' })
  async getPricing() {
    return this.billingService.getPricingTiers();
  }

  /**
   * GET /api/v1/billing/subscription
   * Get current user's subscription
   */
  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription' })
  async getSubscription(@Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.billingService.getSubscription(userId);
  }

  /**
   * POST /api/v1/billing/checkout
   * Create a checkout session
   */
  @Post('checkout')
  @ApiOperation({ summary: 'Create checkout session for plan upgrade' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planId: { type: 'string', example: 'STARTER' },
        successUrl: {
          type: 'string',
          example: 'https://app.wise2.net/billing/success',
        },
        cancelUrl: {
          type: 'string',
          example: 'https://app.wise2.net/billing/cancel',
        },
      },
      required: ['planId', 'successUrl', 'cancelUrl'],
    },
  })
  async createCheckoutSession(
    @Body()
    data: {
      planId: string;
      successUrl: string;
      cancelUrl: string;
    },
    @Request() req: any
  ) {
    const userId = req.user?.sub || req.userId || 'test-user';

    if (!data.planId || !data.successUrl || !data.cancelUrl) {
      throw new BadRequestException(
        'planId, successUrl, and cancelUrl are required'
      );
    }

    return await this.billingService.createCheckoutSession(
      userId,
      data.planId,
      data.successUrl,
      data.cancelUrl
    );
  }

  /**
   * PUT /api/v1/billing/subscription/plan
   * Upgrade or downgrade subscription plan
   */
  @Put('subscription/plan')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planId: { type: 'string', example: 'PRO' },
      },
      required: ['planId'],
    },
  })
  async updatePlan(@Body() data: { planId: string }, @Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';

    if (!data.planId) {
      throw new BadRequestException('planId is required');
    }

    return await this.billingService.updatePlan(userId, data.planId);
  }

  /**
   * GET /api/v1/billing/can-generate
   * Check if user can generate music (feature gating)
   */
  @Get('can-generate')
  @ApiOperation({ summary: 'Check if user can generate music' })
  async canGenerate(@Request() req: any) {
    const userId = req.user?.sub || req.userId || 'test-user';
    return await this.billingService.canGenerateMusic(userId);
  }

  /**
   * POST /api/v1/billing/record-generation
   * Record a generation (increment usage counter)
   */
  @Post('record-generation')
  @ApiOperation({ summary: 'Record a music generation for usage tracking' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        generationType: { type: 'string', example: 'music' },
      },
    },
  })
  async recordGeneration(
    @Body() data: { generationType?: string },
    @Request() req: any
  ) {
    const userId = req.user?.sub || req.userId || 'test-user';
    await this.billingService.recordGeneration(
      userId,
      data.generationType || 'music'
    );
    return { recorded: true };
  }
}
