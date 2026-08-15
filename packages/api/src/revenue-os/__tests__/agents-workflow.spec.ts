import {
  AgentStatus,
  AgentType,
  AutomationRunStatus,
  ConsentChannel,
  LeadStatus,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AgentsService } from '../agents/agents.service';
import { MockProvider } from '../providers/mock.provider';
import {
  AGENT_DEFINITIONS,
  GLOBAL_AGENT_RULES,
} from '../agents/agent-definitions';
import { SpeedToLeadWorkflow } from '../automations/speed-to-lead.workflow';
import { HvacSafetyService } from '../safety/hvac-safety.service';
import { HvacClassifierService } from '../safety/hvac-classifier.service';
import { ConsentService } from '../consent/consent.service';
import { PrismaService } from '../../prisma/prisma.service';

const unconfigured = { get: () => undefined } as unknown as ConfigService;

describe('AI workforce (Phase 5)', () => {
  it('defines all seven agents', () => {
    expect(AGENT_DEFINITIONS).toHaveLength(7);
    expect(AGENT_DEFINITIONS.map((a) => a.type).sort()).toEqual(
      [
        AgentType.BOOKING,
        AgentType.MEMBERSHIP,
        AgentType.REACTIVATION,
        AgentType.RECEPTIONIST,
        AgentType.RECOVERY,
        AgentType.REVIEW,
        AgentType.SPEED_TO_LEAD,
      ].sort(),
    );
  });

  it('binds the global rules that stop an agent inventing commitments', () => {
    const joined = GLOBAL_AGENT_RULES.join(' ').toLowerCase();
    ['prices', 'availability', 'warranties', 'review links', 'membership pricing'].forEach(
      (topic) => expect(joined).toContain(topic),
    );
  });

  it('gives the review agent an explicit no-review-gating guardrail', () => {
    const review = AGENT_DEFINITIONS.find((a) => a.type === AgentType.REVIEW)!;
    expect(review.guardrails.join(' ').toLowerCase()).toContain('does not review-gate');
  });

  describe('status derivation', () => {
    const makeService = (rows: any[]) => {
      const prisma = {
        agentConfig: {
          findMany: jest.fn(async () => rows),
          findFirst: jest.fn(async ({ where }: any) =>
            rows.find((r) => r.type === where.type) ?? null,
          ),
          createMany: jest.fn(async () => ({ count: 0 })),
          updateMany: jest.fn(async () => ({ count: 1 })),
        },
      } as unknown as PrismaService;
      return new AgentsService(prisma, new MockProvider(unconfigured));
    };

    it('reports NEEDS_CONFIG rather than crashing when credentials are missing', async () => {
      const service = makeService([
        {
          id: 'a1',
          type: AgentType.BOOKING,
          name: 'WISE Booking',
          enabled: true,
          status: AgentStatus.ONLINE,
          lastRunAt: null,
          lastError: null,
        },
      ]);

      const [agent] = await service.listForTenant('tenant-a');
      expect(agent.status).toBe(AgentStatus.NEEDS_CONFIG);
      expect(agent.missingCapabilities).toContain('calendar');
    });

    it('refuses to run an agent whose providers are unconfigured', async () => {
      const service = makeService([
        { id: 'a1', type: AgentType.SPEED_TO_LEAD, enabled: true, status: AgentStatus.ONLINE },
      ]);
      await expect(service.canRun('tenant-a', AgentType.SPEED_TO_LEAD)).resolves.toBe(false);
    });

    it('refuses to run a disabled agent', async () => {
      const service = makeService([
        { id: 'a1', type: AgentType.BOOKING, enabled: false, status: AgentStatus.PAUSED },
      ]);
      await expect(service.canRun('tenant-a', AgentType.BOOKING)).resolves.toBe(false);
    });
  });

  it('never invents appointment availability', async () => {
    const provider = new MockProvider(unconfigured);
    await expect(provider.availableSlots('t', new Date(), new Date())).resolves.toEqual([]);
  });
});

