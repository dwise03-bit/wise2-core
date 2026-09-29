import type { Measurement, MeasurementSample } from './measurements.ts';

export type StabilityState = 'WAITING' | 'STABILIZING' | 'STABLE' | 'UNSTABLE' | 'LOST_SIGNAL';

export interface StabilityResult {
  state: StabilityState;
  reason: string;
  key?: string;
}

const WINDOW_MS = 60_000;
const LOST_MS = 8_000;

const THRESHOLDS: Record<string, { label: string; unit: string; maxRange: number }> = {
  suction_pressure: { label: 'suction pressure', unit: 'PSI', maxRange: 8 },
  liquid_pressure: { label: 'liquid pressure', unit: 'PSI', maxRange: 12 },
  suction_line_temp: { label: 'suction line temperature', unit: '°F', maxRange: 2.5 },
  liquid_line_temp: { label: 'liquid line temperature', unit: '°F', maxRange: 2.5 },
  return_db: { label: 'return temperature', unit: '°F', maxRange: 1.5 },
  supply_db: { label: 'supply temperature', unit: '°F', maxRange: 1.5 },
  tes: { label: 'static pressure', unit: 'in. wc', maxRange: 0.08 },
  tesp: { label: 'static pressure', unit: 'in. wc', maxRange: 0.08 },
  amperage: { label: 'amperage', unit: 'A', maxRange: 0.8 },
};

function rangeFor(samples: MeasurementSample[]): number {
  const values = samples.map((sample) => sample.value);
  return Math.max(...values) - Math.min(...values);
}

export function assessStability(
  history: MeasurementSample[],
  liveKeys: string[],
  now = Date.now(),
  expectingStream = false,
): StabilityResult {
  const keys = liveKeys.filter((key) => THRESHOLDS[key]);
  if (keys.length === 0 && !expectingStream) {
    return { state: 'WAITING', reason: 'WAITING — no sensor stream or manual series has been recorded yet.' };
  }

  if (expectingStream) {
    const latest = history.reduce((max, sample) => Math.max(max, sample.at), 0);
    if (!latest) {
      return { state: 'WAITING', reason: 'WAITING — tools are assigned but no samples have arrived.' };
    }
    if (now - latest > LOST_MS) {
      return { state: 'LOST_SIGNAL', reason: 'LOST SIGNAL — no sample received in the last 8 seconds.' };
    }
  }

  const assessed: Array<{ key: string; state: StabilityState; reason: string }> = [];
  for (const key of keys) {
    const meta = THRESHOLDS[key];
    const window = history.filter((sample) => sample.key === key && now - sample.at <= WINDOW_MS);
    if (window.length < 3) {
      assessed.push({
        key,
        state: 'STABILIZING',
        reason: `STABILIZING — not enough ${meta.label} samples in the last 60 seconds.`,
      });
      continue;
    }
    const span = rangeFor(window);
    if (span > meta.maxRange) {
      assessed.push({
        key,
        state: 'UNSTABLE',
        reason: `UNSTABLE — ${meta.label} changed ${span.toFixed(1)} ${meta.unit} during the last 60 seconds.`,
      });
    } else {
      assessed.push({
        key,
        state: 'STABLE',
        reason: `STABLE — ${meta.label} held within ${span.toFixed(1)} ${meta.unit} over 60 seconds.`,
      });
    }
  }

  if (assessed.length === 0) {
    return { state: 'WAITING', reason: 'WAITING — no trendable measurements yet.' };
  }

  const lost = assessed.find((item) => item.state === 'LOST_SIGNAL');
  if (lost) return lost;
  const unstable = assessed.find((item) => item.state === 'UNSTABLE');
  if (unstable) return unstable;
  const stabilizing = assessed.find((item) => item.state === 'STABILIZING');
  if (stabilizing) return stabilizing;
  return assessed[0];
}

export function applyStabilityToMeasurements(
  map: Record<string, Measurement>,
  result: StabilityResult,
): Record<string, Measurement> {
  if (result.state !== 'UNSTABLE' && result.state !== 'LOST_SIGNAL') return map;
  const next = { ...map };
  for (const [key, item] of Object.entries(next)) {
    if (item.value === null) continue;
    if (result.state === 'LOST_SIGNAL') {
      next[key] = { ...item, status: 'disconnected' };
    } else if (item.key === result.key || !result.key) {
      next[key] = { ...item, status: item.source === 'calculated' ? item.status : 'unstable' };
    }
  }
  return next;
}
