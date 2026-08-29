import { saturationTempF, subcoolingF, superheatF } from './refrigerant-pt.ts';

export type MeasurementSource = 'live_tool' | 'manual' | 'calculated' | 'imported';
export type MeasurementStatus = 'valid' | 'stale' | 'unavailable' | 'unstable' | 'disconnected';

export interface Measurement {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  source: MeasurementSource;
  status: MeasurementStatus;
  timestamp: string | null;
  deviceId?: string;
  simulated?: boolean;
}

export type ToolRole =
  | 'low_side_pressure'
  | 'high_side_pressure'
  | 'suction_line_temp'
  | 'liquid_line_temp'
  | 'return_psychrometer'
  | 'supply_psychrometer'
  | 'static_pressure'
  | 'multimeter';

export type ToolConnection = 'connected' | 'disconnected' | 'demo_stream' | 'manual';

export interface ToolCard {
  id: string;
  role: ToolRole;
  type: string;
  deviceName: string;
  assignedRole: string;
  connection: ToolConnection;
  signalQuality: string;
  battery: number | null;
  liveValue: number | null;
  unit: string;
  lastUpdate: string | null;
}

export interface MeasurementSample {
  key: string;
  value: number;
  at: number;
}

export const MEASUREMENT_CATALOG: Array<{
  key: string;
  label: string;
  unit: string;
  group: 'refrigeration' | 'air' | 'airflow' | 'electrical';
}> = [
  { key: 'suction_pressure', label: 'Suction pressure', unit: 'PSIG', group: 'refrigeration' },
  { key: 'liquid_pressure', label: 'Liquid pressure', unit: 'PSIG', group: 'refrigeration' },
  { key: 'suction_line_temp', label: 'Suction line temp', unit: '°F', group: 'refrigeration' },
  { key: 'liquid_line_temp', label: 'Liquid line temp', unit: '°F', group: 'refrigeration' },
  { key: 'suction_sat', label: 'Suction saturation', unit: '°F', group: 'refrigeration' },
  { key: 'liquid_sat', label: 'Liquid saturation', unit: '°F', group: 'refrigeration' },
  { key: 'superheat', label: 'Superheat', unit: '°F', group: 'refrigeration' },
  { key: 'subcooling', label: 'Subcooling', unit: '°F', group: 'refrigeration' },
  { key: 'return_db', label: 'Return dry bulb', unit: '°F', group: 'air' },
  { key: 'return_wb', label: 'Return wet bulb', unit: '°F', group: 'air' },
  { key: 'return_rh', label: 'Return RH', unit: '%', group: 'air' },
  { key: 'supply_db', label: 'Supply dry bulb', unit: '°F', group: 'air' },
  { key: 'supply_wb', label: 'Supply wet bulb', unit: '°F', group: 'air' },
  { key: 'supply_rh', label: 'Supply RH', unit: '%', group: 'air' },
  { key: 'delta_t', label: 'Delta-T', unit: '°F', group: 'air' },
  { key: 'return_static', label: 'Return static', unit: 'in. wc', group: 'airflow' },
  { key: 'supply_static', label: 'Supply static', unit: 'in. wc', group: 'airflow' },
  { key: 'tesp', label: 'Total external static', unit: 'in. wc', group: 'airflow' },
  { key: 'line_voltage', label: 'Line voltage', unit: 'VAC', group: 'electrical' },
  { key: 'load_voltage', label: 'Load voltage', unit: 'VAC', group: 'electrical' },
  { key: 'amperage', label: 'Amperage', unit: 'AAC', group: 'electrical' },
  { key: 'resistance', label: 'Resistance', unit: 'Ω', group: 'electrical' },
  { key: 'capacitance', label: 'Capacitance', unit: 'µF', group: 'electrical' },
  { key: 'control_voltage', label: 'Control voltage', unit: 'VAC', group: 'electrical' },
  { key: 'frequency', label: 'Frequency', unit: 'Hz', group: 'electrical' },
];

