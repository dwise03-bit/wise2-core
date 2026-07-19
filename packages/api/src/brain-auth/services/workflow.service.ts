import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkflowTemplate, WorkflowTemplateDocument } from '../schemas/workflow-template.schema';
import { WorkflowExecution, WorkflowExecutionDocument, ActionExecution } from '../schemas/workflow-execution.schema';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(WorkflowTemplate.name) private readonly templateModel: Model<WorkflowTemplateDocument>,
    @InjectModel(WorkflowExecution.name) private readonly executionModel: Model<WorkflowExecutionDocument>,
  ) {}

  /**
   * Create workflow template
   */
  async createTemplate(
    workspaceId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      triggers: any[];
      actions: any[];
      retryPolicy?: any;
      timeout?: number;
    },
  ): Promise<WorkflowTemplateDocument> {
    if (!data.name || !data.triggers?.length || !data.actions?.length) {
      throw new BadRequestException('name, triggers, and actions are required');
    }

    const template = await this.templateModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      owner: new Types.ObjectId(userId),
      name: data.name,
      description: data.description,
      triggers: data.triggers,
      actions: data.actions,
      retryPolicy: data.retryPolicy || { maxRetries: 3, backoffMs: 1000, exponential: true },
      timeout: data.timeout || 300000, // 5 minutes default
      status: 'draft',
      enabled: true,
    });

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<WorkflowTemplateDocument> {
    const template = await this.templateModel.findById(templateId);
    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }
    return template;
  }

  /**
   * List templates
   */
  async listTemplates(
    workspaceId: string,
    filters?: { status?: string; enabled?: boolean },
  ): Promise<WorkflowTemplateDocument[]> {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (filters?.status) query.status = filters.status;
    if (filters?.enabled !== undefined) query.enabled = filters.enabled;

    return this.templateModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    data: {
      name?: string;
      description?: string;
      triggers?: any[];
      actions?: any[];
      status?: string;
      retryPolicy?: any;
      timeout?: number;
    },
  ): Promise<WorkflowTemplateDocument> {
    const template = await this.getTemplate(templateId);

    if (data.name) template.name = data.name;
    if (data.description) template.description = data.description;
    if (data.triggers) template.triggers = data.triggers;
    if (data.actions) template.actions = data.actions;
    if (data.status) template.status = data.status as any;
    if (data.retryPolicy) template.retryPolicy = data.retryPolicy;
    if (data.timeout) template.timeout = data.timeout;

    template.version += 1;
    return template.save();
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const result = await this.templateModel.findByIdAndUpdate(templateId, { status: 'archived' });
    if (!result) {
      throw new NotFoundException('Workflow template not found');
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    templateId: string,
    workspaceId: string,
    data?: { triggerData?: Record<string, any>; initiatedByUserId?: string; isManualRun?: boolean },
  ): Promise<WorkflowExecutionDocument> {
    const template = await this.getTemplate(templateId);

    if (template.status !== 'active') {
      throw new BadRequestException('Workflow template must be active to execute');
    }

    const execution = await this.executionModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      workflowTemplateId: new Types.ObjectId(templateId),
      workflowName: template.name,
      status: 'pending',
      startedAt: new Date(),
      triggerData: data?.triggerData || {},
      isManualRun: data?.isManualRun || false,
      initiatedBy: data?.initiatedByUserId ? new Types.ObjectId(data.initiatedByUserId) : undefined,
      actionExecutions: template.actions.map((action) => ({
        actionId: action.id,
        actionType: action.type,
        status: 'pending',
        startedAt: new Date(),
        input: action.config,
        retryCount: 0,
      })),
    });

    // Execute asynchronously
    this.executeWorkflowAsync(execution._id.toString(), template).catch((err) => {
      console.error(`Workflow execution failed: ${err.message}`);
    });

    return execution;
  }

  /**
   * Execute workflow actions
   */
  private async executeWorkflowAsync(executionId: string, template: WorkflowTemplateDocument): Promise<void> {
    const execution = await this.executionModel.findById(executionId);
    if (!execution) return;

    execution.status = 'running';
    await execution.save();

    const startTime = Date.now();
    const actionResults: Map<string, any> = new Map();

    try {
      for (const templateAction of template.actions) {
        const actionExecution = execution.actionExecutions.find((a) => a.actionId === templateAction.id);
        if (!actionExecution) continue;

        actionExecution.status = 'running';
        actionExecution.startedAt = new Date();

        try {
          const result = await this.executeAction(templateAction, execution.triggerData || {}, actionResults);

          actionExecution.status = 'success';
          actionExecution.output = result;
          actionExecution.completedAt = new Date();
          actionExecution.durationMs = Date.now() - actionExecution.startedAt.getTime();

          actionResults.set(templateAction.id, result);
          execution.successCount += 1;
        } catch (error) {
          actionExecution.status = 'failed';
          actionExecution.error = {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: 'ACTION_FAILED',
          };
          actionExecution.completedAt = new Date();
          actionExecution.durationMs = Date.now() - actionExecution.startedAt.getTime();

          execution.failureCount += 1;
          execution.error = {
            message: actionExecution.error.message,
            code: 'ACTION_FAILED',
            actionId: templateAction.id,
          };

          // Check retry policy
          if (actionExecution.retryCount < (template.retryPolicy?.maxRetries || 3)) {
            actionExecution.retryCount += 1;
            const backoffMs = template.retryPolicy?.backoffMs || 1000;
            execution.nextRetryAt = new Date(Date.now() + backoffMs);
          }
        }
      }

      execution.status = execution.failureCount === 0 ? 'success' : execution.successCount > 0 ? 'partial' : 'failed';
      execution.output = Object.fromEntries(actionResults);
    } catch (error) {
      execution.status = 'failed';
      execution.error = {
        message: error instanceof Error ? error.message : 'Unknown workflow error',
        code: 'WORKFLOW_ERROR',
      };
    } finally {
      execution.completedAt = new Date();
      execution.durationMs = Date.now() - startTime;

      // Calculate metrics
      execution.metrics = {
        totalActions: template.actions.length,
        parallelActions: 0,
        criticalPath: execution.durationMs || 0,
        efficiency: execution.successCount > 0 ? (execution.successCount / template.actions.length) * 100 : 0,
      };

      await execution.save();

      // Update template stats
      await this.templateModel.findByIdAndUpdate(template._id, {
        executionCount: (template.executionCount || 0) + 1,
        successCount: (template.successCount || 0) + (execution.status === 'success' ? 1 : 0),
        failureCount: (template.failureCount || 0) + (execution.status === 'failed' ? 1 : 0),
        lastExecutedAt: new Date(),
        errorRate: execution.failureCount > 0 ? (execution.failureCount / template.actions.length) * 100 : 0,
        lastError: execution.error,
      });
    }
  }

  /**
   * Execute single action
   */
  private async executeAction(
    action: any,
    triggerData: Record<string, any>,
    previousResults: Map<string, any>,
  ): Promise<Record<string, any>> {
    const context = { triggerData, results: Object.fromEntries(previousResults) };

    switch (action.type) {
      case 'send_email':
        return this.actionSendEmail(action.config, context);
      case 'create_entry':
        return this.actionCreateEntry(action.config, context);
      case 'update_metrics':
        return this.actionUpdateMetrics(action.config, context);
      case 'notify_user':
        return this.actionNotifyUser(action.config, context);
      case 'log_event':
        return this.actionLogEvent(action.config, context);
      case 'webhook':
        return this.actionWebhook(action.config, context);
      case 'conditional':
        return this.actionConditional(action.config, context);
      case 'delay':
        return this.actionDelay(action.config);
      default:
        throw new BadRequestException(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Action: Send email
   */
  private async actionSendEmail(config: any, context: any): Promise<Record<string, any>> {
    // Placeholder - would integrate with mail service
    return {
      type: 'email_sent',
      to: config.to,
      subject: config.subject,
      timestamp: new Date(),
    };
  }

  /**
   * Action: Create entry
   */
  private async actionCreateEntry(config: any, context: any): Promise<Record<string, any>> {
    // Placeholder - would integrate with document service
    return {
      type: 'entry_created',
      title: config.title,
      timestamp: new Date(),
    };
  }

  /**
   * Action: Update metrics
   */
  private async actionUpdateMetrics(config: any, context: any): Promise<Record<string, any>> {
    // Placeholder - would integrate with dashboard service
    return {
      type: 'metrics_updated',
      metricType: config.metricType,
      value: config.value,
      timestamp: new Date(),
    };
  }

  /**
   * Action: Notify user
   */
  private async actionNotifyUser(config: any, context: any): Promise<Record<string, any>> {
    // Placeholder - would integrate with notification service
    return {
      type: 'user_notified',
      userId: config.userId,
      message: config.message,
      timestamp: new Date(),
    };
  }

  /**
   * Action: Log event
   */
  private async actionLogEvent(config: any, context: any): Promise<Record<string, any>> {
    return {
      type: 'event_logged',
      event: config.event,
      timestamp: new Date(),
    };
  }

  /**
   * Action: Webhook
   */
  private async actionWebhook(config: any, context: any): Promise<Record<string, any>> {
    // Placeholder - would make HTTP request
    return {
      type: 'webhook_called',
      url: config.url,
      method: config.method || 'POST',
      timestamp: new Date(),
    };
  }

  /**
   * Action: Conditional
   */
  private async actionConditional(config: any, context: any): Promise<Record<string, any>> {
    // Evaluate condition
    const condition = config.condition;
    const conditionMet = this.evaluateCondition(condition, context);
    return {
      type: 'condition_evaluated',
      condition,
      result: conditionMet,
      timestamp: new Date(),
    };
  }

  /**
   * Action: Delay
   */
  private async actionDelay(config: any): Promise<Record<string, any>> {
    const delayMs = config.delayMs || 1000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return {
      type: 'delay_completed',
      delayMs,
      timestamp: new Date(),
    };
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: any, context: any): boolean {
    // Simple condition evaluation - can be extended
    if (!condition) return true;
    if (condition.field && condition.operator && condition.value) {
      const fieldValue = this.getNestedValue(context, condition.field);
      return this.compareValues(fieldValue, condition.operator, condition.value);
    }
    return true;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Compare values
   */
  private compareValues(a: any, op: string, b: any): boolean {
    switch (op) {
      case 'eq':
        return a === b;
      case 'neq':
        return a !== b;
      case 'gt':
        return a > b;
      case 'gte':
        return a >= b;
      case 'lt':
        return a < b;
      case 'lte':
        return a <= b;
      case 'contains':
        return String(a).includes(String(b));
      case 'in':
        return Array.isArray(b) && b.includes(a);
      default:
        return true;
    }
  }

  /**
   * Get execution
   */
  async getExecution(executionId: string): Promise<WorkflowExecutionDocument> {
    const execution = await this.executionModel.findById(executionId);
    if (!execution) {
      throw new NotFoundException('Workflow execution not found');
    }
    return execution;
  }

  /**
   * List executions
   */
  async listExecutions(
    workspaceId: string,
    filters?: { templateId?: string; status?: string; limit?: number },
  ): Promise<WorkflowExecutionDocument[]> {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (filters?.templateId) query.workflowTemplateId = new Types.ObjectId(filters.templateId);
    if (filters?.status) query.status = filters.status;

    const limit = filters?.limit || 50;
    return this.executionModel.find(query).sort({ createdAt: -1 }).limit(limit).exec();
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<WorkflowExecutionDocument> {
    const execution = await this.getExecution(executionId);

    if (['success', 'failed'].includes(execution.status)) {
      throw new BadRequestException('Cannot cancel completed workflow');
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();

    return execution.save();
  }

  /**
   * Get execution stats
   */
  async getExecutionStats(
    workspaceId: string,
    templateId?: string,
  ): Promise<Record<string, any>> {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (templateId) query.workflowTemplateId = new Types.ObjectId(templateId);

    const executions = await this.executionModel.find(query).exec();

    const total = executions.length;
    const successful = executions.filter((e) => e.status === 'success').length;
    const failed = executions.filter((e) => e.status === 'failed').length;
    const partial = executions.filter((e) => e.status === 'partial').length;

    const avgDuration = executions.reduce((sum, e) => sum + (e.durationMs || 0), 0) / (total || 1);
    const lastExecutionDoc = executions[0];
    const lastExecution = lastExecutionDoc ? (lastExecutionDoc as any).createdAt || lastExecutionDoc.startedAt : undefined;

    return {
      total,
      successful,
      failed,
      partial,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
      avgDurationMs: avgDuration,
      lastExecution,
    };
  }
}
