import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EstimateStatus, LeadStatus, ServiceJobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AttributionService } from '../attribution/attribution.service';

/**
 * Phase 7 attribution coverage.
 *
 * The fake below honours `where` clauses the way Prisma does, so the
 * assertions land on the *query that would be issued* — which is where
 * cross-tenant leaks originate — as well as on the arithmetic. The KPI tests
 * exist to pin down the two rules that are easy to get quietly wrong:
 * engagement is never revenue, and no division ever produces NaN or Infinity.
 */

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';

interface FakeCampaign {
  id: string;
  tenantId: string;
  platform: string;
  campaignName: string;
  spend: any;
  active: boolean;
  createdAt: Date;
}

interface FakeLead {
  id: string;
  tenantId: string;
  campaignId: string | null;
  status: LeadStatus;
  estimatedValue: any;
  bookedAt: Date | null;
  createdAt: Date;
}

interface FakeConversation {
  id: string;
  tenantId: string;
  leadId: string | null;
}

interface FakeEstimate {
  id: string;
  tenantId: string;
  leadId: string | null;
  status: EstimateStatus;
  amount: any;
}

interface FakeJob {
  id: string;
  tenantId: string;
  leadId: string | null;
  status: ServiceJobStatus;
  revenue: any;
}

interface Seed {
  campaigns?: FakeCampaign[];
  leads?: FakeLead[];
  conversations?: FakeConversation[];
  estimates?: FakeEstimate[];
  jobs?: FakeJob[];
}

/** Minimal Prisma stand-in supporting the operators the service uses. */
function createPrismaFake(seed: Seed) {
  const matchesValue = (actual: any, condition: any): boolean => {
    if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
      if ('in' in condition) return condition.in.includes(actual);
      if ('gte' in condition && actual < condition.gte) return false;
      if ('lte' in condition && actual > condition.lte) return false;
      return true;
    }
    return actual === condition;
  };

  const matches = (row: any, where: any): boolean => {
    if (!where) return true;
    return Object.entries(where).every(([key, condition]) =>
      matchesValue(row[key], condition),
    );
  };

  const table = <T>(rows: T[]) => ({
    findMany: jest.fn(async ({ where }: any = {}) => rows.filter((r) => matches(r, where))),
    findFirst: jest.fn(
      async ({ where }: any = {}) => rows.find((r) => matches(r, where)) ?? null,
    ),
    count: jest.fn(async ({ where }: any = {}) => rows.filter((r) => matches(r, where)).length),
  });

  return {
    campaign: table(seed.campaigns ?? []),
    lead: table(seed.leads ?? []),
    conversation: table(seed.conversations ?? []),
    estimate: table(seed.estimates ?? []),
    serviceJob: table(seed.jobs ?? []),
  };
}

async function serviceWith(seed: Seed) {
  const prisma = createPrismaFake(seed);
  const moduleRef = await Test.createTestingModule({
    providers: [AttributionService, { provide: PrismaService, useValue: prisma }],
  }).compile();
  return { prisma, service: moduleRef.get(AttributionService) };
}

const day = (n: number) => new Date(`2026-03-${String(n).padStart(2, '0')}T12:00:00Z`);

const campaign = (over: Partial<FakeCampaign> = {}): FakeCampaign => ({
  id: 'camp-a',
  tenantId: TENANT_A,
  platform: 'google',
  campaignName: 'Spring AC Tune-Up',
  spend: 1000,
  active: true,
  createdAt: day(1),
  ...over,
});

const lead = (over: Partial<FakeLead> & { id: string }): FakeLead => ({
  tenantId: TENANT_A,
  campaignId: 'camp-a',
  status: LeadStatus.NEW,
  estimatedValue: null,
  bookedAt: null,
  createdAt: day(5),
  ...over,
});

/**
 * A campaign whose four leads sit at four different depths of the chain:
 * CAMPAIGN → LEAD → CONVERSATION → BOOKING → ESTIMATE → SOLD JOB → REVENUE.
 */
