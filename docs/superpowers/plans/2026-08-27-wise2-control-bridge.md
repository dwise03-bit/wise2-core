# WISE² Control Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure, audited WISE² Control Bridge that lets ChatGPT and the iOS Command Center inspect and operate the single VPS/GPU host through an allowlisted API.

**Architecture:** Add a focused Node.js + TypeScript service under `services/control-bridge/` that wraps host, Docker, Git, AI, web-health, deployment, restart, and rollback capabilities behind authenticated HTTP endpoints. Use `docker-compose.production.yml` as the canonical runtime definition, keep GitHub Actions as the normal deployment source of truth, and never expose arbitrary shell execution.

**Tech Stack:** Node.js 20+, TypeScript, pnpm 8.15.9, Fastify, Vitest, Zod, Docker Compose, GitHub Actions, Tailscale/HTTPS ingress.

**Spec:** `docs/superpowers/specs/2026-08-27-wise2-control-bridge-design.md`

## Global Constraints

- HTTPS only outside localhost.
- No arbitrary shell endpoint.
- No root shell exposure.
- No database wipe, firewall reset, secret retrieval, or credential dumping through the API.
- Use an explicit service/action allowlist.
- Never interpolate user-controlled text into `sh -c`.
- Apply strict command timeouts and bounded output.
- Redact secrets from logs and responses.
- Record every write action in the audit log.
- Preserve GitHub Actions as the canonical normal deployment path.
- Use `docker-compose.production.yml` as the canonical production Compose file.
- Read-only actions execute directly; restart/deploy/rollback are controlled writes.

---

## File Structure

Create:

- `services/control-bridge/package.json` — package metadata and scripts.
- `services/control-bridge/tsconfig.json` — TypeScript config.
- `services/control-bridge/src/server.ts` — Fastify bootstrap and route registration.
- `services/control-bridge/src/config.ts` — validated environment/config schema.
- `services/control-bridge/src/auth.ts` — bearer-token authentication and constant-time comparison.
- `services/control-bridge/src/types.ts` — shared response/audit/domain types.
- `services/control-bridge/src/lib/exec.ts` — safe process execution wrapper with fixed binary + args.
- `services/control-bridge/src/lib/redact.ts` — bounded output and secret redaction.
- `services/control-bridge/src/lib/audit.ts` — append-only JSONL audit writer/reader.
- `services/control-bridge/src/adapters/host.ts` — CPU/RAM/disk/GPU/uptime.
- `services/control-bridge/src/adapters/docker.ts` — services/stats/logs/restart with allowlist.
- `services/control-bridge/src/adapters/git.ts` — read-only revision/status.
- `services/control-bridge/src/adapters/ai.ts` — Ollama/Hermes health/models.
- `services/control-bridge/src/adapters/web.ts` — wise2.net and internal endpoint health.
- `services/control-bridge/src/adapters/deploy.ts` — deployment trigger/status and rollback metadata.
- `services/control-bridge/src/routes/*.ts` — one route module per adapter family.
- `services/control-bridge/src/__tests__/*.test.ts` — unit/integration tests.
- `services/control-bridge/Dockerfile` — production image.
- `services/control-bridge/.env.example` — non-secret config names only.
- `scripts/control-health-local.sh` — same-host human CLI health wrapper.
- `data/control-bridge/.gitkeep` — audit/rollback runtime mount target.

Modify:

- `package.json` — add `services/*` workspace if not already covered.
- `docker-compose.production.yml` — add `control-bridge` service and restricted mounts.
- `.github/workflows/deploy.yml` — verify/deploy the bridge with the existing pipeline.
- `scripts/health-check-comprehensive.sh` — remove same-host SSH assumption and delegate to local health logic.
- `README.md` — operator commands and secure deployment notes.

## Task 1: Service skeleton, configuration, and safe execution primitives

**Files:**
- Create: `services/control-bridge/package.json`
- Create: `services/control-bridge/tsconfig.json`
- Create: `services/control-bridge/src/config.ts`
- Create: `services/control-bridge/src/types.ts`
- Create: `services/control-bridge/src/lib/exec.ts`
- Create: `services/control-bridge/src/lib/redact.ts`
- Create: `services/control-bridge/src/__tests__/exec.test.ts`
- Create: `services/control-bridge/src/__tests__/redact.test.ts`

