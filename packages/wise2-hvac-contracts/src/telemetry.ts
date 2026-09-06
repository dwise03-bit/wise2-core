/**
 * WISE² HVAC Pocket Node telemetry contract.
 *
 * The backend is the trust boundary. A Pocket Node submits a
 * {@link PocketNodeTelemetryEnvelope}; the API validates it with
 * {@link parsePocketNodeTelemetry}, timestamps receipt, and exposes a read-only
 * {@link HvacTelemetrySnapshot} whose {@link TelemetryConnectionState} makes data
 * freshness explicit. The XR client never treats stale data as connected.
 */

export const TELEMETRY_SCHEMA_VERSION = 1;

/** Seconds after capture before a reading is no longer considered live. */
export const DEFAULT_FRESHNESS_SECONDS = 120;

export type TelemetryQuality = 'ok' | 'degraded' | 'invalid';

export type TelemetryConnectionState =
  | 'CONNECTED'
  | 'DEMO'
  | 'NO_TELEMETRY'
  | 'DEGRADED';

/** A single measured value with an explicit unit. Units are never inferred. */
export interface Measurement {
  value: number;
  unit: string;
}

/**
 * One capture from a Pocket Node. Every field is optional; a node reports only
 * the channels it has. Unknown fields are ignored on parse for forward
 * compatibility.
 */
export interface HvacTelemetryReading {
  /** Optional per-reading capture time (ISO-8601). Falls back to the envelope. */
  capturedAt?: string;
  suctionPressure?: Measurement;
  dischargePressure?: Measurement;
  suctionLineTemp?: Measurement;
  liquidLineTemp?: Measurement;
  superheat?: Measurement;
  subcooling?: Measurement;
  voltage?: Measurement;
  current?: Measurement;
}

export interface PocketNodeTelemetryEnvelope {
  schemaVersion: number;
  nodeId: string;
  /** ISO-8601 capture time, preserved verbatim. */
  capturedAt: string;
  readings: HvacTelemetryReading[];
}

export interface HvacTelemetrySnapshot {
  nodeId: string;
  connectionState: TelemetryConnectionState;
  quality: TelemetryQuality;
  /** Capture time of the most recent reading, or null when none is known. */
  capturedAt: string | null;
  /** Server receipt time of the most recent reading, or null. */
  receivedAt: string | null;
  /** Age of the most recent reading in seconds, or null when unknown. */
  ageSeconds: number | null;
  reading: HvacTelemetryReading | null;
  /** Safe, human-readable reason for a non-CONNECTED state. */
  reason?: string;
}

export type TelemetryParseErrorCode =
  | 'INPUT_NOT_OBJECT'
  | 'SCHEMA_VERSION_INVALID'
  | 'NODE_ID_MISSING'
  | 'CAPTURED_AT_MISSING'
  | 'CAPTURED_AT_INVALID'
  | 'READINGS_INVALID'
  | 'READING_INVALID'
  | 'MEASUREMENT_INVALID';

/** Stable, inspectable failure for telemetry parsing. */
export class TelemetryParseError extends Error {
  readonly code: TelemetryParseErrorCode;

  constructor(code: TelemetryParseErrorCode, detail: string) {
    super(`${code}: ${detail}`);
    this.name = 'TelemetryParseError';
    this.code = code;
  }
}

