import { describe, expect, it, vi } from 'vitest';
import { createHealthMonitor, type HealthEvent, type ProbeResult } from '../health.js';
import { createDiscordNotifier, renderHealthAlert } from '../notify.js';
import { probeHealth } from '../transport.js';
import { CORE, TUNNELLED, jsonResponse } from './helpers.js';

function monitorWith(results: ProbeResult[], options: { threshold?: number; targets?: typeof CORE[] } = {}) {
  const events: HealthEvent[] = [];
  let index = 0;
  const monitor = createHealthMonitor({
    targets: options.targets ?? [CORE],
    failureThreshold: options.threshold ?? 2,
    probe: async () => results[Math.min(index++, results.length - 1)]!,
    notify: (event) => { events.push(event); },
  });
  return { monitor, events };
}

const up: ProbeResult = { ok: true, detail: 'all components healthy' };
const down: ProbeResult = { ok: false, detail: 'unreachable (TimeoutError)' };
const degraded: ProbeResult = { ok: true, degraded: true, detail: 'degraded components: ollama' };

describe('state changes only', () => {
  it('reports the first observation immediately', async () => {
    const { monitor, events } = monitorWith([up]);
    await monitor.sweep();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ alias: 'wise2-core', from: 'unknown', to: 'healthy' });
  });

  it('stays silent while nothing changes', async () => {
    const { monitor, events } = monitorWith([up]);
    await monitor.sweep();
    await monitor.sweep();
    await monitor.sweep();
    expect(events).toHaveLength(1);
  });

  it('posts exactly one alert for a sustained outage', async () => {
    const { monitor, events } = monitorWith([up, down, down, down, down]);
    for (let i = 0; i < 5; i += 1) await monitor.sweep();
    const outage = events.filter(event => event.to === 'down');
    expect(outage).toHaveLength(1);
    expect(outage[0]).toMatchObject({ from: 'healthy', to: 'down', detail: 'unreachable (TimeoutError)' });
  });

  it('debounces a single blip below the threshold', async () => {
    const results = [up, down, up, up];
    let index = 0;
    const events: HealthEvent[] = [];
    const monitor = createHealthMonitor({
      targets: [CORE], failureThreshold: 2,
      probe: async () => results[Math.min(index++, results.length - 1)]!,
      notify: (event) => { events.push(event); },
    });
    for (let i = 0; i < 4; i += 1) await monitor.sweep();
    expect(events.filter(event => event.to === 'down')).toHaveLength(0);
    expect(monitor.states()[0]!.phase).toBe('healthy');
  });

  it('reports recovery as its own transition', async () => {
    const results = [up, down, down, up, up];
    let index = 0;
    const events: HealthEvent[] = [];
    const monitor = createHealthMonitor({
      targets: [CORE], failureThreshold: 2,
      probe: async () => results[Math.min(index++, results.length - 1)]!,
      notify: (event) => { events.push(event); },
    });
    for (let i = 0; i < 5; i += 1) await monitor.sweep();
    expect(events.map(event => event.to)).toEqual(['healthy', 'down', 'healthy']);
  });

  it('distinguishes degraded from down', async () => {
    const { monitor, events } = monitorWith([up, degraded, degraded]);
    for (let i = 0; i < 3; i += 1) await monitor.sweep();
    expect(events.at(-1)).toMatchObject({ to: 'degraded', detail: 'degraded components: ollama' });
  });

  it('tracks each target independently', async () => {
    const events: HealthEvent[] = [];
    const monitor = createHealthMonitor({
      targets: [CORE, TUNNELLED], failureThreshold: 1,
      probe: async (target) => (target.alias === 'wise2-core' ? up : down),
      notify: (event) => { events.push(event); },
    });
    await monitor.sweep();
    expect(events.map(event => [event.alias, event.to])).toEqual([['wise2-core', 'healthy'], ['wise2-tunnel', 'down']]);
  });

  it('treats a throwing probe as down rather than crashing the sweep', async () => {
    const events: HealthEvent[] = [];
    const monitor = createHealthMonitor({
      targets: [CORE], failureThreshold: 1,
      probe: async () => { throw new Error('boom'); },
      notify: (event) => { events.push(event); },
    });
    await expect(monitor.sweep()).resolves.toHaveLength(1);
    expect(events[0]).toMatchObject({ to: 'down', detail: 'boom' });
  });

  it('keeps the state change when the notifier fails', async () => {
    const errors: Error[] = [];
    const monitor = createHealthMonitor({
      targets: [CORE], failureThreshold: 1,
      probe: async () => up,
      notify: () => { throw new Error('discord down'); },
      onError: (error) => { errors.push(error); },
    });
    await monitor.sweep();
    expect(errors).toHaveLength(1);
    expect(monitor.states()[0]!.phase).toBe('healthy');
  });
});

