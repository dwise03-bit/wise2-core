import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkflowTemplate, WorkflowTemplateDocument } from '../schemas/workflow-template.schema';
import { WorkflowExecution, WorkflowExecutionDocument, ActionExecution } from '../schemas/workflow-execution.schema';
import { ActionHandlerService } from './action-handler.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectModel(WorkflowTemplate.name) private readonly templateModel: Model<WorkflowTemplateDocument>,
    @InjectModel(WorkflowExecution.name) private readonly executionModel: Model<WorkflowExecutionDocument>,
    private readonly actionHandlerService: ActionHandlerService,
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
   * Get template by ID with workspace validation
   */
  async getTemplate(templateId: string, workspaceId: string): Promise<WorkflowTemplateDocument> {
    const template = await this.templateModel.findOne({
      _id: new Types.ObjectId(templateId),
      workspaceId: new Types.ObjectId(workspaceId),
    });
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
    workspaceId: string,
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
    const template = await this.getTemplate(templateId, workspaceId);

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
  async deleteTemplate(templateId: string, workspaceId: string): Promise<void> {
    const result = await this.templateModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(templateId),
        workspaceId: new Types.ObjectId(workspaceId),
      },
      { status: 'archived' },
    );
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
    const template = await this.getTemplate(templateId, workspaceId);

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

    // Execute asynchronously with proper error handling
    this.executeWorkflowAsync(execution._id.toString(), template).catch(async (err) => {
      try {
        this.logger.error(
          `Workflow execution failed: ${err.message}`,
          err instanceof Error ? err.stack : String(err),
          {
            executionId: execution._id.toString(),
            templateId: template._id.toString(),
            workspaceId: template.workspaceId.toString(),
          },
        );

        await this.executionModel.findByIdAndUpdate(execution._id, {
          status: 'failed',
          error: {
            message: err instanceof Error ? err.message : String(err),
            code: 'EXECUTION_ERROR',
            details: err instanceof Error ? { stack: err.stack } : undefined,
          },
          completedAt: new Date(),
          durationMs: Date.now() - execution.startedAt.getTime(),
        });
      } catch (saveError) {
        this.logger.error(
          'Failed to update execution with error state',
          saveError instanceof Error ? saveError.stack : String(saveError),
        );
      }
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
   * Execute single action using handler registry (public for testability)
   */
  async executeAction(
    action: any,
    triggerData: Record<string, any>,
    previousResults: Map<string, any>,
  ): Promise<Record<string, any>> {
    const context = {
      triggerData,
      results: Object.fromEntries(previousResults),
      variables: {},
    };

    const handler = this.actionHandlerService.getHandler(action.type);
    return handler.execute(action.config, context);
  }

  /**
   * Get execution with workspace validation
   */
  async getExecution(executionId: string, workspaceId: string): Promise<WorkflowExecutionDocument> {
    const execution = await this.executionModel.findOne({
      _id: new Types.ObjectId(executionId),
      workspaceId: new Types.ObjectId(workspaceId),
    });
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
  async cancelExecution(executionId: string, workspaceId: string): Promise<WorkflowExecutionDocument> {
    const execution = await this.getExecution(executionId, workspaceId);

    if (['success', 'failed'].includes(execution.status)) {
      throw new BadRequestException('Cannot cancel completed workflow');
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();

    return execution.save();
  }

  /**
   * Get execution stats using MongoDB aggregation (optimized for large datasets)
   */
  async getExecutionStats(
    workspaceId: string,
    templateId?: string,
  ): Promise<Record<string, any>> {
    const pipeline: any[] = [
      {
        $match: {
          workspaceId: new Types.ObjectId(workspaceId),
          ...(templateId && { workflowTemplateId: new Types.ObjectId(templateId) }),
        },
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                successful: {
                  $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
                },
                failed: {
                  $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
                },
                partial: {
                  $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] },
                },
                avgDurationMs: {
                  $avg: { $ifNull: ['$durationMs', 0] },
                },
              },
            },
          ],
          lastExecution: [
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { createdAt: 1, startedAt: 1 } },
          ],
        },
      },
    ];

    const result = await this.executionModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        partial: 0,
        successRate: 0,
        failureRate: 0,
        avgDurationMs: 0,
        lastExecution: undefined,
      };
    }

    const { stats, lastExecution } = result[0];
    const statsData = stats[0] || {};
    const total = statsData.total || 0;

    return {
      total,
      successful: statsData.successful || 0,
      failed: statsData.failed || 0,
      partial: statsData.partial || 0,
      successRate: total > 0 ? ((statsData.successful || 0) / total) * 100 : 0,
      failureRate: total > 0 ? ((statsData.failed || 0) / total) * 100 : 0,
      avgDurationMs: statsData.avgDurationMs || 0,
      lastExecution: lastExecution[0]?.createdAt || lastExecution[0]?.startedAt,
    };
  }
}
