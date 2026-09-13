# WISE² Command Shell Level-Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Daniel's M4 WISE² shell into a single accurate, local-first, diagnosable operator console with idempotent startup, correct Ollama state, remote health visibility, compatibility commands, and reversible installation.

**Architecture:** Extend the approved WISE² Ghostty architecture rather than introducing another shell. Build a canonical `wise` command backed by small status adapters; keep `wise2-*` commands as compatibility shims; derive the startup banner from the same normalized health layer used by `wise status` and `wise doctor`.

**Tech Stack:** macOS zsh, POSIX shell utilities, curl, jq when available with safe fallback, Ollama HTTP API, Tailscale CLI, Git, existing WISE² Control Bridge/Hermes interfaces.

**Spec:** `docs/superpowers/specs/2026-09-12-wise2-command-shell-level-up-design.md`

## Global Constraints

- Preserve working WISE² functionality and existing user configuration.
- Do not overwrite uncommitted work.
- No secrets in Git, status output, logs, or shell history.
- AUTO is local-first and must never silently escalate to Claude/Codex.
- Privileged remote operations remain behind the existing Control Bridge allowlist.
- Remote health checks use bounded timeouts and cannot block local shell startup.
- Existing `wise2-*` commands remain available until behavior is mapped and verified.
- Installation and upgrade are idempotent and reversible.

---

### Task 1: Reproduce and Map Existing Shell State

**Files:**
- Inspect: `scripts/wise2-ghostty.zsh`
- Inspect: `scripts/setup-mac-local-models.sh`
- Inspect: existing shell/CLI installers and tests discovered by repository search
- Create: `docs/operations/WISE2_COMMAND_SHELL_BASELINE.md`

**Interfaces:**
- Consumes: current repository and Mac shell state.
- Produces: exact source-chain map, current command locations, model-count data source, and reproducible failure evidence.

- [ ] **Step 1:** Record `git status --short`, current branch, and relevant recent commits; stop if another developer's uncommitted work would be overwritten.
- [ ] **Step 2:** Search repository for `WISE² M4 Configuration Loaded`, `Models in memory`, `LOCAL AI`, `wise2-dashboard`, `wise2-status`, `wise2-ai`, and `wise2-alerts` and record exact defining files.
- [ ] **Step 3:** On the M4, inspect `.zshrc`, `.zprofile`, Ghostty config, and sourced WISE² files without printing secrets; record duplicate source paths.
- [ ] **Step 4:** Capture Ollama `/api/version`, `/api/tags`, `/api/ps`, and `ollama list` counts and compare them with shell output.
- [ ] **Step 5:** Write `WISE2_COMMAND_SHELL_BASELINE.md` containing confirmed causes/evidence, not hypotheses.
- [ ] **Step 6:** Commit only the baseline document.

### Task 2: Add Normalized Ollama Model-State Adapter

**Files:**
- Create: `scripts/wise2/lib/ollama.zsh`
- Create: `scripts/wise2/tests/test-ollama.zsh`

**Interfaces:**
- Produces: `wise2_ollama_status`, `wise2_ollama_installed_models`, `wise2_ollama_loaded_models`, and normalized status fields consumed by status/models/doctor.

- [ ] **Step 1:** Write fixtures/tests for healthy service with installed+loaded models, healthy service with zero loaded models, tags failure, ps failure, and service unavailable.
- [ ] **Step 2:** Run tests and verify failure before implementation.
- [ ] **Step 3:** Implement HTTP queries with short connect/request timeouts and distinguish unavailable, unknown, zero, and positive counts.
- [ ] **Step 4:** Ensure `/api/ps` failure returns loaded=`unknown`, never loaded=`0`.
- [ ] **Step 5:** Run adapter tests and shell syntax checks.
- [ ] **Step 6:** Commit adapter and tests.

### Task 3: Add macOS Host Health Adapter and Memory Guardrails

**Files:**
- Create: `scripts/wise2/lib/macos.zsh`
- Create: `scripts/wise2/tests/test-macos.zsh`

**Interfaces:**
- Produces: host architecture, memory percentage, memory pressure state, swap summary, storage, battery/power state, and `wise2_memory_route_policy`.

- [ ] **Step 1:** Add tests for NORMAL, WARN, and CRITICAL normalized pressure decisions using fixtures/mocked command output.
- [ ] **Step 2:** Verify tests fail.
- [ ] **Step 3:** Implement host metrics using macOS-native read-only commands and parse them into stable normalized fields.
- [ ] **Step 4:** Implement route policy: NORMAL permits local; WARN avoids another large local load; CRITICAL blocks automatic large local launch; neither state permits automatic cloud escalation.
- [ ] **Step 5:** Run tests and syntax checks.
- [ ] **Step 6:** Commit.

