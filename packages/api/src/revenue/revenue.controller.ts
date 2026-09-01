import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { LeadScoringService, ScoringResult } from './lead-scoring.service';
import { OfferRecommendationService, OfferRecommendation } from './offer-recommendation.service';
import { AICloserService, ClosingContext } from './ai-closer.service';
import { FollowUpService } from './followup.service';
import { PhoneBridgeService, CallInitiatedEvent } from './phone-bridge.service';
import { AttributionService } from './attribution.service';
import { LeadScore, Offer, Deal } from '@prisma/client';

@Controller('revenue')
export class RevenueController {
  constructor(
    private scoringService: LeadScoringService,
    private recommendationService: OfferRecommendationService,
    private closerService: AICloserService,
    private followUpService: FollowUpService,
    private phoneBridgeService: PhoneBridgeService,
    private attributionService: AttributionService,
  ) {}

  /**
   * POST /revenue/leads/{leadId}/score
   * Calculate or recalculate lead score
   */
  @Post('leads/:leadId/score')
  async calculateLeadScore(@Param('leadId') leadId: string): Promise<LeadScore> {
    return this.scoringService.calculateLeadScore(leadId);
  }

  /**
   * GET /revenue/leads/{leadId}/score
   * Get current lead score
   */
  @Get('leads/:leadId/score')
  async getLeadScore(@Param('leadId') leadId: string) {
    return this.scoringService.getScoreSummary(leadId);
  }

  /**
   * POST /revenue/leads/batch-recalculate
   * Recalculate scores for top N leads (default 100)
   */
  @Post('leads/batch-recalculate')
  async batchRecalculateScores(
    @Query('limit') limit: string = '100',
  ): Promise<LeadScore[]> {
    return this.scoringService.batchRecalculateScores(parseInt(limit));
  }

  /**
   * GET /revenue/leads/{leadId}/recommendations
   * Get recommended offers for a lead
   */
  @Get('leads/:leadId/recommendations')
  async getOfferRecommendations(
    @Param('leadId') leadId: string,
  ): Promise<OfferRecommendation[]> {
    const recommendations = await this.recommendationService.getRecommendedOffers(
      leadId,
    );
    return recommendations;
  }

  /**
   * GET /revenue/leads/{leadId}/best-offer
   * Get single best offer recommendation
   */
  @Get('leads/:leadId/best-offer')
  async getBestOffer(
    @Param('leadId') leadId: string,
  ): Promise<OfferRecommendation | null> {
    return this.recommendationService.getRecommendedOffer(leadId);
  }

  /**
   * GET /revenue/offers
   * List all active offers
   */
  @Get('offers')
  async listOffers(
    @Query('aiClosable') aiClosable?: string,
    @Query('industry') industry?: string,
  ): Promise<Offer[]> {
    const where: any = { isActive: true };

    if (aiClosable === 'true') {
      where.aiClosable = true;
    }

    if (industry) {
      where.allowedIndustries = { has: industry };
    }

    return this.scoringService['prisma'].offer.findMany({ where });
  }

  /**
   * GET /revenue/offers/{offerId}
   * Get offer details
   */
  @Get('offers/:offerId')
  async getOfferDetails(@Param('offerId') offerId: string): Promise<Offer | null> {
    return this.recommendationService.getOfferDetails(offerId);
  }

  /**
   * POST /revenue/offers
   * Create new offer (admin only)
   */
  @Post('offers')
  async createOffer(
    @Body()
    offerData: {
      name: string;
      basePrice: number;
      minimumPrice: number;
      aiClosable?: boolean;
      isRecurring?: boolean;
      allowedIndustries?: string[];
    },
  ): Promise<Offer> {
    return this.scoringService['prisma'].offer.create({
      data: {
        name: offerData.name,
        basePrice: offerData.basePrice,
        minimumPrice: offerData.minimumPrice,
        aiClosable: offerData.aiClosable || false,
        isRecurring: offerData.isRecurring || false,
        allowedIndustries: offerData.allowedIndustries || [],
        isActive: true,
      },
    });
  }