const chainSeed = (): Seed => ({
  campaigns: [campaign()],
  leads: [
    // Reached the end: contacted, booked, estimated, sold, job completed.
    lead({
      id: 'lead-1',
      status: LeadStatus.WON,
      estimatedValue: 5200,
      bookedAt: day(6),
    }),
    // Booked and estimated, but the estimate has not been sold.
    lead({
      id: 'lead-2',
      status: LeadStatus.ESTIMATE,
      estimatedValue: 3000,
      bookedAt: day(7),
    }),
    // Contacted only.
    lead({ id: 'lead-3', status: LeadStatus.CONTACTING }),
    // Never contacted.
    lead({ id: 'lead-4', status: LeadStatus.NEW }),
  ],
  conversations: [
    { id: 'conv-1', tenantId: TENANT_A, leadId: 'lead-1' },
    { id: 'conv-1b', tenantId: TENANT_A, leadId: 'lead-1' },
    { id: 'conv-2', tenantId: TENANT_A, leadId: 'lead-2' },
    { id: 'conv-3', tenantId: TENANT_A, leadId: 'lead-3' },
  ],
  estimates: [
    {
      id: 'est-1',
      tenantId: TENANT_A,
      leadId: 'lead-1',
      status: EstimateStatus.SOLD,
      amount: 5000,
    },
    {
      id: 'est-2',
      tenantId: TENANT_A,
      leadId: 'lead-2',
      status: EstimateStatus.SENT,
      amount: 2800,
    },
  ],
  jobs: [
    {
      id: 'job-1',
      tenantId: TENANT_A,
      leadId: 'lead-1',
      status: ServiceJobStatus.COMPLETED,
      revenue: 4800,
    },
    {
      id: 'job-2',
      tenantId: TENANT_A,
      leadId: 'lead-2',
      status: ServiceJobStatus.SCHEDULED,
      revenue: 2800,
    },
  ],
});

describe('AttributionService — the full chain', () => {
  it('counts every stage from campaign through completed revenue', async () => {
    const { service } = await serviceWith(chainSeed());
    const { totals } = await service.summary(TENANT_A);

    expect(totals.leads).toBe(4);
    expect(totals.contacted).toBe(3); // lead-1 has two conversations, counted once
    expect(totals.booked).toBe(2);
    expect(totals.estimated).toBe(2);
    expect(totals.sold).toBe(1);
    expect(totals.completed).toBe(1);
  });

  it('derives the rates from those stage counts', async () => {
    const { service } = await serviceWith(chainSeed());
    const { totals } = await service.summary(TENANT_A);

    expect(totals.contactRate).toBeCloseTo(3 / 4);
    expect(totals.bookingRate).toBeCloseTo(2 / 3);
    expect(totals.estimateRate).toBeCloseTo(2 / 2);
    expect(totals.closeRate).toBeCloseTo(1 / 2);
  });

  it('keeps booked, sold and completed revenue distinct', async () => {
    const { service } = await serviceWith(chainSeed());
    const { totals } = await service.summary(TENANT_A);

    // Forecast from the two booked leads.
    expect(totals.bookedRevenue).toBe(5200 + 3000);
    // Contracted: only the SOLD estimate, not the SENT one.
    expect(totals.soldRevenue).toBe(5000);
    // Earned: only the COMPLETED job, not the SCHEDULED one.
    expect(totals.completedRevenue).toBe(4800);
  });

  it('reports spend, cost per lead and ROAS off completed revenue', async () => {
    const { service } = await serviceWith(chainSeed());
    const { totals } = await service.summary(TENANT_A);

    expect(totals.spend).toBe(1000);
    expect(totals.costPerLead).toBe(1000 / 4);
    expect(totals.roas).toBeCloseTo(4800 / 1000);
  });

  it('attributes the chain to the originating campaign', async () => {
    const { service } = await serviceWith(chainSeed());
    const summary = await service.summary(TENANT_A);

    expect(summary.campaigns).toHaveLength(1);
    expect(summary.campaigns[0].campaignId).toBe('camp-a');
    expect(summary.campaigns[0].campaignName).toBe('Spring AC Tune-Up');
    expect(summary.campaigns[0].completedRevenue).toBe(4800);
    expect(summary.campaigns[0].leads).toBe(4);
  });

  it('buckets campaign-less leads as unattributed with zero spend', async () => {
    const seed = chainSeed();
    seed.leads!.push(
      lead({
        id: 'lead-walkin',
        campaignId: null,
        status: LeadStatus.WON,
        estimatedValue: 900,
        bookedAt: day(8),
      }),
    );

    const { service } = await serviceWith(seed);
    const summary = await service.summary(TENANT_A);

    expect(summary.unattributed.leads).toBe(1);
    expect(summary.unattributed.spend).toBe(0);
    // One lead acquired at no ad spend: cost per lead really is 0 here.
    expect(summary.unattributed.costPerLead).toBe(0);
    // ROAS against zero spend stays undefined rather than becoming Infinity.
    expect(summary.unattributed.roas).toBeNull();
    expect(summary.unattributed.bookedRevenue).toBe(900);
    // The campaign bucket must not absorb it.
    expect(summary.campaigns[0].leads).toBe(4);
    expect(summary.totals.leads).toBe(5);
  });

  it('exposes the chain as ordered funnel stages', async () => {
    const { service } = await serviceWith(chainSeed());
    const stages = await service.funnel(TENANT_A);

    expect(stages.map((s) => s.stage)).toEqual([
      'CAMPAIGN',
      'LEAD',
      'CONVERSATION',
      'BOOKING',
      'ESTIMATE',
      'SOLD',
      'REVENUE',
    ]);
    expect(stages.map((s) => s.count)).toEqual([1, 4, 3, 2, 2, 1, 1]);
    stages.forEach((s) => expect(Number.isFinite(s.conversionFromPrevious)).toBe(true));
  });

  it('reads Prisma Decimal instances, not just plain numbers', async () => {
    const decimal = (n: number) => ({ toNumber: () => n });
    const seed = chainSeed();
    seed.campaigns![0].spend = decimal(1000);
    seed.estimates![0].amount = decimal(5000);
    seed.jobs![0].revenue = decimal(4800);
    seed.leads![0].estimatedValue = decimal(5200);

    const { service } = await serviceWith(seed);
    const { totals } = await service.summary(TENANT_A);

    expect(totals.spend).toBe(1000);
    expect(totals.soldRevenue).toBe(5000);
    expect(totals.completedRevenue).toBe(4800);
    expect(totals.roas).toBeCloseTo(4.8);
  });
});

