import { BadRequestException } from '@nestjs/common';
import { BusinessOsControlBridgeClient } from './business-os-control-bridge.client';
import { BusinessOsLeadClaimStore } from './business-os-lead-claim.store';
import { BusinessOsService } from './business-os.service';

// ─── Minimal mocks ────────────────────────────────────────────────────────────

function makeProspectsMock(overrides: Record<string, any> = {}) {
  return {
    getPipelineStats: jest.fn().mockResolvedValue({
      byStatus: { NEW: 2, CONTACTED: 1, QUALIFIED: 3, AUDIT_SCHEDULED: 0, AUDIT_COMPLETE: 0, PROPOSAL_SENT: 1, WON: 1, LOST: 0 },
      totalProspects: 8,
      totalOpportunity: 40_000,
      closedOpportunity: 5_000,
      wonOpportunity: 5_000,
      conversionRate: 12.5,
    }),
    getProspects: jest.fn().mockResolvedValue({
      prospects: [
        { id: 'lead-1', businessName: 'Acme', contactName: 'Alice', email: 'alice@acme.com', status: 'QUALIFIED', estimatedOpportunity: 5_000, leadSource: 'DIRECT', createdAt: new Date('2026-01-01') },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    }),
    ...overrides,
  };
}

function makeCustomersMock(overrides: Record<string, any> = {}) {
  return {
    findAll: jest.fn().mockResolvedValue({
      customers: [
        { id: 'cust-1', businessName: 'Beta Corp', contactName: 'Bob', email: 'bob@beta.com', status: 'ACTIVE', mrr: 1_500, industry: 'Tech', createdAt: new Date('2026-02-01') },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    }),
    getStats: jest.fn().mockResolvedValue({ total: 5, active: 4, totalMrr: 7_500, averageMrr: 1_500 }),
    ...overrides,
  };
}

function makeControlBridgeMock(overrides: Record<string, any> = {}) {
  return {
    healthCheck: jest.fn().mockResolvedValue({ status: 'ok', latencyMs: 42, checkedAt: '2026-01-01T00:00:00.000Z' }),
    deploy: jest.fn().mockResolvedValue({ success: true, service: 'api', output: 'Deploy queued', executedAt: '2026-01-01T00:00:00.000Z' }),
    restart: jest.fn().mockResolvedValue({ success: true, service: 'api', output: 'Restart queued', executedAt: '2026-01-01T00:00:00.000Z' }),
    rollback: jest.fn().mockResolvedValue({ success: true, service: 'api', output: 'Rollback queued', executedAt: '2026-01-01T00:00:00.000Z' }),
    inventory: jest.fn().mockResolvedValue({ services: [{ name: 'api', status: 'running' }], generatedAt: '2026-01-01T00:00:00.000Z' }),
    ...overrides,
  } as unknown as BusinessOsControlBridgeClient;
}

// ─── Suite: no dependencies wired ────────────────────────────────────────────

describe('BusinessOsService (no deps)', () => {
  let service: BusinessOsService;

  beforeEach(() => {
    service = new BusinessOsService();
  });

  it('returns zero dashboard metrics when providers are not wired', async () => {
    expect(await service.getDashboard()).toEqual({
      revenueToday: 0,
      revenueMonth: 0,
      hotLeadCount: 0,
      activeJobCount: 0,
      unpaidInvoiceCount: 0,
      criticalAlertCount: 0,
    });
  });

  it('accepts show hot leads command', () => {
    const result = service.submitCommand('show hot leads');
    expect(result.status).toBe('completed');
    expect(result.result?.module).toBe('crm');
  });

  it('accepts show_business_summary intent', () => {
    const result = service.submitCommand('show_business_summary');
    expect(result.status).toBe('completed');
    expect(result.result?.module).toBe('command');
  });

  it('accepts health_check intent', () => {
    const result = service.submitCommand('health_check');
    expect(result.status).toBe('completed');
    expect(result.result?.module).toBe('cloud');
  });

  it('accepts health text', () => {
    const result = service.submitCommand('show me a health check');
    expect(result.status).toBe('completed');
    expect(result.result?.module).toBe('cloud');
  });

  it('rejects empty command text', () => {
    expect(() => service.submitCommand('   ')).toThrow(BadRequestException);
  });

  it('rejects shell capability commands', () => {
    expect(() => service.submitCommand('run shell on prod')).toThrow(BadRequestException);
  });

  it('rejects ssh capability commands', () => {
    expect(() => service.submitCommand('ssh into server')).toThrow(BadRequestException);
  });

  it('rejects exec capability commands', () => {
    expect(() => service.submitCommand('exec rm -rf')).toThrow(BadRequestException);
  });

  it('rejects terminal capability commands', () => {
    expect(() => service.submitCommand('open terminal')).toThrow(BadRequestException);
  });

  it('rejects unknown commands', () => {
    expect(() => service.submitCommand('delete everything')).toThrow(BadRequestException);
  });

  it('generates unique operationId per invocation', () => {
    const a = service.submitCommand('health_check');
    const b = service.submitCommand('health_check');
    expect(a.operationId).not.toBe(b.operationId);
  });

  it('returns empty pipeline when prospects not wired', async () => {
    const result = await service.getPipeline();
    expect(result).toMatchObject({ totalCount: 0, stages: [] });
  });

  it('returns empty lead list when prospects not wired', async () => {
    const result = await service.getLeads();
    expect(result).toMatchObject({ leads: [], total: 0 });
  });

  it('returns null claim when store not wired', async () => {
    expect(await service.claimLead('lead-1', 'user-1')).toBeNull();
  });

  it('returns empty customers when service not wired', async () => {
    const result = await service.getCustomers();
    expect(result).toMatchObject({ customers: [], total: 0 });
  });

  it('returns null customer stats when service not wired', async () => {
    expect(await service.getCustomerStats()).toBeNull();
  });

  it('returns zero finance snapshot when service not wired', async () => {
    const result = await service.getFinanceSnapshot();
    expect(result).toMatchObject({ revenueToday: 0, totalMrr: 0, activeCustomers: 0 });
  });

  it('returns unreachable cloud health when bridge not wired', async () => {
    const result = await service.getCloudHealth();
    expect(result.status).toBe('unreachable');
  });

  it('returns failure when deploy called without bridge', async () => {
    const result = await service.deploy({ service: 'api' });
    expect(result.success).toBe(false);
  });

  it('returns failure when restart called without bridge', async () => {
    const result = await service.restart({ service: 'api' });
    expect(result.success).toBe(false);
  });

  it('returns failure when rollback called without bridge', async () => {
    const result = await service.rollback({ service: 'api' });
    expect(result.success).toBe(false);
  });

  it('returns empty inventory when bridge not wired', async () => {
    const result = await service.getInventory();
    expect(result.services).toEqual([]);
  });

  it('returns capability matrix showing all unavailable when no deps', () => {
    const matrix = service.getCapabilities();
    expect(matrix.capabilities.every((c) => !c.available)).toBe(true);
    expect(matrix.generatedAt).toBeTruthy();
  });
});

// ─── Suite: with wired dependencies ──────────────────────────────────────────

describe('BusinessOsService (wired deps)', () => {
  let service: BusinessOsService;
  let prospectsMock: ReturnType<typeof makeProspectsMock>;
  let customersMock: ReturnType<typeof makeCustomersMock>;
  let bridgeMock: ReturnType<typeof makeControlBridgeMock>;
  let store: BusinessOsLeadClaimStore;

  beforeEach(() => {
    prospectsMock = makeProspectsMock();
    customersMock = makeCustomersMock();
    bridgeMock = makeControlBridgeMock();
    store = new BusinessOsLeadClaimStore();
    service = new BusinessOsService(
      prospectsMock as any,
      customersMock as any,
      undefined,
      undefined,
      store,
      bridgeMock,
    );
  });

  it('dashboard includes MRR from customer stats', async () => {
    const result = await service.getDashboard();
    expect(result.revenueMonth).toBe(7_500);
  });

  it('dashboard includes hot lead count from prospects', async () => {
    prospectsMock.getProspects.mockResolvedValueOnce({ prospects: [], total: 3, limit: 1, offset: 0 });
    const result = await service.getDashboard();
    expect(result.hotLeadCount).toBe(3);
  });

  it('getPipeline returns mapped stages and stats', async () => {
    const result = await service.getPipeline();
    expect(result.totalCount).toBe(8);
    expect(result.totalValue).toBe(40_000);
    expect(result.conversionRate).toBe(12.5);
    expect(result.stages.length).toBeGreaterThan(0);
  });

  it('getLeads returns mapped leads', async () => {
    const result = await service.getLeads({ status: 'QUALIFIED' });
    expect(result.leads).toHaveLength(1);
    expect(result.leads[0].id).toBe('lead-1');
    expect(result.leads[0].status).toBe('QUALIFIED');
    expect(prospectsMock.getProspects).toHaveBeenCalledWith({ status: 'QUALIFIED' });
  });

  it('getCustomers returns mapped customers', async () => {
    const result = await service.getCustomers({ status: 'ACTIVE' });
    expect(result.customers).toHaveLength(1);
    expect(result.customers[0].id).toBe('cust-1');
    expect(result.customers[0].mrr).toBe(1_500);
  });

  it('getCustomerStats returns stats from service', async () => {
    const result = await service.getCustomerStats();
    expect(result?.totalMrr).toBe(7_500);
    expect(result?.active).toBe(4);
  });

  it('getFinanceSnapshot reflects MRR and active customers', async () => {
    const result = await service.getFinanceSnapshot();
    expect(result.totalMrr).toBe(7_500);
    expect(result.activeCustomers).toBe(4);
  });

  it('claimLead succeeds for first claimer', async () => {
    const result = await service.claimLead('lead-new', 'user-1');
    expect(result?.leadId).toBe('lead-new');
    expect(result?.claimedBy).toBe('user-1');
  });

  it('claimLead returns null for second claimer on same lead', async () => {
    await service.claimLead('lead-contested', 'user-1');
    const result = await service.claimLead('lead-contested', 'user-2');
    expect(result).toBeNull();
  });

  it('claimLead is idempotent for same user', async () => {
    await service.claimLead('lead-idem', 'user-1');
    const result = await service.claimLead('lead-idem', 'user-1');
    expect(result?.claimedBy).toBe('user-1');
  });

  it('getCloudHealth delegates to controlBridge', async () => {
    const result = await service.getCloudHealth();
    expect(result.status).toBe('ok');
    expect(bridgeMock.healthCheck).toHaveBeenCalledTimes(1);
  });

  it('deploy delegates to controlBridge', async () => {
    const result = await service.deploy({ service: 'api', tag: 'v1.2.0' });
    expect(result.success).toBe(true);
    expect(bridgeMock.deploy).toHaveBeenCalledWith({ service: 'api', tag: 'v1.2.0' });
  });

  it('restart delegates to controlBridge', async () => {
    const result = await service.restart({ service: 'api' });
    expect(result.success).toBe(true);
    expect(bridgeMock.restart).toHaveBeenCalledWith({ service: 'api' });
  });

  it('rollback delegates to controlBridge', async () => {
    const result = await service.rollback({ service: 'api', steps: 1 });
    expect(result.success).toBe(true);
    expect(bridgeMock.rollback).toHaveBeenCalledWith({ service: 'api', steps: 1 });
  });

  it('getInventory delegates to controlBridge', async () => {
    const result = await service.getInventory();
    expect(result.services).toHaveLength(1);
    expect(bridgeMock.inventory).toHaveBeenCalledTimes(1);
  });

  it('capabilities matrix shows available when deps wired', () => {
    const matrix = service.getCapabilities();
    const byName = Object.fromEntries(matrix.capabilities.map((c) => [c.name, c]));
    expect(byName['crm'].available).toBe(true);
    expect(byName['customers'].available).toBe(true);
    expect(byName['lead_claims'].available).toBe(true);
  });

  it('capabilities matrix shows hermes as unavailable when not wired', () => {
    const matrix = service.getCapabilities();
    const hermes = matrix.capabilities.find((c) => c.name === 'hermes');
    expect(hermes?.available).toBe(false);
  });

  it('dashboard degrades gracefully when customer stats throw', async () => {
    customersMock.getStats.mockRejectedValueOnce(new Error('DB error'));
    const result = await service.getDashboard();
    expect(result.revenueMonth).toBe(0);
  });
});
