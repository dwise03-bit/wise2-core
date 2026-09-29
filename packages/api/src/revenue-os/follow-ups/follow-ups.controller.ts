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
import { FollowUpStatus, FollowUpType } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/follow-up.dto';

@Controller('revenue-os/follow-ups')
@UseGuards(JwtAuthGuard, TenantGuard)
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get()
  findAll(
    @Req() req: Request,
    @Query('status') status?: FollowUpStatus,
    @Query('assignedTo') assignedTo?: string,
    @Query('relatedEntityType') relatedEntityType?: string,
    @Query('relatedEntityId') relatedEntityId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const tenantId = requireTenantId(req);
    return this.followUpsService.findAll(tenantId, {
      status,
      assignedTo,
      relatedEntityType,
      relatedEntityId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('pending-count')
  getPendingCount(@Req() req: Request) {
    return this.followUpsService.getPendingFollowUps(requireTenantId(req));
  }

  @Get('overdue-count')
  getOverdueCount(@Req() req: Request) {
    return this.followUpsService.getOverdueFollowUps(requireTenantId(req));
  }

  @Get('entity/:entityType/:entityId')
  getByEntity(
    @Req() req: Request,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.followUpsService.getFollowUpsByEntity(requireTenantId(req), entityType, entityId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.followUpsService.findOne(requireTenantId(req), id);
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateFollowUpDto) {
    return this.followUpsService.create(requireTenantId(req), body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() body: UpdateFollowUpDto) {
    return this.followUpsService.update(requireTenantId(req), id, body);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.followUpsService.remove(requireTenantId(req), id);
  }
}

function requireTenantId(req: Request): string {
  const tenantId = req.tenant_id;
  if (!tenantId) {
    throw new Error('Missing tenant_id on request');
  }
  return tenantId;
}
