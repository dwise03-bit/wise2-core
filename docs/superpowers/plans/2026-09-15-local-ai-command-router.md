# WISE² Local AI Command Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved WISE² Local AI web control layer inside Command Center with safe Mac↔GPU routing and live system controls.

**Architecture:** Extend `apps/command-center` with `/local-ai` and narrow server-side APIs. Browser UI consumes normalized status and action endpoints; machine-specific commands remain server-side and allowlisted. AUTO prefers safe Mac inference for normal jobs and offloads heavy/resource-constrained work to GPU-NMLS.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, existing WISE² UI components, Node child-process/fetch APIs, Ollama HTTP API, Tailscale/private GPU connectivity, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-15-local-ai-command-router-design.md`

## Global Constraints
- Preserve the approved WISE² UNITED Local AI visual baseline.
- Do not modify unrelated BLAKKHAIL or Fergie dirty-tree work.
- Never expose SSH credentials, API keys, tokens, or unrestricted shell execution to the browser.
- AUTO must not select `wise2-coder-m4:latest` on the 16 GB Mac.
- Local Ollama remains single-model/single-inference and unloads after use.
- GPU-NMLS traffic uses private/Tailscale infrastructure.

---

## File map
- `app/local-ai/page.tsx`: Local AI dashboard route.
- `app/local-ai/local-ai.css`: page-specific approved visual treatment.
- `app/api/local-ai/status/route.ts`: normalized health endpoint.
- `app/api/local-ai/route/route.ts`: bounded routing/execution endpoint.
- `app/api/local-ai/action/route.ts`: allowlisted maintenance endpoint.
- `app/api/local-ai/logs/route.ts`: sanitized capped logs.
- `src/lib/local-ai/types.ts`: shared contracts.
- `src/lib/local-ai/router.ts`: routing policy only.
- `src/lib/local-ai/system.ts`: server-only probes/actions.
- `src/lib/local-ai/sanitize.ts`: log/error redaction.
- `src/lib/local-ai/*.test.ts`: policy, safety, sanitization tests.
### Task 1: Routing contracts and policy

**Files:**
- Create: `apps/command-center/src/lib/local-ai/types.ts`
- Create: `apps/command-center/src/lib/local-ai/router.ts`
- Test: `apps/command-center/src/lib/local-ai/router.test.ts`

**Interfaces:**
- Produces: `RouteMode = 'auto' | 'local' | 'gpu'`, `SystemSnapshot`, `RouteDecision`, `chooseRoute(request, snapshot)`.

- [ ] Write failing Vitest cases proving AUTO selects `qwen2.5-coder:7b` for normal coding, GPU for heavy requests, and GPU when Mac memory pressure is high.
- [ ] Run `cd apps/command-center && npx vitest run src/lib/local-ai/router.test.ts` and confirm RED.
- [ ] Implement pure `chooseRoute` with no shell/network side effects and explicit LOCAL/GPU overrides.
- [ ] Re-run the focused test and confirm GREEN.
- [ ] Commit only Task 1 files with `feat(local-ai): add safe routing policy`.

### Task 2: Safe system adapter

**Files:**
- Create: `apps/command-center/src/lib/local-ai/system.ts`
- Create: `apps/command-center/src/lib/local-ai/sanitize.ts`
- Test: `apps/command-center/src/lib/local-ai/system.test.ts`
- Test: `apps/command-center/src/lib/local-ai/sanitize.test.ts`

**Interfaces:**
- Produces: `getSystemSnapshot()`, `runAllowlistedAction(action)`, `executeLocal(prompt, model)`, `executeGpu(prompt, model)`, `sanitizeText(text)`.

- [ ] Write failing tests proving unknown actions are rejected and credential-like log values are redacted.
- [ ] Run the focused system/sanitize tests and confirm RED.
- [ ] Implement probes with fixed executable/argument arrays; do not interpolate browser input into shell commands.
- [ ] Implement GPU calls only through configured private endpoint/transport and cap command/API timeouts.
- [ ] Re-run focused tests and confirm GREEN.
- [ ] Commit Task 2 files with `feat(local-ai): add guarded system adapter`.
### Task 3: Server API boundary

**Files:**
- Create: `apps/command-center/app/api/local-ai/status/route.ts`
- Create: `apps/command-center/app/api/local-ai/route/route.ts`
- Create: `apps/command-center/app/api/local-ai/action/route.ts`
- Create: `apps/command-center/app/api/local-ai/logs/route.ts`
- Test: `apps/command-center/app/api/local-ai/local-ai-api.test.ts`

**Interfaces:**
- `GET status -> SystemSnapshot`
- `POST route { prompt, mode, workload } -> { decision, output }`
- `POST action { action } -> { ok, message }`
- `GET logs -> { lines: string[] }`

- [ ] Write failing route-handler tests for valid requests, malformed payloads, unsupported actions, timeout responses, and sanitized errors.
- [ ] Run the API test and confirm RED.
- [ ] Implement strict payload length/enums and call only Task 2 interfaces.
- [ ] Ensure no endpoint accepts arbitrary executable names, shell text, hostnames, paths, or environment keys.
- [ ] Re-run API tests and confirm GREEN.
- [ ] Commit Task 3 files with `feat(local-ai): expose guarded control api`.

### Task 4: Approved Command Router UI

**Files:**
- Create: `apps/command-center/app/local-ai/page.tsx`
- Create: `apps/command-center/app/local-ai/local-ai.css`
- Test: `apps/command-center/app/local-ai/page.test.tsx`

**Interfaces:**
- Consumes the four Task 3 endpoints only.

- [ ] Write a failing render test for header health chips, AUTO/LOCAL/GPU controls, model cards, ROUTE/OBSERVE/ACT panels, resource monitor, loaded models, and quick actions.
- [ ] Run the page test and confirm RED.
- [ ] Implement the page to match the locked visual: chrome identity, black/charcoal, cyan structure, neon-green health, industrial panels, responsive desktop/mobile layout.
- [ ] Add polling with a conservative interval and pause/reduce polling when the tab is hidden.
- [ ] Add explicit confirmation for cleanup/stop actions and visible failure states.
- [ ] Re-run the page test and confirm GREEN.
- [ ] Commit Task 4 files with `feat(local-ai): build command router dashboard`.
### Task 5: Navigation, integration, and verification

**Files:**
- Modify: existing Command Center navigation component that owns dashboard links, identified during implementation before editing.
- Modify: `apps/command-center/.env.example` only if new non-secret endpoint names are required.
- Test: existing Command Center suite plus Local AI focused tests.

**Interfaces:**
- Produces a discoverable `/local-ai` route without changing existing dashboard behavior.

- [ ] Locate the canonical navigation component and add one `Local AI` link; do not duplicate navigation structures.
- [ ] Run `npm run type-check` in `apps/command-center` and resolve only Local AI regressions.
- [ ] Run `npm test -- --run` and record exact pass/fail counts.
- [ ] Run the app/build command supported by the existing package scripts and record exit status.
- [ ] Start Command Center locally and verify `/local-ai`, `/api/local-ai/status`, LOCAL execution, GPU execution, Stop Models, Diagnostics, and sanitized logs.
- [ ] Verify `ollama ps` is empty after idle/stop and Mac memory has zero throttled pages.
- [ ] Run `git status --short` and confirm unrelated pre-existing BLAKKHAIL/Fergie files were not modified by this feature.
- [ ] Commit integration files with `feat(local-ai): integrate command router`.

## Final verification gate
- [ ] Run all Local AI Vitest tests together with zero failures.
- [ ] Run Command Center type-check with zero Local AI errors.
- [ ] Verify both Mac and GPU routes with a deterministic `Reply exactly:` prompt.
- [ ] Verify malformed action/route requests cannot execute arbitrary commands.
- [ ] Verify returned status/log payloads contain no credentials or environment secrets.
- [ ] Compare rendered `/local-ai` against the approved visual reference at desktop width and correct material layout deviations before deployment.
- [ ] Deploy only after all gates above pass, then verify the production URL and health endpoint from outside the development process.
