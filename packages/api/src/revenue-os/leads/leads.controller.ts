import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LeadStatus, LeadUrgency } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

/**
 * Guard order is significant: JwtAuthGuard populates request.user, which
 * TenantGuard then resolves into tenant context. Every handler takes the
 * tenant from req.tenant_id — no route param or body field carries a tenant id.
 */
@Controller('revenue-os/leads')
@UseGuards(JwtAuthGuard, TenantGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(
    @Req() req: Request,
    @Query('status') status?: LeadStatus,
    @Query('urgency') urgency?: LeadUrgency,
    @Query('campaignId') campaignId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const tenantId = requireTenantId(req);
    return this.leadsService.findAll(tenantId, {
      status,
      urgency,
      campaignId,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('pipeline')
  pipeline(@Req() req: Request) {
    return this.leadsService.pipelineSummary(requireTenantId(req));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.leadsService.findOne(requireTenantId(req), id);
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateLeadDto) {
    return this.leadsService.create(requireTenantId(req), body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() body: UpdateLeadDto) {
    return this.leadsService.update(requireTenantId(req), id, body);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.leadsService.remove(requireTenantId(req), id);
  }
}

function requireTenantId(req: Request): string {
  const tenantId = req.tenant_id;
  if (!tenantId) {
    throw new Error('Missing tenant_id on request');
  }
  return tenantId;
}
