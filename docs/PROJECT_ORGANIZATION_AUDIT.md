# Project Organization Audit

**Reviewed:** 2026-09-30  
**Scope:** Repository layout, workspace configuration, and the changes in [PR #105](https://github.com/dwise03-bit/wise2-core/pull/105). This is a structural audit; it does not certify project build or production status.

## Current inventory

| Area | Direct project directories | Intended role |
| --- | ---: | --- |
| `apps/` | 43 | Applications and product-specific clients |
| `packages/` | 27 | Shared libraries and contracts |
| `services/` | 30 | Standalone or deployable service projects |
| `clients/` | 3 | Client-specific deliverables |

The inventory includes heterogeneous projects; directory membership alone does not establish that a project is active, deployable, or safe to merge into another project.

### Applications

`action-dispatch`, `admin`, `api`, `ar-field-service`, `atak-radio-bridge`, `blakkhail-ios`, `cherry-count`, `command-center`, `dashboard`, `fergies-table`, `fieldtech-android`, `fieldtech-ios`, `getdown-demo`, `hvac-agent`, `jo-credit-os-demo`, `lexis-inks-demo`, `lil-lizzy`, `mobile-ios`, `musicgen-service`, `phone-agent`, `phone-gateway`, `pixel-slate`, `podcast-music`, `prompt-shop`, `quest-hvac-fieldtech`, `sencere-ios`, `sound-labs-ui`, `studio`, `trading-mobile`, `voice-synthesis-service`, `vr-workspace`, `website`, `wise-ai-assistant`, `wise-defense-edge`, `wise-hvac-demo`, `wise-imp-desktop`, `wise2-android`, `wise2-atak-plugin`, `wise2-command-center-ios`, `wise2-ios`, `wise2-me-capture-android`, `wise2-terminal-dashboard`, `wise2-xr`.

### Packages

`aether-trader`, `agent-framework`, `ai`, `ai-phone`, `api`, `api-gateway`, `api-keys`, `audio`, `auth`, `brand-lock`, `dashboard-shell`, `db`, `design-system`, `ops-protocol`, `reaper-domain`, `reaper-intelligence`, `reaper-providers`, `reaper-scoring`, `reaper-worker`, `shared`, `sync-engine`, `trading-engine`, `types`, `ui-components`, `wise2-hvac-contracts`, `wos-foundation`, `xiao-imps-firmware`.

### Services

`admin-backend`, `admin-dashboard`, `ai-orchestrator`, `api`, `auth-gateway`, `bot`, `control-bridge`, `control-relay`, `dashboard`, `demo`, `discord-bot`, `discord-ecosystem`, `edge-appliance`, `executive-agent`, `integration-tests`, `k10-api`, `knowledge-graph`, `memory-engine`, `mobile-config`, `ops-chain-tests`, `paperclip`, `quest-meta-sdk`, `rayban-meta-sdk`, `reaper-bridge`, `sound-labs`, `trading-bot`, `voice-assistant`, `wise-discord`, `wise2-ai-router`, `worker`.

## Findings

1. **Workspace definitions disagree.** `pnpm-workspace.yaml` includes every `apps/*` and `packages/*`, `tools/ghostty`, and only `services/reaper-bridge`, while excluding `apps/wise-imp-desktop`. Root `package.json` also declares an npm `workspaces` list containing only nine apps plus `packages/*`. The intended source of truth and the reason for the exclusions need to be explicit.
2. **The documented architecture conflicts.** `MONOREPO.md` describes `apps/` and `packages/` as the supported structure and says not to use `services/`; the current workspace includes one service, and 29 additional service directories exist outside that explicit service entry.
3. **The previous repository audit is stale.** `docs/REPOSITORY_AUDIT.md` describes six apps, 13 packages, and 18 services (dated 2026-07-23), compared with the current directory counts above.
4. **Several project families need ownership decisions before consolidation.** Examples include API code under `apps/api`, `packages/api`, and `services/api`; command-center code under `apps/command-center`, `apps/wise2-command-center-ios`, and root `wise2-command-center`; and multiple iOS, HVAC, and Discord projects. Their names suggest overlap, but this audit does not establish that they are duplicates.
5. **Root-level project material sits outside the main taxonomy.** Examples include `CJAYS/`, `wise-os/`, `wise-touch/`, `wise2-command-center/`, `discord-ecosystem/`, client/media/asset directories, and a large collection of root scripts and deployment files.
6. **PR #105 crossed project boundaries.** It changed 125 files in 22 commits across `apps/`, `packages/`, `services/`, `.github/`, and the repository root. Its changes span the trading dashboard/mobile/bot, field-tech Android, phone service, Sound Labs, and SenCere storefront. This makes ownership and review scope difficult to follow.
7. **Generated Gradle state was tracked.** There were 98 tracked files under `.gradle/`, including seven under `apps/fieldtech-android/.gradle/` changed by PR #105. These are local build caches, not project source. The root ignore rules now exclude `.gradle/`; the tracked cache files are removed in this audit.
8. **Ignored backup material remains tracked.** `/.lcd_diag_backup/` already has an ignore rule but is tracked. Its contents are deliberately left untouched until their provenance and retention requirements are reviewed.

## Organization decisions

- Keep current project paths unchanged in this pass. Moving or merging projects before confirming their owners, imports, CI path filters, deployment definitions, and release workflows could break existing consumers.
- Use `apps/` for products, `packages/` for reusable code, and `clients/` for customer-specific delivery as the preferred navigation model; record approved exceptions rather than silently adding more top-level project roots.
- Treat `services/` as an unresolved legacy/standalone area until maintainers decide whether services are supported workspace members or should be migrated. Do not add all services to the workspace based on directory names alone.
- Keep project-specific assets and generated outputs separate from source; do not delete tracked backup/output content without an explicit retention review.
- Keep future pull requests focused on one project or one shared cross-project change. If a change spans products, explain the dependency and review boundary in the PR description.

## Follow-up queue

1. Name maintainers and lifecycle status (active, experimental, archived) for each app, package, and service.
2. Decide whether pnpm or npm workspace metadata is authoritative, then reconcile the other file and document exclusions.
3. Resolve the service policy against the `MONOREPO.md` guidance and actual deployment/build workflows.
4. Trace imports, deployment references, and CI path filters before consolidating the API, command-center, mobile, HVAC, or Discord project families.
5. Review root-level scripts and project/asset directories with their owners; migrate only verified source and archive only material approved for retention.
6. Refresh or supersede stale repository structure and audit documentation after those decisions are made.
