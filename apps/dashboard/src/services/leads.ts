'use client';

import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api-client';

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATING' | 'WON' | 'LOST';
  source?: string;
  assignedTo?: string;
  estimatedValue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilter {
  status?: string;
  assignedTo?: string;
  source?: string;
  searchQuery?: string;
  minValue?: number;
  maxValue?: number;
}

export class LeadsService {
  async getLeads(page = 1, limit = 20, filters?: LeadFilter): Promise<PaginatedResponse<Lead>> {
    const filterParams: any = {};

    if (filters?.status) filterParams.status = filters.status;
    if (filters?.assignedTo) filterParams.assignedTo = filters.assignedTo;
    if (filters?.source) filterParams.source = filters.source;
    if (filters?.minValue) filterParams.minValue = filters.minValue;
    if (filters?.maxValue) filterParams.maxValue = filters.maxValue;

    const response = await apiClient.listLeads(page, limit, filterParams);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch leads');
    }

    return response.data;
  }

  async getLeadById(leadId: string): Promise<Lead> {
    const response = await apiClient.request<Lead>('GET', `/crm/leads/${leadId}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch lead');
    }

    return response.data;
  }

  async createLead(data: Omit<Lead, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const response = await apiClient.createLead(data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create lead');
    }

    return response.data;
  }

  async updateLead(leadId: string, data: Partial<Lead>): Promise<Lead> {
    const response = await apiClient.updateLead(leadId, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update lead');
    }

    return response.data;
  }

  async deleteLead(leadId: string): Promise<void> {
    const response = await apiClient.deleteLead(leadId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete lead');
    }
  }

  async searchLeads(query: string): Promise<Lead[]> {
    const response = await apiClient.searchLeads(query);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to search leads');
    }

    return response.data;
  }

  async updateLeadStatus(leadId: string, status: Lead['status']): Promise<Lead> {
    return this.updateLead(leadId, { status });
  }

  async assignLeadToUser(leadId: string, userId: string): Promise<Lead> {
    return this.updateLead(leadId, { assignedTo: userId });
  }
}

export const leadsService = new LeadsService();