**Interfaces:**
- Produces: `loadConfig(env): ControlConfig`
- Produces: `runCommand(binary: string, args: string[], options?: RunOptions): Promise<CommandResult>`
- Produces: `redactText(input: string, secrets: string[]): string`
- Produces: `boundedText(input: string, maxBytes: number): string`

- [ ] **Step 1: Write failing tests for safe execution**

```ts
import { describe, expect, it } from 'vitest';
import { runCommand } from '../lib/exec';

describe('runCommand', () => {
  it('passes arguments without shell expansion', async () => {
    const result = await runCommand('/usr/bin/printf', ['%s', '$(whoami)']);
    expect(result.stdout).toBe('$(whoami)');
    expect(result.code).toBe(0);
  });

  it('times out long commands', async () => {
    await expect(
      runCommand('/usr/bin/sleep', ['2'], { timeoutMs: 50 })
    ).rejects.toMatchObject({ code: 'COMMAND_TIMEOUT' });
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm --dir services/control-bridge test -- exec.test.ts`
Expected: FAIL because `runCommand` does not exist.

- [ ] **Step 3: Implement shell-free execution**

```ts
import { spawn } from 'node:child_process';

export type CommandResult = { code: number; stdout: string; stderr: string };
export type RunOptions = { timeoutMs?: number; maxOutputBytes?: number; cwd?: string };

export async function runCommand(
  binary: string,
  args: string[],
  options: RunOptions = {}
): Promise<CommandResult> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const max = options.maxOutputBytes ?? 64_000;

  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { cwd: options.cwd, shell: false, env: process.env });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject({ code: 'COMMAND_TIMEOUT', message: `Command timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    child.stdout.on('data', (chunk) => { stdout = (stdout + chunk.toString()).slice(0, max); });
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk.toString()).slice(0, max); });
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
}
```

- [ ] **Step 4: Add redaction tests and implementation**

```ts
import { expect, it } from 'vitest';
import { boundedText, redactText } from '../lib/redact';

it('redacts configured secrets', () => {
  expect(redactText('token=abc123', ['abc123'])).toBe('token=[REDACTED]');
});

it('bounds returned output', () => {
  expect(boundedText('1234567890', 5)).toBe('12345');
});
```

- [ ] **Step 5: Run Task 1 tests**

Run: `pnpm --dir services/control-bridge test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add services/control-bridge
git commit -m "feat(control): add safe execution foundation"
```

## Task 2: Authentication, request IDs, rate limiting, and audit log

**Files:**
- Create: `services/control-bridge/src/auth.ts`
- Create: `services/control-bridge/src/lib/audit.ts`
- Create: `services/control-bridge/src/server.ts`
- Create: `services/control-bridge/src/__tests__/auth.test.ts`
- Create: `services/control-bridge/src/__tests__/audit.test.ts`

**Interfaces:**
- Consumes: `ControlConfig`, `redactText`, `boundedText`
- Produces: `buildServer(config: ControlConfig): FastifyInstance`
- Produces: `appendAudit(entry: AuditEntry): Promise<void>`
- Produces: `readAudit(limit: number): Promise<AuditEntry[]>`

- [ ] **Step 1: Write auth tests**

```ts
it('rejects missing bearer token', async () => {
  const app = await buildServer(testConfig);
  const res = await app.inject({ method: 'GET', url: '/v1/control/health' });
  expect(res.statusCode).toBe(401);
});