describe('Workflow A — Speed to Lead (Phase 6)', () => {
  const baseLead = {
    id: 'lead-1',
    tenantId: 'tenant-a',
    customerId: 'cust-1',
    status: LeadStatus.NEW,
    summary: 'my ac is not cooling',
    customer: { phone: '+15550100' },
  };

  const build = (overrides: {
    lead?: any;
    canRun?: boolean;
    consent?: boolean;
  } = {}) => {
    const prisma = {
      lead: {
        findFirst: jest.fn(async () =>
          overrides.lead === undefined ? baseLead : overrides.lead,
        ),
        updateMany: jest.fn(async () => ({ count: 1 })),
      },
      automationRun: {
        create: jest.fn(async ({ data }: any) => ({ id: 'run-1', ...data })),
        update: jest.fn(async ({ data }: any) => data),
      },
      tenant: { findUnique: jest.fn(async () => ({ safetyScript: null })) },
      safetyEvent: { create: jest.fn(async ({ data }: any) => data) },
      agentConfig: { updateMany: jest.fn(async () => ({ count: 1 })) },
    } as unknown as PrismaService;

    const agents = {
      canRun: jest.fn(async () => overrides.canRun ?? true),
      recordRun: jest.fn(async () => undefined),
    } as unknown as AgentsService;

    const consent = {
      canContact: jest.fn(async () => overrides.consent ?? true),
    } as unknown as ConsentService;

    const workflow = new SpeedToLeadWorkflow(
      prisma,
      new HvacSafetyService(prisma),
      new HvacClassifierService(),
      consent,
      agents,
      new MockProvider(unconfigured),
    );

    return { workflow, prisma, agents, consent };
  };

  it('records an AutomationRun for every execution', async () => {
    const { workflow, prisma } = build();
    await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-1' });
    expect(prisma.automationRun.create).toHaveBeenCalled();
    expect(prisma.automationRun.update).toHaveBeenCalled();
  });

  it('halts on a safety trigger and does not contact the customer', async () => {
    const { workflow, consent } = build({
      lead: { ...baseLead, summary: 'I smell gas near the furnace' },
    });

    const result = await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-1' });

    expect(result.status).toBe(AutomationRunStatus.SKIPPED);
    expect(result.detail).toContain('safety escalation');
    // The gate runs before consent and before sending — nothing went out.
    expect(consent.canContact).not.toHaveBeenCalled();
  });

  it('does not contact a customer without SMS consent', async () => {
    const { workflow } = build({ consent: false });
    const result = await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-1' });
    expect(result.status).toBe(AutomationRunStatus.SKIPPED);
    expect(result.detail).toContain('consent');
  });

  it('skips when the agent is disabled or NEEDS_CONFIG', async () => {
    const { workflow } = build({ canRun: false });
    const result = await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-1' });
    expect(result.status).toBe(AutomationRunStatus.SKIPPED);
    expect(result.detail).toContain('NEEDS_CONFIG');
  });

  it('reports "not sent" rather than success when the provider is unconfigured', async () => {
    const { workflow } = build();
    const result = await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-1' });
    expect(result.status).toBe(AutomationRunStatus.SKIPPED);
    expect(result.detail).toMatch(/not configured/i);
  });

  it('skips a lead that already booked', async () => {
    const { workflow } = build({ lead: { ...baseLead, status: LeadStatus.BOOKED } });
    const result = await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-1' });
    expect(result.detail).toContain('already progressed');
  });

  it('will not act on a lead belonging to another tenant', async () => {
    const { workflow } = build({ lead: null });
    const result = await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-x' });
    expect(result.status).toBe(AutomationRunStatus.SKIPPED);
    expect(result.detail).toContain('not found for tenant');
  });

  it('checks consent on the SMS channel specifically', async () => {
    const { workflow, consent } = build();
    await workflow.execute({ tenantId: 'tenant-a', leadId: 'lead-1' });
    expect(consent.canContact).toHaveBeenCalledWith('tenant-a', 'cust-1', ConsentChannel.SMS);
  });
});
