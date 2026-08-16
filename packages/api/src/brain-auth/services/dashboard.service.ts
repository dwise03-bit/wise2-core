import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DashboardMetric, DashboardMetricDocument } from '../schemas/dashboard-metric.schema';
import { AICommand, AICommandDocument } from '../schemas/ai-command.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(DashboardMetric.name) private readonly metricModel: Model<DashboardMetricDocument>,
    @InjectModel(AICommand.name) private readonly aiCommandModel: Model<AICommandDocument>,
  ) {}

  /**
   * Record a new metric
   */
  async recordMetric(
    workspaceId: string,
    metricType: string,
    value: number,
    data?: {
      unit?: string;
      breakdown?: { current?: number; target?: number; limit?: number };
      metadata?: Record<string, any>;
      period?: string;
      relatedEntityId?: string;
    },
  ): Promise<DashboardMetricDocument> {
    // Get previous value for trend calculation
    const previousMetric = await this.metricModel
      .findOne({
        workspaceId: new Types.ObjectId(workspaceId),
        metricType,
      })
      .sort({ recordedAt: -1 })
      .exec();

    const previousValue = previousMetric?.value;
    let trend: 'up' | 'down' | 'stable' | undefined;
    let trendPercentage: number | undefined;

    if (previousValue !== undefined) {
      const diff = value - previousValue;
      if (diff > 0) trend = 'up';
      else if (diff < 0) trend = 'down';
      else trend = 'stable';
      trendPercentage = previousValue !== 0 ? (diff / previousValue) * 100 : 0;
    }

    const metric = await this.metricModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      metricType,
      value,
      previousValue,
      trend,
      trendPercentage,
      unit: data?.unit,
      breakdown: data?.breakdown,
      metadata: data?.metadata || {},
      period: data?.period || 'daily',
      relatedEntityId: data?.relatedEntityId ? new Types.ObjectId(data.relatedEntityId) : undefined,
      recordedAt: new Date(),
      status: 'active',
    });

    return metric;
  }

  /**
   * Get current KPI values
   */
  async getKPIs(workspaceId: string): Promise<Record<string, any>> {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    // Get latest metrics
    const [revenue, aiUsage, automationHealth, documentCount, userActivity, storage] =
      await Promise.all([
        this.getLatestMetric(workspaceId, 'revenue'),
        this.getLatestMetric(workspaceId, 'ai_usage'),
        this.getLatestMetric(workspaceId, 'automation_health'),
        this.getLatestMetric(workspaceId, 'document_count'),
        this.getLatestMetric(workspaceId, 'user_activity'),
        this.getLatestMetric(workspaceId, 'storage'),
      ]);

    return {
      revenue: this.formatMetric(revenue),
      aiUsage: this.formatMetric(aiUsage),
      automationHealth: this.formatMetric(automationHealth),
      documentCount: this.formatMetric(documentCount),
      userActivity: this.formatMetric(userActivity),
      storage: this.formatMetric(storage),
    };
  }

  /**
   * Get metric history for charting
   */
  async getMetricHistory(
    workspaceId: string,
    metricType: string,
    days: number = 30,
  ): Promise<DashboardMetricDocument[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.metricModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        metricType,
        recordedAt: { $gte: startDate },
      })
      .sort({ recordedAt: 1 })
      .exec();
  }

  /**
   * Record AI operation
   */
  async recordAIOperation(
    workspaceId: string,
    userId: string,
    operationType: string,
    data?: {
      description?: string;
      prompt?: string;
      model?: string;
      metadata?: Record<string, any>;
      relatedDocumentId?: string;
      relatedCustomerId?: string;
      relatedWorkflowId?: string;
    },
  ): Promise<AICommandDocument> {
    const command = await this.aiCommandModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(userId),
      operationType,
      description: data?.description,
      prompt: data?.prompt,
      model: data?.model || 'claude-3-sonnet',
      metadata: data?.metadata || {},
      relatedDocumentId: data?.relatedDocumentId
        ? new Types.ObjectId(data.relatedDocumentId)
        : undefined,
      relatedCustomerId: data?.relatedCustomerId
        ? new Types.ObjectId(data.relatedCustomerId)
        : undefined,
      relatedWorkflowId: data?.relatedWorkflowId
        ? new Types.ObjectId(data.relatedWorkflowId)
        : undefined,
      status: 'pending',
      startedAt: new Date(),
      visibility: 'active',
    });

    return command;
  }

  /**
   * Update AI operation status
   */
  async updateAIOperation(
    commandId: string,
    data: {
      status?: string;
      result?: string;
      error?: string;
      inputTokens?: number;
      outputTokens?: number;
      costUSD?: number;
    },
  ): Promise<AICommandDocument | null> {
    const completedAt = data.status === 'success' || data.status === 'failed' ? new Date() : undefined;

    let durationMs: number | undefined;
    if (completedAt) {
      const command = await this.aiCommandModel.findById(commandId);
      const startTime = command?.startedAt?.getTime() || 0;
      durationMs = startTime > 0 ? completedAt.getTime() - startTime : undefined;
    }

    return this.aiCommandModel.findByIdAndUpdate(
      commandId,
      {
        status: data.status,
        result: data.result,
        error: data.error,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        costUSD: data.costUSD,
        durationMs,
        completedAt,
      },
      { new: true },
    );
  }

  /**
   * Get AI Command Center - recent operations
   */
  async getCommandCenter(workspaceId: string, limit: number = 20) {
    const [pending, running, recent, stats] = await Promise.all([
      this.aiCommandModel
        .find({
          workspaceId: new Types.ObjectId(workspaceId),
          status: 'pending',
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      this.aiCommandModel
        .find({
          workspaceId: new Types.ObjectId(workspaceId),
          status: 'running',
        })
        .sort({ startedAt: -1 })
        .limit(5)
        .exec(),
      this.aiCommandModel
        .find({
          workspaceId: new Types.ObjectId(workspaceId),
          visibility: 'active',
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
      this.getAIStats(workspaceId),
    ]);

    return {
      pending,
      running,
      recent,
      stats,
    };
  }

  /**
   * Get AI statistics
   */
  async getAIStats(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const [totalOps, successRate, totalCost, byType] = await Promise.all([
      this.aiCommandModel.countDocuments({
        workspaceId: workspaceObjectId,
        visibility: 'active',
      }),
      this.aiCommandModel.aggregate([
        { $match: { workspaceId: workspaceObjectId, visibility: 'active' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successful: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
            },
          },
        },
      ]),
      this.aiCommandModel.aggregate([
        { $match: { workspaceId: workspaceObjectId, visibility: 'active' } },
        { $group: { _id: null, totalCost: { $sum: '$costUSD' } } },
      ]),
      this.aiCommandModel.aggregate([
        { $match: { workspaceId: workspaceObjectId, visibility: 'active' } },
        { $group: { _id: '$operationType', count: { $sum: 1 } } },
      ]),
    ]);

    const successRateData = successRate[0];
    const costData = totalCost[0];

    return {
      totalOperations: totalOps,
      successRate: successRateData
        ? Math.round((successRateData.successful / successRateData.total) * 100)
        : 0,
      totalCostUSD: costData?.totalCost || 0,
      byOperationType: byType.reduce(
        (acc: Record<string, number>, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        },
        {},
      ),
    };
  }

  /**
   * Health check for all Brain components
   */
  async getComponentHealth(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const [aiHealth, automationHealth, documentHealth, graphHealth] = await Promise.all([
      this.aiCommandModel.countDocuments({
        workspaceId: workspaceObjectId,
        status: 'failed',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      this.getLatestMetric(workspaceId, 'automation_health'),
      this.metricModel.countDocuments({
        workspaceId: workspaceObjectId,
        metricType: 'document_count',
      }),
      this.recordMetric(workspaceId, 'graph_health', 0), // Placeholder
    ]);

    const totalOps = await this.aiCommandModel.countDocuments({
      workspaceId: workspaceObjectId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    return {
      ai: {
        status: aiHealth === 0 ? 'healthy' : 'degraded',
        failedOperations24h: aiHealth,
        totalOperations24h: totalOps,
      },
      automation: {
        status: automationHealth ? 'healthy' : 'degraded',
        value: automationHealth?.value || 0,
      },
      documents: {
        status: documentHealth > 0 ? 'healthy' : 'degraded',
        count: documentHealth,
      },
      graph: {
        status: 'healthy', // TODO: Add real health check
        message: 'Knowledge graph operational',
      },
    };
  }

  // Private helpers

  private async getLatestMetric(workspaceId: string, metricType: string) {
    return this.metricModel
      .findOne({
        workspaceId: new Types.ObjectId(workspaceId),
        metricType,
      })
      .sort({ recordedAt: -1 })
      .exec();
  }

  private formatMetric(metric: DashboardMetricDocument | null) {
    if (!metric) {
      return null;
    }

    return {
      value: metric.value,
      unit: metric.unit,
      trend: metric.trend,
      trendPercentage: metric.trendPercentage,
      breakdown: metric.breakdown,
      recordedAt: metric.recordedAt,
    };
  }
}