describe('alerts never remediate', () => {
  it('gives the monitor no way to dispatch a job', async () => {
    const calls: string[] = [];
    const monitor = createHealthMonitor({
      targets: [CORE], failureThreshold: 1,
      probe: async () => { calls.push('probe'); return down; },
      notify: () => { calls.push('notify'); },
    });
    await monitor.sweep();
    await monitor.sweep();
    // Only observation and reporting — never a third kind of call.
    expect(new Set(calls)).toEqual(new Set(['probe', 'notify']));
    expect(Object.keys(monitor)).toEqual(['sweep', 'start', 'stop', 'states', 'running']);
  });

  it('names a command for a person instead of running one', () => {
    const alert = renderHealthAlert({ alias: 'wise2-core', environment: 'production', from: 'healthy', to: 'down', at: '2026-09-09T12:00:00.000Z', detail: 'unreachable' });
    expect(alert).toContain('/ops status wise2-core');
    expect(alert).toContain('performs no remediation');
  });
});

describe('alert rendering', () => {
  it('marks recovery as needing no action', () => {
    const alert = renderHealthAlert({ alias: 'wise2-core', environment: 'production', from: 'down', to: 'healthy', at: '2026-09-09T12:00:00.000Z' });
    expect(alert).toContain('🟢');
    expect(alert).toContain('No action needed.');
  });

  it('redacts a secret that appears in the detail', () => {
    const alert = renderHealthAlert(
      { alias: 'wise2-core', environment: 'production', from: 'healthy', to: 'down', at: '2026-09-09T12:00:00.000Z', detail: 'DATABASE_URL=postgres://wise2:hunter2@db:5432/prod' },
      ['a-bridge-token'],
    );
    expect(alert).not.toContain('hunter2');
  });

  it('suppresses mentions so an alert cannot ping the channel', async () => {
    const bodies: string[] = [];
    const notifier = createDiscordNotifier({
      webhookUrl: 'https://discord.test/webhook',
      fetchImpl: (async (_url: unknown, init: RequestInit) => { bodies.push(String(init.body)); return jsonResponse({}); }) as unknown as typeof globalThis.fetch,
    });
    await notifier({ alias: 'wise2-core', environment: 'production', from: 'healthy', to: 'down', at: '2026-09-09T12:00:00.000Z', detail: '@everyone look' });
    expect(JSON.parse(bodies[0]!).allowed_mentions).toEqual({ parse: [] });
  });

  it('does nothing when no webhook is configured', async () => {
    const fetchImpl = vi.fn();
    const notifier = createDiscordNotifier({ fetchImpl: fetchImpl as unknown as typeof globalThis.fetch });
    await notifier({ alias: 'wise2-core', environment: 'production', from: 'healthy', to: 'down', at: '2026-09-09T12:00:00.000Z' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('swallows a webhook outage instead of failing the sweep', async () => {
    const errors: Error[] = [];
    const notifier = createDiscordNotifier({
      webhookUrl: 'https://discord.test/webhook',
      fetchImpl: (async () => { throw new Error('discord unreachable'); }) as unknown as typeof globalThis.fetch,
      onError: (error) => { errors.push(error); },
    });
    await expect(notifier({ alias: 'wise2-core', environment: 'production', from: 'healthy', to: 'down', at: '2026-09-09T12:00:00.000Z' })).resolves.toBeUndefined();
    expect(errors).toHaveLength(1);
  });
});

describe('probeHealth', () => {
  it('reports healthy when every component is healthy', async () => {
    const fetchImpl = (async () => jsonResponse({ ok: true, data: { host: { status: 'healthy' }, docker: { status: 'healthy' } } })) as unknown as typeof globalThis.fetch;
    expect(await probeHealth({ target: CORE, timeoutMs: 1000, fetchImpl })).toMatchObject({ ok: true, detail: 'all components healthy' });
  });

  it('reports degraded and names the components', async () => {
    const fetchImpl = (async () => jsonResponse({ ok: true, data: { host: { status: 'healthy' }, ollama: { status: 'down' } } })) as unknown as typeof globalThis.fetch;
    expect(await probeHealth({ target: CORE, timeoutMs: 1000, fetchImpl })).toMatchObject({ ok: true, degraded: true, detail: 'degraded components: ollama' });
  });

  it('reports down when the bridge is unreachable', async () => {
    const fetchImpl = (async () => { throw Object.assign(new Error('nope'), { name: 'TimeoutError' }); }) as unknown as typeof globalThis.fetch;
    expect(await probeHealth({ target: CORE, timeoutMs: 1000, fetchImpl })).toMatchObject({ ok: false, detail: 'unreachable (TimeoutError)' });
  });

  it('reports down on an HTTP error and never echoes the token', async () => {
    const fetchImpl = (async () => jsonResponse({ error: 'nope' }, 401)) as unknown as typeof globalThis.fetch;
    const result = await probeHealth({ target: CORE, bridgeToken: 'a-bridge-token', timeoutMs: 1000, fetchImpl });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain('a-bridge-token');
  });

  it('only ever issues a GET to the status endpoint', async () => {
    const calls: { url: string; method: string }[] = [];
    const fetchImpl = (async (url: unknown, init: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET' });
      return jsonResponse({ ok: true, data: {} });
    }) as unknown as typeof globalThis.fetch;
    await probeHealth({ target: CORE, timeoutMs: 1000, fetchImpl });
    expect(calls).toEqual([{ url: 'http://100.64.0.10:3099/v1/control/status', method: 'GET' }]);
  });
});
