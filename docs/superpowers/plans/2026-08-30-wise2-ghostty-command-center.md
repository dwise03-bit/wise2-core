# WISE² Ghostty Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Ghostty-centered WISE² operator console on the Apple M4 / 16 GB MacBook Pro with one `wise` CLI that routes local Ollama work, GPU/Hermes work, Control Bridge operations, and explicit Claude/Codex handoffs.

**Architecture:** Add a focused Node.js 20+ / TypeScript CLI under `tools/ghostty/` and register it as a pnpm workspace. Ghostty remains presentation-only; the `wise` CLI owns routing, local/remote AI clients, status/doctor output, and handoffs. Privileged remote operations call the existing WISE² Control Bridge endpoints rather than introducing arbitrary SSH execution.

**Tech Stack:** Node.js >=20, TypeScript, pnpm 8.15.9, Vitest, Zod, YAML, native `fetch`, Ghostty config, zsh, Ollama HTTP API, Tailscale/private networking, WISE² Control Bridge.

**Spec:** `docs/superpowers/specs/2026-08-30-wise2-ghostty-command-center-design.md`

## Global Constraints

- Mac target is Apple M4, 10 CPU cores, 16 GB unified memory, arm64 macOS.
- Default routing is local-first.
- Fast/general chat stays in the 3B-8B quantized class by default.
- Coding uses an approximately 7B quantized coder route by default.
- Vision uses an approximately 7B-class multimodal route when memory permits.
- 20B-30B+ workloads route to the GPU host by default.
- Do not keep multiple large local models resident unnecessarily.
- Automatic cloud escalation is disabled by default.
- Claude and Codex must require explicit user handoff.
- Remote operational writes must use the existing Control Bridge allowlist.
- Do not add an arbitrary remote shell proxy.
- Do not store secrets in Ghostty config or tracked repository files.
- Do not print bearer tokens, API keys, SSH keys, or secret environment values in status/doctor output.
- Do not interpolate prompt text into `sh -c` or another shell command.
- Installer changes to user config must be idempotent, backed up, and reversible.
- Any release ZIP must be generated from tracked source and accompanied by a checksum.

---

## File Structure

Create:

- `tools/ghostty/package.json` — CLI package metadata, scripts, dependencies, and `wise` binary mapping.
- `tools/ghostty/tsconfig.json` — NodeNext/ES2022 strict TypeScript configuration.
- `tools/ghostty/vitest.config.ts` — test configuration.
- `tools/ghostty/src/cli.ts` — command parser and top-level dispatch.
- `tools/ghostty/src/types.ts` — config, route, backend, status, and error types.
- `tools/ghostty/src/config.ts` — YAML config loading/validation and defaults.
- `tools/ghostty/src/router.ts` — role-to-backend decision logic.
- `tools/ghostty/src/backends/ollama.ts` — local and GPU Ollama HTTP client.
- `tools/ghostty/src/backends/hermes.ts` — Hermes health/prompt adapter.
- `tools/ghostty/src/backends/control-bridge.ts` — typed client for existing `/v1/control/*` API.
- `tools/ghostty/src/backends/cloud.ts` — explicit Claude/Codex process handoff only.
- `tools/ghostty/src/system/macos.ts` — arm64, memory, binary, Tailscale, and process checks.
- `tools/ghostty/src/commands/chat.ts` — default/fast/code/gpu prompt execution.
- `tools/ghostty/src/commands/vision.ts` — image prompt execution.
- `tools/ghostty/src/commands/models.ts` — local/remote model discovery.
- `tools/ghostty/src/commands/status.ts` — compact human and JSON status output.
- `tools/ghostty/src/commands/doctor.ts` — diagnostic checks and remediation hints.
- `tools/ghostty/src/commands/control.ts` — Control Bridge command mapping.
- `tools/ghostty/src/commands/handoff.ts` — explicit Claude/Codex launch behavior.
- `tools/ghostty/src/commands/project.ts` — current repo/branch/project summary.
- `tools/ghostty/config/config.example.yaml` — non-secret route configuration example.
- `tools/ghostty/config/ghostty.wise2.conf` — WISE² Ghostty presentation fragment.
- `tools/ghostty/config/zsh.wise2.zsh` — PATH/completion/prompt integration fragment.
- `tools/ghostty/scripts/install.sh` — idempotent macOS installer.
- `tools/ghostty/scripts/uninstall.sh` — managed-block removal and restore helper.
- `tools/ghostty/scripts/package-release.sh` — deterministic ZIP + SHA-256 generation.
- `tools/ghostty/README.md` — operator documentation.
- `tools/ghostty/src/__tests__/config.test.ts`
- `tools/ghostty/src/__tests__/router.test.ts`
- `tools/ghostty/src/__tests__/ollama.test.ts`
- `tools/ghostty/src/__tests__/control-bridge.test.ts`
- `tools/ghostty/src/__tests__/status.test.ts`
- `tools/ghostty/src/__tests__/doctor.test.ts`
- `tools/ghostty/src/__tests__/cloud.test.ts`
- `tools/ghostty/src/__tests__/cli.test.ts`
- `tools/ghostty/tests/install.bats` — installer idempotency/rollback shell tests when `bats` is available.

