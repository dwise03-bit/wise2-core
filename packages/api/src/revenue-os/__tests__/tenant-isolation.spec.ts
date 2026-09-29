import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LeadStatus, TenantRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadsService } from '../leads/leads.service';
import { TenantService } from '../tenant/tenant.service';
import { TenantGuard } from '../tenant/tenant.guard';

/**
 * Phase 3 / Phase 14 security coverage.
 *
 * These tests encode the non-negotiable rule: tenant identity comes from the
 * authenticated session, and every read and write is scoped by it. They use
 * an in-memory fake of the Prisma calls the services make, so they assert on
 * the *query* that would be issued — which is precisely where cross-tenant
 * leaks originate.
 */

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';

interface FakeLead {
  id: string;
  tenantId: string;
  source: string;
  status: LeadStatus;
  customerId?: string | null;
  campaignId?: string | null;
  estimatedValue?: number | null;
}

/** Minimal Prisma stand-in that honours `where` clauses the way Prisma does. */
function createPrismaFake(seed: FakeLead[]) {
  let leads = [...seed];

  const matches = (lead: FakeLead, where: any) => {
    if (!where) return true;
    if (where.id !== undefined && lead.id !== where.id) return false;
    if (where.tenantId !== undefined && lead.tenantId !== where.tenantId) return false;
    if (where.status !== undefined && lead.status !== where.status) return false;
    return true;
  };

  return {
    __leads: () => leads,
    lead: {
      create: jest.fn(async ({ data }: any) => {
        const created = { ...data, id: `lead-${leads.length + 1}` };
        leads.push(created);
        return created;
      }),
      findFirst: jest.fn(async ({ where }: any) =>
        leads.find((l) => matches(l, where)) ?? null,
      ),
      findMany: jest.fn(async ({ where }: any) => leads.filter((l) => matches(l, where))),
      count: jest.fn(async ({ where }: any) => leads.filter((l) => matches(l, where)).length),
      updateMany: jest.fn(async ({ where, data }: any) => {
        const targets = leads.filter((l) => matches(l, where));
        targets.forEach((t) => Object.assign(t, data));
        return { count: targets.length };
      }),
      deleteMany: jest.fn(async ({ where }: any) => {
        const before = leads.length;
        leads = leads.filter((l) => !matches(l, where));
        return { count: before - leads.length };
      }),
      groupBy: jest.fn(async ({ where }: any) => {
        const scoped = leads.filter((l) => matches(l, where));
        const byStatus = new Map<string, number>();
        scoped.forEach((l) => byStatus.set(l.status, (byStatus.get(l.status) ?? 0) + 1));
        return [...byStatus.entries()].map(([status, count]) => ({
          status,
          _count: { _all: count },
          _sum: { estimatedValue: null },
        }));
      }),
    },
    revenueCustomer: {
      findFirst: jest.fn(async ({ where }: any) =>
        where.tenantId === TENANT_A && where.id === 'customer-a'
          ? { id: 'customer-a' }
          : null,
      ),
    },
    campaign: { findFirst: jest.fn(async () => null) },
    tenantMembership: { findMany: jest.fn(async () => []) },
  };
}