### Task 4: Add Remote and Project Health Adapters

**Files:**
- Create: `scripts/wise2/lib/remote.zsh`
- Create: `scripts/wise2/lib/project.zsh`
- Create: `scripts/wise2/tests/test-remote.zsh`
- Create: `scripts/wise2/tests/test-project.zsh`

**Interfaces:**
- Produces normalized health for Tailscale, configured GPU endpoint, Hermes, Control Bridge, Discord/alerts, and current Git project.

- [ ] **Step 1:** Add tests showing each remote dependency can time out/fail independently without failing aggregate status.
- [ ] **Step 2:** Verify tests fail.
- [ ] **Step 3:** Implement Tailscale and endpoint checks with bounded timeouts; redact credential-bearing values.
- [ ] **Step 4:** Reuse existing Control Bridge and alert status contracts discovered in Task 1 rather than introducing unrestricted SSH operations.
- [ ] **Step 5:** Implement Git root, branch, and dirty/clean state detection.
- [ ] **Step 6:** Run tests and commit.

### Task 5: Implement Canonical `wise models`, `wise status`, and JSON Schema

**Files:**
- Create: `scripts/wise2/wise`
- Create: `scripts/wise2/lib/render.zsh`
- Create: `scripts/wise2/tests/test-status.zsh`
- Create: `scripts/wise2/tests/test-models.zsh`

**Interfaces:**
- Consumes: adapters from Tasks 2-4.
- Produces: `wise models`, `wise status`, `wise status --json`.

- [ ] **Step 1:** Add failing tests that require Installed, Loaded, Configured, and Healthy model concepts to remain separate.
- [ ] **Step 2:** Add failing JSON tests requiring stable top-level keys: `host`, `local_ai`, `routing`, `network`, `remote`, `alerts`, `project`.
- [ ] **Step 3:** Implement command parser and model/status renderers.
- [ ] **Step 4:** Ensure healthy Ollama with zero resident models renders `READY · 0 LOADED`, never `0 MODELS`.
- [ ] **Step 5:** Validate JSON with `jq -e .` when jq is installed and a fallback parser/test otherwise.
- [ ] **Step 6:** Run tests and commit.

### Task 6: Implement `wise doctor`

**Files:**
- Create: `scripts/wise2/lib/doctor.zsh`
- Create: `scripts/wise2/tests/test-doctor.zsh`
- Modify: `scripts/wise2/wise`

**Interfaces:**
- Produces: `wise doctor` and `wise doctor --json` with pass/warn/fail checks and safe remediation text.

- [ ] **Step 1:** Add failing tests for duplicate loader, Ollama down, missing configured model, disconnected Tailscale, unavailable GPU, bad config permissions, and healthy system.
- [ ] **Step 2:** Verify tests fail.
- [ ] **Step 3:** Implement deterministic checks listed in the spec; doctor remains read-only by default.
- [ ] **Step 4:** Ensure remediation never prints secrets or suggests bypassing Control Bridge.
- [ ] **Step 5:** Run tests and commit.

### Task 7: Fix Startup Duplication and Render the Upgraded Banner

**Files:**
- Create or Modify: exact loader file discovered in Task 1
- Modify: `scripts/wise2-ghostty.zsh`
- Create: `scripts/wise2/tests/test-startup.zsh`

**Interfaces:**
- Consumes: canonical status layer.
- Produces: one idempotent initialization and compact startup banner.

- [ ] **Step 1:** Add regression test reproducing the confirmed duplicate-source path from Task 1.
- [ ] **Step 2:** Verify test fails.
- [ ] **Step 3:** Add shell-scoped initialization guard and remove only the confirmed duplicate managed source path.
- [ ] **Step 4:** Render compact banner using fast local checks; defer slower remote details to `wise status`.
- [ ] **Step 5:** Verify sourcing loader twice produces one banner and no duplicated environment mutation.
- [ ] **Step 6:** Commit.

### Task 8: Implement Routing Modes and Local-First AI Commands

**Files:**
- Create: `scripts/wise2/lib/routes.zsh`
- Create: `scripts/wise2/tests/test-routes.zsh`
- Modify: `scripts/wise2/wise`

**Interfaces:**
- Produces: AUTO/LOCAL/GPU/CLOUD mode inspection plus `wise ai`, `fast`, `code`, `vision`, `rag`, `gpu`, `hermes`, and explicit handoff routing.

- [ ] **Step 1:** Add tests proving AUTO chooses local when healthy, can choose approved GPU fallback, and never chooses cloud automatically.
- [ ] **Step 2:** Add tests proving LOCAL/GPU/CLOUD explicit modes obey user selection and route labels are visible.
- [ ] **Step 3:** Implement role configuration separately from concrete model tags.
- [ ] **Step 4:** Integrate Task 3 memory guardrails without silently invoking cloud.
- [ ] **Step 5:** Quote all prompt/file arguments safely and run injection tests.
- [ ] **Step 6:** Run tests and commit.

