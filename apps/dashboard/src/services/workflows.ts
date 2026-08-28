'use client';

import { apiClient, PaginatedResponse } from '../lib/api-client';

export interface WorkflowTrigger {
  type: 'LEAD_STATUS_CHANGE' | 'ESTIMATE_SENT' | 'JOB_COMPLETED' | 'FOLLOWUP_OVERDUE' | 'PAYMENT_RECEIVED';
  entityType?: string;
  conditions?: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  type: 'SEND_SMS' | 'SEND_EMAIL' | 'PUBLISH_SOCIAL' | 'CHARGE_PAYMENT' | 'UPDATE_LEAD' | 'CREATE_TASK';
  condition?: string;
  payload: Record<string, any>;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  enabled: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  triggerEvent?: Record<string, any>;
  actions?: WorkflowActionExecution[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowActionExecution {
  actionId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  attempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  result?: Record<string, any>;
  error?: string;
}

export interface WorkflowFilter {
  enabled?: boolean;
  searchQuery?: string;
  triggerType?: string;
}

export class WorkflowsService {
  async getWorkflows(page = 1, limit = 20, filters?: WorkflowFilter): Promise<PaginatedResponse<Workflow>> {
    const filterParams: any = {};

    if (filters?.enabled !== undefined) filterParams.enabled = filters.enabled;
    if (filters?.triggerType) filterParams.triggerType = filters.triggerType;

    const response = await apiClient.listWorkflows(page, limit);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch workflows');
    }

    return response.data;
  }

  async getWorkflowById(workflowId: string): Promise<Workflow> {
    const response = await apiClient.getWorkflowDetails(workflowId);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch workflow');
    }

    return response.data;
  }

  async createWorkflow(data: Omit<Workflow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const response = await apiClient.createWorkflow(data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create workflow');
    }

    return response.data;
  }

  async updateWorkflow(workflowId: string, data: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.updateWorkflow(workflowId, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update workflow');
    }

    return response.data;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    const response = await apiClient.deleteWorkflow(workflowId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete workflow');
    }
  }

  async toggleWorkflow(workflowId: string, enabled: boolean): Promise<Workflow> {
    return this.updateWorkflow(workflowId, { enabled });
  }

  async testWorkflow(workflowId: string, testData: Record<string, any>): Promise<WorkflowExecution> {
    const response = await apiClient.testWorkflow(workflowId, testData);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to test workflow');
    }

    return response.data;
  }

  async getExecutionHistory(workflowId: string, page = 1, limit = 20): Promise<PaginatedResponse<WorkflowExecution>> {
    const response = await apiClient.getWorkflowExecutionHistory(workflowId, page, limit);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch execution history');
    }

    return response.data;
  }

  async getExecutionDetails(executionId: string): Promise<WorkflowExecution> {
    const response = await apiClient.request<WorkflowExecution>('GET', `/workflows/executions/${executionId}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch execution details');
    }

    return response.data;
  }

  async initializeEngine(): Promise<void> {
    const response = await apiClient.initializeWorkflowEngine();

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to initialize workflow engine');
    }
  }

  async triggerEvent(triggerType: string, entityId: string, data: Record<string, any>): Promise<WorkflowExecution[]> {
    const response = await apiClient.triggerWorkflowEvent(triggerType, entityId, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to trigger workflow event');
    }

    return response.data;
  }

  async cancelExecution(executionId: string): Promise<void> {
    const response = await apiClient.request('POST', `/workflows/executions/${executionId}/cancel`, {});

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel execution');
    }
  }

  // Helper method to build a workflow action for sending SMS
  buildSmsAction(phoneNumber: string, message: string): WorkflowAction {
    return {
      id: crypto.randomUUID?.() || Date.now().toString(),
      type: 'SEND_SMS',
      payload: {
        phoneNumber,
        message,
        from: 'WISE2',
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
      },
    };
  }

  // Helper method to build a workflow action for sending email
  buildEmailAction(email: string, subject: string, body: string): WorkflowAction {
    return {
      id: crypto.randomUUID?.() || Date.now().toString(),
      type: 'SEND_EMAIL',
      payload: {
        email,
        subject,
        body,
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
      },
    };
  }

  // Helper method to build a workflow action for creating a task
  buildTaskAction(title: string, description?: string, dueDate?: string): WorkflowAction {
    return {
      id: crypto.randomUUID?.() || Date.now().toString(),
      type: 'CREATE_TASK',
      payload: {
        title,
        description,
        dueDate,
      },
    };
  }
}

export const workflowsService = new WorkflowsService();
