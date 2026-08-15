import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TenantService } from './tenant/tenant.service';
import { TenantGuard } from './tenant/tenant.guard';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { AttributionController } from './attribution/attribution.controller';
import { AttributionService } from './attribution/attribution.service';
import { HvacSafetyService } from './safety/hvac-safety.service';
import { HvacClassifierService } from './safety/hvac-classifier.service';
import { ConsentService } from './consent/consent.service';
import { MockProvider } from './providers/mock.provider';
import { WebhookSecurityService } from './webhooks/webhook-security.service';
import { AgentsService } from './agents/agents.service';
import { RevenueQueueService } from './automations/queue.service';
import { SpeedToLeadWorkflow } from './automations/speed-to-lead.workflow';
import { WorkflowRunnerService } from './automations/workflow-runner.service';
import { InboundReceptionistWorkflow } from './automations/inbound-receptionist.workflow';
import { EstimateRecoveryWorkflow } from './automations/estimate-recovery.workflow';
import { ReviewWorkflow } from './automations/review.workflow';
import { MembershipWorkflow } from './automations/membership.workflow';
import { ReactivationWorkflow } from './automations/reactivation.workflow';
import { RevenueWorkerService } from './automations/revenue-worker.service';

/**
 * WISE² Revenue OS.
 *
 * Turn leads into booked jobs: CAMPAIGN → LEAD → CONVERSATION → BOOKING →
 * ESTIMATE → SOLD JOB → REVENUE → REVIEW → MEMBERSHIP → REACTIVATION.
 *
 * Gated by REVENUE_OS_ENABLED globally and Tenant.revenueOsEnabled per
 * tenant, both enforced in TenantGuard. With the flag off, nothing in this
 * module is reachable and existing WISE² behaviour is unchanged.
 *
 * AuthModule is imported for the JWT strategy that JwtAuthGuard depends on.
 */
@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  controllers: [LeadsController, AttributionController],
  providers: [
    TenantService,
    TenantGuard,
    LeadsService,
    AttributionService,
    HvacSafetyService,
    HvacClassifierService,
    ConsentService,
    MockProvider,
    WebhookSecurityService,
    AgentsService,
    RevenueQueueService,
    SpeedToLeadWorkflow,
    WorkflowRunnerService,
    InboundReceptionistWorkflow,
    EstimateRecoveryWorkflow,
    ReviewWorkflow,
    MembershipWorkflow,
    ReactivationWorkflow,
    RevenueWorkerService,
  ],
  exports: [
    TenantService,
    LeadsService,
    AttributionService,
    HvacSafetyService,
    HvacClassifierService,
    ConsentService,
    MockProvider,
    WebhookSecurityService,
  ],
})
export class RevenueOsModule {}
