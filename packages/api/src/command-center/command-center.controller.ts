import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TenantGuard } from '../revenue-os/tenant/tenant.guard';
import { CommandCenterService } from './command-center.service';

@Controller('command-center')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CommandCenterController {
  constructor(private readonly commandCenterService: CommandCenterService) {}

  @Get('revenue/today')
  getTodayRevenue(@Req() req: Request) {
    return this.commandCenterService.getTodayRevenue(getTenantId(req));
  }

  @Get('jobs/today')
  getTodayJobs(@Req() req: Request) {
    return this.commandCenterService.getTodayJobs(getTenantId(req));
  }

  @Get('techs/utilization')
  getTechUtilization(@Req() req: Request) {
    return this.commandCenterService.getTechnicianUtilization(getTenantId(req));
  }

  @Get('estimates/open')
  getOpenEstimates(@Req() req: Request) {
    return this.commandCenterService.getOpenEstimates(getTenantId(req));
  }

  @Get('ar/outstanding')
  getOutstandingAR(@Req() req: Request) {
    return this.commandCenterService.getOutstandingAR(getTenantId(req));
  }

  @Get('margins/alerts')
  getMarginAlerts(@Req() req: Request) {
    return this.commandCenterService.getMarginAlerts(getTenantId(req));
  }

  @Get('ai/recommendations')
  getAiRecommendations(@Req() req: Request) {
    return this.commandCenterService.getAiRecommendations(getTenantId(req));
  }

  @Get('schedule/today')
  getTodaySchedule(@Req() req: Request) {
    return this.commandCenterService.getTodaySchedule(getTenantId(req));
  }

  @Get('business/health')
  getBusinessHealth(@Req() req: Request) {
    return this.commandCenterService.getBusinessHealth(getTenantId(req));
  }

  @Get('calls/recent')
  getRecentCalls(@Req() req: Request) {
    return this.commandCenterService.getRecentCalls(getTenantId(req));
  }

  @Get('permissions/engine')
  getPermissionEngine(@Req() req: Request) {
    return this.commandCenterService.getPermissionEngine(getTenantId(req));
  }

  @Get('dashboard')
  getCompleteDashboard(@Req() req: Request) {
    return this.commandCenterService.getCompleteDashboard(getTenantId(req));
  }
}

function getTenantId(req: Request): string {
  const tenantId = req.tenant_id as string;
  if (!tenantId) {
    throw new Error('Missing tenant_id on request');
  }
  return tenantId;
}
