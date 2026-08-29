import { Test, TestingModule } from '@nestjs/testing';
import { BusinessOsController } from './business-os.controller';
import { BusinessOsService } from './business-os.service';

describe('BusinessOsController', () => {
  let controller: BusinessOsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessOsController],
      providers: [BusinessOsService],
    }).compile();

    controller = module.get<BusinessOsController>(BusinessOsController);
  });

  it('returns dashboard contract shape', () => {
    expect(controller.getDashboard()).toEqual({
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
});
