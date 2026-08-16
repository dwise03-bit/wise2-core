import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadStatus, LeadUrgency } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { Tenant } from '../tenant/tenant.decorator';
import { TenantContext } from '../tenant/tenant-context';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

/**
 * Guard order is significant: JwtAuthGuard populates request.user, which
 * TenantGuard then resolves into tenant context. Every handler takes the
 * tenant from @Tenant() — no route param or body field carries a tenant id.
 */
@Controller('revenue-os/leads')
@UseGuards(JwtAuthGuard, TenantGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(
    @Tenant() tenant: TenantContext,
    @Query('status') status?: LeadStatus,
    @Query('urgency') urgency?: LeadUrgency,
    @Query('campaignId') campaignId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.leadsService.findAll(tenant.tenantId, {
      status,
      urgency,
      campaignId,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('pipeline')
  pipeline(@Tenant() tenant: TenantContext) {
    return this.leadsService.pipelineSummary(tenant.tenantId);
  }

  @Get(':id')
  findOne(@Tenant() tenant: TenantContext, @Param('id') id: string) {
    return this.leadsService.findOne(tenant.tenantId, id);
  }

  @Post()
  create(@Tenant() tenant: TenantContext, @Body() body: CreateLeadDto) {
    return this.leadsService.create(tenant.tenantId, body);
  }

  @Patch(':id')
  update(
    @Tenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() body: UpdateLeadDto,
  ) {
    return this.leadsService.update(tenant.tenantId, id, body);
  }

  @Delete(':id')
  remove(@Tenant() tenant: TenantContext, @Param('id') id: string) {
    return this.leadsService.remove(tenant.tenantId, id);
  }
}
