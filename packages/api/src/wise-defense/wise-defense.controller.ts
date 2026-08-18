import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { WiseDefenseTenantGuard } from './wise-defense.guard';
import { WiseDefenseService } from './wise-defense.service';

@Controller('wise-defense')
@UseGuards(JwtAuthGuard, WiseDefenseTenantGuard)
export class WiseDefenseController {
  constructor(private readonly service: WiseDefenseService) {}
  @Get('dashboard') dashboard(@Req() req: Request) { return this.service.dashboard(tenant(req)); }
  @Get('incidents') incidents(@Req() req: Request) { return this.service.listIncidents(tenant(req)); }
  @Post('incidents') incident(@Req() req: Request, @Body() body: Record<string, unknown>) { return this.service.createIncident(tenant(req), body); }
  @Get('watch-zones') zones(@Req() req: Request) { return this.service.listWatchZones(tenant(req)); }
  @Post('watch-zones') zone(@Req() req: Request, @Body() body: Record<string, unknown>) { return this.service.createWatchZone(tenant(req), body); }
  @Get('mesh/nodes') nodes(@Req() req: Request) { return this.service.listMeshNodes(tenant(req)); }
  /** Edge gateway endpoint. Production gateway authentication must be added before enabling a remote gateway. */
  @Post('mesh/telemetry') telemetry(@Req() req: Request, @Body() body: Record<string, unknown>) { return this.service.ingestMeshTelemetry(tenant(req), body); }
  @Get('radio/gmrs') gmrs(@Req() req: Request) { return this.service.radio(tenant(req), 'GMRS'); }
  @Get('radio/ham') ham(@Req() req: Request) { return this.service.radio(tenant(req), 'HAM'); }
  @Get('sdr/devices') async sdr(@Req() req: Request) { const [devices] = await this.service.sdr(tenant(req)); return devices; }
  @Get('sdr/signals') async signals(@Req() req: Request) { const [, signals] = await this.service.sdr(tenant(req)); return signals; }
  @Get('alerts') alerts(@Req() req: Request) { return this.service.listAlerts(tenant(req)); }
  @Get('family') family(@Req() req: Request) { return this.service.family(tenant(req)); }
  @Get('resiliency') resiliency(@Req() req: Request) { return this.service.resiliencyForTenant(tenant(req)); }
  @Post('leads/:type') @HttpCode(201) lead(@Req() req: Request, @Param('type') type: string) { return this.service.createLeadEvent(tenant(req), type); }
}
function tenant(req: Request): string { if (!req.tenant_id) throw new Error('Tenant context missing'); return req.tenant_id; }