const MEASUREMENT_KEYS = [
  'suctionPressure',
  'dischargePressure',
  'suctionLineTemp',
  'liquidLineTemp',
  'superheat',
  'subcooling',
  'voltage',
  'current',
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseMeasurement(field: string, raw: unknown): Measurement {
  if (!isPlainObject(raw)) {
    throw new TelemetryParseError('MEASUREMENT_INVALID', `${field} must be an object`);
  }
  // Strings are never coerced into numbers.
  if (!isFiniteNumber(raw.value)) {
    throw new TelemetryParseError(
      'MEASUREMENT_INVALID',
      `${field}.value must be a finite number`,
    );
  }
  if (typeof raw.unit !== 'string' || raw.unit.trim() === '') {
    throw new TelemetryParseError(
      'MEASUREMENT_INVALID',
      `${field}.unit must be a non-empty string`,
    );
  }
  return { value: raw.value, unit: raw.unit };
}

function parseReading(index: number, raw: unknown): HvacTelemetryReading {
  if (!isPlainObject(raw)) {
    throw new TelemetryParseError('READING_INVALID', `readings[${index}] must be an object`);
  }
  const reading: HvacTelemetryReading = {};
  if (raw.capturedAt !== undefined) {
    if (typeof raw.capturedAt !== 'string' || Number.isNaN(Date.parse(raw.capturedAt))) {
      throw new TelemetryParseError(
        'READING_INVALID',
        `readings[${index}].capturedAt must be an ISO-8601 string`,
      );
    }
    reading.capturedAt = raw.capturedAt;
  }
  for (const key of MEASUREMENT_KEYS) {
    if (raw[key] !== undefined) {
      reading[key] = parseMeasurement(`readings[${index}].${key}`, raw[key]);
    }
  }
  return reading;
}

/**
 * Validate untrusted input into a {@link PocketNodeTelemetryEnvelope}.
 *
 * Pure. Throws {@link TelemetryParseError} with a stable `code` on any malformed
 * input. Does not coerce strings into numbers and does not mutate timestamps.
 */
export function parsePocketNodeTelemetry(input: unknown): PocketNodeTelemetryEnvelope {
  if (!isPlainObject(input)) {
    throw new TelemetryParseError('INPUT_NOT_OBJECT', 'envelope must be an object');
  }

  if (!isFiniteNumber(input.schemaVersion) || input.schemaVersion <= 0) {
    throw new TelemetryParseError(
      'SCHEMA_VERSION_INVALID',
      'schemaVersion must be a positive number',
    );
  }

  if (typeof input.nodeId !== 'string' || input.nodeId.trim() === '') {
    throw new TelemetryParseError('NODE_ID_MISSING', 'nodeId must be a non-empty string');
  }

  if (typeof input.capturedAt !== 'string' || input.capturedAt.trim() === '') {
    throw new TelemetryParseError(
      'CAPTURED_AT_MISSING',
      'capturedAt must be a non-empty ISO-8601 string',
    );
  }
  if (Number.isNaN(Date.parse(input.capturedAt))) {
    throw new TelemetryParseError('CAPTURED_AT_INVALID', 'capturedAt is not a valid timestamp');
  }

  if (!Array.isArray(input.readings)) {
    throw new TelemetryParseError('READINGS_INVALID', 'readings must be an array');
  }

  const readings = input.readings.map((raw, index) => parseReading(index, raw));

  return {
    schemaVersion: input.schemaVersion,
    nodeId: input.nodeId,
    capturedAt: input.capturedAt,
    readings,
  };
}

export interface SnapshotInput {
  nodeId: string;
  envelope?: PocketNodeTelemetryEnvelope | null;
  /** Server receipt time of the envelope (ISO-8601). */
  receivedAt?: string | null;
  /** Evaluation time; defaults to now. */
  now?: Date;
  freshnessSeconds?: number;
  /** True when the caller is explicitly serving offline demo data. */
  demo?: boolean;
}

/**
 * Derive a freshness-aware {@link HvacTelemetrySnapshot}. Shared by the API read
 * endpoint and the XR adapter so both map identical inputs to identical states.
 */
export function buildTelemetrySnapshot(input: SnapshotInput): HvacTelemetrySnapshot {
  const {
    nodeId,
    envelope,
    receivedAt = null,
    now = new Date(),
    freshnessSeconds = DEFAULT_FRESHNESS_SECONDS,
    demo = false,
  } = input;

  if (demo) {
    return {
      nodeId,
      connectionState: 'DEMO',
      quality: 'ok',
      capturedAt: envelope?.capturedAt ?? null,
      receivedAt,
      ageSeconds: null,
      reading: envelope?.readings[envelope.readings.length - 1] ?? null,
      reason: 'Offline demo data',
    };
  }

  if (!envelope || envelope.readings.length === 0) {
    return {
      nodeId,
      connectionState: 'NO_TELEMETRY',
      quality: 'invalid',
      capturedAt: envelope?.capturedAt ?? null,
      receivedAt,
      ageSeconds: null,
      reading: null,
      reason: 'No readings received from this node',
    };
  }

  const lastReading = envelope.readings[envelope.readings.length - 1];
  const capturedAt = lastReading.capturedAt ?? envelope.capturedAt;
  const capturedMs = Date.parse(capturedAt);

  if (Number.isNaN(capturedMs)) {
    return {
      nodeId,
      connectionState: 'DEGRADED',
      quality: 'degraded',
      capturedAt,
      receivedAt,
      ageSeconds: null,
      reading: lastReading,
      reason: 'Reading timestamp could not be read',
    };
  }

  const ageSeconds = Math.max(0, Math.round((now.getTime() - capturedMs) / 1000));

  if (ageSeconds > freshnessSeconds) {
    return {
      nodeId,
      connectionState: 'DEGRADED',
      quality: 'degraded',
      capturedAt,
      receivedAt,
      ageSeconds,
      reading: lastReading,
      reason: `Last reading is ${ageSeconds}s old (limit ${freshnessSeconds}s)`,
    };
  }

  return {
    nodeId,
    connectionState: 'CONNECTED',
    quality: 'ok',
    capturedAt,
    receivedAt,
    ageSeconds,
    reading: lastReading,
  };
}
