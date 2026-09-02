import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '@shared/prisma';
// DISABLED: Services have TypeScript compilation errors with Prisma relationship queries
// Re-enable after fixing service layer to properly include relationships
// import { LeadScoringService } from './lead-scoring.service';
// import { OfferRecommendationService } from './offer-recommendation.service';
// import { AICloserService } from './ai-closer.service';
// import { FollowUpService } from './followup.service';
// import { PhoneBridgeService } from './phone-bridge.service';
// import { AttributionService } from './attribution.service';
// import { RevenueController } from './revenue.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [PrismaService],
  exports: [],
})
export class RevenueModule {}
