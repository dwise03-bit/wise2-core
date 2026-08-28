'use client';

// API Client for WISE² Command Center
// Handles authentication, tenant scoping, retries, and error handling

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tenantId: string | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;
  private readonly retryableStatusCodes = [408, 429, 500, 502, 503, 504];

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined'
      ? `${window.location.origin}/api`
      : 'http://localhost:3001/api');
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  setTenantId(tenantId: string | null): void {
    this.tenantId = tenantId;
  }

  getToken(): string | null {
    return this.token;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.tenantId) {
      headers['X-Tenant-Id'] = this.tenantId;
    }

    return headers;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(status: number, attempt: number): boolean {
    return attempt < this.maxRetries && this.retryableStatusCodes.includes(status);
  }

  async request<T>(
    method: string,
    path: string,
    body?: any,
    options?: { skipAuth?: boolean; skipRetry?: boolean }
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: options?.skipAuth ? { 'Content-Type': 'application/json' } : this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = (await response.json()) as ApiResponse<T>;

        if (!response.ok && this.shouldRetry(response.status, attempt) && !options?.skipRetry) {
          const delayTime = this.retryDelayMs * Math.pow(2, attempt);
          await this.delay(delayTime);
          continue;
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1 && !options?.skipRetry) {
          const delayTime = this.retryDelayMs * Math.pow(2, attempt);
          await this.delay(delayTime);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; tenantId: string; user: any }>> {
    return this.request('POST', '/auth/login', { email, password }, { skipAuth: true });
  }

  async signup(email: string, password: string, companyName: string): Promise<ApiResponse<{ token: string; tenantId: string; user: any }>> {
    return this.request('POST', '/auth/signup', { email, password, companyName }, { skipAuth: true });
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request('POST', '/auth/logout', {});
  }

  // CRM endpoints
  async listLeads(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = new URLSearchParams({ page: page.toString(), limit: Math.min(limit, 100).toString() });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.append(key, String(value));
      });
    }
    return this.request('GET', `/crm/leads?${query}`);
  }

  async createLead(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/crm/leads', data);
  }

  async updateLead(leadId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PUT', `/crm/leads/${leadId}`, data);
  }

  async deleteLead(leadId: string): Promise<ApiResponse<null>> {
    return this.request('DELETE', `/crm/leads/${leadId}`);
  }

  async searchLeads(query: string): Promise<ApiResponse<any[]>> {
    return this.request('GET', `/crm/leads/search?q=${encodeURIComponent(query)}`);
  }

  async listCustomers(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.request('GET', `/crm/customers?page=${page}&limit=${Math.min(limit, 100)}`);
  }

  async getPipelineSummary(): Promise<ApiResponse<any>> {
    return this.request('GET', '/crm/pipeline/summary');
  }

  // Estimates endpoints
  async listEstimates(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = new URLSearchParams({ page: page.toString(), limit: Math.min(limit, 100).toString() });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.append(key, String(value));
      });
    }
    return this.request('GET', `/estimates?${query}`);
  }

  async createEstimate(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/estimates', data);
  }

  async updateEstimate(estimateId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PUT', `/estimates/${estimateId}`, data);
  }

  async deleteEstimate(estimateId: string): Promise<ApiResponse<null>> {
    return this.request('DELETE', `/estimates/${estimateId}`);
  }

  async sendEstimate(estimateId: string, recipientEmail: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/estimates/${estimateId}/send`, { recipientEmail });
  }

  async markEstimateAccepted(estimateId: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/estimates/${estimateId}/accept`, {});
  }

  async markEstimateDeclined(estimateId: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/estimates/${estimateId}/decline`, {});
  }

  // Dispatch endpoints
  async listJobs(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = new URLSearchParams({ page: page.toString(), limit: Math.min(limit, 100).toString() });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.append(key, String(value));
      });
    }
    return this.request('GET', `/dispatch/jobs?${query}`);
  }

  async createJob(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/dispatch/jobs', data);
  }

  async updateJob(jobId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PUT', `/dispatch/jobs/${jobId}`, data);
  }

  async deleteJob(jobId: string): Promise<ApiResponse<null>> {
    return this.request('DELETE', `/dispatch/jobs/${jobId}`);
  }

  async assignJob(jobId: string, technicianId: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/dispatch/jobs/${jobId}/assign`, { technicianId });
  }

  async updateJobStatus(jobId: string, status: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/dispatch/jobs/${jobId}/status`, { status });
  }

  async getDispatchQueue(): Promise<ApiResponse<any>> {
    return this.request('GET', '/dispatch/queue');
  }

  // Approvals endpoints
  async listApprovals(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = new URLSearchParams({ page: page.toString(), limit: Math.min(limit, 100).toString() });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.append(key, String(value));
      });
    }
    return this.request('GET', `/approvals?${query}`);
  }

  async approveAction(approvalId: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/approvals/${approvalId}/approve`, {});
  }

  async rejectAction(approvalId: string, reason?: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/approvals/${approvalId}/reject`, { reason });
  }

  async executeApprovedAction(approvalId: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/approvals/${approvalId}/execute`, {});
  }

  async getApprovalSummary(): Promise<ApiResponse<any>> {
    return this.request('GET', '/approvals/summary');
  }

  // Workflows endpoints
  async listWorkflows(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.request('GET', `/workflows?page=${page}&limit=${Math.min(limit, 100)}`);
  }

  async createWorkflow(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/workflows', data);
  }

  async updateWorkflow(workflowId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PUT', `/workflows/${workflowId}`, data);
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<null>> {
    return this.request('DELETE', `/workflows/${workflowId}`);
  }

  async getWorkflowDetails(workflowId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/workflows/${workflowId}`);
  }

  async testWorkflow(workflowId: string, testData: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/workflows/${workflowId}/test`, testData);
  }

  async getWorkflowExecutionHistory(workflowId: string, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.request('GET', `/workflows/${workflowId}/executions?page=${page}&limit=${Math.min(limit, 100)}`);
  }

  async initializeWorkflowEngine(): Promise<ApiResponse<any>> {
    return this.request('POST', '/workflows/engine/initialize', {});
  }

  async triggerWorkflowEvent(triggerType: string, entityId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/workflows/engine/trigger-event', { triggerType, entityId, data });
  }

  // Reports endpoints
  async getSalesReport(filters?: any): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.append(key, String(value));
      });
    }
    return this.request('GET', `/reports/sales?${query}`);
  }

  async getDispatchReport(filters?: any): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.append(key, String(value));
      });
    }
    return this.request('GET', `/reports/dispatch?${query}`);
  }

  async getRevenueReport(filters?: any): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.append(key, String(value));
      });
    }
    return this.request('GET', `/reports/revenue?${query}`);
  }

  // Business Intelligence endpoints
  async getInsights(): Promise<ApiResponse<any>> {
    return this.request('GET', '/business-intelligence/insights');
  }

  async getSummary(): Promise<ApiResponse<any>> {
    return this.request('GET', '/business-intelligence/summary');
  }

  // Health check
  async health(): Promise<ApiResponse<any>> {
    return this.request('GET', '/observability/health', undefined, { skipAuth: true });
  }
}

export const apiClient = new ApiClient();