  /**
   * POST /revenue/deals/{dealId}/close
   * Attempt AI close on a deal
   */
  @Post('deals/:dealId/close')
  async attemptClose(
    @Param('dealId') dealId: string,
    @Body() body: { offerId?: string },
  ): Promise<any> {
    const prisma = this.scoringService['prisma'];

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { lead: { include: { score: true } } },
    });

    if (!deal || !deal.lead || !deal.lead.score) {
      throw new Error('Deal, lead, or score not found');
    }

    const offer =
      body.offerId && body.offerId !== 'auto'
        ? await prisma.offer.findUnique({ where: { id: body.offerId } })
        : deal.aiClosableOfferId
        ? await prisma.offer.findUnique({ where: { id: deal.aiClosableOfferId } })
        : null;

    if (!offer) {
      throw new Error('Offer not specified or not found');
    }

    const context: ClosingContext = {
      deal,
      offer,
      leadScore: deal.lead.score,
      customerId: deal.customerId || undefined,
    };

    return this.closerService.attemptClose(context);
  }

  /**
   * POST /revenue/deals/{dealId}/objection
   * Handle prospect objection
   */
  @Post('deals/:dealId/objection')
  async handleObjection(
    @Param('dealId') dealId: string,
    @Body() body: { objectionText: string; offerId?: string },
  ): Promise<any> {
    const prisma = this.scoringService['prisma'];

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { lead: { include: { score: true } } },
    });

    if (!deal || !deal.lead || !deal.lead.score) {
      throw new Error('Deal, lead, or score not found');
    }

    const offer = body.offerId
      ? await prisma.offer.findUnique({ where: { id: body.offerId } })
      : deal.aiClosableOfferId
      ? await prisma.offer.findUnique({ where: { id: deal.aiClosableOfferId } })
      : null;

    if (!offer) {
      throw new Error('Offer not found');
    }

    const context: ClosingContext = {
      deal,
      offer,
      leadScore: deal.lead.score,
    };

    return this.closerService.handleObjection(context, body.objectionText);
  }

  /**
   * GET /revenue/deals/{dealId}/closing-recommendations
   * Get AI closing recommendations
   */
  @Get('deals/:dealId/closing-recommendations')
  async getClosingRecommendations(
    @Param('dealId') dealId: string,
  ): Promise<any> {
    return this.closerService.getClosingRecommendations(dealId);
  }

  /**
   * GET /revenue/deals/{dealId}/escalate
   * Check if deal should escalate
   */
  @Get('deals/:dealId/escalate')
  async checkEscalation(
    @Param('dealId') dealId: string,
    @Body() body: { offerId: string },
  ): Promise<any> {
    const prisma = this.scoringService['prisma'];

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { lead: { include: { score: true } } },
    });

    if (!deal || !deal.lead || !deal.lead.score) {
      throw new Error('Deal, lead, or score not found');
    }

    const offer = await prisma.offer.findUnique({
      where: { id: body.offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    const context: ClosingContext = {
      deal,
      offer,
      leadScore: deal.lead.score,
    };

    return this.closerService.shouldEscalateTohuman(context);
  }

  /**
   * POST /revenue/phone/call-initiated
   * Handle inbound call from phone gateway
   */
  @Post('phone/call-initiated')
  async handleCallInitiated(
    @Body() body: { callSessionId: string; from: string; to: string },
  ): Promise<any> {
    return this.phoneBridgeService.handleCallInitiated({
      callSessionId: body.callSessionId,
      from: body.from,
      to: body.to,
      timestamp: new Date(),
    });
  }

  /**
   * POST /revenue/phone/call-completed
   * Handle call completion and scoring
   */
  @Post('phone/call-completed')
  async handleCallCompleted(
    @Body()
    body: {
      callSessionId: string;
      callId: string;
      duration: number;
      transcript?: string;
      summary?: string;
      status: string;
    },
  ): Promise<void> {
    return this.phoneBridgeService.handleCallCompleted(body);
  }

  /**
   * GET /revenue/phone/call-history/{leadId}
   * Get call history for a lead
   */
  @Get('phone/call-history/:leadId')
  async getCallHistory(@Param('leadId') leadId: string): Promise<any> {
    return this.phoneBridgeService.getCallHistory(leadId);
  }

  /**
   * POST /revenue/followup/schedule
   * Schedule a follow-up task
   */
  @Post('followup/schedule')
  async scheduleFollowUp(
    @Body()
    body: {
      leadId: string;
      channel: 'sms' | 'email' | 'call';
      message: string;
      delayMinutes: number;
    },
  ): Promise<any> {
    return this.followUpService.scheduleFollowUp(
      body.leadId,
      body.channel,
      body.message,
      body.delayMinutes,
    );
  }

  /**
   * POST /revenue/followup/sequence
   * Create automated follow-up sequence
   */
  @Post('followup/sequence')
  async createFollowUpSequence(
    @Body()
    body: { leadId: string; stage: string },
  ): Promise<void> {
    return this.followUpService.createFollowUpSequence(body.leadId, body.stage);
  }

  /**
   * GET /revenue/followup/pending/{leadId}
   * Get pending follow-ups for a lead
   */
  @Get('followup/pending/:leadId')
  async getPendingFollowUps(@Param('leadId') leadId: string): Promise<any> {
    return this.followUpService.getPendingFollowUps(leadId);
  }

  /**
   * POST /revenue/followup/cancel/{taskId}
   * Cancel a follow-up task
   */
  @Post('followup/cancel/:taskId')
  async cancelFollowUp(@Param('taskId') taskId: string): Promise<void> {
    return this.followUpService.cancelFollowUp(taskId);
  }

  /**
   * POST /revenue/reactivate/{leadId}
   * Start reactivation campaign for old lead
   */
  @Post('reactivate/:leadId')
  async startReactivation(@Param('leadId') leadId: string): Promise<void> {
    return this.followUpService.createReactivationCampaign(leadId);
  }

  /**
   * GET /revenue/attribution/by-source
   * Get revenue attribution by source
   */
  @Get('attribution/by-source')
  async getAttributionBySource(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.attributionService.getAttributionBySource(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * GET /revenue/attribution/by-owner
   * Get revenue attribution by sales owner
   */
  @Get('attribution/by-owner')
  async getAttributionByOwner(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.attributionService.getAttributionByOwner(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * GET /revenue/pipeline
   * Get pipeline metrics by stage
   */
  @Get('pipeline')
  async getPipeline(): Promise<any> {
    return this.attributionService.getPipelineMetrics();
  }

  /**
   * GET /revenue/funnel
   * Get funnel conversion metrics
   */
  @Get('funnel')
  async getFunnel(): Promise<any> {
    return this.attributionService.getFunnelMetrics();
  }

  /**
   * GET /revenue/trend
   * Get revenue trend over time
   */
  @Get('trend')
  async getRevenueTrend(@Query('days') days: string = '30'): Promise<any> {
    return this.attributionService.getRevenueTrend(parseInt(days));
  }

  /**
   * GET /revenue/top-deals
   * Get top performing deals
   */
  @Get('top-deals')
  async getTopDeals(@Query('limit') limit: string = '10'): Promise<any> {
    return this.attributionService.getTopDeals(parseInt(limit));
  }

  /**
   * GET /revenue/insights
   * Get conversion insights
   */
  @Get('insights')
  async getInsights(): Promise<any> {
    return this.attributionService.getConversionInsights();
  }

  /**
   * GET /revenue/dashboard
   * Revenue dashboard summary
   */
  @Get('dashboard')
  async getDashboard(
    @Query('period') period: string = 'today',
  ): Promise<any> {
    return this.buildDashboard(period);
  }

  private async buildDashboard(period: string): Promise<any> {
    const prisma = this.scoringService['prisma'];

    // Date range calculation
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const [
      newLeads,
      hotLeads,
      openDeals,
      wonDeals,
      totalRevenue,
      topLeads,
    ] = await Promise.all([
      prisma.lead.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.leadScore.count({
        where: {
          level: { in: ['HOT', 'CLOSING_READY'] },
          lastCalculatedAt: { gte: startDate },
        },
      }),
      prisma.deal.count({
        where: { stage: { notIn: ['WON', 'LOST'] } },
      }),
      prisma.deal.count({
        where: { stage: 'WON', closedAt: { gte: startDate } },
      }),
      prisma.revenueEvent.aggregate({
        where: { createdAt: { gte: startDate }, eventType: 'deal_won' },
        _sum: { value: true },
      }),
      prisma.leadScore.findMany({
        where: { level: 'CLOSING_READY' },
        include: { lead: true },
        take: 5,
        orderBy: { totalScore: 'desc' },
      }),
    ]);

    const openDealsValue = await prisma.deal.aggregate({
      where: { stage: { notIn: ['WON', 'LOST'] } },
      _sum: { value: true },
    });

    return {
      period,
      summary: {
        newLeads,
        hotLeads,
        openDeals,
        openDealsValue: openDealsValue._sum.value || 0,
        wonDeals,
        revenue: totalRevenue._sum.value || 0,
      },
      topLeads: topLeads.map((sl) => ({
        id: sl.lead.id,
        score: sl.totalScore,
        level: sl.level,
        recommended: sl.recommendedAction,
      })),
      timestamp: new Date(),
    };
  }
}
