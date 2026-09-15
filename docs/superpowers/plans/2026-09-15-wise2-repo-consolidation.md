# WISE² Repository Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove API ownership ambiguity, restore reliable workspace testing, reduce local disk pressure, and put Consultant Audit OS on the canonical WISE² backend.

**Architecture:** `packages/api` remains the authoritative HTTP/API boundary, matching the existing WOS architecture decision. `services/api` becomes explicitly legacy until its unique routes are migrated; it must no longer share the `@wise2/api` package identity. Active code stays in workspaces, generated artifacts stay out of Git, and cleanup never deletes secrets, source, client assets, or uncommitted work.

**Tech Stack:** pnpm 8, Turbo, NestJS 10, Jest 29, TypeScript 5, Prisma, Git worktrees.

**Spec:** `docs/wos/WOS-V1-ARCHITECTURE.md` plus the user-approved consolidation design from 2026-09-15.

## Global Constraints

- Never modify `main` directly.
- Preserve unrelated uncommitted work on Mac and GPU machines.
- Do not print or commit secret values.
- `packages/api` is canonical; `services/api` is legacy until migrated.
- Tests must actually discover and execute test files; `--passWithNoTests` is not verification.
- Delete only regenerable caches/build outputs during disk cleanup.

---

### Task 1: Remove API package identity collision

**Files:**
- Modify: `services/api/package.json`
- Modify: `docs/wos/WOS-V1-ARCHITECTURE.md`
- Create: `docs/architecture/API_OWNERSHIP.md`

**Interfaces:**
- Produces: unique package identities `@wise2/api` and `@wise2/legacy-express-api`.

- [ ] Verify the duplicate with a package-name inventory script.
- [ ] Rename only the legacy package identity; do not move routes yet.
- [ ] Add an ownership document naming canonical, legacy, UI, database, and deployment boundaries.
- [ ] Re-run the inventory and require zero duplicate package names.
- [ ] Commit as `chore: clarify canonical api ownership`.

### Task 2: Move Consultant Audit engine to canonical API

**Files:**
- Create: `packages/api/src/consulting/consultant-audit.engine.ts`
- Create: `packages/api/src/consulting/consultant-audit.engine.spec.ts`
- Remove after port: `services/api/src/services/consulting-audit.ts`
- Remove after port: `services/api/src/services/__tests__/consulting-audit.test.ts`

**Interfaces:**
- Produces: `scoreAudit`, `detectRevenueLeaks`, `mapWise2Solutions`, `buildAuditXRay`.

- [ ] Write/port the Jest specification beside the canonical Nest consulting module.
- [ ] Run the exact spec and verify Jest reports five executed tests.
- [ ] Port the minimal engine implementation.
- [ ] Run the exact spec and require PASS.
- [ ] Run `pnpm --filter @wise2/api type-check`.
- [ ] Remove the branch-only copies from legacy `services/api`.
- [ ] Commit as `feat: move consultant audit xray to canonical api`.

### Task 3: Harden workspace and generated-artifact policy

**Files:**
- Modify: `.gitignore`
- Modify: `pnpm-workspace.yaml` only if inventory proves an active package is unintentionally excluded.
- Create: `scripts/repo-health.sh`

**Interfaces:**
- Produces: one non-destructive repo health command that checks duplicate package names, tracked generated outputs, disk free space, and worktree status.

- [ ] Add a failing shell health check for duplicate package identities and tracked build/cache output.
- [ ] Extend ignore rules for generated outputs not already covered, without ignoring source directories.
- [ ] Verify `scripts/repo-health.sh` exits zero on the feature worktree.
- [ ] Run canonical API test and type-check again.
- [ ] Commit as `chore: add wise2 repository health guardrails`.

### Task 4: Recover Mac development space safely

**Files:** No tracked source files.

- [ ] Record filesystem free space and Git worktree status before cleanup.
- [ ] Inventory regenerable `.next`, `.turbo`, build caches, stale worktrees, and package-manager caches.
- [ ] Remove only regenerable caches and stale worktrees that contain no unique uncommitted work.
- [ ] Prune package-manager caches only if still needed.
- [ ] Record free space after cleanup and verify the main working tree is unchanged.

### Task 5: Verify consolidation baseline

- [ ] Run `scripts/repo-health.sh`.
- [ ] Run the Consultant Audit engine spec and confirm the test count.
- [ ] Run `pnpm --filter @wise2/api type-check`.
- [ ] Run `git status --short` and inspect every changed file.
- [ ] Document remaining `services/api` migration references as follow-up inventory rather than mass-moving unverified runtime code.
- [ ] Commit the plan/status documentation.
