import { BadRequestException } from '@nestjs/common';
import { BusinessOsService } from './business-os.service';

describe('BusinessOsService', () => {
  let service: BusinessOsService;

  beforeEach(() => {
    service = new BusinessOsService();
  });

  it('returns zero dashboard metrics when providers are not wired', () => {
    expect(service.getDashboard()).toEqual({
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

  it('rejects shell capability commands', () => {
    expect(() => service.submitCommand('run shell on prod')).toThrow(BadRequestException);
  });

  it('rejects ssh capability commands', () => {
    expect(() => service.submitCommand('ssh into server')).toThrow(BadRequestException);
  });

  it('rejects unknown commands', () => {
    expect(() => service.submitCommand('delete everything')).toThrow(BadRequestException);
  });
});
