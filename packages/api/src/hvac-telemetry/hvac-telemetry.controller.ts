import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IngestTelemetryDto } from './dto/telemetry.dto';
import { HvacTelemetryService } from './hvac-telemetry.service';

/**
 * WISE² HVAC Pocket Node telemetry boundary.
 *
 * - `POST /v1/hvac/telemetry` ingests a validated PocketNodeTelemetryEnvelope.
 * - `GET  /v1/hvac/telemetry/:nodeId/latest` returns an HvacTelemetrySnapshot
 *   with an explicit connection/freshness state.
 *
 * Tenant context comes from `TenantMiddleware` (JWT claims). This route is
 * read/ingest only; any state-changing HVAC command lives elsewhere behind
 * CommandPreview and explicit confirmation.
 */
@Controller('v1/hvac/telemetry')
@UseGuards(JwtAuthGuard)
export class HvacTelemetryController {
  constructor(private readonly telemetry: HvacTelemetryService) {}

  @Post()
  ingest(@Body() dto: IngestTelemetryDto, @Req() req: Request) {
    return this.telemetry.ingest(dto, req.tenant_id);
  }

  @Get(':nodeId/latest')
  latest(@Param('nodeId') nodeId: string, @Req() req: Request) {
    return this.telemetry.latest(nodeId, req.tenant_id);
  }
}
