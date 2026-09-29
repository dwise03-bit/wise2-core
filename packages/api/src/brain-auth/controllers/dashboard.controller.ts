import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { JwtGuard } from '../guards/jwt.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('api/brain/dashboard')
@UseGuards(JwtGuard, PermissionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get executive dashboard KPIs
   */
  @Get('kpis')
  @RequirePermission('read_documents')
  async getKPIs(@Request() req) {
    const workspaceId = req.user.workspaceId;

    const kpis = await this.dashboardService.getKPIs(workspaceId);

    return {
      workspace: workspaceId,
      kpis,
      generatedAt: new Date(),
    };
  }

  /**
   * Get metric history for charting
   */
  @Get('metrics/:metricType')
  @RequirePermission('read_documents')
  async getMetricHistory(
    @Request() req,
    @Query('metricType') metricType?: string,
    @Query('days') days?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    if (!metricType) {
      throw new BadRequestException('metricType query parameter required');
    }

    const history = await this.dashboardService.getMetricHistory(
      workspaceId,
      metricType,
      days ? parseInt(days, 10) : 30,
    );

    return {
      metricType,
      period: `${days || 30} days`,
      dataPoints: history.length,
      data: history,
    };
  }

  /**
   * Record a metric (for internal use / scheduled jobs)
   */
  @Post('metrics')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async recordMetric(
    @Request() req,
    @Body()
    body: {
      metricType: string;
      value: number;
      unit?: string;
      breakdown?: { current?: number; target?: number; limit?: number };
      metadata?: Record<string, any>;
    },
  ) {
    const workspaceId = req.user.workspaceId;

    if (!body.metricType || body.value === undefined) {
      throw new BadRequestException('metricType and value are required');
    }

    const metric = await this.dashboardService.recordMetric(
      workspaceId,
      body.metricType,
      body.value,
      {
        unit: body.unit,
        breakdown: body.breakdown,
        metadata: body.metadata,
      },
    );

    return {
      success: true,
      metric,
    };
  }

  /**
   * AI Command Center - overview of all AI operations
   */
  @Get('ai/command-center')
  @RequirePermission('read_documents')
  async getCommandCenter(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    const center = await this.dashboardService.getCommandCenter(
      workspaceId,
      limit ? parseInt(limit, 10) : 20,
    );

    return {
      workspace: workspaceId,
      ...center,
    };
  }

  /**
   * AI statistics
   */
  @Get('ai/stats')
  @RequirePermission('read_documents')
  async getAIStats(@Request() req) {
    const workspaceId = req.user.workspaceId;

    const stats = await this.dashboardService.getAIStats(workspaceId);

    return {
      workspace: workspaceId,
      ...stats,
    };
  }

  /**
   * Record new AI operation
   */
  @Post('ai/operations')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async recordAIOperation(
    @Request() req,
    @Body()
    body: {
      operationType: string;
      description?: string;
      prompt?: string;
      model?: string;
      metadata?: Record<string, any>;
      relatedDocumentId?: string;
      relatedCustomerId?: string;
      relatedWorkflowId?: string;
    },
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub;

    if (!body.operationType) {
      throw new BadRequestException('operationType is required');
    }

    const command = await this.dashboardService.recordAIOperation(
      workspaceId,
      userId,
      body.operationType,
      {
        description: body.description,
        prompt: body.prompt,
        model: body.model,
        metadata: body.metadata,
        relatedDocumentId: body.relatedDocumentId,
        relatedCustomerId: body.relatedCustomerId,
        relatedWorkflowId: body.relatedWorkflowId,
      },
    );

    return {
      success: true,
      commandId: command._id,
      status: 'pending',
    };
  }

  /**
   * Update AI operation (mark as complete, failed, etc.)
   */
  @Post('ai/operations/:commandId/update')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async updateAIOperation(
    @Request() req,
    @Query('commandId') commandId?: string,
    @Body()
    body?: {
      status?: string;
      result?: string;
      error?: string;
      inputTokens?: number;
      outputTokens?: number;
      costUSD?: number;
    },
  ) {
    if (!commandId) {
      throw new BadRequestException('commandId is required');
    }

    const command = await this.dashboardService.updateAIOperation(commandId, body || {});

    return {
      success: true,
      command,
    };
  }

  /**
   * Brain component health status
   */
  @Get('health')
  @RequirePermission('read_documents')
  async getComponentHealth(@Request() req) {
    const workspaceId = req.user.workspaceId;

    const health = await this.dashboardService.getComponentHealth(workspaceId);

    return {
      workspace: workspaceId,
      timestamp: new Date(),
      components: health,
      overallStatus: this.getOverallStatus(health),
    };
  }

  // Private helper

  private getOverallStatus(health: any): string {
    const statuses = [health.ai.status, health.automation.status, health.documents.status, health.graph.status];

    if (statuses.every((s) => s === 'healthy')) return 'healthy';
    if (statuses.some((s) => s === 'critical')) return 'critical';
    return 'degraded';
  }
}
