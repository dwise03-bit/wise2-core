'use client';

import { apiClient, PaginatedResponse } from '../lib/api-client';

export interface Job {
  id: string;
  tenantId: string;
  leadId: string;
  title: string;
  description?: string;
  address: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  technicianName?: string;
  estimatedDuration?: number; // in minutes
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  availability: boolean;
  currentJobs: number;
  rating?: number;
}

export interface JobFilter {
  status?: string;
  assignedTo?: string;
  priority?: string;
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DispatchQueue {
  unassignedJobs: Job[];
  assignedJobs: Job[];
  completedToday: number;
  averageCompletionTime: number;
  techniciansAvailable: Technician[];
}

export class DispatchService {
  async getJobs(page = 1, limit = 20, filters?: JobFilter): Promise<PaginatedResponse<Job>> {
    const filterParams: any = {};

    if (filters?.status) filterParams.status = filters.status;
    if (filters?.assignedTo) filterParams.assignedTo = filters.assignedTo;
    if (filters?.priority) filterParams.priority = filters.priority;
    if (filters?.dateRange) {
      filterParams.dateStart = filters.dateRange.start;
      filterParams.dateEnd = filters.dateRange.end;
    }

    const response = await apiClient.listJobs(page, limit, filterParams);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch jobs');
    }

    return response.data;
  }

  async getJobById(jobId: string): Promise<Job> {
    const response = await apiClient.request<Job>('GET', `/dispatch/jobs/${jobId}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch job');
    }

    return response.data;
  }

  async createJob(data: Omit<Job, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const response = await apiClient.createJob(data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create job');
    }

    return response.data;
  }

  async updateJob(jobId: string, data: Partial<Job>): Promise<Job> {
    const response = await apiClient.updateJob(jobId, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update job');
    }

    return response.data;
  }

  async deleteJob(jobId: string): Promise<void> {
    const response = await apiClient.deleteJob(jobId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete job');
    }
  }

  async assignJob(jobId: string, technicianId: string): Promise<Job> {
    const response = await apiClient.assignJob(jobId, technicianId);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to assign job');
    }

    return response.data;
  }

  async updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
    const response = await apiClient.updateJobStatus(jobId, status);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update job status');
    }

    return response.data;
  }

  async getDispatchQueue(): Promise<DispatchQueue> {
    const response = await apiClient.getDispatchQueue();

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch dispatch queue');
    }

    return response.data;
  }

  async getUnassignedJobs(limit = 20): Promise<Job[]> {
    const response = await this.getJobs(1, limit, { status: 'UNASSIGNED' });
    return response.items;
  }

  async getActiveJobs(technicianId?: string, limit = 20): Promise<Job[]> {
    const response = await this.getJobs(1, limit, {
      status: 'IN_PROGRESS',
      assignedTo: technicianId,
    });
    return response.items;
  }

  async getTodaysJobs(limit = 20): Promise<Job[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getJobs(1, limit, {
      dateRange: {
        start: today,
        end: today,
      },
    });
    return response.items;
  }

  calculateOptimalAssignment(job: Job, technicians: Technician[]): string | null {
    if (technicians.length === 0) return null;

    // Simple heuristic: assign to least busy technician with highest rating
    return technicians
      .filter(t => t.availability)
      .sort((a, b) => {
        if (a.currentJobs !== b.currentJobs) {
          return a.currentJobs - b.currentJobs;
        }
        return (b.rating || 0) - (a.rating || 0);
      })[0]?.id || null;
  }
}

export const dispatchService = new DispatchService();