Modify:

- `pnpm-workspace.yaml` — add `tools/ghostty` to the workspace.
- `package.json` — add root convenience scripts: `wise:build`, `wise:test`, `wise:doctor`.
- `.gitignore` — ignore generated Ghostty release archives/checksums if stored under a local release directory.

Existing files consumed but not structurally replaced:

- `services/control-bridge/src/server.ts` — canonical API route contract.
- `services/control-bridge/src/types.ts` — reference for envelope semantics.
- `docs/superpowers/specs/2026-08-30-wise2-ghostty-command-center-design.md` — approved design.

---

### Task 1: Create the typed CLI package and validated configuration

**Files:**
- Create: `tools/ghostty/package.json`
- Create: `tools/ghostty/tsconfig.json`
- Create: `tools/ghostty/vitest.config.ts`
- Create: `tools/ghostty/src/types.ts`
- Create: `tools/ghostty/src/config.ts`
- Create: `tools/ghostty/config/config.example.yaml`
- Create: `tools/ghostty/src/__tests__/config.test.ts`
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`

**Interfaces:**
- Produces: `type WiseConfig`
- Produces: `type RoleName = 'fast' | 'code' | 'vision' | 'rag' | 'architect'`
- Produces: `loadConfig(path?: string, env?: NodeJS.ProcessEnv): WiseConfig`
- Produces: `defaultConfig(): WiseConfig`

- [ ] **Step 1: Write the failing config test**

```ts
import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../config.js';

