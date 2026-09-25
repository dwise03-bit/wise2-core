import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  BadRequestException,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { ClaudeDesignHandoffService } from '../integrations/claude-design-handoff.service';

@Controller('api/design-briefs')
export class DesignBriefsController {
  constructor(private readonly designHandoffService: ClaudeDesignHandoffService) {}

  /**
   * POST /api/design-briefs
   * Submit a new design brief from ChatGPT plugin
   */
  @Post()
  async createDesignBrief(
    @Body()
    body: {
      userId: string;
      title: string;
      description: string;
      designType?: string;
      referenceImages?: string[];
      designAssets?: string[];
      brandGuide?: string;
      briefJson?: any;
      submittedBy?: string;
    },
    @Headers('x-design-handoff') source?: string,
  ) {
    if (!body.userId || !body.title || !body.description) {
      throw new BadRequestException('userId, title, and description are required');
    }

    const brief = await this.designHandoffService.submitDesignBrief({
      userId: body.userId,
      title: body.title,
      description: body.description,
      designType: (body.designType || 'OTHER') as any,
      referenceImages: body.referenceImages,
      designAssets: body.designAssets,
      brandGuide: body.brandGuide,
      briefJson: body.briefJson,
      submittedBy: body.submittedBy || source || 'chatgpt-plugin',
    });

    return {
      success: true,
      brief,
      message: 'Design brief submitted successfully',
    };
  }

  /**
   * GET /api/design-briefs
   * List design briefs for a user
   */
  @Get()
  async listDesignBriefs(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('designType') designType?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }

    const briefs = await this.designHandoffService.listDesignBriefs(userId, status, designType);

    return {
      success: true,
      briefs,
      count: briefs.length,
    };
  }

  /**
   * GET /api/design-briefs/pending
   * Get all pending design briefs awaiting Claude work
   */
  @Get('pending')
  async getPendingBriefs() {
    const briefs = await this.designHandoffService.getPendingBriefs();

    return {
      success: true,
      briefs,
      count: briefs.length,
    };
  }

  /**
   * GET /api/design-briefs/stats
   * Get design brief statistics
   */
  @Get('stats')
  async getBriefStats() {
    const stats = await this.designHandoffService.getBriefStats();

    return {
      success: true,
      stats,
    };
  }

  /**
   * GET /api/design-briefs/:briefId
   * Get a specific design brief
   */
  @Get(':briefId')
  async getDesignBrief(
    @Param('briefId') briefId: string,
    @Query('userId') userId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }

    const brief = await this.designHandoffService.getDesignBrief(briefId, userId);

    return {
      success: true,
      brief,
    };
  }

  /**
   * PATCH /api/design-briefs/:briefId
   * Update a design brief (Claude updates status and notes)
   */
  @Patch(':briefId')
  async updateDesignBrief(
    @Param('briefId') briefId: string,
    @Body()
    body: {
      status?: string;
      claudeNotes?: string;
      claudeStatus?: string;
      claudeUrl?: string;
      feedback?: string;
    },
    @Headers('x-design-handoff') source?: string,
  ) {
    if (!source) {
      throw new UnauthorizedException('x-design-handoff header is required for updates');
    }

    const brief = await this.designHandoffService.updateDesignBrief(briefId, {
      status: body.status,
      claudeNotes: body.claudeNotes,
      claudeStatus: body.claudeStatus,
      claudeUrl: body.claudeUrl,
      feedback: body.feedback,
    });

    return {
      success: true,
      brief,
      message: 'Design brief updated successfully',
    };
  }

  /**
   * PATCH /api/design-briefs/:briefId/status
   * Quick status update endpoint
   */
  @Patch(':briefId/status')
  async updateStatus(
    @Param('briefId') briefId: string,
    @Body() body: { status: string; claudeUrl?: string; notes?: string },
  ) {
    const update: any = { status: body.status };
    if (body.claudeUrl) update.claudeUrl = body.claudeUrl;
    if (body.notes) update.claudeNotes = body.notes;

    const brief = await this.designHandoffService.updateDesignBrief(briefId, update);

    return {
      success: true,
      brief,
    };
  }
}
