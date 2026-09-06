import { describe, expect, it } from 'vitest';
import {
  buildTelemetrySnapshot,
  parsePocketNodeTelemetry,
  TelemetryParseError,
  TELEMETRY_SCHEMA_VERSION,
} from './telemetry';

const validEnvelope = () => ({
  schemaVersion: TELEMETRY_SCHEMA_VERSION,
  nodeId: 'pn-001',
  capturedAt: '2026-09-06T15:00:00.000Z',
  readings: [
    {
      suctionPressure: { value: 118.4, unit: 'psig' },
      dischargePressure: { value: 300.1, unit: 'psig' },
      superheat: { value: 12, unit: 'deltaF' },
    },
  ],
});

describe('parsePocketNodeTelemetry', () => {
  it('preserves units and timestamps for a valid envelope', () => {
    const parsed = parsePocketNodeTelemetry(validEnvelope());
    expect(parsed.nodeId).toBe('pn-001');
    expect(parsed.capturedAt).toBe('2026-09-06T15:00:00.000Z');
    expect(parsed.readings[0].suctionPressure).toEqual({ value: 118.4, unit: 'psig' });
    expect(parsed.readings[0].superheat?.unit).toBe('deltaF');
  });

  it('permits readings with no optional measurements', () => {
    const parsed = parsePocketNodeTelemetry({ ...validEnvelope(), readings: [{}] });
    expect(parsed.readings).toEqual([{}]);
  });

  it('rejects a missing nodeId with a stable code', () => {
    const input: Record<string, unknown> = validEnvelope();
    delete input.nodeId;
    expect(() => parsePocketNodeTelemetry(input)).toThrow(TelemetryParseError);
    try {
      parsePocketNodeTelemetry(input);
    } catch (error) {
      expect((error as TelemetryParseError).code).toBe('NODE_ID_MISSING');
    }
  });

  it('rejects a missing capturedAt', () => {
    const input: Record<string, unknown> = validEnvelope();
    delete input.capturedAt;
    expect(() => parsePocketNodeTelemetry(input)).toThrow('CAPTURED_AT_MISSING');
  });

  it('rejects an unparseable capturedAt', () => {
    expect(() =>
      parsePocketNodeTelemetry({ ...validEnvelope(), capturedAt: 'not-a-date' }),
    ).toThrow('CAPTURED_AT_INVALID');
  });

  it('rejects non-finite numeric measurement values', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        parsePocketNodeTelemetry({
          ...validEnvelope(),
          readings: [{ suctionPressure: { value: bad, unit: 'psig' } }],
        }),
      ).toThrow('MEASUREMENT_INVALID');
    }
  });

  it('does not coerce a string measurement value into a number', () => {
    expect(() =>
      parsePocketNodeTelemetry({
        ...validEnvelope(),
        readings: [{ suctionPressure: { value: '118.4', unit: 'psig' } }],
      }),
    ).toThrow('MEASUREMENT_INVALID');
  });

  it('rejects a measurement missing its unit', () => {
    expect(() =>
      parsePocketNodeTelemetry({
        ...validEnvelope(),
        readings: [{ suctionPressure: { value: 118.4 } }],
      }),
    ).toThrow('MEASUREMENT_INVALID');
  });

  it('rejects non-object input and non-array readings', () => {
    expect(() => parsePocketNodeTelemetry(null)).toThrow('INPUT_NOT_OBJECT');
    expect(() => parsePocketNodeTelemetry({ ...validEnvelope(), readings: {} })).toThrow(
      'READINGS_INVALID',
    );
  });

  it('ignores unknown forward-compatible fields', () => {
    const parsed = parsePocketNodeTelemetry({
      ...validEnvelope(),
      readings: [{ suctionPressure: { value: 1, unit: 'psig' }, futureField: 42 }],
    });
    expect(parsed.readings[0]).toEqual({ suctionPressure: { value: 1, unit: 'psig' } });
  });
});

describe('buildTelemetrySnapshot', () => {
  const now = new Date('2026-09-06T15:01:00.000Z');

  it('maps a fresh envelope to CONNECTED', () => {
    const snapshot = buildTelemetrySnapshot({
      nodeId: 'pn-001',
      envelope: parsePocketNodeTelemetry(validEnvelope()),
      receivedAt: '2026-09-06T15:00:01.000Z',
      now,
    });
    expect(snapshot.connectionState).toBe('CONNECTED');
    expect(snapshot.quality).toBe('ok');
    expect(snapshot.ageSeconds).toBe(60);
  });

  it('maps a stale envelope to DEGRADED with a safe reason', () => {
    const snapshot = buildTelemetrySnapshot({
      nodeId: 'pn-001',
      envelope: parsePocketNodeTelemetry(validEnvelope()),
      now: new Date('2026-09-06T15:10:00.000Z'),
    });
    expect(snapshot.connectionState).toBe('DEGRADED');
    expect(snapshot.reason).toContain('old');
  });

  it('maps an absent envelope to NO_TELEMETRY', () => {
    const snapshot = buildTelemetrySnapshot({ nodeId: 'pn-001', envelope: null, now });
    expect(snapshot.connectionState).toBe('NO_TELEMETRY');
    expect(snapshot.reading).toBeNull();
  });

  it('honors an explicit demo request', () => {
    const snapshot = buildTelemetrySnapshot({
      nodeId: 'pn-001',
      envelope: parsePocketNodeTelemetry(validEnvelope()),
      demo: true,
      now,
    });
    expect(snapshot.connectionState).toBe('DEMO');
  });
});
