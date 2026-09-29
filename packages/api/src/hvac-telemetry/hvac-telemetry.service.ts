import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  buildTelemetrySnapshot,
  parsePocketNodeTelemetry,
  TelemetryParseError,
  type HvacTelemetrySnapshot,
  type PocketNodeTelemetryEnvelope,
} from '@wise2/hvac-contracts';

interface StoredTelemetry {
  envelope: PocketNodeTelemetryEnvelope;
  receivedAt: string;
}

export interface IngestResult {
  nodeId: string;
  receivedAt: string;
  readings: number;
}

/**
 * Trust boundary for Pocket Node HVAC telemetry. The Pocket Node submits an
 * envelope; the server validates identity (tenant context), schema, units, and
 * ranges, then exposes a freshness-aware read-only snapshot to the XR client.
 *
 * Storage is an in-memory latest-per-node cache. The XR read path only needs the
 * most recent reading; durable persistence and history are a follow-up documented
 * in `docs/WISE2-HVAC-XR-TELEMETRY.md`. No parallel HVAC job model is introduced.
 */
@Injectable()
export class HvacTelemetryService {
  private readonly logger = new Logger(HvacTelemetryService.name);
  private readonly latestByKey = new Map<string, StoredTelemetry>();

  private key(tenantId: string, nodeId: string): string {
    return `${tenantId}::${nodeId}`;
  }

  ingest(input: unknown, tenantId: string | undefined): IngestResult {
    if (!tenantId) {
      throw new UnauthorizedException('TENANT_CONTEXT_REQUIRED');
    }

    let envelope: PocketNodeTelemetryEnvelope;
    try {
      envelope = parsePocketNodeTelemetry(input);
    } catch (error) {
      if (error instanceof TelemetryParseError) {
        // Stable, safe reason. No raw payload echoed back.
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const receivedAt = new Date().toISOString();
    this.latestByKey.set(this.key(tenantId, envelope.nodeId), { envelope, receivedAt });
    this.logger.log(
      `telemetry ingested node=${envelope.nodeId} tenant=${tenantId} readings=${envelope.readings.length}`,
    );

    return { nodeId: envelope.nodeId, receivedAt, readings: envelope.readings.length };
  }

  latest(nodeId: string, tenantId: string | undefined): HvacTelemetrySnapshot {
    if (!tenantId) {
      throw new UnauthorizedException('TENANT_CONTEXT_REQUIRED');
    }

    const stored = this.latestByKey.get(this.key(tenantId, nodeId));
    return buildTelemetrySnapshot({
      nodeId,
      envelope: stored?.envelope ?? null,
      receivedAt: stored?.receivedAt ?? null,
    });
  }
}