### Task 9: Preserve Existing Commands Through Compatibility Shims

**Files:**
- Modify/Create exact `wise2-*` command files discovered in Task 1
- Create: `scripts/wise2/tests/test-compat.zsh`

**Interfaces:**
- Produces compatibility mappings for `wise2-status`, `wise2-dashboard`, `wise2-ai`, and `wise2-alerts` without discarding any broader confirmed behavior.

- [ ] **Step 1:** Snapshot/test existing observable behavior.
- [ ] **Step 2:** Add compatibility tests for canonical mappings.
- [ ] **Step 3:** Replace duplicated status/model logic with calls into canonical `wise` where behavior matches.
- [ ] **Step 4:** Preserve extra legacy behavior until explicitly migrated.
- [ ] **Step 5:** Run tests and commit.

### Task 10: Build Safe Installer, Upgrade, and Rollback

**Files:**
- Create: `scripts/wise2/install.zsh`
- Create: `scripts/wise2/uninstall.zsh`
- Create: `scripts/wise2/tests/test-install.zsh`

**Interfaces:**
- Produces idempotent managed shell installation, timestamped backup, PATH setup, and rollback.

- [ ] **Step 1:** Add tests using temporary HOME directories for first install, second install, existing unrelated `.zshrc` content, and uninstall restore.
- [ ] **Step 2:** Verify tests fail.
- [ ] **Step 3:** Implement managed-block/source-file installation without replacing unrelated config.
- [ ] **Step 4:** Create timestamped backups before edits and strict permissions where required.
- [ ] **Step 5:** Run installer twice in fixture HOME and prove no duplicate source lines appear.
- [ ] **Step 6:** Run uninstall/rollback fixture and prove unrelated config remains intact.
- [ ] **Step 7:** Commit.

### Task 11: Full Automated Verification

**Files:**
- Create: `scripts/wise2/tests/run-all.zsh`
- Modify: relevant docs if actual commands differ from spec due to confirmed existing contracts.

**Interfaces:**
- Produces one deterministic test entry point.

- [ ] **Step 1:** Build runner covering every test suite from Tasks 2-10.
- [ ] **Step 2:** Run `zsh -n` against all new/modified zsh files.
- [ ] **Step 3:** Run the complete test suite and capture results.
- [ ] **Step 4:** Search output/source for accidental secret/token exposure patterns without printing secret values.
- [ ] **Step 5:** Run Git diff review and confirm only intended files changed.
- [ ] **Step 6:** Commit verification runner/docs.

### Task 12: M4 Installation and Live Verification

**Files:**
- Update: `docs/operations/WISE2_COMMAND_SHELL_BASELINE.md`
- Create: `docs/operations/WISE2_COMMAND_SHELL_RUNBOOK.md`

**Interfaces:**
- Consumes tested repository implementation.
- Produces verified live M4 installation and operator runbook.

- [ ] **Step 1:** Back up current Mac managed shell configuration and record pre-install state.
- [ ] **Step 2:** Install the tested WISE² shell package on Daniel's M4.
- [ ] **Step 3:** Open/source a fresh shell and verify the banner appears once.
- [ ] **Step 4:** Run `wise doctor`, `wise models`, `wise status`, and `wise status --json`.
- [ ] **Step 5:** Compare installed/loaded counts against live Ollama APIs and CLI.
- [ ] **Step 6:** Run local fast and coding prompts and confirm local endpoint use.
- [ ] **Step 7:** Test explicit GPU route, then temporarily test remote-unavailable behavior without modifying production services.
- [ ] **Step 8:** Verify compatibility commands.
- [ ] **Step 9:** Verify no credentials appear in output/history and rollback command is available.
- [ ] **Step 10:** Update baseline/runbook with verified results, remaining warnings, exact rollback procedure, and synchronization notes.
- [ ] **Step 11:** Commit documentation only after live verification evidence is captured.

### Task 13: Final Synchronization Review

**Files:**
- Review all changed files and repository state.

**Interfaces:**
- Produces a clean, reviewable implementation ready for integration.

- [ ] **Step 1:** Compare implementation against every requirement in the approved spec.
- [ ] **Step 2:** Run complete automated suite again.
- [ ] **Step 3:** Run `wise doctor` and `wise status` on the M4 again.
- [ ] **Step 4:** Confirm repository branch/worktree has no unintended changes.
- [ ] **Step 5:** Record final commit SHA and deployment/install state.
- [ ] **Step 6:** Request code review before merging/integrating the implementation branch.