describe('Revenue OS tenant isolation', () => {
  let prisma: ReturnType<typeof createPrismaFake>;
  let leads: LeadsService;

  beforeEach(async () => {
    prisma = createPrismaFake([
      { id: 'lead-a', tenantId: TENANT_A, source: 'web', status: LeadStatus.NEW },
      { id: 'lead-b', tenantId: TENANT_B, source: 'meta', status: LeadStatus.NEW },
    ]);

    const moduleRef = await Test.createTestingModule({
      providers: [LeadsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    leads = moduleRef.get(LeadsService);
  });

  describe('reads', () => {
    it('Tenant A cannot read a Tenant B lead', async () => {
      await expect(leads.findOne(TENANT_A, 'lead-b')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('reports a foreign lead as not found, indistinguishable from absent', async () => {
      const foreign = await leads.findOne(TENANT_A, 'lead-b').catch((e) => e.message);
      const missing = await leads.findOne(TENANT_A, 'no-such-id').catch((e) => e.message);
      expect(foreign).toEqual(missing);
    });

    it('lists only its own tenant leads', async () => {
      const result = await leads.findAll(TENANT_A);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('lead-a');
    });

    it('always includes tenantId in the list query', async () => {
      await leads.findAll(TENANT_A);
      const call = prisma.lead.findMany.mock.calls[0][0];
      expect(call.where.tenantId).toBe(TENANT_A);
    });

    it('scopes pipeline aggregates by tenant', async () => {
      await leads.pipelineSummary(TENANT_A);
      const call = prisma.lead.groupBy.mock.calls[0][0];
      expect(call.where.tenantId).toBe(TENANT_A);
    });
  });

  describe('writes', () => {
    it('Tenant A cannot mutate a Tenant B lead', async () => {
      await expect(
        leads.update(TENANT_A, 'lead-b', { summary: 'hijacked' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      const untouched = prisma.__leads().find((l) => l.id === 'lead-b');
      expect((untouched as any).summary).toBeUndefined();
    });

    it('Tenant A cannot delete a Tenant B lead', async () => {
      await expect(leads.remove(TENANT_A, 'lead-b')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.__leads().some((l) => l.id === 'lead-b')).toBe(true);
    });

    it('stamps the caller tenant on create, ignoring any supplied value', async () => {
      await leads.create(TENANT_A, { source: 'web', tenantId: TENANT_B } as any);
      const call = prisma.lead.create.mock.calls[0][0];
      expect(call.data.tenantId).toBe(TENANT_A);
    });

    it('refuses to attach a customer belonging to another tenant', async () => {
      await expect(
        leads.create(TENANT_B, { source: 'web', customerId: 'customer-a' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('scopes update queries by tenant, not id alone', async () => {
      await leads.update(TENANT_A, 'lead-a', { summary: 'ok' });
      const call = prisma.lead.updateMany.mock.calls[0][0];
      expect(call.where).toEqual({ id: 'lead-a', tenantId: TENANT_A });
    });
  });
});

describe('TenantGuard', () => {
  const configEnabled = { get: () => 'true' } as unknown as ConfigService;

  const contextFor = (request: any) =>
    ({ switchToHttp: () => ({ getRequest: () => request }) } as any);

  const tenantServiceReturning = (value: any) =>
    ({ resolveForUser: jest.fn(async () => value) } as unknown as TenantService);

  it('rejects an unauthenticated request', async () => {
    const guard = new TenantGuard(tenantServiceReturning(null), configEnabled);
    await expect(
      guard.canActivate(contextFor({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a user with no membership', async () => {
    const guard = new TenantGuard(tenantServiceReturning(null), configEnabled);
    await expect(
      guard.canActivate(contextFor({ user: { id: 'u1' }, headers: {} })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('never trusts a client-supplied tenant id on its own', async () => {
    const tenantService = tenantServiceReturning(null);
    const guard = new TenantGuard(tenantService, configEnabled);

    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'u1' }, headers: { 'x-tenant-id': TENANT_B } }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    // The requested id is passed to the resolver for *verification*, and the
    // resolver is what decides — the guard never assigns it directly.
    expect(tenantService.resolveForUser).toHaveBeenCalledWith('u1', TENANT_B);
  });

  it('attaches tenant context when membership checks out', async () => {
    const tenant = {
      tenantId: TENANT_A,
      tenantSlug: 'wise-hvac',
      userId: 'u1',
      role: TenantRole.OWNER,
      revenueOsEnabled: true,
    };
    const guard = new TenantGuard(tenantServiceReturning(tenant), configEnabled);
    const request: any = { user: { id: 'u1' }, headers: {} };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.tenant).toEqual(tenant);
  });

  describe('feature gate', () => {
    const tenant = {
      tenantId: TENANT_A,
      tenantSlug: 'wise-hvac',
      userId: 'u1',
      role: TenantRole.VIEWER,
      revenueOsEnabled: true,
    };

    it('hides Revenue OS when the global flag is off', async () => {
      const configDisabled = { get: () => 'false' } as unknown as ConfigService;
      const guard = new TenantGuard(tenantServiceReturning(tenant), configDisabled);
      await expect(
        guard.canActivate(contextFor({ user: { id: 'u1' }, headers: {} })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('hides Revenue OS when the tenant has not been enabled', async () => {
      const guard = new TenantGuard(
        tenantServiceReturning({ ...tenant, revenueOsEnabled: false }),
        configEnabled,
      );
      await expect(
        guard.canActivate(contextFor({ user: { id: 'u1' }, headers: {} })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