describe('defaultConfig', () => {
  it('is local-first and disables cloud auto escalation', () => {
    const config = defaultConfig();
    expect(config.localOllamaUrl).toBe('http://127.0.0.1:11434');
    expect(config.autoCloudEscalation).toBe(false);
    expect(config.roles.fast.backend).toBe('local-ollama');
    expect(config.roles.architect.backend).toBe('gpu-ollama');
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm --dir tools/ghostty test -- config.test.ts`
Expected: FAIL because the package/config module does not exist.

- [ ] **Step 3: Add package metadata and workspace registration**

Use:

```json
{
  "name": "@wise2/ghostty-command-center",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": { "wise": "dist/cli.js" },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run --config vitest.config.ts",
    "dev": "tsx src/cli.ts"
  },
  "dependencies": {
    "yaml": "^2.8.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/node": "^20.17.0",
    "tsx": "^4.23.12",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

Add `tools/ghostty` to `pnpm-workspace.yaml`. Add root scripts:

```json
"wise:build": "pnpm --dir tools/ghostty build",
"wise:test": "pnpm --dir tools/ghostty test",
"wise:doctor": "pnpm --dir tools/ghostty dev -- doctor"
```

- [ ] **Step 4: Implement exact core config types**

```ts
export type BackendName = 'local-ollama' | 'gpu-ollama' | 'hermes';
export type RoleName = 'fast' | 'code' | 'vision' | 'rag' | 'architect';
export type RoleRoute = { backend: BackendName; model: string; maxLocalMemoryPercent?: number };

export type WiseConfig = {
  localOllamaUrl: string;
  gpuOllamaUrl?: string;
  hermesUrl?: string;
  controlBridgeUrl?: string;
  controlBridgeTokenEnv: string;
  autoCloudEscalation: boolean;
  requestTimeoutMs: number;
  roles: Record<RoleName, RoleRoute>;
};
```

Default values:

```ts
export function defaultConfig(): WiseConfig {
  return {
    localOllamaUrl: 'http://127.0.0.1:11434',
    gpuOllamaUrl: undefined,
    hermesUrl: undefined,
    controlBridgeUrl: undefined,
    controlBridgeTokenEnv: 'WISE2_CONTROL_TOKEN',
    autoCloudEscalation: false,
    requestTimeoutMs: 120000,
    roles: {
      fast: { backend: 'local-ollama', model: 'wise2-fast', maxLocalMemoryPercent: 82 },
      code: { backend: 'local-ollama', model: 'qwen2.5-coder:7b', maxLocalMemoryPercent: 82 },
      vision: { backend: 'local-ollama', model: 'wise2-vision', maxLocalMemoryPercent: 80 },
      rag: { backend: 'local-ollama', model: 'wise2-rag', maxLocalMemoryPercent: 82 },
      architect: { backend: 'gpu-ollama', model: 'qwen3-coder:30b' }
    }
  };
}
```

- [ ] **Step 5: Implement YAML loading with Zod validation**

Config path precedence must be:

1. explicit `--config` path;
2. `$WISE2_CONFIG`;
3. `~/.config/wise2/config.yaml`;
4. defaults.

Reject unknown backend names and invalid URLs. Environment variables may override endpoint URLs but not silently enable cloud escalation.

- [ ] **Step 6: Add example YAML**

```yaml
localOllamaUrl: http://127.0.0.1:11434
gpuOllamaUrl: http://100.68.145.5:11434
hermesUrl: http://100.68.145.5:8642
controlBridgeUrl: https://gpu-nmls-1.tail44396d.ts.net
controlBridgeTokenEnv: WISE2_CONTROL_TOKEN
autoCloudEscalation: false
requestTimeoutMs: 120000
roles:
  fast: { backend: local-ollama, model: wise2-fast, maxLocalMemoryPercent: 82 }
  code: { backend: local-ollama, model: qwen2.5-coder:7b, maxLocalMemoryPercent: 82 }
  vision: { backend: local-ollama, model: wise2-vision, maxLocalMemoryPercent: 80 }
  rag: { backend: local-ollama, model: wise2-rag, maxLocalMemoryPercent: 82 }
  architect: { backend: gpu-ollama, model: qwen3-coder:30b }
```

- [ ] **Step 7: Run tests/build**

Run:

```bash
pnpm install
pnpm --dir tools/ghostty test -- config.test.ts
pnpm --dir tools/ghostty build
```

Expected: PASS; TypeScript build succeeds.

- [ ] **Step 8: Commit**

```bash
git add pnpm-workspace.yaml package.json tools/ghostty
git commit -m "feat(ghostty): add typed wise CLI configuration"
```

---

### Task 2: Implement Ollama backends and deterministic local/GPU routing

**Files:**
- Create: `tools/ghostty/src/backends/ollama.ts`
- Create: `tools/ghostty/src/router.ts`
- Create: `tools/ghostty/src/system/macos.ts`
- Create: `tools/ghostty/src/__tests__/ollama.test.ts`
- Create: `tools/ghostty/src/__tests__/router.test.ts`

**Interfaces:**
- Consumes: `WiseConfig`, `RoleName`, `RoleRoute`
- Produces: `listOllamaModels(baseUrl, fetchImpl?): Promise<string[]>`
- Produces: `chatOllama(input): Promise<string>`
- Produces: `getMacMemoryState(): Promise<{ totalBytes: number; usedBytes: number; usedPercent: number }>`
- Produces: `resolveRoute(role, config, state): RouteDecision`

- [ ] **Step 1: Write failing Ollama API tests**

```ts
it('lists model names from /api/tags', async () => {
  const fakeFetch = vi.fn(async () => new Response(JSON.stringify({ models: [{ name: 'wise2-fast' }] }), { status: 200 }));
  expect(await listOllamaModels('http://127.0.0.1:11434', fakeFetch as typeof fetch)).toEqual(['wise2-fast']);
});
```

```ts
it('sends chat requests without a shell', async () => {
  const fakeFetch = vi.fn(async () => new Response(JSON.stringify({ message: { content: 'ok' } }), { status: 200 }));
  const text = await chatOllama({ baseUrl: 'http://127.0.0.1:11434', model: 'wise2-fast', prompt: 'hello', fetchImpl: fakeFetch as typeof fetch });
  expect(text).toBe('ok');
  expect(fakeFetch).toHaveBeenCalledWith('http://127.0.0.1:11434/api/chat', expect.objectContaining({ method: 'POST' }));
});
```

- [ ] **Step 2: Write failing routing tests**

```ts
it('routes architect to GPU', () => {
  const decision = resolveRoute('architect', defaultConfig(), { localMemoryUsedPercent: 25 });
  expect(decision.backend).toBe('gpu-ollama');
});

it('reroutes an overloaded local role to GPU only when GPU is configured', () => {
  const config = defaultConfig();
  config.gpuOllamaUrl = 'http://100.68.145.5:11434';
  const decision = resolveRoute('code', config, { localMemoryUsedPercent: 95 });
  expect(decision.backend).toBe('gpu-ollama');
  expect(decision.reason).toBe('local-memory-pressure');
});
```

- [ ] **Step 3: Implement the Ollama HTTP client**

Use native `fetch` only. Required endpoints:

- `GET /api/tags`
- `POST /api/chat`

`chatOllama` request body:

```ts
{
  model,
  stream: false,
  messages: [{ role: 'user', content: prompt }],
  keep_alive: '5m'
}
```

Use `AbortSignal.timeout(timeoutMs)` and convert non-2xx responses into a typed `BackendError` containing backend name, HTTP status, and safe message.

- [ ] **Step 4: Implement macOS memory inspection**

Use `os.totalmem()` for total memory and `/usr/bin/vm_stat` via `execFile` for page counts. Never use `exec` or `sh -c`. Calculate `usedPercent` from active+wired+compressed pages. If `vm_stat` parsing fails, return an `unknown` state and do not block local inference solely because telemetry failed.

- [ ] **Step 5: Implement deterministic route decisions**

`RouteDecision`:

```ts
export type RouteDecision = {
  backend: BackendName;
  model: string;
  baseUrl?: string;
  reason: 'configured' | 'local-memory-pressure' | 'explicit-gpu';
};
```

Rules:

1. `architect` uses configured `gpu-ollama`.
2. `fast`, `code`, `vision`, `rag` use their configured local route when memory is below the role threshold.
3. If local memory exceeds threshold and `gpuOllamaUrl` exists, preserve the role model when available remotely; otherwise use the configured architect model.
4. If local memory exceeds threshold and no GPU is configured, fail with `LOCAL_MEMORY_PRESSURE`; do not switch to cloud.
5. `autoCloudEscalation` is ignored by the router in v1 except to assert it remains false; cloud commands live outside this router.

- [ ] **Step 6: Run tests/build**

```bash
pnpm --dir tools/ghostty test -- ollama.test.ts router.test.ts
pnpm --dir tools/ghostty build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add tools/ghostty/src/backends/ollama.ts tools/ghostty/src/router.ts tools/ghostty/src/system/macos.ts tools/ghostty/src/__tests__
git commit -m "feat(ghostty): add local and GPU AI routing"
```

---

### Task 3: Implement the real Control Bridge client and safe operation mapping

**Files:**
- Create: `tools/ghostty/src/backends/control-bridge.ts`
- Create: `tools/ghostty/src/commands/control.ts`
- Create: `tools/ghostty/src/__tests__/control-bridge.test.ts`

**Interfaces:**
- Produces: `controlRequest<T>(config, method, path, fetchImpl?): Promise<ControlEnvelope<T>>`
- Produces: `runControlCommand(args, config): Promise<ControlEnvelope<unknown>>`

- [ ] **Step 1: Write failing authentication and endpoint tests**

```ts
it('uses the configured token environment variable without exposing it', async () => {
  process.env.WISE2_CONTROL_TOKEN = 'secret-token';
  const fakeFetch = vi.fn(async (_url, init) => {
    expect((init?.headers as Record<string, string>).authorization).toBe('Bearer secret-token');
    return new Response(JSON.stringify({ ok: true, requestId: '1', action: 'health', timestamp: new Date().toISOString(), data: { status: 'ok' } }), { status: 200 });
  });
  const config = { ...defaultConfig(), controlBridgeUrl: 'https://bridge.example' };
  await controlRequest(config, 'GET', '/v1/control/health', fakeFetch as typeof fetch);
});
```

- [ ] **Step 2: Encode the existing server contract exactly**

Support these commands/endpoints:

```text
status                 GET  /v1/control/status
health                 GET  /v1/control/health
gpu                    GET  /v1/control/host/gpu
models                 GET  /v1/control/ollama/models
hermes                 GET  /v1/control/hermes/status
logs <service> [lines] GET  /v1/control/docker/:service/logs?lines=N
restart <service>      POST /v1/control/docker/:service/restart
deploy <app>           POST /v1/control/deploy/:app
rollback <app>         POST /v1/control/rollback/:app
git                    GET  /v1/control/git/status
revision               GET  /v1/control/git/revision
web                    GET  /v1/control/web/wise2
```

Do not add endpoints absent from `services/control-bridge/src/server.ts`.

- [ ] **Step 3: Implement safe URL construction**

Use `new URL()` and `encodeURIComponent` for target path segments. Validate `lines` as integer `1..500`. Never concatenate raw target text into a shell command.

- [ ] **Step 4: Implement error handling**

On 401/403, return a safe message such as `Control Bridge authorization failed` without including the token. Preserve server `error.code` and `requestId` when available.

- [ ] **Step 5: Run tests/build**

```bash
pnpm --dir tools/ghostty test -- control-bridge.test.ts
pnpm --dir tools/ghostty build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tools/ghostty/src/backends/control-bridge.ts tools/ghostty/src/commands/control.ts tools/ghostty/src/__tests__/control-bridge.test.ts
git commit -m "feat(ghostty): connect wise CLI to control bridge"
```

---

### Task 4: Add chat, vision, models, project, and Hermes commands

**Files:**
- Create: `tools/ghostty/src/backends/hermes.ts`
- Create: `tools/ghostty/src/commands/chat.ts`
- Create: `tools/ghostty/src/commands/vision.ts`
- Create: `tools/ghostty/src/commands/models.ts`
- Create: `tools/ghostty/src/commands/project.ts`
- Create: `tools/ghostty/src/__tests__/cli.test.ts`

**Interfaces:**
- Produces: `runChat(role, prompt, config): Promise<CommandOutput>`
- Produces: `runVision(filePath, prompt, config): Promise<CommandOutput>`
- Produces: `runModels(config): Promise<ModelInventory>`
- Produces: `runProject(cwd): Promise<ProjectSummary>`

- [ ] **Step 1: Write failing command behavior tests**

Verify:

```ts
expect(parseArgs(['code', 'fix this'])).toMatchObject({ command: 'code', prompt: 'fix this' });
expect(parseArgs(['gpu', 'analyze repo'])).toMatchObject({ command: 'gpu', prompt: 'analyze repo' });
expect(parseArgs(['vision', './photo.jpg', 'inspect'])).toMatchObject({ command: 'vision', filePath: './photo.jpg' });
```

- [ ] **Step 2: Implement local/default chat roles**

Mapping:

```text
wise "prompt"       -> role fast
wise fast "prompt"  -> role fast
wise code "prompt"  -> role code
wise rag "prompt"   -> role rag
wise gpu "prompt"   -> explicit GPU route using architect model unless `--model` overrides it
```

Before a remote GPU request, print to stderr:

```text
WISE² route: GPU host
```

Before local inference, print nothing unless `--verbose` is set.

- [ ] **Step 3: Implement vision requests without embedding secrets**

Read the image with `fs.readFile`, base64 encode bytes in memory, and call Ollama `/api/chat` with:

```ts
messages: [{ role: 'user', content: prompt || 'Analyze this image.', images: [base64Image] }]
```

Reject files larger than 20 MiB in v1 with `IMAGE_TOO_LARGE`.

- [ ] **Step 4: Implement model inventory**

Return:

```ts
type ModelInventory = {
  local: { reachable: boolean; models: string[] };
  gpu: { configured: boolean; reachable: boolean; models: string[] };
  roles: Record<RoleName, { backend: string; model: string; available: boolean }>;
};
```

Model inventory must not invoke cloud tools.

- [ ] **Step 5: Implement project summary without mutation**

Use `execFile('/usr/bin/git', ['rev-parse', '--show-toplevel'])`, `git branch --show-current`, and `git status --short`. If not in a repository, return `isGitRepo: false`; do not throw.

- [ ] **Step 6: Implement Hermes adapter conservatively**

In v1, support health/status using configured `hermesUrl`. Only add prompt execution if the actual Hermes API contract is verified in repository/runtime docs during implementation. If prompt contract is not verified, `wise hermes` must clearly state that Hermes is reachable but interactive prompt routing is not configured; do not invent an endpoint.

- [ ] **Step 7: Run tests/build**

```bash
pnpm --dir tools/ghostty test -- cli.test.ts ollama.test.ts
pnpm --dir tools/ghostty build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add tools/ghostty/src/backends/hermes.ts tools/ghostty/src/commands tools/ghostty/src/__tests__/cli.test.ts
git commit -m "feat(ghostty): add wise AI and project commands"
```

---

### Task 5: Implement `wise status` and `wise doctor`

**Files:**
- Create: `tools/ghostty/src/commands/status.ts`
- Create: `tools/ghostty/src/commands/doctor.ts`
- Create: `tools/ghostty/src/__tests__/status.test.ts`
- Create: `tools/ghostty/src/__tests__/doctor.test.ts`

**Interfaces:**
- Produces: `collectStatus(config, cwd): Promise<WiseStatus>`
- Produces: `runDoctor(config): Promise<DoctorReport>`

- [ ] **Step 1: Write failing status schema test**

```ts
it('returns stable machine-readable status fields', async () => {
  const status = await collectStatusForTest();
  expect(status).toHaveProperty('mac');
  expect(status).toHaveProperty('localOllama');
  expect(status).toHaveProperty('gpu');
  expect(status).toHaveProperty('controlBridge');
  expect(status).toHaveProperty('project');
  expect(status).not.toHaveProperty('controlBridgeToken');
});
```

- [ ] **Step 2: Implement status aggregation**

`WiseStatus` must contain:

```ts
{
  mac: { arch, totalMemoryBytes, usedMemoryPercent },
  localOllama: { reachable, url, models },
  gpu: { configured, reachable, url? },
  hermes: { configured, reachable },
  controlBridge: { configured, reachable },
  cloud: { claudeInstalled, codexInstalled },
  project: { isGitRepo, root?, branch?, dirty? }
}
```

Human output should be compact and use symbols only as decoration. `wise status --json` prints only JSON to stdout.

- [ ] **Step 3: Write failing doctor tests**

Check that a missing local Ollama returns a failed diagnostic with remediation text:

```ts
expect(report.checks.find(c => c.id === 'local-ollama')).toMatchObject({ ok: false });
expect(report.checks.find(c => c.id === 'local-ollama')?.remediation).toContain('ollama serve');
```

- [ ] **Step 4: Implement exact doctor checks**

Checks:

1. `process.arch === 'arm64'`.
2. Node major version >=20.
3. `ghostty` exists via `/usr/bin/which ghostty` or known app binary path.
4. `wise` package/config loads.
5. local Ollama responds.
6. configured local role models exist.
7. Tailscale exists and reports connected when GPU/control URLs use private/Tailscale routes.
8. GPU Ollama responds when configured.
9. Control Bridge health responds with authentication when configured.
10. Claude CLI installed when configured/used.
11. Codex CLI installed when configured/used.
12. config file and optional secret file permissions are not group/world-readable when they contain sensitive values.

- [ ] **Step 5: Run tests/build**

```bash
pnpm --dir tools/ghostty test -- status.test.ts doctor.test.ts
pnpm --dir tools/ghostty build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tools/ghostty/src/commands/status.ts tools/ghostty/src/commands/doctor.ts tools/ghostty/src/__tests__/status.test.ts tools/ghostty/src/__tests__/doctor.test.ts
git commit -m "feat(ghostty): add status and doctor diagnostics"
```

---

### Task 6: Add explicit Claude and Codex handoffs with no automatic cloud fallback

**Files:**
- Create: `tools/ghostty/src/backends/cloud.ts`
- Create: `tools/ghostty/src/commands/handoff.ts`
- Create: `tools/ghostty/src/__tests__/cloud.test.ts`

**Interfaces:**
- Produces: `handoff(tool: 'claude' | 'codex', cwd: string): Promise<number>`

- [ ] **Step 1: Write failing tests proving cloud is explicit**

```ts
it('never returns a cloud backend from normal routing', () => {
  const decision = resolveRoute('code', defaultConfig(), { localMemoryUsedPercent: 20 });
  expect(['local-ollama', 'gpu-ollama', 'hermes']).toContain(decision.backend);
});
```

```ts
it('launches claude with execFile/spawn and no shell', async () => {
  const launch = vi.fn();
  await handoffWithLauncher('claude', '/tmp/project', launch);
  expect(launch).toHaveBeenCalledWith('claude', [], expect.objectContaining({ cwd: '/tmp/project', stdio: 'inherit', shell: false }));
});
```

- [ ] **Step 2: Implement cloud handoff**

Use `spawn(tool, [], { cwd, stdio: 'inherit', shell: false })` for `claude` and `codex` only. Print before launch:

```text
WISE² cloud handoff: CLAUDE
```

or

```text
WISE² cloud handoff: CODEX
```

Do not automatically forward the previous local prompt or project files in v1.

- [ ] **Step 3: Run tests/build**

```bash
pnpm --dir tools/ghostty test -- cloud.test.ts router.test.ts
pnpm --dir tools/ghostty build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tools/ghostty/src/backends/cloud.ts tools/ghostty/src/commands/handoff.ts tools/ghostty/src/__tests__/cloud.test.ts
git commit -m "feat(ghostty): add explicit cloud handoffs"
```

---

### Task 7: Build the top-level `wise` CLI contract

**Files:**
- Create: `tools/ghostty/src/cli.ts`
- Modify: `tools/ghostty/src/__tests__/cli.test.ts`

**Interfaces:**
- Consumes all command modules from Tasks 1-6.
- Produces the installed `wise` binary.

- [ ] **Step 1: Add failing CLI dispatch tests**

Cover:

```text
wise "hello"
wise fast "hello"
wise code "review this"
wise vision ./photo.jpg "analyze"
wise rag "question"
wise gpu "deep analysis"
wise status
wise status --json
wise doctor
wise models
wise project
wise control status
wise control logs api 100
wise control restart api
wise control deploy hvac
wise control rollback hvac
wise handoff claude
wise handoff codex
```

Unknown commands exit code `2`; backend failures exit code `1`; success exits `0`.

- [ ] **Step 2: Implement parser without a heavy CLI framework**

Use `process.argv.slice(2)` and a small explicit parser to avoid unnecessary dependencies. Support global flags `--config`, `--json`, and `--verbose` before or after the command where practical.

- [ ] **Step 3: Add executable shebang and output discipline**

First line:

```ts
#!/usr/bin/env node
```

Rules:

- normal command result -> stdout;
- route labels/warnings -> stderr;
- `--json` -> machine-readable stdout only;
- secrets -> never output;
- stack traces -> only with `WISE2_DEBUG=1`.

- [ ] **Step 4: Run full CLI test/build**

```bash
pnpm --dir tools/ghostty test
pnpm --dir tools/ghostty build
node tools/ghostty/dist/cli.js --help
```

Expected: all tests PASS and help lists the documented command surface.

- [ ] **Step 5: Commit**

```bash
git add tools/ghostty/src/cli.ts tools/ghostty/src/__tests__/cli.test.ts
git commit -m "feat(ghostty): expose unified wise command"
```

---

### Task 8: Add Ghostty presentation, zsh integration, installer, and rollback

**Files:**
- Create: `tools/ghostty/config/ghostty.wise2.conf`
- Create: `tools/ghostty/config/zsh.wise2.zsh`
- Create: `tools/ghostty/scripts/install.sh`
- Create: `tools/ghostty/scripts/uninstall.sh`
- Create: `tools/ghostty/tests/install.bats`

**Interfaces:**
- Produces user executable: `~/.local/bin/wise`
- Produces config: `~/.config/wise2/config.yaml`
- Manages one marked include block in `~/.config/ghostty/config`
- Manages one marked source block in `~/.zshrc`

- [ ] **Step 1: Define Ghostty fragment with readability-first WISE² styling**

Use a compact fragment that sets a black/carbon background, cool light foreground, restrained green accent, readable selection colors, title behavior, and shell integration. Do not add large ASCII splash art.

The managed root config block must be exactly bounded by:

```text
# >>> WISE2 GHOSTTY >>>
config-file = ~/.config/wise2/ghostty.wise2.conf
# <<< WISE2 GHOSTTY <<<
```

- [ ] **Step 2: Define zsh fragment**

The managed `.zshrc` block must be:

```sh
# >>> WISE2 SHELL >>>
[ -f "$HOME/.config/wise2/zsh.wise2.zsh" ] && source "$HOME/.config/wise2/zsh.wise2.zsh"
# <<< WISE2 SHELL <<<
```

The sourced fragment may add `~/.local/bin` to PATH and lightweight completion, but must not replace the user's prompt unless `WISE2_PROMPT=1`.

- [ ] **Step 3: Write installer idempotency tests**

`install.bats` should run installer twice against a temporary HOME and assert exactly one Ghostty block and one zsh block exist after the second run.

- [ ] **Step 4: Implement installer**

Installer behavior:

1. `set -eu`.
2. Verify macOS and arm64; warn but do not destroy configuration on mismatch.
3. Run `pnpm --dir tools/ghostty build`.
4. Create timestamped backups of existing Ghostty config and `.zshrc` before first managed edit.
5. Copy `dist/` runtime plus a small launcher to `~/.local/share/wise2-ghostty/`.
6. Symlink `~/.local/bin/wise` to the installed CLI entry.
7. Copy example config to `~/.config/wise2/config.yaml` only when no config exists.
8. Copy Ghostty/zsh fragments.
9. Insert or replace only the marked managed blocks.
10. Run `wise doctor` at the end; installer itself succeeds if optional remote/cloud dependencies are missing, but prints diagnostic results.

- [ ] **Step 5: Implement uninstall/rollback**

Uninstaller removes only WISE² managed blocks, symlink, installed runtime, and generated fragments. It must preserve the user's existing config.yaml by default. Add `--restore-backup` to restore the most recent installer-created Ghostty and zsh backups.

- [ ] **Step 6: Run shell checks**

```bash
bash -n tools/ghostty/scripts/install.sh
bash -n tools/ghostty/scripts/uninstall.sh
command -v bats >/dev/null && bats tools/ghostty/tests/install.bats || true
```

Expected: syntax PASS; Bats PASS when installed.

- [ ] **Step 7: Commit**

```bash
git add tools/ghostty/config tools/ghostty/scripts tools/ghostty/tests
git commit -m "feat(ghostty): add terminal profile and mac installer"
```

---

### Task 9: Documentation, release packaging, and end-to-end verification

**Files:**
- Create: `tools/ghostty/scripts/package-release.sh`
- Create: `tools/ghostty/README.md`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `release/wise2-ghostty-command-center.zip`
- Produces: `release/wise2-ghostty-command-center.zip.sha256`

- [ ] **Step 1: Implement deterministic release packaging**

`package-release.sh` must:

1. run the complete test suite;
2. run the TypeScript build;
3. stage only tracked/runtime-required Ghostty files in a temporary directory;
4. create ZIP only after successful tests/build;
5. verify it with `unzip -t`;
6. reject a zero-byte archive;
7. write `shasum -a 256` output to the `.sha256` file.

- [ ] **Step 2: Add README quick start**

Document exactly:

```bash
pnpm install
pnpm --dir tools/ghostty test
bash tools/ghostty/scripts/install.sh
wise doctor
wise status
wise "hello"
wise code "review this repo"
wise gpu "deep architecture review"
wise control status
```

Also document config paths, Control Bridge token environment variable, local/GPU/cloud routing boundaries, uninstall, and recovery from a bad Ghostty config.

- [ ] **Step 3: Add generated release ignores**

Append:

```gitignore
/tools/ghostty/release/
```

Do not ignore source config, tests, or scripts.

- [ ] **Step 4: Run complete automated verification**

```bash
pnpm --dir tools/ghostty test
pnpm --dir tools/ghostty build
bash -n tools/ghostty/scripts/install.sh
bash -n tools/ghostty/scripts/uninstall.sh
bash -n tools/ghostty/scripts/package-release.sh
```

Expected: all commands succeed.

- [ ] **Step 5: Run M4 Mac manual verification**

On the target Mac:

```bash
wise doctor
wise status
wise models
wise "Reply with LOCAL_OK only"
wise code "Reply with CODE_OK only"
wise project
```

Verify local requests reach `127.0.0.1:11434` and no route label says GPU/cloud.

Then, with GPU configured:

```bash
wise gpu "Reply with GPU_OK only"
wise control health
wise control status
```

Verify GPU route is explicitly labeled and Control Bridge requests succeed without revealing the bearer token.

Then verify cloud is explicit:

```bash
wise handoff claude
# exit Claude
wise handoff codex
# exit Codex
```

No normal local/GPU failure may auto-launch either command.

- [ ] **Step 6: Build and verify release artifact**

```bash
bash tools/ghostty/scripts/package-release.sh
unzip -t tools/ghostty/release/wise2-ghostty-command-center.zip
shasum -a 256 tools/ghostty/release/wise2-ghostty-command-center.zip
cat tools/ghostty/release/wise2-ghostty-command-center.zip.sha256
```

Expected: ZIP integrity PASS and checksum values match.

- [ ] **Step 7: Commit documentation/package scripts**

```bash
git add tools/ghostty/README.md tools/ghostty/scripts/package-release.sh .gitignore
git commit -m "docs(ghostty): document and package command center"
```

---

## Final Verification Gate

Before declaring implementation complete, run:

```bash
pnpm --dir tools/ghostty test
pnpm --dir tools/ghostty build
bash -n tools/ghostty/scripts/install.sh
bash -n tools/ghostty/scripts/uninstall.sh
bash -n tools/ghostty/scripts/package-release.sh
```

Then run on the actual M4 Mac:

```bash
wise doctor
wise status
wise models
wise "LOCAL_VERIFY"
wise code "CODE_VERIFY"
wise gpu "GPU_VERIFY"
wise control health
```

Completion requires:

- local-first routing verified;
- GPU routing visibly identified;
- no automatic Claude/Codex escalation;
- Control Bridge operations use the existing API contract;
- no arbitrary SSH/shell proxy added;
- no secrets in stdout/stderr/history generated by the CLI;
- Ghostty and zsh managed blocks are idempotent;
- uninstall/restore works;
- tests/build pass;
- generated ZIP passes `unzip -t` and SHA-256 verification.