describe('AttributionService — clicks are never revenue', () => {
  /**
   * Heavy engagement, no delivered work: a campaign with real spend, many
   * leads and many conversations, but nothing sold and nothing completed.
   * Every revenue figure must be 0. If engagement ever leaked into revenue
   * this is the test that would catch it.
   */
  const engagementOnly = (): Seed => ({
    campaigns: [campaign({ spend: 5000 })],
    leads: Array.from({ length: 40 }, (_, i) =>
      lead({ id: `lead-${i}`, status: LeadStatus.CONTACTING, estimatedValue: 9999 }),
    ),
    conversations: Array.from({ length: 120 }, (_, i) => ({
      id: `conv-${i}`,
      tenantId: TENANT_A,
      leadId: `lead-${i % 40}`,
    })),
    estimates: [],
    jobs: [],
  });

  it('earns no revenue from leads and conversations alone', async () => {
    const { service } = await serviceWith(engagementOnly());
    const { totals } = await service.summary(TENANT_A);

    expect(totals.leads).toBe(40);
    expect(totals.contacted).toBe(40);
    expect(totals.bookedRevenue).toBe(0);
    expect(totals.soldRevenue).toBe(0);
    expect(totals.completedRevenue).toBe(0);
    expect(totals.roas).toBe(0);
  });

  it('ignores estimatedValue on leads that were never booked', async () => {
    const { service } = await serviceWith(engagementOnly());
    const { totals } = await service.summary(TENANT_A);

    // Every lead carries estimatedValue 9999, none is booked.
    expect(totals.booked).toBe(0);
    expect(totals.bookedRevenue).toBe(0);
  });

  it('excludes non-SOLD estimates and non-COMPLETED jobs from revenue', async () => {
    const seed: Seed = {
      campaigns: [campaign()],
      leads: [lead({ id: 'lead-1', status: LeadStatus.BOOKED, bookedAt: day(6) })],
      conversations: [{ id: 'c1', tenantId: TENANT_A, leadId: 'lead-1' }],
      estimates: [
        {
          id: 'e1',
          tenantId: TENANT_A,
          leadId: 'lead-1',
          status: EstimateStatus.DECLINED,
          amount: 7000,
        },
      ],
      jobs: [
        {
          id: 'j1',
          tenantId: TENANT_A,
          leadId: 'lead-1',
          status: ServiceJobStatus.CANCELED,
          revenue: 7000,
        },
      ],
    };

    const { service } = await serviceWith(seed);
    const { totals } = await service.summary(TENANT_A);

    expect(totals.estimated).toBe(1);
    expect(totals.sold).toBe(0);
    expect(totals.completed).toBe(0);
    expect(totals.soldRevenue).toBe(0);
    expect(totals.completedRevenue).toBe(0);
  });
});

