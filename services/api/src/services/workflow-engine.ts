/**
 * Workflow Automation Engine
 * Phase 5: Event-driven workflow triggers, retry logic, audit trail
 */

import { logger } from '../logger';

/**
 * Workflow Trigger Event
 */
interface WorkflowTriggerEvent {
  tenantId: string;
  triggerType: 'LEAD_STATUS_CHANGE' | 'ESTIMATE_SENT' | 'JOB_COMPLETED' | 'FOLLOWUP_OVERDUE' | 'PAYMENT_RECEIVED';
  entityId: string;
  entityType: 'Lead' | 'Estimate' | 'Job' | 'FollowUp' | 'Payment';
  data: Record<string, any>;
  timestamp: Date;
}

/**
 * Workflow Action
 */
interface WorkflowAction {
  id: string;
  type: 'SEND_SMS' | 'SEND_EMAIL' | 'PUBLISH_SOCIAL' | 'CHARGE_PAYMENT' | 'UPDATE_LEAD' | 'CREATE_TASK';
  condition?: string; // Optional condition expression
  payload: Record<string, any>;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

/**
 * Workflow Definition
 */
interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  enabled: boolean;
  triggers: string[]; // Array of trigger types that activate this workflow
  actions: WorkflowAction[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow Execution State
 */
interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  triggerEvent: WorkflowTriggerEvent;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  actions: WorkflowActionExecution[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Individual Action Execution State
 */
interface WorkflowActionExecution {
  actionId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  attempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  result?: Record<string, any>;
  error?: string;
}

/**
 * Workflow Engine - Orchestrates trigger detection and action execution
 */
export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private retryQueue: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    logger.info('Workflow engine initialized');
  }

  /**
   * Register a workflow definition
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    logger.info('Workflow registered', { workflowId: workflow.id, name: workflow.name });
  }

  /**
   * Unregister a workflow
   */
  unregisterWorkflow(workflowId: string): void {
    this.workflows.delete(workflowId);
    logger.info('Workflow unregistered', { workflowId });
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * List all workflows for a tenant
   */
  listWorkflows(tenantId: string): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(w => w.tenantId === tenantId && w.enabled);
  }

  /**
   * Process a trigger event through all matching workflows
   */
  async processTrigger(event: WorkflowTriggerEvent): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];

    // Find all workflows that match this trigger
    const matchingWorkflows = Array.from(this.workflows.values()).filter(
      w => w.tenantId === event.tenantId && w.enabled && w.triggers.includes(event.triggerType)
    );

    for (const workflow of matchingWorkflows) {
      const execution = await this.executeWorkflow(workflow, event);
      executions.push(execution);
    }

    logger.info('Trigger processed', {
      tenantId: event.tenantId,
      triggerType: event.triggerType,
      matchingWorkflows: matchingWorkflows.length,
      executions: executions.length,
    });

