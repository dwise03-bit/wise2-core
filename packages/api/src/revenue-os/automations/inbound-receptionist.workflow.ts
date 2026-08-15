import { Injectable } from '@nestjs/common';
import { AgentType, LeadStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { HvacSafetyService } from '../safety/hvac-safety.service';
import { HvacClassifierService } from '../safety/hvac-classifier.service';
import { AgentsService } from '../agents/agents.service';
import { InboundReceptionistJob, WorkflowKey } from './workflow.types';
import {
  WorkflowRunnerService,
  WorkflowResult,
  skipped,
  succeeded,
} from './workflow-runner.service';

/**
 * Workflow B — Inbound Receptionist.
 *
 * Trigger: telephony.inbound, after the webhook has been admitted.
 *
 * Tenant is already resolved by webhook admission from the inbound number
 * mapping, never from the payload, so this workflow is handed a trusted
 * tenantId rather than deriving one.
 */
@Injectable()
export class InboundReceptionistWorkflow {
  constructor(
    private prisma: PrismaService,
    private runner: WorkflowRunnerService,
    private safety: HvacSafetyService,
    private classifier: HvacClassifierService,
    private agents: AgentsService,
  ) {}

  async execute(job: InboundReceptionistJob): Promise<WorkflowResult> {
    const { tenantId, conversationId } = job;

    return this.runner.run(
      {
        tenantId,
        workflowKey: WorkflowKey.INBOUND_RECEPTIONIST,
        entityType: 'Conversation',
        entityId: conversationId,
      },
      async () => {
        const conversation = await this.prisma.conversation.findFirst({
          where: { id: conversationId, tenantId },
        });

        if (!conversation) {
          return skipped('conversation not found for tenant');
        }

        const spoken = conversation.transcript ?? conversation.body ?? '';

        // Safety gate runs before any intent handling: a caller reporting a
        // gas smell must not be routed into a booking conversation.
        const safety = await this.safety.evaluate(tenantId, spoken);
        if (!safety.safe) {
          await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { aiHandled: false },
          });
          return skipped(
            `safety escalation: ${safety.detection?.riskType} — transferred to human`,
          );
        }

        if (!(await this.agents.canRun(tenantId, AgentType.RECEPTIONIST))) {
          return skipped('Receptionist agent disabled or NEEDS_CONFIG');
        }

        const classification = this.classifier.classify(spoken);

        // Match an existing customer by caller id before creating anything,
        // so repeat callers do not accumulate duplicate records.
        const customer = conversation.fromValue
          ? await this.prisma.revenueCustomer.findFirst({
              where: { tenantId, phone: conversation.fromValue },
            })
          : null;

        const lead = await this.prisma.lead.create({
          data: {
            tenantId,
            customerId: customer?.id,
            source: 'inbound-call',
            hvacCategory: classification.category,
            urgency: classification.urgency,
            status: LeadStatus.CONTACTING,
            summary: spoken.slice(0, 500),
          },
        });

        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { leadId: lead.id, customerId: customer?.id, aiHandled: true },
        });

        await this.agents.recordRun(tenantId, AgentType.RECEPTIONIST);

        return succeeded('call handled, lead created', {
          data: {
            leadId: lead.id,
            category: classification.category,
            urgency: classification.urgency,
            existingCustomer: Boolean(customer),
          },
        });
      },
    );
  }
}
