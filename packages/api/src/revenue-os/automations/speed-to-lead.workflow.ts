import { Injectable, Logger } from '@nestjs/common';
import {
  AgentType,
  AutomationRunStatus,
  ConsentChannel,
  LeadStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { HvacSafetyService } from '../safety/hvac-safety.service';
import { HvacClassifierService } from '../safety/hvac-classifier.service';
import { ConsentService } from '../consent/consent.service';
import { AgentsService } from '../agents/agents.service';
import { MockProvider } from '../providers/mock.provider';
import { SpeedToLeadJob, WorkflowKey, SPEED_TO_LEAD_CADENCE_MINUTES } from './workflow.types';
import {
  WorkflowRunnerService,
  WorkflowResult,
  skipped,
  succeeded,
} from './workflow-runner.service';

/**
 * Workflow A — Speed to Lead.
 *
 * Trigger: lead.created.
 *
 * Order is deliberate: classify, then run the safety gate, then check
 * consent, and only then contact. Each step can halt the workflow, and the
 * halting steps come before anything is sent — a safety escalation or an
 * opt-out must never be discovered after the first message has gone out.
 */
@Injectable()
export class SpeedToLeadWorkflow {
  private readonly logger = new Logger('RevenueOS/SpeedToLead');

  constructor(
    private prisma: PrismaService,
    private runner: WorkflowRunnerService,
    private safety: HvacSafetyService,
    private classifier: HvacClassifierService,
    private consent: ConsentService,
    private agents: AgentsService,
    private provider: MockProvider,
  ) {}

  async execute(job: SpeedToLeadJob): Promise<WorkflowResult> {
    const { tenantId, leadId, attempt = 0 } = job;

    return this.runner.run(
      {
        tenantId,
        workflowKey: WorkflowKey.SPEED_TO_LEAD,
        entityType: 'Lead',
        entityId: leadId,
        payload: { attempt },
        attempt,
      },
      () => this.run(tenantId, leadId, attempt),
    );
  }

  private async run(
    tenantId: string,
    leadId: string,
    attempt: number,
  ): Promise<WorkflowResult> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId },
      include: { customer: true },
    });

    if (!lead) {
      return skipped('lead not found for tenant');
    }

    if (lead.status === LeadStatus.BOOKED || lead.status === LeadStatus.WON) {
      return skipped('lead already progressed');
    }

    if (!(await this.agents.canRun(tenantId, AgentType.SPEED_TO_LEAD))) {
      return skipped('Speed-to-Lead agent disabled or NEEDS_CONFIG');
    }

    // Classify before contact so the message reflects the real intent.
    const classification = this.classifier.classify(lead.summary);

    // Safety gate: halts the sales flow entirely.
    const safety = await this.safety.evaluate(tenantId, lead.summary, lead.id);
    if (!safety.safe) {
      await this.prisma.lead.updateMany({
        where: { id: leadId, tenantId },
        data: { urgency: 'EMERGENCY', status: LeadStatus.CONTACTING },
      });
      return skipped(`safety escalation: ${safety.detection?.riskType} — handed to human`);
    }

    if (!lead.customerId) {
      return skipped('lead has no customer to contact');
    }

    const allowed = await this.consent.canContact(
      tenantId,
      lead.customerId,
      ConsentChannel.SMS,
    );
    if (!allowed) {
      return skipped('no SMS consent on record — not contacted');
    }

    const send = await this.provider.sendSms({
      tenantId,
      to: lead.customer?.phone ?? '',
      body: this.composeOpener(classification.category),
    });

    if (!send.sent) {
      // Not a failure: an unconfigured provider is an expected state, and
      // reporting success here would be a lie recorded in the audit trail.
      return skipped(send.detail ?? 'messaging provider not configured');
    }

    await this.prisma.lead.updateMany({
      where: { id: leadId, tenantId },
      data: { status: LeadStatus.CONTACTING, hvacCategory: classification.category },
    });

    await this.agents.recordRun(tenantId, AgentType.SPEED_TO_LEAD);

    const nextIndex = attempt + 1;
    return succeeded('opener sent', { retryInMinutes: SPEED_TO_LEAD_CADENCE_MINUTES[nextIndex] });
  }

  /**
   * Opener copy is templated per intent, never generated, so it cannot
   * introduce a price, a promise or an arrival time.
   */
  private composeOpener(category: string): string {
    const openers: Record<string, string> = {
      NO_COOLING: 'Thanks for reaching out about your AC. Can we get a technician out to take a look?',
      NO_HEAT: 'Thanks for reaching out about your heat. Can we get a technician out to take a look?',
      PREVENTATIVE_MAINTENANCE: 'Thanks for your interest in maintenance. Would you like to book a visit?',
    };
    return (
      openers[category] ??
      'Thanks for reaching out. Would you like to book a visit with one of our technicians?'
    );
  }
}