export const TOOL_ROLES: Array<{ role: ToolRole; type: string; assignedRole: string; unit: string; measurementKey: string }> = [
  { role: 'low_side_pressure', type: 'Pressure', assignedRole: 'Low Side Pressure', unit: 'PSIG', measurementKey: 'suction_pressure' },
  { role: 'high_side_pressure', type: 'Pressure', assignedRole: 'High Side Pressure', unit: 'PSIG', measurementKey: 'liquid_pressure' },
  { role: 'suction_line_temp', type: 'Pipe clamp', assignedRole: 'Suction Line Temperature', unit: '°F', measurementKey: 'suction_line_temp' },
  { role: 'liquid_line_temp', type: 'Pipe clamp', assignedRole: 'Liquid Line Temperature', unit: '°F', measurementKey: 'liquid_line_temp' },
  { role: 'return_psychrometer', type: 'Psychrometer', assignedRole: 'Return Psychrometer', unit: '°F', measurementKey: 'return_db' },
  { role: 'supply_psychrometer', type: 'Psychrometer', assignedRole: 'Supply Psychrometer', unit: '°F', measurementKey: 'supply_db' },
  { role: 'static_pressure', type: 'Manometer', assignedRole: 'Static Pressure / Manometer', unit: 'in. wc', measurementKey: 'tesp' },
  { role: 'multimeter', type: 'Multimeter', assignedRole: 'Multimeter / Electrical', unit: 'VAC', measurementKey: 'line_voltage' },
];

const STALE_MS = 15_000;

export function emptyMeasurement(key: string, timestamp: string | null = null): Measurement {
  const meta = MEASUREMENT_CATALOG.find((item) => item.key === key);
  return {
    key,
    label: meta?.label || key,
    value: null,
    unit: meta?.unit || '',
    source: 'manual',
    status: 'unavailable',
    timestamp,
  };
}

export function sourceLabel(measurement: Measurement): string {
  if (measurement.simulated) return 'DEMO STREAM';
  if (measurement.status === 'disconnected') return 'DISCONNECTED';
  if (measurement.status === 'stale') return 'STALE';
  if (measurement.source === 'live_tool') return 'LIVE TOOL';
  if (measurement.source === 'manual') return 'MANUAL';
  if (measurement.source === 'calculated') return 'CALCULATED';
  return 'IMPORTED';
}

export function displayValue(measurement: Measurement | undefined): string {
  if (!measurement || measurement.value === null || !Number.isFinite(measurement.value)) {
    if (measurement?.status === 'disconnected') return 'Unavailable';
    if (measurement?.status === 'stale') return '—';
    return '—';
  }
  const digits = measurement.unit === 'AAC' || measurement.unit === 'in. wc' ? 2 : 1;
  return measurement.value.toFixed(digits);
}

