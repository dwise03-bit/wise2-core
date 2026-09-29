import { Test, TestingModule } from '@nestjs/testing';
import { BusinessOsController } from './business-os.controller';
import { BusinessOsService } from './business-os.service';
import { BusinessOsMobileService } from './business-os.mobile.service';

describe('BusinessOsController', () => {
  let controller: BusinessOsController;

  const core = {
    getDashboard: jest.fn().mockResolvedValue({
      revenueToday: 0,
      revenueMonth: 0,
      hotLeadCount: 0,
      activeJobCount: 0,
      unpaidInvoiceCount: 0,
      criticalAlertCount: 0,
    }),
    submitCommand: jest.fn().mockReturnValue({
      status: 'completed',
      result: { module: 'cloud' },
    }),
    getCapabilities: jest.fn().mockReturnValue({
      capabilities: [],
      generatedAt: new Date().toISOString(),
    }),
    getPipeline: jest.fn().mockResolvedValue({ totalCount: 0, totalValue: 0 }),
    getLeads: jest.fn().mockResolvedValue({ leads: [], total: 0 }),
    getCustomers: jest.fn().mockResolvedValue({ customers: [], total: 0 }),
    getFinanceSnapshot: jest.fn().mockResolvedValue({ revenueToday: 0, totalMrr: 0 }),
    getCloudHealth: jest.fn().mockResolvedValue({ status: 'unreachable' }),
  };

  const mobile = {
    getMobileCapabilities: jest.fn().mockReturnValue({ trading: false, cloud: false, hvac: true }),
    getMobileLeads: jest.fn().mockResolvedValue([]),
    getMobileCloudHealth: jest.fn().mockResolvedValue({ status: 'unreachable', components: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessOsController],
      providers: [
        { provide: BusinessOsService, useValue: core },
        { provide: BusinessOsMobileService, useValue: mobile },
      ],
    }).compile();

    controller = module.get<BusinessOsController>(BusinessOsController);
  });

  it('returns dashboard contract shape', async () => {
    expect(await controller.getDashboard()).toEqual({
      revenueToday: 0,
      revenueMonth: 0,
      hotLeadCount: 0,
      activeJobCount: 0,
      unpaidInvoiceCount: 0,
      criticalAlertCount: 0,
    });
  });

  it('routes health_check command through service', () => {
    const result = controller.submitCommand({ text: 'health_check' });
    expect(result.status).toBe('completed');
    expect(result.result?.module).toBe('cloud');
  });

  it('returns mobile capabilities for iOS', () => {
    const result = controller.getMobileCapabilities({ user: { role: 'VIEWER' } });
    expect(result).toEqual({ trading: false, cloud: false, hvac: true });
  });

  it('returns capability matrix on admin route', () => {
    const result = controller.getCapabilityMatrix();
    expect(result).toHaveProperty('capabilities');
    expect(result).toHaveProperty('generatedAt');
  });

  it('returns pipeline when no prospects service wired', async () => {
    const result = await controller.getPipeline();
    expect(result).toMatchObject({ totalCount: 0, totalValue: 0 });
  });

  it('returns mobile leads array for iOS', async () => {
    const result = await controller.getMobileLeads();
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns customers list when no customers service wired', async () => {
    const result = await controller.getCustomers({});
    expect(result).toMatchObject({ customers: [], total: 0 });
  });

  it('returns finance snapshot when no customers service wired', async () => {
    const result = await controller.getFinanceSnapshot();
    expect(result).toMatchObject({ revenueToday: 0, totalMrr: 0 });
  });

  it('returns mobile cloud health when bridge not configured', async () => {
    const result = await controller.getMobileCloudHealth();
    expect(result.status).toBe('unreachable');
  });
});
