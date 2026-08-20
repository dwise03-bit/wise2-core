import { LeadsService, type Lead } from '../services/leads';
import * as apiClient from '../lib/api-client';

jest.mock('../lib/api-client');

describe('LeadsService', () => {
  let service: LeadsService;
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    service = new LeadsService();
    jest.clearAllMocks();
  });

  const mockLead: Lead = {
    id: 'lead-123',
    tenantId: 'tenant-456',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-0123',
    company: 'Acme Corp',
    status: 'QUALIFIED',
    source: 'Website',
    assignedTo: 'user-789',
    estimatedValue: 5000,
    notes: 'Test lead',
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
  };

  describe('getLeads', () => {
    it('should fetch leads with pagination', async () => {
      const mockResponse = {
        items: [mockLead],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockApiClient.apiClient.listLeads = jest.fn().mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await service.getLeads(1, 20);

      expect(result.items).toEqual([mockLead]);
      expect(result.total).toBe(1);
    });

    it('should throw error when fetch fails', async () => {
      mockApiClient.apiClient.listLeads = jest.fn().mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed to fetch' },
      });

      await expect(service.getLeads(1, 20)).rejects.toThrow('Failed to fetch');
    });

    it('should apply filters', async () => {
      mockApiClient.apiClient.listLeads = jest.fn().mockResolvedValue({
        success: true,
        data: { items: [], total: 0, page: 1, limit: 20 },
      });

      await service.getLeads(1, 20, { status: 'WON', minValue: 1000 });

      expect(mockApiClient.apiClient.listLeads).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({ status: 'WON', minValue: 1000 })
      );
    });
  });

  describe('createLead', () => {
    it('should create a new lead', async () => {
      const leadData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        status: 'NEW' as const,
      };

      mockApiClient.apiClient.createLead = jest.fn().mockResolvedValue({
        success: true,
        data: { ...mockLead, ...leadData, id: 'new-lead-id' },
      });

      const result = await service.createLead(leadData);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(mockApiClient.apiClient.createLead).toHaveBeenCalledWith(leadData);
    });

    it('should throw error when creation fails', async () => {
      mockApiClient.apiClient.createLead = jest.fn().mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Validation failed' },
      });

      await expect(
        service.createLead({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          status: 'NEW',
        })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('updateLead', () => {
    it('should update an existing lead', async () => {
      const updates = { status: 'WON' as const, estimatedValue: 10000 };

      mockApiClient.apiClient.updateLead = jest.fn().mockResolvedValue({
        success: true,
        data: { ...mockLead, ...updates },
      });

      const result = await service.updateLead('lead-123', updates);

      expect(result.status).toBe('WON');
      expect(result.estimatedValue).toBe(10000);
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead', async () => {
      mockApiClient.apiClient.deleteLead = jest.fn().mockResolvedValue({
        success: true,
      });

      await service.deleteLead('lead-123');

      expect(mockApiClient.apiClient.deleteLead).toHaveBeenCalledWith('lead-123');
    });

    it('should throw error when deletion fails', async () => {
      mockApiClient.apiClient.deleteLead = jest.fn().mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });

      await expect(service.deleteLead('nonexistent')).rejects.toThrow('Lead not found');
    });
  });

  describe('searchLeads', () => {
    it('should search leads by query', async () => {
      mockApiClient.apiClient.searchLeads = jest.fn().mockResolvedValue({
        success: true,
        data: [mockLead],
      });

      const result = await service.searchLeads('john');

      expect(result).toEqual([mockLead]);
      expect(mockApiClient.apiClient.searchLeads).toHaveBeenCalledWith('john');
    });
  });

  describe('updateLeadStatus', () => {
    it('should update only the status field', async () => {
      mockApiClient.apiClient.updateLead = jest.fn().mockResolvedValue({
        success: true,
        data: { ...mockLead, status: 'WON' },
      });

      await service.updateLeadStatus('lead-123', 'WON');

      expect(mockApiClient.apiClient.updateLead).toHaveBeenCalledWith('lead-123', { status: 'WON' });
    });
  });

  describe('assignLeadToUser', () => {
    it('should assign lead to user', async () => {
      mockApiClient.apiClient.updateLead = jest.fn().mockResolvedValue({
        success: true,
        data: { ...mockLead, assignedTo: 'new-user-id' },
      });

      await service.assignLeadToUser('lead-123', 'new-user-id');

      expect(mockApiClient.apiClient.updateLead).toHaveBeenCalledWith('lead-123', { assignedTo: 'new-user-id' });
    });
  });
});
