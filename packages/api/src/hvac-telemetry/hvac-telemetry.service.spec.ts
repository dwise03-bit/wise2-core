import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TELEMETRY_SCHEMA_VERSION } from '@wise2/hvac-contracts';
import { HvacTelemetryService } from './hvac-telemetry.service';

const envelopeAt = (capturedAt: string) => ({
  schemaVersion: TELEMETRY_SCHEMA_VERSION,
  nodeId: 'pn-042',
  capturedAt,
  readings: [
    {
      suctionPressure: { value: 118.4, unit: 'psig' },
      dischargePressure: { value: 300.1, unit: 'psig' },
      superheat: { value: 11.5, unit: 'deltaF' },
    },
  ],
});

describe('HvacTelemetryService', () => {
  let service: HvacTelemetryService;

  beforeEach(() => {
    service = new HvacTelemetryService();
  });

  it('rejects ingestion without tenant context', () => {
    expect(() => service.ingest(envelopeAt(new Date().toISOString()), undefined)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a latest read without tenant context', () => {
    expect(() => service.latest('pn-042', '')).toThrow(UnauthorizedException);
  });

  it('accepts a valid envelope and exposes it as a CONNECTED snapshot', () => {
    const result = service.ingest(envelopeAt(new Date().toISOString()), 'tenant-a');
    expect(result.nodeId).toBe('pn-042');
    expect(result.readings).toBe(1);
    expect(typeof result.receivedAt).toBe('string');

    const snapshot = service.latest('pn-042', 'tenant-a');
    expect(snapshot.connectionState).toBe('CONNECTED');
    expect(snapshot.quality).toBe('ok');
    expect(snapshot.reading?.suctionPressure).toEqual({ value: 118.4, unit: 'psig' });
    expect(snapshot.receivedAt).toBe(result.receivedAt);
  });

  it('rejects malformed readings with a 400 and no coercion', () => {
    const bad = {
      ...envelopeAt(new Date().toISOString()),
      readings: [{ suctionPressure: { value: '118.4', unit: 'psig' } }],
    };
    expect(() => service.ingest(bad, 'tenant-a')).toThrow(BadRequestException);
  });

  it('marks a stale reading as DEGRADED rather than CONNECTED', () => {
    const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    service.ingest(envelopeAt(old), 'tenant-a');

    const snapshot = service.latest('pn-042', 'tenant-a');
    expect(snapshot.connectionState).toBe('DEGRADED');
    expect(snapshot.reason).toContain('old');
  });

  it('isolates telemetry by tenant', () => {
    service.ingest(envelopeAt(new Date().toISOString()), 'tenant-a');

    const otherTenant = service.latest('pn-042', 'tenant-b');
    expect(otherTenant.connectionState).toBe('NO_TELEMETRY');
    expect(otherTenant.reading).toBeNull();
  });

  it('reports NO_TELEMETRY when a node has never reported', () => {
    const snapshot = service.latest('pn-999', 'tenant-a');
    expect(snapshot.connectionState).toBe('NO_TELEMETRY');
  });
});
