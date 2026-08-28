'use client';

import { apiClient, PaginatedResponse } from '../lib/api-client';

export interface Estimate {
  id: string;
  tenantId: string;
  leadId: string;
  title: string;
  description?: string;
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  validUntil?: string;
  sentAt?: string;
  respondedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface EstimateFilter {
  status?: string;
  leadId?: string;
  createdBy?: string;
  searchQuery?: string;
  minTotal?: number;
  maxTotal?: number;
}

export class EstimatesService {
  async getEstimates(page = 1, limit = 20, filters?: EstimateFilter): Promise<PaginatedResponse<Estimate>> {
    const filterParams: any = {};

    if (filters?.status) filterParams.status = filters.status;
    if (filters?.leadId) filterParams.leadId = filters.leadId;
    if (filters?.createdBy) filterParams.createdBy = filters.createdBy;
    if (filters?.minTotal) filterParams.minTotal = filters.minTotal;
    if (filters?.maxTotal) filterParams.maxTotal = filters.maxTotal;

    const response = await apiClient.listEstimates(page, limit, filterParams);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch estimates');
    }

    return response.data;
  }

  async getEstimateById(estimateId: string): Promise<Estimate> {
    const response = await apiClient.request<Estimate>('GET', `/estimates/${estimateId}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch estimate');
    }

    return response.data;
  }

  async createEstimate(data: Omit<Estimate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'sentAt' | 'respondedAt'>): Promise<Estimate> {
    const response = await apiClient.createEstimate(data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create estimate');
    }

    return response.data;
  }

  async updateEstimate(estimateId: string, data: Partial<Estimate>): Promise<Estimate> {
    const response = await apiClient.updateEstimate(estimateId, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update estimate');
    }

    return response.data;
  }

  async deleteEstimate(estimateId: string): Promise<void> {
    const response = await apiClient.deleteEstimate(estimateId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete estimate');
    }
  }

  async sendEstimate(estimateId: string, recipientEmail: string): Promise<Estimate> {
    const response = await apiClient.sendEstimate(estimateId, recipientEmail);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send estimate');
    }

    return response.data;
  }

  async acceptEstimate(estimateId: string): Promise<Estimate> {
    const response = await apiClient.markEstimateAccepted(estimateId);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to accept estimate');
    }

    return response.data;
  }

  async declineEstimate(estimateId: string): Promise<Estimate> {
    const response = await apiClient.markEstimateDeclined(estimateId);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to decline estimate');
    }

    return response.data;
  }

  async calculateTotal(items: EstimateItem[], taxRate = 0.1): Promise<{ subtotal: number; tax: number; total: number }> {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }
}

export const estimatesService = new EstimatesService();
