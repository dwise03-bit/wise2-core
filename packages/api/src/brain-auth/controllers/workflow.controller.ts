import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { WorkflowService } from '../services/workflow.service';
import { JwtGuard } from '../guards/jwt.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('api/brain/workflows')
@UseGuards(JwtGuard, PermissionGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * Create workflow template
   */
  @Post('templates')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(
    @Request() req,
    @Body()
    body: {
      name: string;
      description?: string;
      triggers: any[];
      actions: any[];
      retryPolicy?: any;
      timeout?: number;
    },
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub;

    if (!body.name || !body.triggers?.length || !body.actions?.length) {
      throw new BadRequestException('name, triggers, and actions are required');
    }

    const template = await this.workflowService.createTemplate(workspaceId, userId, body);

    return {
      success: true,
      template,
    };
  }

  /**
   * List templates
   */
  @Get('templates')
  @RequirePermission('read_documents')
  async listTemplates(
    @Request() req,
    @Query('status') status?: string,
    @Query('enabled') enabled?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    const templates = await this.workflowService.listTemplates(workspaceId, {
      status,
      enabled: enabled === 'true' ? true : enabled === 'false' ? false : undefined,
    });

    return {
      total: templates.length,
      templates,
    };
  }

  /**
   * Get template
   */
  @Get('templates/:templateId')
  @RequirePermission('read_documents')
  async getTemplate(
    @Request() req,
    @Param('templateId') templateId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const template = await this.workflowService.getTemplate(templateId, workspaceId);

    return template;
  }

  /**
   * Update template
   */
  @Put('templates/:templateId')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async updateTemplate(
    @Request() req,
    @Param('templateId') templateId: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      triggers?: any[];
      actions?: any[];
      status?: string;
      retryPolicy?: any;
      timeout?: number;
    },
  ) {
    const workspaceId = req.user.workspaceId;
    const template = await this.workflowService.updateTemplate(templateId, workspaceId, body);

    return {
      success: true,
      template,
    };
  }

  /**
   * Delete template
   */
  @Delete('templates/:templateId')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async deleteTemplate(
    @Request() req,
    @Param('templateId') templateId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    await this.workflowService.deleteTemplate(templateId, workspaceId);

    return {
      success: true,
      message: 'Template archived',
    };
  }

  /**
   * Execute workflow
   */
  @Post('templates/:templateId/execute')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async executeWorkflow(
    @Request() req,
    @Param('templateId') templateId: string,
    @Body()
    body?: {
      triggerData?: Record<string, any>;
      isManualRun?: boolean;
    },
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub;

    const execution = await this.workflowService.executeWorkflow(templateId, workspaceId, {
      triggerData: body?.triggerData,
      initiatedByUserId: userId,
      isManualRun: body?.isManualRun !== false,
    });

    return {
      success: true,
      execution,
    };
  }

  /**
   * Get execution
   */
  @Get('executions/:executionId')
  @RequirePermission('read_documents')
  async getExecution(
    @Request() req,
    @Param('executionId') executionId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const execution = await this.workflowService.getExecution(executionId, workspaceId);

    return execution;
  }

  /**
   * List executions
   */
  @Get('executions')
  @RequirePermission('read_documents')
  async listExecutions(
    @Request() req,
    @Query('templateId') templateId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    const executions = await this.workflowService.listExecutions(workspaceId, {
      templateId,
      status,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    return {
      total: executions.length,
      executions,
    };
  }

  /**
   * Cancel execution
   */
  @Post('executions/:executionId/cancel')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async cancelExecution(
    @Request() req,
    @Param('executionId') executionId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const execution = await this.workflowService.cancelExecution(executionId, workspaceId);

    return {
      success: true,
      execution,
    };
  }

  /**
   * Get execution stats
   */
  @Get('stats')
  @RequirePermission('read_documents')
  async getStats(
    @Request() req,
    @Query('templateId') templateId?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    const stats = await this.workflowService.getExecutionStats(workspaceId, templateId);

    return stats;
  }
}
