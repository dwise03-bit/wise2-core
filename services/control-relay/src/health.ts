import type { PublicTarget, TargetRecord } from '../../../packages/ops-protocol/src/index.js';

/**
 * Health polling for the managed fleet.
 *
 * This monitor can only observe and report. It holds no signing key, no dispatcher and no
 * reference to the job path, so an alert structurally cannot become a restart, a deploy
 * or a rollback — remediation is always a person running /ops.
 */

export type HealthPhase = 'unknown' | 'healthy' | 'degraded' | 'down';

export type ProbeResult = {
  ok: boolean;
  /** Short, already-sanitized description of what the host said. */
  detail?: string;
  degraded?: boolean;
};

export type TargetHealth = {
  alias: string;
  environment: string;
  phase: HealthPhase;
  /** Consecutive probes that disagreed with the current phase. */
  pending: number;
  since: string;
  checkedAt: string;
  detail?: string;
};

export type HealthEvent = {
  alias: string;
  environment: string;
  from: HealthPhase;
  to: HealthPhase;
  at: string;
  detail?: string;
};

export type HealthMonitorOptions = {
  targets: readonly TargetRecord[];
  probe: (target: TargetRecord) => Promise<ProbeResult>;
  /** Called once per state change. Never called for an unchanged phase. */
  notify: (event: HealthEvent) => Promise<void> | void;
  intervalMs?: number;
  /** Consecutive disagreeing probes before the phase flips. Debounces single blips. */
  failureThreshold?: number;
  now?: () => number;
  onError?: (error: Error) => void;
};

export type HealthMonitor = {
  /** Runs one full sweep. Returns the events it emitted. */
  sweep(): Promise<HealthEvent[]>;
  start(): void;
  stop(): void;
  states(): TargetHealth[];
  running(): boolean;
};

function phaseFor(result: ProbeResult): HealthPhase {
  if (!result.ok) return 'down';
  return result.degraded ? 'degraded' : 'healthy';
}

export function createHealthMonitor(options: HealthMonitorOptions): HealthMonitor {
  const intervalMs = options.intervalMs ?? 60_000;
  const threshold = Math.max(1, options.failureThreshold ?? 2);
  const now = options.now ?? Date.now;
  const states = new Map<string, TargetHealth>();
  let timer: ReturnType<typeof setInterval> | undefined;
  let sweeping = false;

  for (const target of options.targets) {
    states.set(target.alias, {
      alias: target.alias,
      environment: target.environment,
      phase: 'unknown',
      pending: 0,
      since: new Date(now()).toISOString(),
      checkedAt: new Date(0).toISOString(),
    });
  }

  async function sweep(): Promise<HealthEvent[]> {
    // Overlapping sweeps would double-count the threshold and double-post alerts.
    if (sweeping) return [];
    sweeping = true;
    const events: HealthEvent[] = [];
    try {
      for (const target of options.targets) {
        const state = states.get(target.alias);
        if (!state) continue;

        let observed: HealthPhase;
        let detail: string | undefined;
        try {
          const result = await options.probe(target);
          observed = phaseFor(result);
          detail = result.detail;
        } catch (error) {
          observed = 'down';
          detail = (error as Error).message;
        }

        const at = new Date(now()).toISOString();
        state.checkedAt = at;

        if (observed === state.phase) {
          state.pending = 0;
          state.detail = detail;
          continue;
        }

        state.pending += 1;
        // The first observation of a target is reported immediately: there is no prior
        // state to debounce against, and silence would look like health.
        const confirmed = state.phase === 'unknown' || state.pending >= threshold;
        if (!confirmed) continue;

        const event: HealthEvent = { alias: target.alias, environment: target.environment, from: state.phase, to: observed, at, detail };
        state.phase = observed;
        state.pending = 0;
        state.since = at;
        state.detail = detail;
        events.push(event);

        try {
          await options.notify(event);
        } catch (error) {
          // A failing notifier must not stop the sweep or lose the state transition.
          options.onError?.(error as Error);
        }
      }
    } finally {
      sweeping = false;
    }
    return events;
  }

  return {
    sweep,
    start() {
      if (timer) return;
      timer = setInterval(() => {
        sweep().catch(error => options.onError?.(error as Error));
      }, intervalMs);
      timer.unref?.();
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = undefined;
    },
    states() {
      return [...states.values()];
    },
    running() {
      return Boolean(timer);
    },
  };
}

/** Discord-safe projection of the fleet's health: aliases only, no addresses. */
export function publicHealth(states: readonly TargetHealth[]): (PublicTarget extends never ? never : Omit<TargetHealth, 'detail'> & { detail?: string })[] {
  return states.map(state => ({ ...state }));
}