    return executions;
  }

  /**
   * Execute a workflow
   */
  private async executeWorkflow(workflow: WorkflowDefinition, event: WorkflowTriggerEvent): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      workflowId: workflow.id,
      tenantId: workflow.tenantId,
      triggerEvent: event,
      status: 'PENDING',
      actions: workflow.actions.map(a => ({
        actionId: a.id,
        status: 'PENDING',
        attempts: 0,
      })),
      startedAt: new Date(),
    };

    this.executions.set(execution.id, execution);

    try {
      execution.status = 'RUNNING';

      // Execute each action in sequence
      for (const action of workflow.actions) {
        const actionExec = execution.actions.find(a => a.actionId === action.id)!;

        // Check condition if present
        if (action.condition && !this.evaluateCondition(action.condition, event.data)) {
          logger.info('Workflow action skipped due to condition', {
            executionId: execution.id,
            actionId: action.id,
          });
          actionExec.status = 'COMPLETED';
          continue;
        }

        await this.executeAction(action, execution, actionExec);
      }

      execution.status = 'COMPLETED';
      execution.completedAt = new Date();

      logger.info('Workflow execution completed', {
        executionId: execution.id,
        workflowId: workflow.id,
        duration: execution.completedAt.getTime() - execution.startedAt.getTime(),
      });
    } catch (error) {
      execution.status = 'FAILED';
      execution.completedAt = new Date();
      execution.error = error instanceof Error ? error.message : String(error);

      logger.error('Workflow execution failed', {
        executionId: execution.id,
        workflowId: workflow.id,
        error: execution.error,
      });
    }

    return execution;
  }

  /**
   * Execute a single action with retry logic
   */
  private async executeAction(
    action: WorkflowAction,
    execution: WorkflowExecution,
    actionExec: WorkflowActionExecution
  ): Promise<void> {
    const retryPolicy = action.retryPolicy || {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelayMs: 1000,
    };

    actionExec.status = 'RUNNING';
    actionExec.attempts = 0;

    while (actionExec.attempts < retryPolicy.maxRetries) {
      try {
        actionExec.attempts++;
        actionExec.lastAttemptAt = new Date();

        logger.info('Workflow action executing', {
          executionId: execution.id,
          actionId: action.id,
          attempt: actionExec.attempts,
          type: action.type,
        });

        // Execute the action based on type
        const result = await this.executeActionByType(action);
        actionExec.result = result;
        actionExec.status = 'COMPLETED';

        logger.info('Workflow action completed', {
          executionId: execution.id,
          actionId: action.id,
          attempt: actionExec.attempts,
        });

        return; // Success
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        actionExec.error = errorMsg;

        if (actionExec.attempts >= retryPolicy.maxRetries) {
          actionExec.status = 'FAILED';
          throw new Error(`Action ${action.id} failed after ${actionExec.attempts} attempts: ${errorMsg}`);
        }

        // Schedule retry
        const delayMs = retryPolicy.initialDelayMs * Math.pow(retryPolicy.backoffMultiplier, actionExec.attempts - 1);
        actionExec.status = 'RETRYING';
        actionExec.nextRetryAt = new Date(Date.now() + delayMs);

        logger.warn('Workflow action retrying', {
          executionId: execution.id,
          actionId: action.id,
          attempt: actionExec.attempts,
          delayMs,
          error: errorMsg,
        });

        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  /**
   * Execute action based on type (placeholder for integration with approval executors)
   */
  private async executeActionByType(action: WorkflowAction): Promise<any> {
    switch (action.type) {
      case 'SEND_SMS':
        return { provider: 'sms', status: 'sent', messageId: `msg_${Date.now()}` };
      case 'SEND_EMAIL':
        return { provider: 'email', status: 'sent', messageId: `email_${Date.now()}` };
      case 'PUBLISH_SOCIAL':
        return { provider: action.payload.platform, status: 'published', postId: `post_${Date.now()}` };
      case 'CHARGE_PAYMENT':
        return { provider: 'stripe', status: 'charged', chargeId: `ch_${Date.now()}` };
      case 'UPDATE_LEAD':
        return { action: 'lead_updated', leadId: action.payload.leadId };
      case 'CREATE_TASK':
        return { action: 'task_created', taskId: `task_${Date.now()}` };
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Simple condition evaluator (supports basic property checks)
   */
  private evaluateCondition(condition: string, data: Record<string, any>): boolean {
    try {
      // Basic implementation: evaluate as JavaScript expression with data context
      // In production, use a safer expression evaluator
      const fn = new Function(...Object.keys(data), `return ${condition}`);
      return fn(...Object.values(data));
    } catch (error) {
      logger.warn('Condition evaluation failed', { condition, error });
      return false;
    }
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * List executions for a workflow
   */
  listExecutions(workflowId: string, limit: number = 50): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.workflowId === workflowId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Cancel an execution
   */
  cancelExecution(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'PAUSED';
      logger.info('Execution cancelled', { executionId });
    }
  }

  /**
   * Clean up old executions (older than 30 days)
   */
  cleanup(retentionDays: number = 30): number {
    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let removed = 0;

    for (const [id, execution] of this.executions.entries()) {
      if (execution.completedAt && execution.completedAt.getTime() < cutoffTime) {
        this.executions.delete(id);
        removed++;
      }
    }

    logger.info('Workflow executions cleaned up', { removed, retentionDays });
    return removed;
  }
}

export { WorkflowTriggerEvent, WorkflowDefinition, WorkflowExecution, WorkflowAction, WorkflowActionExecution };
