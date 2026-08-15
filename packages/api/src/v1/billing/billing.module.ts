import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeWebhookHandler } from './stripe.webhook';
import { EntitlementsService } from './entitlements.service';
import { EmailService } from '../email/email.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    EntitlementsService,
    StripeWebhookHandler,
    EmailService,
    AnalyticsService,
    PrismaService,
    WorkspacesService,
  ],
  exports: [BillingService, EntitlementsService, StripeWebhookHandler],
})
export class BillingModule {}