it('accepts exact bearer token', async () => {
  const app = await buildServer(testConfig);
  const res = await app.inject({
    method: 'GET',
    url: '/v1/control/health',
    headers: { authorization: `Bearer ${testConfig.authToken}` },
  });
  expect(res.statusCode).toBe(200);
});
```

- [ ] **Step 2: Implement constant-time token validation**

Use `crypto.timingSafeEqual` after equal-length Buffer checks. Never log the supplied header.

- [ ] **Step 3: Add request IDs and standard response envelope**

```ts
export type ControlResponse<T> = {
  ok: boolean;
  requestId: string;
  action: string;
  target?: string;
  timestamp: string;
  data?: T;
  error?: { code: string; message: string; detail?: string };
};
```

- [ ] **Step 4: Add rate limiting**

Configure Fastify rate limiting from `CONTROL_RATE_LIMIT_MAX` and `CONTROL_RATE_LIMIT_WINDOW_MS`, with a default of 60 requests per minute per source.

- [ ] **Step 5: Add audit tests and JSONL writer**

```ts
it('writes no bearer token to audit log', async () => {
  await appendAudit({
    requestId: 'req-1', actor: 'chatgpt', action: 'restart', target: 'hvac',
    startedAt: '2026-08-27T00:00:00Z', endedAt: '2026-08-27T00:00:01Z', ok: true,
  });
  const entries = await readAudit(10);
  expect(JSON.stringify(entries)).not.toContain('Bearer');
});
```

- [ ] **Step 6: Run tests**

Run: `pnpm --dir services/control-bridge test -- auth.test.ts audit.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add services/control-bridge/src
git commit -m "feat(control): add auth rate limits and audit logging"
```

## Task 3: Read-only host, Docker, Git, AI, and web-health adapters

**Files:**
- Create: `services/control-bridge/src/adapters/host.ts`
- Create: `services/control-bridge/src/adapters/docker.ts`
- Create: `services/control-bridge/src/adapters/git.ts`
- Create: `services/control-bridge/src/adapters/ai.ts`
- Create: `services/control-bridge/src/adapters/web.ts`
- Create: `services/control-bridge/src/routes/host.ts`
- Create: `services/control-bridge/src/routes/docker.ts`
- Create: `services/control-bridge/src/routes/git.ts`
- Create: `services/control-bridge/src/routes/ai.ts`
- Create: `services/control-bridge/src/routes/web.ts`
- Create: `services/control-bridge/src/__tests__/readonly.test.ts`

**Interfaces:**
- Produces: `getHostMetrics(): Promise<HostMetrics>`
- Produces: `getGpuMetrics(): Promise<GpuMetrics | null>`
- Produces: `listServices(): Promise<DockerService[]>`
- Produces: `getServiceLogs(service: AllowedService, lines: number): Promise<string>`
- Produces: `getGitRevision(): Promise<GitRevision>`
- Produces: `getOllamaModels(): Promise<OllamaModel[]>`
- Produces: `getHermesStatus(): Promise<ServiceHealth>`
- Produces: `getWise2WebHealth(): Promise<WebHealth>`

- [ ] **Step 1: Write allowlist and line-cap tests**

```ts
it('rejects unknown docker services', async () => {
  await expect(getServiceLogs('not-a-service' as never, 50)).rejects.toMatchObject({ code: 'SERVICE_NOT_ALLOWED' });
});

it('caps log requests at 500 lines', async () => {
  const lines = normalizeLogLines(9999);
  expect(lines).toBe(500);
});
```

- [ ] **Step 2: Implement Docker service discovery from canonical compose config**

Run fixed command:

```ts
runCommand('/usr/bin/docker', ['compose', '-f', config.composeFile, 'config', '--services']);
```

Cache the resulting service set for 30 seconds. Never accept an unvalidated service name.

- [ ] **Step 3: Implement host metrics**

Use `/proc/loadavg`, `os.totalmem()`, `os.freemem()`, `os.uptime()`, `df -P /`, and `nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits` when available.

- [ ] **Step 4: Implement read-only Git adapter**

Use only fixed commands:

```text
git -C <repo> status --porcelain=v1
git -C <repo> rev-parse --abbrev-ref HEAD
git -C <repo> rev-parse HEAD
```

- [ ] **Step 5: Implement Ollama/Hermes/web HTTP probes**

Use `fetch` with 5-second AbortSignal timeouts. Ollama defaults to `http://127.0.0.1:11434/api/tags`; Hermes defaults to configured health endpoint; public WISE² probe defaults to `https://wise2.net`.

- [ ] **Step 6: Register read-only routes**

Required routes:

```text
GET /v1/control/host/metrics
GET /v1/control/host/gpu
GET /v1/control/docker/services
GET /v1/control/docker/stats
GET /v1/control/docker/:service/logs?lines=200
GET /v1/control/git/status
GET /v1/control/git/revision
GET /v1/control/ollama/status
GET /v1/control/ollama/models
GET /v1/control/hermes/status
GET /v1/control/web/wise2
```

- [ ] **Step 7: Run read-only tests**

Run: `pnpm --dir services/control-bridge test -- readonly.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add services/control-bridge/src/adapters services/control-bridge/src/routes services/control-bridge/src/__tests__/readonly.test.ts
git commit -m "feat(control): add read-only system adapters"
```

## Task 4: Controlled restart action and aggregate status

**Files:**
- Modify: `services/control-bridge/src/adapters/docker.ts`
- Create: `services/control-bridge/src/routes/status.ts`
- Modify: `services/control-bridge/src/routes/docker.ts`
- Create: `services/control-bridge/src/__tests__/restart.test.ts`
- Create: `services/control-bridge/src/__tests__/status.test.ts`

**Interfaces:**
- Produces: `restartService(service: AllowedService): Promise<RestartResult>`
- Produces: `getAggregateStatus(): Promise<AggregateStatus>`

- [ ] **Step 1: Write restart allowlist test**

```ts
it('cannot restart an unknown service', async () => {
  await expect(restartService('postgres;rm -rf /' as never)).rejects.toMatchObject({ code: 'SERVICE_NOT_ALLOWED' });
});
```

- [ ] **Step 2: Implement restart using fixed Docker args**

```ts
await runCommand('/usr/bin/docker', [
  'compose', '-f', config.composeFile, 'restart', validatedService,
], { cwd: config.repoDir, timeoutMs: 60_000 });
```

After restart, poll `docker compose ... ps --format json <service>` until healthy/running or timeout.

- [ ] **Step 3: Audit restart writes**

Record actor, action=`docker.restart`, target, start/end time, result, exit code, and request ID.

- [ ] **Step 4: Add aggregate status route**

`GET /v1/control/status` returns host metrics, Docker summary, Git revision, wise2.net health, Ollama health, and Hermes health. Dependency failures are represented as degraded components instead of failing the entire response.

- [ ] **Step 5: Run tests**

Run: `pnpm --dir services/control-bridge test -- restart.test.ts status.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add services/control-bridge/src
git commit -m "feat(control): add restart and aggregate status"
```

## Task 5: Deployment and rollback adapter

**Files:**
- Create: `services/control-bridge/src/adapters/deploy.ts`
- Create: `services/control-bridge/src/routes/deploy.ts`
- Create: `services/control-bridge/src/__tests__/deploy.test.ts`
- Create: `data/control-bridge/.gitkeep`

**Interfaces:**
- Produces: `triggerDeployment(app: AllowedApp): Promise<DeploymentRecord>`
- Produces: `getDeployment(id: string): Promise<DeploymentRecord | null>`
- Produces: `rollbackApp(app: AllowedApp): Promise<DeploymentRecord>`

- [ ] **Step 1: Write app allowlist tests**

```ts
it('rejects deployment of arbitrary app names', async () => {
  await expect(triggerDeployment('../etc' as never)).rejects.toMatchObject({ code: 'APP_NOT_ALLOWED' });
});
```

- [ ] **Step 2: Implement deployment records**

Persist JSON records under `CONTROL_DATA_DIR/deployments/` containing:

```ts
type DeploymentRecord = {
  id: string;
  app: AllowedApp;
  previousRevision: string;
  targetRevision: string;
  status: 'queued' | 'running' | 'healthy' | 'failed' | 'rolled-back';
  createdAt: string;
  completedAt?: string;
  health?: { ok: boolean; detail: string };
};
```

- [ ] **Step 3: Implement GitHub-driven deploy trigger**

Use a server-side GitHub token scoped to the repository and call the repository Actions workflow-dispatch endpoint with a fixed workflow and allowlisted app input. Do not accept repository/workflow names from the HTTP request.

If workflow dispatch is unavailable, return `DEPLOYMENT_PROVIDER_UNAVAILABLE`; do not silently fall back to arbitrary shell deployment.

