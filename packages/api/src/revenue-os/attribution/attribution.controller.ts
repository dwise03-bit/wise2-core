import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { AttributionService } from './attribution.service';
import { AttributionFilter } from './attribution.types';

/**
 * Guard order is significant: JwtAuthGuard populates request.user, which
 * TenantGuard then resolves into tenant context. Every handler takes the
 * tenant from req.tenant_id — no route param, query string or body field carries
 * a tenant id, and `:campaignId` below is resolved against the session
 * tenant inside the service.
 */
@Controller('revenue-os/attribution')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AttributionController {
  constructor(private readonly attributionService: AttributionService) {}

  @Get()
  summary(
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attributionService.summary(requireTenantId(req), parseRange(from, to));
  }

  @Get('funnel')
  funnel(
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attributionService.funnel(requireTenantId(req), parseRange(from, to));
  }

  @Get('campaigns/:campaignId')
  forCampaign(
    @Req() req: Request,
    @Param('campaignId') campaignId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attributionService.forCampaign(
      requireTenantId(req),
      campaignId,
      parseRange(from, to),
    );
  }
}

/**
 * Rejects unparseable dates instead of passing `Invalid Date` into a Prisma
 * where clause, which would silently return nothing and read as "no data".
 */
function parseRange(from?: string, to?: string): AttributionFilter {
  return {
    ...(from ? { from: parseDate(from, 'from') } : {}),
    ...(to ? { to: parseDate(to, 'to') } : {}),
  };
}

function parseDate(value: string, field: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`Invalid \`${field}\` date`);
  }
  return parsed;
}

function requireTenantId(req: Request): string {
  const tenantId = req.tenant_id;
  if (!tenantId) {
    throw new Error('Missing tenant_id on request');
  }
  return tenantId;
}
