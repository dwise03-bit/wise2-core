# WISE² Command Shell Level-Up Design

Date: 2026-09-12
Status: Approved design, implementation pending
Owner: WISE²
Repository: dwise03-bit/wise2-core

## Objective

Upgrade Daniel's WISE² Command Shell on the M4 Mac from a collection of partially overlapping startup/status helpers into a reliable operator console that accurately reports local AI state, avoids duplicate initialization, preserves local-first AI routing, exposes diagnostics, and stays synchronized with the existing WISE² Ghostty/Command Center architecture.

This is an extension of the approved 2026-08-30 WISE² Ghostty Command Center design, not a parallel shell system.

## Current Evidence

Observed shell output shows:

- WISE² M4 configuration banner printed twice during shell startup.
- A startup summary reports `Models in memory: 2`.
- The WISE² command shell later reports `LOCAL AI READY · 0 MODELS`.
- Memory is reported around 81-85% on the 16 GB M4.
- Existing shortcuts include `wise2-dashboard`, `wise2-status`, `wise2-ai`, and `wise2-alerts`.

Existing repository implementation includes `scripts/wise2-ghostty.zsh`, which provides basic repository discovery, terminal safety, model setup, SSH wrapping, and lightweight repo status, but it does not yet implement the full approved `wise` operator surface.

## Goals

1. Fix misleading model counts by separating installed, configured, loaded, and healthy model state.
2. Eliminate duplicate WISE² shell initialization and make startup idempotent.
3. Preserve compatibility with existing `wise2-*` commands while standardizing on a single `wise` CLI.
4. Add a reliable aggregate status view for Mac, local AI, Tailscale, VPS/GPU, Control Bridge, Hermes, Discord/alerts, and Git project state.
5. Add `wise doctor` diagnostics with safe remediation guidance.
6. Enforce the approved local-first AI routing policy and prevent silent cloud escalation.
7. Add memory-pressure guardrails appropriate for an M4 Mac with 16 GB unified memory.
8. Improve the visual terminal experience without obscuring logs or command output.
9. Make installation, upgrade, and rollback safe, idempotent, and reversible.
10. Verify behavior with automated and manual tests before production use.

## Non-Goals

- Do not replace Ollama, Tailscale, Hermes, Control Bridge, or existing WISE² services.
- Do not introduce a second remote-control path that bypasses Control Bridge policy.
- Do not automatically install or invoke paid/cloud AI services.
- Do not expose API keys, bearer tokens, SSH keys, or credentials in output or Git.
- Do not overwrite unrelated `.zshrc`, Ghostty, or user configuration.
- Do not treat high memory usage alone as a failure; use macOS memory pressure and swap context.

## Architecture

```text
Ghostty / macOS Terminal
        |
        v
  WISE² startup loader
        |
        +-- idempotent init guard
        +-- managed PATH/config loading
        +-- compact startup summary
        |
        v
      `wise`
        |
        +-- status
        +-- doctor
        +-- models
        +-- routes
        +-- ai / fast / code / vision / rag
        +-- gpu / hermes
        +-- control
        +-- alerts
        +-- project
        +-- handoff claude|codex
        |
        +-- local Ollama adapter
        +-- remote GPU Ollama/Hermes adapter
        +-- Control Bridge client
        +-- Git/project adapter
        +-- Tailscale connectivity adapter
        +-- macOS health adapter
```

The existing `wise2-*` commands remain compatibility shims that call canonical `wise` commands.

## Shell Startup

### Idempotent initialization

A shell-scoped guard prevents duplicate initialization when multiple shell files source the same WISE² loader.

Example behavior:

```text
if already initialized in this shell:
  return without printing or reconfiguring
else:
  initialize once
```

The implementation must inspect `.zshrc`, `.zprofile`, Ghostty startup commands, and any WISE² sourced files to determine why the banner currently appears twice before changing anything.

### Startup summary

Default startup output stays compact:

```text
◈ WISE² COMMAND CENTER // DANIEL'S M4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● CORE        ONLINE
● LOCAL AI    READY
  INSTALLED   8
  LOADED      2
● ROUTE       AUTO → LOCAL
● MEMORY      81% · PRESSURE NORMAL
● STORAGE     52%
● TAILSCALE   CONNECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
wise status   Full system state
wise doctor   Diagnose issues
wise models   Models + routing
```

Startup checks must use short timeouts so a slow VPS or network does not delay opening a shell.

## Local AI State Model

The shell must stop using a single ambiguous `MODELS` count.

Definitions:

- **Installed**: model tags returned by local Ollama `/api/tags` or equivalent CLI query.
- **Loaded**: models currently resident according to local Ollama `/api/ps`.
- **Configured**: model tags referenced by WISE² role routing configuration.
- **Healthy**: configured model exists and its backend is reachable.

`wise models` displays all four concepts separately.

If Ollama is healthy but no model is resident, status should say `READY · 0 LOADED`, not `0 MODELS`.

## Canonical Command Surface

```text
wise status [--json]
wise doctor [--json]
wise models
wise routes
wise ai "<prompt>"
wise fast "<prompt>"
wise code "<prompt>"
wise vision <file> [prompt]
wise rag "<prompt>"
wise gpu "<prompt>"
wise hermes "<prompt>"
wise control <action>
wise alerts [status|test]
wise project
wise handoff claude
wise handoff codex
```

Compatibility aliases:

```text
wise2-status      -> wise status
wise2-dashboard   -> wise status
wise2-ai          -> wise ai
wise2-alerts      -> wise alerts
```

Existing commands that already have broader behavior must be preserved until their behavior is explicitly mapped and tested.

## Routing Policy

Modes:

- **AUTO**: local first; route to WISE² GPU only when policy permits or resource thresholds require it; never silently route to cloud.
- **LOCAL**: force local Ollama.
- **GPU**: force the private WISE² GPU/Ollama/Hermes route.
- **CLOUD**: explicit user-selected cloud route only.

Default remains AUTO.

The active route is visible in status and before a prompt leaves the Mac.

## M4 Memory Guardrails

Do not use raw percentage alone to decide routing. Evaluate:

- macOS memory pressure state;
- swap usage/trend where practical;
- currently loaded Ollama models;
- target model class/size;
- user-selected route.

Policy:

- NORMAL pressure: allow standard local roles.
- WARN pressure: avoid loading another large local model; prefer unloading/expiry or GPU route.
- CRITICAL pressure: block automatic large local launches and recommend/route to GPU according to policy.

No automatic cloud escalation is permitted due to memory pressure.

## `wise status`

The human-readable status view includes:

- host name and architecture;
- macOS version where useful;
- CPU/Apple Silicon identification;
- memory usage plus pressure state;
- swap summary;
- storage usage;
- battery percentage and power state;
- local Ollama reachability/version;
- installed and loaded model counts;
- configured role models and availability;
- active AI route mode;
- Tailscale connectivity;
- configured VPS/GPU reachability;
- Hermes health when configured;
- Control Bridge health;
- Discord/alert integration health without exposing tokens;
- current project/repository, branch, and dirty/clean state.

`wise status --json` returns a stable machine-readable schema for future Command Center UI, Discord bot, mobile, and automation reuse.

## `wise doctor`

Checks:

1. WISE² loader sourced exactly once.
2. `wise` available on PATH.
3. Shell architecture is arm64 on the M4.
4. Local Ollama reachable.
5. Installed models query succeeds.
6. Configured role models exist.
7. Loaded-model query succeeds.
8. Local routing configuration parses.
9. Tailscale installed/connected when remote routes are enabled.
10. GPU endpoint reachable when configured.
11. Hermes endpoint/process reachable when configured.
12. Control Bridge reachable/authenticated without printing credentials.
13. Alert/Discord integration configuration present and testable without exposing secrets.
14. Git repository state readable.
15. Claude/Codex availability reported only as optional explicit handoff targets.
16. Managed config file permissions are safe.
17. Duplicate WISE² source statements detected.

Each failed check should include a safe next action where deterministic. Doctor does not perform destructive repair by default.

## Status Adapter Boundaries

Each status source is isolated behind a small adapter with a strict timeout and normalized result:

```text
state: healthy | warning | error | disabled | unknown
label: concise human text
latency_ms: optional
metadata: non-secret structured details
```

One failed remote adapter must not break the whole status command.

## Error Handling

- Local Ollama down: report unavailable; do not pretend zero models means healthy.
- `/api/tags` fails but service responds: distinguish discovery failure from service failure.
- `/api/ps` unsupported/fails: show loaded state as unknown, not zero.
- Tailscale disconnected: local features remain available.
- GPU unreachable: explicit GPU requests fail clearly; AUTO remains local where capable.
- Control Bridge unavailable: never substitute unrestricted remote shell execution.
- Discord/alerts unhealthy: status reports it; no secret values are printed.
- Config parse error: fail closed to safe local behavior and show file/location.
- Network checks use bounded timeouts and no infinite retry loop.

## Security