- [ ] **Step 4: Implement deployment status reconciliation**

Poll the fixed GitHub Actions workflow run and then verify local app health through the existing adapter. Store the final result in the deployment record.

- [ ] **Step 5: Implement rollback**

Rollback only to `previousRevision` recorded by the most recent healthy deployment for that allowlisted app, trigger the same approved workflow with that revision, then run health verification. No database rollback.

- [ ] **Step 6: Register deployment routes**

```text
POST /v1/control/deploy/:app
GET  /v1/control/deploy/:deploymentId
POST /v1/control/rollback/:app
```

- [ ] **Step 7: Run tests**

Run: `pnpm --dir services/control-bridge test -- deploy.test.ts`
Expected: PASS using mocked GitHub HTTP responses.

- [ ] **Step 8: Commit**

```bash
git add services/control-bridge/src data/control-bridge/.gitkeep
git commit -m "feat(control): add deployment and rollback control"
```

## Task 6: Canonical local health flow and Compose normalization

**Files:**
- Create: `scripts/control-health-local.sh`
- Modify: `scripts/health-check-comprehensive.sh`
- Modify: `docker-compose.production.yml`
- Create: `services/control-bridge/Dockerfile`
- Create: `services/control-bridge/.env.example`
- Create: `services/control-bridge/src/__tests__/config.test.ts`

**Interfaces:**
- Canonical compose path: `${WISE2_COMPOSE_FILE:-/home/dwise/wise2-core/docker-compose.production.yml}`
- Bridge port: `${CONTROL_PORT:-3099}` bound to localhost/private ingress only.

- [ ] **Step 1: Write config tests for canonical paths**

```ts
it('defaults to docker-compose.production.yml', () => {
  const cfg = loadConfig({ CONTROL_AUTH_TOKEN: 'x'.repeat(48) });
  expect(cfg.composeFile.endsWith('docker-compose.production.yml')).toBe(true);
});
```

- [ ] **Step 2: Create local health wrapper**

`scripts/control-health-local.sh` must run on the VPS directly and print JSON when `--json` is supplied. It must not SSH to the same server.

Core commands:

```bash
docker compose -f "$WISE2_COMPOSE_FILE" ps
df -P /
free -m
curl -fsS --max-time 5 http://127.0.0.1:3010/api/health
curl -fsS --max-time 5 http://127.0.0.1:3099/v1/control/health
```

- [ ] **Step 3: Convert comprehensive health script into a wrapper**

Keep existing human-friendly output, but replace remote SSH execution with a call to `scripts/control-health-local.sh` when run on the production host. Preserve optional remote mode only when a different host is explicitly supplied.

- [ ] **Step 4: Add Dockerfile**

Use a Node 20 Alpine image, install only production dependencies, run as a non-root user, and expose 3099. Do not bake tokens into the image.

- [ ] **Step 5: Add `control-bridge` service to `docker-compose.production.yml`**

Requirements:

- Build from `services/control-bridge/Dockerfile`.
- Bind `127.0.0.1:3099:3099` by default.
- Mount repo read-only at `/workspace`.
- Mount `/var/run/docker.sock` only if required by the chosen Docker integration.
- Mount `./data/control-bridge:/data/control-bridge` read/write.
- Pass only named environment variables.
- Add a healthcheck against `/v1/control/health` using the local token through an internal health mechanism that does not print it.

- [ ] **Step 6: Run config tests and Compose validation**

Run:

```bash
pnpm --dir services/control-bridge test -- config.test.ts
docker compose -f docker-compose.production.yml config >/dev/null
```

Expected: PASS / exit 0.

- [ ] **Step 7: Commit**

```bash
git add scripts services/control-bridge docker-compose.production.yml data/control-bridge
git commit -m "feat(control): package bridge for production"
```

## Task 7: CI/CD, ingress, documentation, and production verification

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Create: `docs/CONTROL_BRIDGE_OPERATIONS.md`
- Create: `services/control-bridge/src/__tests__/security.test.ts`

**Interfaces:**
- External ingress should terminate HTTPS and forward only to `127.0.0.1:3099` or a Tailscale-private listener.

- [ ] **Step 1: Add security regression tests**