describe('AttributionService — divide by zero', () => {
  const assertNoBadNumbers = (m: any) => {
    Object.entries(m).forEach(([key, value]) => {
      if (typeof value === 'number') {
        expect(`${key}:${Number.isNaN(value)}`).toBe(`${key}:false`);
        expect(`${key}:${Number.isFinite(value)}`).toBe(`${key}:true`);
      }
    });
  };

  it('returns clean zeros for a tenant with no data at all', async () => {
    const { service } = await serviceWith({});
    const summary = await service.summary(TENANT_A);

    expect(summary.campaigns).toEqual([]);
    expect(summary.totals.leads).toBe(0);
    expect(summary.totals.spend).toBe(0);
    expect(summary.totals.contactRate).toBe(0);
    expect(summary.totals.bookingRate).toBe(0);
    expect(summary.totals.estimateRate).toBe(0);
    expect(summary.totals.closeRate).toBe(0);
    expect(summary.totals.costPerLead).toBeNull();
    expect(summary.totals.roas).toBeNull();
    assertNoBadNumbers(summary.totals);
    assertNoBadNumbers(summary.unattributed);
  });

  it('handles a campaign with spend but zero leads', async () => {
    const { service } = await serviceWith({ campaigns: [campaign({ spend: 2500 })] });
    const { campaigns, totals } = await service.summary(TENANT_A);

    expect(campaigns[0].spend).toBe(2500);
    expect(campaigns[0].leads).toBe(0);
    // spend / 0 leads is undefined, not Infinity and not 0.
    expect(campaigns[0].costPerLead).toBeNull();
    // 0 revenue / 2500 spend is a genuine 0 ROAS, not null.
    expect(campaigns[0].roas).toBe(0);
    assertNoBadNumbers(campaigns[0]);
    assertNoBadNumbers(totals);
  });

  it('handles zero spend with real revenue without producing Infinity', async () => {
    const seed = chainSeed();
    seed.campaigns![0].spend = 0;

    const { service } = await serviceWith(seed);
    const { totals } = await service.summary(TENANT_A);

    expect(totals.spend).toBe(0);
    expect(totals.completedRevenue).toBe(4800);
    // 4800 / 0 would be Infinity.
    expect(totals.roas).toBeNull();
    expect(totals.costPerLead).toBe(0);
    assertNoBadNumbers(totals);
  });

  it('keeps every rate at 0 when its denominator stage is empty', async () => {
    const seed: Seed = {
      campaigns: [campaign({ spend: 100 })],
      leads: [lead({ id: 'lead-1', status: LeadStatus.NEW })],
      conversations: [],
      estimates: [],
      jobs: [],
    };

    const { service } = await serviceWith(seed);
    const { totals } = await service.summary(TENANT_A);

    expect(totals.contactRate).toBe(0);
    // 0 booked / 0 contacted
    expect(totals.bookingRate).toBe(0);
    expect(totals.estimateRate).toBe(0);
    expect(totals.closeRate).toBe(0);
    assertNoBadNumbers(totals);
  });

  it('never divides by zero in the funnel conversions', async () => {
    const { service } = await serviceWith({});
    const stages = await service.funnel(TENANT_A);

    stages.forEach((s) => {
      expect(Number.isNaN(s.conversionFromPrevious)).toBe(false);
      expect(s.conversionFromPrevious).toBe(0);
    });
  });
});

