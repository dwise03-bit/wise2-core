import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { DashboardStatsService } from './dashboard-stats.service';

@Controller('revenue-os/dashboard')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DashboardStatsController {
  constructor(private readonly dashboardStatsService: DashboardStatsService) {}

  @Get('kpis')
  getExecutiveKpis(@Req() req: Request) {
    return this.dashboardStatsService.getExecutiveKpis(requireTenantId(req));
  }

  @Get('pipeline')
  getPipelineMetrics(@Req() req: Request) {
    return this.dashboardStatsService.getPipelineMetrics(requireTenantId(req));
  }

  @Get('dispatch')
  getDispatchMetrics(@Req() req: Request) {
    return this.dashboardStatsService.getDispatchMetrics(requireTenantId(req));
  }

  @Get('alerts')
  getAlertsPanel(@Req() req: Request) {
    return this.dashboardStatsService.getAlertsPanel(requireTenantId(req));
  }

  @Get('recent-activity')
  getRecentActivity(@Req() req: Request, @Query('limit') limit?: string) {
    return this.dashboardStatsService.getRecentActivity(requireTenantId(req), limit ? parseInt(limit, 10) : 10);
  }
}

function requireTenantId(req: Request): string {
  const tenantId = req.tenant_id;
  if (!tenantId) {
    throw new Error('Missing tenant_id on request');
  }
  return tenantId;
}