function numeric(map: Record<string, Measurement>, key: string): number | null {
  const value = map[key]?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function calculated(
  key: string,
  value: number | null,
  timestamp: string | null,
): Measurement {
  const base = emptyMeasurement(key, timestamp);
  if (value === null) {
    return { ...base, source: 'calculated', status: 'unavailable' };
  }
  return {
    ...base,
    value,
    source: 'calculated',
    status: 'valid',
    timestamp,
  };
}

export function deriveMeasurements(
  raw: Record<string, Measurement>,
  refrigerant?: string | null,
): Record<string, Measurement> {
  const next = { ...raw };
  const suctionP = numeric(next, 'suction_pressure');
  const liquidP = numeric(next, 'liquid_pressure');
  const suctionT = numeric(next, 'suction_line_temp');
  const liquidT = numeric(next, 'liquid_line_temp');
  const returnDb = numeric(next, 'return_db');
  const supplyDb = numeric(next, 'supply_db');
  const returnStatic = numeric(next, 'return_static');
  const supplyStatic = numeric(next, 'supply_static');
  const stamp =
    next.suction_pressure?.timestamp
    || next.liquid_pressure?.timestamp
    || next.return_db?.timestamp
    || next.return_static?.timestamp
    || null;

  next.suction_sat = calculated('suction_sat', saturationTempF(refrigerant, suctionP), stamp);
  next.liquid_sat = calculated('liquid_sat', saturationTempF(refrigerant, liquidP), stamp);
  next.superheat = calculated('superheat', superheatF(refrigerant, suctionP, suctionT), stamp);
  next.subcooling = calculated('subcooling', subcoolingF(refrigerant, liquidP, liquidT), stamp);
  next.delta_t = calculated(
    'delta_t',
    returnDb !== null && supplyDb !== null ? Number((returnDb - supplyDb).toFixed(1)) : null,
    stamp,
  );
  next.tesp = next.tesp?.value != null
    ? next.tesp
    : calculated(
      'tesp',
      returnStatic !== null && supplyStatic !== null
        ? Number((Math.abs(returnStatic) + Math.abs(supplyStatic)).toFixed(2))
        : null,
      stamp,
    );
  return next;
}

export function markStale(map: Record<string, Measurement>, now = Date.now()): Record<string, Measurement> {
  const next: Record<string, Measurement> = {};
  for (const [key, item] of Object.entries(map)) {
    if (!item.timestamp || item.value === null || item.source === 'manual' || item.source === 'calculated') {
      next[key] = item;
      continue;
    }
    const age = now - Date.parse(item.timestamp);
    if (!Number.isFinite(age) || age <= STALE_MS) {
      next[key] = item;
      continue;
    }
    next[key] = { ...item, status: 'stale' };
  }
  return next;
}

export function snapshotToRaw(
  snapshot: {
    pressureLow: number;
    pressureHigh: number;
    tempEvap: number;
    tempCond: number;
    voltage: number;
    current: number;
    superheat: number;
    subcooling: number;
    simulated: boolean;
    updatedAt: string;
  },
): Record<string, Measurement> {
  const stamp = snapshot.updatedAt;
  const make = (key: string, value: number, source: MeasurementSource = 'imported'): Measurement => ({
    ...emptyMeasurement(key, stamp),
    value,
    source,
    status: 'valid',
    timestamp: stamp,
    simulated: snapshot.simulated,
    deviceId: snapshot.simulated ? 'demo-stream' : undefined,
  });
  return {
    suction_pressure: make('suction_pressure', snapshot.pressureLow),
    liquid_pressure: make('liquid_pressure', snapshot.pressureHigh),
    suction_line_temp: make('suction_line_temp', snapshot.tempEvap),
    liquid_line_temp: make('liquid_line_temp', snapshot.tempCond),
    line_voltage: make('line_voltage', snapshot.voltage),
    amperage: make('amperage', snapshot.current),
  };
}

export function appendSample(
  history: MeasurementSample[],
  key: string,
  value: number,
  at = Date.now(),
  maxPoints = 900,
): MeasurementSample[] {
  const next = [...history, { key, value, at }];
  return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
}

export function samplesForRange(
  history: MeasurementSample[],
  key: string,
  rangeMs: number | null,
  now = Date.now(),
): MeasurementSample[] {
  return history.filter((sample) => sample.key === key && (rangeMs === null || now - sample.at <= rangeMs));
}

export const TREND_RANGES: Array<{ id: string; label: string; ms: number | null }> = [
  { id: '1m', label: '1 MIN', ms: 60_000 },
  { id: '5m', label: '5 MIN', ms: 5 * 60_000 },
  { id: '15m', label: '15 MIN', ms: 15 * 60_000 },
  { id: '30m', label: '30 MIN', ms: 30 * 60_000 },
  { id: 'session', label: 'SESSION', ms: null },
];

export const TREND_SERIES = [
  'suction_pressure',
  'liquid_pressure',
  'suction_line_temp',
  'liquid_line_temp',
  'superheat',
  'subcooling',
  'delta_t',
  'tesp',
  'amperage',
] as const;