describe('AttributionService — tenant isolation', () => {
  /** Tenant B mirrors Tenant A's chain with larger numbers throughout. */
  const twoTenants = (): Seed => {
    const a = chainSeed();
    return {
      campaigns: [...a.campaigns!, campaign({ id: 'camp-b', tenantId: TENANT_B, spend: 99999 })],
      leads: [
        ...a.leads!,
        lead({
          id: 'lead-b1',
          tenantId: TENANT_B,
          campaignId: 'camp-b',
          status: LeadStatus.WON,
          estimatedValue: 88888,
          bookedAt: day(6),
        }),
      ],
      conversations: [
        ...a.conversations!,
        { id: 'conv-b1', tenantId: TENANT_B, leadId: 'lead-b1' },
      ],
      estimates: [
        ...a.estimates!,
        {
          id: 'est-b1',
          tenantId: TENANT_B,
          leadId: 'lead-b1',
          status: EstimateStatus.SOLD,
          amount: 77777,
        },
      ],
      jobs: [
        ...a.jobs!,
        {
          id: 'job-b1',
          tenantId: TENANT_B,
          leadId: 'lead-b1',
          status: ServiceJobStatus.COMPLETED,
          revenue: 66666,
        },
      ],
    };
  };

  it('never includes another tenant rows in the numbers', async () => {
    const { service } = await serviceWith(twoTenants());
    const summary = await service.summary(TENANT_A);

    expect(summary.campaigns.map((c) => c.campaignId)).toEqual(['camp-a']);
    expect(summary.totals.leads).toBe(4);
    expect(summary.totals.spend).toBe(1000);
    expect(summary.totals.bookedRevenue).toBe(8200);
    expect(summary.totals.soldRevenue).toBe(5000);
    expect(summary.totals.completedRevenue).toBe(4800);
  });

  it('scopes every query it issues by tenantId', async () => {
    const { prisma, service } = await serviceWith(twoTenants());
    await service.summary(TENANT_A);

    expect(prisma.campaign.findMany.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
    expect(prisma.lead.findMany.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
    expect(prisma.conversation.findMany.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
    expect(prisma.estimate.findMany.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
    expect(prisma.serviceJob.findMany.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
  });

  it('restricts downstream queries to the tenant own lead cohort', async () => {
    const { prisma, service } = await serviceWith(twoTenants());
    await service.summary(TENANT_A);

    const ids = prisma.conversation.findMany.mock.calls[0][0].where.leadId.in;
    expect(ids).toEqual(['lead-1', 'lead-2', 'lead-3', 'lead-4']);
    expect(ids).not.toContain('lead-b1');
  });

  it('scopes the funnel by tenant', async () => {
    const { prisma, service } = await serviceWith(twoTenants());
    const stages = await service.funnel(TENANT_A);

    expect(prisma.campaign.count.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
    expect(stages.find((s) => s.stage === 'CAMPAIGN')!.count).toBe(1);
    expect(stages.find((s) => s.stage === 'REVENUE')!.count).toBe(1);
  });

  it('refuses to report on another tenant campaign', async () => {
    const { service } = await serviceWith(twoTenants());
    await expect(service.forCampaign(TENANT_A, 'camp-b')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('reports a foreign campaign as not found, indistinguishable from absent', async () => {
    const { service } = await serviceWith(twoTenants());
    const foreign = await service.forCampaign(TENANT_A, 'camp-b').catch((e) => e.message);
    const missing = await service
      .forCampaign(TENANT_A, 'no-such-campaign')
      .catch((e) => e.message);
    expect(foreign).toEqual(missing);
  });

  it('looks a campaign up by id and tenant together, never id alone', async () => {
    const { prisma, service } = await serviceWith(twoTenants());
    await service.forCampaign(TENANT_A, 'camp-a');

    expect(prisma.campaign.findFirst.mock.calls[0][0].where).toEqual({
      id: 'camp-a',
      tenantId: TENANT_A,
    });
    expect(prisma.lead.findMany.mock.calls[0][0].where).toEqual({
      tenantId: TENANT_A,
      campaignId: 'camp-a',
    });
  });
});

describe('AttributionService — date range', () => {
  it('filters the lead cohort on createdAt and reports the range back', async () => {
    const seed = chainSeed();
    seed.leads![3].createdAt = day(20);

    const { prisma, service } = await serviceWith(seed);
    const summary = await service.summary(TENANT_A, { from: day(1), to: day(10) });

    expect(prisma.lead.findMany.mock.calls[0][0].where).toEqual({
      tenantId: TENANT_A,
      createdAt: { gte: day(1), lte: day(10) },
    });
    expect(summary.totals.leads).toBe(3);
    expect(summary.range.from).toBe(day(1).toISOString());
    expect(summary.range.to).toBe(day(10).toISOString());
  });

  it('flags that spend is a lifetime figure the range cannot narrow', async () => {
    const { service } = await serviceWith(chainSeed());
    const summary = await service.summary(TENANT_A, { from: day(1) });
    expect(summary.spendIsLifetime).toBe(true);
  });
});
