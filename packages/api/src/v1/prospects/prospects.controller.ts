import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProspectsService } from './prospects.service';

@Controller('v1/prospects')
export class ProspectsController {
  constructor(private prospectsService: ProspectsService) {}

  /**
   * POST /v1/prospects
   * Create a new prospect from intake form
   */
  @Post()
  async createProspect(
    @Body()
    body: {
      businessName: string;
      contactName: string;
      email: string;
      phone?: string;
      website?: string;
      industry?: string;
      primaryProblem: string;
      leadSource?: string;
      estimatedOpportunity?: number;
      notes?: string;
      tags?: string[];
    },
  ) {
    return this.prospectsService.createProspect(body);
  }

  /**
   * GET /v1/prospects
   * Get all prospects with optional filtering and search
   * Query params: status, search, sortBy, sortOrder, limit, offset
   */
  @Get()
  async getProspects(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.prospectsService.getProspects({
      status,
      search,
      sortBy,
      sortOrder,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  /**
   * GET /v1/prospects/:id
   * Get a specific prospect
   */
  @Get(':id')
  async getProspect(@Param('id') id: string) {
    return this.prospectsService.getProspect(id);
  }

  /**
   * PATCH /v1/prospects/:id
   * Update prospect information
   */
  @Patch(':id')
  async updateProspect(
    @Param('id') id: string,
    @Body()
    body: {
      status?: string;
      notes?: string;
      estimatedOpportunity?: number;
      tags?: string[];
      auditScheduledAt?: Date;
      auditCompletedAt?: Date;
      proposalSentAt?: Date;
      wonAt?: Date;
      lostAt?: Date;
      lostReason?: string;
    },
  ) {
    return this.prospectsService.updateProspect(id, body);
  }

  /**
   * PATCH /v1/prospects/:id/status
   * Change prospect status (with additional data like lost reason)
   */
  @Patch(':id/status')
  async updateProspectStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
      reason?: string; // For LOST status
    },
  ) {
    return this.prospectsService.updateProspectStatus(id, body.status, { reason: body.reason });
  }

  /**
   * DELETE /v1/prospects/:id
   * Archive/delete a prospect
   */
  @Delete(':id')
  async deleteProspect(@Param('id') id: string) {
    return this.prospectsService.deleteProspect(id);
  }

  /**
   * GET /v1/prospects/stats/pipeline
   * Get pipeline statistics by stage and total opportunity value
   */
  @Get('stats/pipeline')
  async getPipelineStats() {
    return this.prospectsService.getPipelineStats();
  }

  /**
   * GET /v1/prospects/stats/lead-source
   * Get prospects grouped by lead source
   */
  @Get('stats/lead-source')
  async getProspectsByLeadSource() {
    return this.prospectsService.getProspectsByLeadSource();
  }
}