```ts
it.each([
  'api;id',
  'api && whoami',
  '../api',
  '$(id)',
])('rejects malicious service name %s', async (name) => {
  const res = await authedRequest('POST', `/v1/control/docker/${encodeURIComponent(name)}/restart`);
  expect([400, 403, 404]).toContain(res.statusCode);
});

it('never returns configured auth token', async () => {
  const res = await authedRequest('GET', '/v1/control/status');
  expect(res.body).not.toContain(testConfig.authToken);
});
```

- [ ] **Step 2: Add bridge test/build to CI**

Add workflow steps:

```bash
pnpm --dir services/control-bridge install --frozen-lockfile
pnpm --dir services/control-bridge test
pnpm --dir services/control-bridge build
docker compose -f docker-compose.production.yml config >/dev/null
```

- [ ] **Step 3: Add deployment verification**

After production deploy, verify locally on the server:

```bash
curl -fsS http://127.0.0.1:3099/v1/control/health
```

The health endpoint must be designed so liveness can be checked locally without leaking operational data; all operational routes remain authenticated.

- [ ] **Step 4: Document ingress**

`docs/CONTROL_BRIDGE_OPERATIONS.md` must document two supported options:

1. Tailscale private HTTPS/service access.
2. Existing reverse proxy with TLS, IP/source restriction where available, and bearer auth.

Do not expose port 3099 directly to the public internet.

- [ ] **Step 5: Document ChatGPT command mapping**

Include:

```text
WISE² status              -> GET  /v1/control/status
check wise2.net           -> GET  /v1/control/web/wise2
show API logs             -> GET  /v1/control/docker/api/logs
restart HVAC              -> POST /v1/control/docker/hvac/restart
deploy HVAC               -> POST /v1/control/deploy/hvac
rollback HVAC             -> POST /v1/control/rollback/hvac
show GPU                   -> GET  /v1/control/host/gpu
what models are loaded    -> GET  /v1/control/ollama/models
```

- [ ] **Step 6: Run complete test suite**

Run:

```bash
pnpm --dir services/control-bridge test
pnpm --dir services/control-bridge build
docker compose -f docker-compose.production.yml config >/dev/null
```

Expected: all tests PASS, TypeScript build succeeds, Compose config validates.

- [ ] **Step 7: Deploy through existing GitHub Actions path**

Push the implementation branch, review CI, merge to the approved deployment branch, and let the existing SSH deployment workflow update production.

- [ ] **Step 8: Production verification**

On the VPS:

```bash
curl -fsS http://127.0.0.1:3099/v1/control/health
curl -i http://127.0.0.1:3099/v1/control/status
curl -fsS -H "Authorization: Bearer $CONTROL_AUTH_TOKEN" http://127.0.0.1:3099/v1/control/status
curl -fsS -H "Authorization: Bearer $CONTROL_AUTH_TOKEN" http://127.0.0.1:3099/v1/control/web/wise2
```

Expected:

- Health returns 200.
- Unauthenticated operational status returns 401.
- Authenticated status returns 200.
- wise2.net health reports healthy or an explicit degraded reason.

- [ ] **Step 9: Perform one controlled noncritical restart test**

Choose an allowlisted noncritical test service, restart it through the bridge, verify it returns healthy, and verify the audit entry contains the request ID/action/target but no credentials.

- [ ] **Step 10: Final commit**

```bash
git add .github/workflows/deploy.yml README.md docs/CONTROL_BRIDGE_OPERATIONS.md services/control-bridge
git commit -m "docs(control): finalize operations and production verification"
```

## Self-Review Results

- Spec coverage: authentication, allowlists, safe execution, status, health, logs, Docker, Git, GPU, Ollama, Hermes, wise2.net, restart, deploy, rollback, audit, rate limits, Compose normalization, CI/CD, ingress, and production verification are all mapped to tasks.
- Placeholder scan: no TBD/TODO/fill-later steps remain.
- Type consistency: `ControlConfig`, `CommandResult`, `AuditEntry`, `AllowedService`, `AllowedApp`, and `DeploymentRecord` are introduced before dependent tasks.
- Security boundary: no task creates arbitrary shell execution or destructive system/database actions.