- Never print secrets or full credential-bearing URLs.
- Never commit local secret files.
- Use quoted argument handling; never interpolate user prompts into shell command strings.
- Preserve Control Bridge allowlists for privileged operations.
- Keep cloud handoff explicit and visibly labeled.
- Back up configuration before any managed edit.
- Use least-privilege file modes for local WISE² config containing sensitive metadata.

## Files / Components To Inspect Before Implementation

At minimum:

- `scripts/wise2-ghostty.zsh`
- approved Ghostty Command Center spec and plan
- existing local-model setup scripts
- current `wise2-status`, `wise2-dashboard`, `wise2-ai`, and `wise2-alerts` implementations wherever they live
- existing shell installer/uninstaller scripts
- WISE² Control Bridge client/contracts
- Hermes and GPU routing configuration
- Discord/alert integration status hooks
- existing tests around shell/CLI/model routing
- Mac `.zshrc`, `.zprofile`, and Ghostty startup configuration during machine verification

## Implementation Strategy

1. Observe and reproduce the duplicate startup and model-count mismatch.
2. Trace current startup sourcing and model-count data flow.
3. Add failing regression tests for the identified causes.
4. Introduce normalized health/model adapters.
5. Implement canonical `wise status`, `wise models`, and `wise doctor` first.
6. Add compatibility shims for existing `wise2-*` commands.
7. Add routing mode reporting and memory guardrails.
8. Integrate remote WISE² health checks with strict timeouts.
9. Upgrade the startup banner to use the normalized status layer.
10. Add install/upgrade/rollback safety.
11. Run automated tests.
12. Verify on Daniel's M4 with real Ollama/Tailscale/WISE² endpoints.
13. Document exact changes, remaining warnings, and rollback path.

## Tests

Automated coverage must include:

1. startup loader idempotency;
2. duplicate source detection;
3. installed-model parsing;
4. loaded-model parsing;
5. healthy Ollama with zero loaded models;
6. Ollama unavailable;
7. tags-query failure;
8. ps-query failure;
9. configured-model missing;
10. routing mode parsing;
11. no silent cloud fallback;
12. memory pressure policy decisions;
13. remote timeout isolation;
14. Control Bridge status mapping;
15. alert status redaction;
16. Git status adapter;
17. `wise status --json` schema;
18. `wise doctor` pass/fail output;
19. command argument injection attempts;
20. installer idempotency;
21. backup/rollback behavior;
22. compatibility aliases.

## Manual Verification On Daniel's M4

1. Open a fresh Ghostty shell and confirm the WISE² startup banner appears once.
2. Confirm the shell opens promptly even if VPS/GPU connectivity is unavailable.
3. Run `wise doctor` and resolve/record any failures.
4. Run `wise models`; compare installed count with `ollama list` and loaded count with Ollama process state.
5. Run `wise status`; confirm model numbers match real runtime state.
6. Run `wise status --json` and validate schema/output.
7. Run a local fast prompt and confirm it stays on local Ollama.
8. Run the coding route and verify configured coder model selection.
9. Force GPU route and verify the route is visibly labeled.
10. Disconnect Tailscale temporarily and verify local status/AI continue functioning.
11. Confirm AUTO never falls through to Claude/Codex.
12. Test `wise2-status`, `wise2-dashboard`, `wise2-ai`, and `wise2-alerts` compatibility.
13. Confirm secrets never appear in output or shell history.
14. Re-open a shell and verify initialization remains single and stable.

## Rollback Protection

Before modifying user-level configuration:

- record current Git state;
- do not overwrite uncommitted repository work;
- create timestamped backups of managed user configuration;
- keep installer edits inside clearly marked managed blocks or sourced files;
- provide a rollback/uninstall path that restores prior managed configuration without deleting unrelated settings.

Repository changes should be made on an isolated branch/worktree where practical and merged only after tests pass.

## Definition Of Done

The upgrade is complete when:

- the startup banner appears once per interactive shell;
- local Ollama state is reported accurately using installed/configured/loaded/healthy distinctions;
- `wise status`, `wise models`, and `wise doctor` work reliably;
- existing `wise2-*` commands remain functional through compatibility mappings;
- local-first routing is visible and cloud escalation remains explicit;
- memory guardrails prevent avoidable M4 pressure without unnecessary cloud usage;
- remote subsystem failures do not break local operation;
- no secrets are exposed;
- automated tests pass;
- manual verification on Daniel's M4 matches real Ollama/Tailscale/WISE² state;
- rollback instructions are tested and documented;
- changes and operational status are synchronized back to the WISE² repository.
