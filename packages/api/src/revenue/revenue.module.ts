import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '@shared/prisma';
import { LeadScoringService } from './lead-scoring.service';
import { OfferRecommendationService } from './offer-recommendation.service';
import { AICloserService } from './ai-closer.service';
import { FollowUpService } from './followup.service';
import { PhoneBridgeService } from './phone-bridge.service';
import { AttributionService } from './attribution.service';
import { RevenueController } from './revenue.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [RevenueController],
  providers: [
    LeadScoringService,
    OfferRecommendationService,
    AICloserService,
    FollowUpService,
    PhoneBridgeService,
    AttributionService,
    PrismaService,
  ],
  exports: [
    LeadScoringService,
    OfferRecommendationService,
    AICloserService,
    FollowUpService,
    PhoneBridgeService,
    AttributionService,
  ],
})
export class RevenueModule {}
