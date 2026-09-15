import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Get, Logger } from '@nestjs/common';
import { ToolsService } from './tools.service';

interface ExecuteToolRequest {
  tool: string;
  args: Record<string, any>;
}

@Controller('tools')
export class ToolsController {
  private readonly logger = new Logger('ToolsController');

  constructor(private toolsService: ToolsService) {}

  @Get('available')
  @HttpCode(HttpStatus.OK)
  getAvailableTools() {
    return {
      tools: this.toolsService.getAvailableTools(),
    };
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async executeTool(
    @Body() req: ExecuteToolRequest,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId?: string
  ) {
    this.logger.log(`Tool execution requested: ${req.tool}`);

    if (!tenantId) {
      return {
        success: false,
        error: 'x-tenant-id header required',
      };
    }

    const result = await this.toolsService.executeTool({
      name: req.tool,
      args: req.args,
      tenantId,
      userId,
    });

    return result;
  }

  /**
   * Batch tool execution for optimizing multiple operations
   */
  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async batchExecuteTools(
    @Body() requests: ExecuteToolRequest[],
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId?: string
  ) {
    if (!tenantId) {
      return {
        success: false,
        error: 'x-tenant-id header required',
      };
    }

    const results = await Promise.all(
      requests.map(req =>
        this.toolsService.executeTool({
          name: req.tool,
          args: req.args,
          tenantId,
          userId,
        })
      )
    );

    return {
      batch_results: results,
      success_count: results.filter(r => r.success).length,
      failure_count: results.filter(r => !r.success).length,
    };
  }
}
