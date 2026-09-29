import { boundedText, redactText } from '../../../packages/ops-protocol/src/index.js';
import type { Confirmation, Job, Signed, TargetRecord } from '../../../packages/ops-protocol/src/index.js';

export type DispatchRequest = {
  target: TargetRecord;
  job: Job;
  /** Forwarded verbatim so the bridge verifies the same envelope independently. */
  envelope: Signed<Job>;
  confirmations: Signed<Confirmation>[];
  bridgeToken?: string;
  timeoutMs: number;
  fetchImpl?: typeof globalThis.fetch;
};

export type DispatchResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; code: string; message: string; status?: number; detail?: string };

type Route = { method: 'GET' | 'POST'; path: string; query?: Record<string, string> };

/**
 * Maps an action profile to the one control-bridge endpoint that implements it. A profile
 * with no mapping is refused here rather than guessed at — the relay never constructs a
 * path from operator input.
 */
export function routeFor(job: Job): Route | undefined {
  const { args } = job;
  switch (job.actionProfile) {
    case 'status': return { method: 'GET', path: '/v1/control/status' };
    case 'services': return { method: 'GET', path: '/v1/control/docker/services' };
    case 'logs': return { method: 'GET', path: `/v1/control/docker/${args.service}/logs`, query: args.lines ? { lines: args.lines } : undefined };
    case 'deploy-status': return { method: 'GET', path: `/v1/control/deploy/${args.deploymentId}` };
    case 'diagnose': return { method: 'GET', path: `/v1/control/diagnose/${args.profile}` };
    case 'restart': return { method: 'POST', path: `/v1/control/docker/${args.service}/restart` };
    case 'deploy': return { method: 'POST', path: `/v1/control/deploy/${args.app}` };
    case 'rollback': return { method: 'POST', path: `/v1/control/rollback/${args.app}` };
    case 'maintenance': return { method: 'POST', path: `/v1/control/maintenance/${args.state}` };
    case 'emergency-stop': return { method: 'POST', path: `/v1/control/emergency/${args.service}/stop` };
    default: return undefined;
  }
}

/**
 * Base URL for a target. The `ssh` transport is not a shell: it is the same HTTP call
 * through an SSH port-forward that is established out-of-band, so the relay never
 * executes a remote command.
 */
export function baseUrlFor(target: TargetRecord): string {
  // An explicit origin (a `tailscale serve` endpoint) wins: it lets the bridge keep
  // binding 127.0.0.1 while the tailnet proxy supplies TLS and device identity.
  if (target.baseUrl) return target.baseUrl;
  if (target.transport === 'ssh') return `http://127.0.0.1:${target.forwardPort}`;
  return `http://${target.address}:${target.controlPort ?? 3099}`;
}

export type ProbeRequest = {
  target: TargetRecord;
  bridgeToken?: string;
  timeoutMs: number;
  fetchImpl?: typeof globalThis.fetch;
};

/**
 * Read-only liveness probe for the health monitor. It calls the bridge's aggregate status
 * and nothing else — there is no code path from here to a write.
 */
export async function probeHealth(request: ProbeRequest): Promise<{ ok: boolean; degraded?: boolean; detail?: string }> {
  const fetchImpl = request.fetchImpl ?? globalThis.fetch;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (request.bridgeToken) headers.authorization = `Bearer ${request.bridgeToken}`;

  let response: Response;
  try {
    response = await fetchImpl(new URL('/v1/control/status', baseUrlFor(request.target)), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(request.timeoutMs),
    });
  } catch (error) {
    return { ok: false, detail: `unreachable (${(error as Error).name})` };
  }

  const raw = boundedText(await response.text().catch(() => ''), 16_000);
  const secrets = [request.bridgeToken ?? ''].filter(Boolean);
  if (!response.ok) return { ok: false, detail: redactText(`control bridge returned HTTP ${response.status}`, secrets) };

  try {
    const body = JSON.parse(redactText(raw, secrets)) as { data?: Record<string, { status?: string }> };
    const components = Object.entries(body.data ?? {});
    const unhealthy = components.filter(([, value]) => value && typeof value === 'object' && 'status' in value && value.status !== 'healthy');
    if (unhealthy.length > 0) {
      return { ok: true, degraded: true, detail: `degraded components: ${unhealthy.map(([name]) => name).join(', ')}` };
    }
    return { ok: true, detail: 'all components healthy' };
  } catch {
    return { ok: true, detail: 'status returned an unparsable body' };
  }
}

export async function dispatch(request: DispatchRequest): Promise<DispatchResult> {
  const route = routeFor(request.job);
  if (!route) return { ok: false, code: 'PROFILE_NOT_IMPLEMENTED', message: 'No control-bridge endpoint implements this profile yet', detail: request.job.actionProfile };

  const url = new URL(route.path, baseUrlFor(request.target));
  for (const [key, value] of Object.entries(route.query ?? {})) url.searchParams.set(key, value);

  const fetchImpl = request.fetchImpl ?? globalThis.fetch;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (request.bridgeToken) headers.authorization = `Bearer ${request.bridgeToken}`;
  if (route.method === 'POST') headers['content-type'] = 'application/json';

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: route.method,
      headers,
      body: route.method === 'POST' ? JSON.stringify({ job: request.envelope, confirmations: request.confirmations }) : undefined,
      signal: AbortSignal.timeout(request.timeoutMs),
    });
  } catch (error) {
    // Unreachable host, refused tunnel, DNS failure, timeout: all fail closed. The relay
    // never reports a write as done because it could not observe the outcome.
    return { ok: false, code: 'TARGET_UNREACHABLE', message: 'Target control bridge did not respond', detail: (error as Error).name };
  }

  const raw = boundedText(await response.text().catch(() => ''), 32_000);
  const secrets = [request.bridgeToken ?? ''].filter(Boolean);
  let data: unknown;
  try {
    data = JSON.parse(redactText(raw, secrets));
  } catch {
    data = { raw: redactText(raw, secrets) };
  }

  if (!response.ok) {
    const envelope = data as { error?: { code?: string; message?: string; detail?: string } };
    return {
      ok: false,
      status: response.status,
      code: envelope?.error?.code ?? `BRIDGE_HTTP_${response.status}`,
      message: envelope?.error?.message ?? 'Control bridge rejected the job',
      detail: envelope?.error?.detail,
    };
  }
  return { ok: true, status: response.status, data };
}
