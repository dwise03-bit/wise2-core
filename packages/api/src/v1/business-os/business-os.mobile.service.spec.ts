import { Test, TestingModule } from '@nestjs/testing';
import { BusinessOsMobileService } from './business-os.mobile.service';
import { BusinessOsService } from './business-os.service';

describe('BusinessOsMobileService', () => {
  let service: BusinessOsMobileService;

  const core = {
    getCustomers: jest.fn().mockResolvedValue({ customers: [], total: 0 }),
    getFinanceSnapshot: jest.fn().mockResolvedValue({
      revenueToday: 0,
      revenueMonth: 0,
      unpaidInvoiceCount: 0,
    }),
    getInventory: jest.fn().mockResolvedValue({ services: [], generatedAt: new Date().toISOString() }),
    getCloudHealth: jest.fn().mockResolvedValue({ status: 'unreachable', checkedAt: new Date().toISOString() }),
    deploy: jest.fn(),
    restart: jest.fn(),
    rollback: jest.fn(),
  };

  beforeEach(() => {
    service = new BusinessOsMobileService(core as unknown as BusinessOsService);
  });

  it('gates trading by role', () => {
    expect(service.getMobileCapabilities({ role: 'FOUNDER' }).trading).toBe(true);
    expect(service.getMobileCapabilities({ role: 'VIEWER' }).trading).toBe(false);
  });

  it('returns empty conversations until providers are wired', () => {
    expect(service.getMobileConversations()).toEqual([]);
  });

  it('deduplicates HVAC drafts by idempotency key', () => {
    const first = service.saveMobileHvacDraft('tech-1', {
      idempotencyKey: 'draft-1',
      notes: 'Filter check',
    });
    const second = service.saveMobileHvacDraft('tech-1', {
      idempotencyKey: 'draft-1',
      notes: 'Filter check',
    });
    expect(second.id).toBe(first.id);
  });
});
