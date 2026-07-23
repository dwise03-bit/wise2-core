import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeWebhookHandler } from './stripe.webhook';
import { EmailService } from '../email/email.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { ConsultingService } from '../consulting/consulting.service';
import { PrismaService } from '@app/common/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    StripeWebhookHandler,
    EmailService,
    AnalyticsService,
    ConsultingService,
    PrismaService,
    WorkspacesService,
  ],
  exports: [BillingService, StripeWebhookHandler],
})
export class BillingModule {}
