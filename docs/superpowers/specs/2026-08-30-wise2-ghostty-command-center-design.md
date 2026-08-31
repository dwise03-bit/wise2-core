# WISE² Ghostty Command Center Design

Date: 2026-08-30
Status: Approved architecture, implementation pending
Owner: WISE²
Repository: dwise03-bit/wise2-core

## Purpose

Turn Ghostty on the user's Apple M4 / 16 GB MacBook Pro into the primary WISE² terminal command center. Ghostty is the presentation and operator surface; a single `wise` CLI router selects the correct execution backend for local AI, coding, vision, WISE² infrastructure control, and explicit cloud escalation.

The design keeps routine work local on the Mac, routes heavy AI work to the WISE² GPU host, and reuses the existing WISE² Control Bridge for privileged remote operations instead of exposing unrestricted SSH or shell execution.

## Current Environment

Mac workstation:

- MacBook Pro, model identifier Mac16,1.
- Apple M4, 10 CPU cores (4 performance, 6 efficiency).
- 16 GB unified memory.
- Apple Silicon / arm64 macOS.
- Ollama available locally at `127.0.0.1:11434` in the established WISE² development workflow.
- WISE² local model roles already include fast chat, coding, vision, RAG/embeddings, and 3D-oriented models.
- Development tools include Ghostty, Cursor, Claude Code, Git, Node.js tooling, and Xcode-related workflows.

WISE² remote environment:

- The VPS and GPU server are the same WISE² host.
- Ollama/Hermes and production WISE² workloads run there.
- Tailscale is part of the established private-access architecture.
- The approved WISE² Control Bridge design provides allowlisted status, health, logs, deploy, restart, rollback, Git, Docker, Ollama/Hermes, and host-resource operations without exposing an arbitrary remote shell.

## Goals

1. Make Ghostty the fastest human-facing WISE² command surface on macOS.
2. Use one memorable `wise` CLI entry point instead of many unrelated scripts.
3. Prefer local M4 inference for low-latency, low-cost work.
4. Protect the 16 GB Mac from memory pressure by using role-aware model limits and single-large-model loading.
5. Route heavy inference to the WISE² GPU host when local capability or memory thresholds are exceeded.
6. Use the Control Bridge for remote operational actions instead of raw shell commands.
7. Keep Claude and Codex explicit escalation targets so paid/cloud use is never silent.
8. Preserve existing WISE² model names where practical, while allowing backend aliases to change without changing user commands.
9. Provide clear health/status commands and safe fallback behavior.
10. Package the integration so it can be installed, verified, upgraded, and removed cleanly.

## Non-Goals

- Ghostty is not the business logic layer.
- No arbitrary remote shell proxy is introduced.
- No automatic cloud spend without explicit user selection or a separately approved policy.
- No attempt to run 20B-30B models as the normal workload on the 16 GB Mac.
- No duplication of deployment logic already owned by GitHub Actions or the WISE² Control Bridge.
- No storage of credentials, bearer tokens, SSH private keys, or API secrets inside the Ghostty configuration itself.

## Architecture

```text
Ghostty — WISE² Command Center
        |
        | interactive shell / profiles / keybindings
        v
      `wise`
        |
        +-- local AI router
        |     Ollama / optional MLX adapter
        |     fast / code / vision / rag
        |
        +-- project tools
        |     git / repo status / Cursor / Claude Code / Codex launch
        |
        +-- remote AI router
        |     GPU-host Ollama / Hermes
        |     Tailscale-private transport
        |
        +-- WISE² operations client
        |     Control Bridge API
        |     health / status / logs / restart / deploy / rollback
        |
        +-- explicit cloud escalation
              Claude / Codex
```

Ghostty owns terminal presentation, profiles, launch behavior, and keybindings. The `wise` CLI owns routing and user commands. The Control Bridge owns privileged WISE² infrastructure actions. Model runtimes own inference.

## Primary User Interface

The top-level command is:

```bash
wise <command> [arguments]
```

Initial command surface:

```text
wise "<prompt>"              default local chat/assistant route
wise fast "<prompt>"         fastest local assistant route
wise code "<prompt>"         local coding model route
wise vision <file> [prompt]   local vision route
wise rag "<prompt>"          retrieval/embedding-aware route
wise gpu "<prompt>"          explicit heavy-model GPU route
wise hermes "<prompt>"       explicit Hermes/agent route
wise status                   aggregate Mac + local AI + remote WISE² status
wise doctor                   dependency/config/connectivity diagnostics
wise models                   show available local and remote models
wise routes                   show current role-to-backend routing
wise project                  summarize current repo/project context
wise control <action>         call allowlisted WISE² Control Bridge operations
wise handoff claude           explicit Claude escalation
wise handoff codex            explicit Codex escalation
```

Aliases may be added later, but the canonical UX remains `wise`.

## Ghostty Profiles

Ghostty should expose visually distinct WISE²-oriented launch profiles while keeping a common shell environment:

1. **WISE² FAST** — launches the WISE² shell with local fast model as the default assistant role.
2. **WISE² CODER** — opens in the active development directory and favors the coding route.
3. **WISE² VISION** — optimized for image/file inspection workflows.
4. **WISE² ARCHITECT** — favors explicit GPU-host reasoning and long-running analysis.
5. **WISE² DEVOPS** — emphasizes Control Bridge status, logs, deploy, restart, rollback, and host health.
6. **HERMES** — launches the Hermes-oriented operator workflow.
7. **CLAUDE** — launches Claude Code through an explicit cloud boundary.
8. **CODEX** — launches Codex through an explicit cloud boundary.

Profiles may differ by title, working directory, environment flags, startup command, and keybinding. They must not embed secrets.

## Local Model Policy for M4 / 16 GB

The Mac is treated as an edge AI workstation, not the heavy-model server.

Recommended operating envelope:

- Fast/general chat: 3B-8B quantized models.
- Coding: approximately 7B quantized coder model.
- Vision: approximately 7B-class multimodal model when memory allows.
- RAG embeddings: small dedicated embedding model such as `nomic-embed-text`.
- General reasoning: up to roughly 7B-12B quantized when the rest of the workstation load permits.
- 20B-30B+ workloads: route to the GPU host by default.

The router should avoid keeping multiple large local models resident simultaneously. Before switching roles, it may unload or allow the runtime to expire the prior model according to configurable keep-alive policy.

## Routing Policy

Routing is deterministic and inspectable.

### Default local-first behavior

- `wise` and `wise fast` stay local unless the configured local backend is unavailable.
- `wise code` stays local for focused code questions and normal file-sized context.
- `wise vision` stays local if the configured local vision model is available and memory is healthy.
- `wise rag` uses the local embedding path by default.

### GPU route

The GPU host is used when:

- the user explicitly invokes `wise gpu`;
- the selected role is configured as GPU-only;
- the local model is unavailable and the fallback policy allows remote use;
- local memory pressure exceeds the configured safety threshold;
- the requested context/task size exceeds the local route's configured limit.

The router must display when a task is leaving the Mac for the WISE² GPU host.

### Cloud route

Claude and Codex are explicit escalation targets. The initial implementation must not automatically send prompts, source files, images, or project content to cloud services merely because a local/GPU route fails.

Automatic cloud escalation is disabled by default.

## Backend Abstraction

The CLI should define logical roles separately from concrete model identifiers.

Example configuration concept:

```yaml
roles:
  fast:
    backend: local-ollama
    model: wise2-fast
  code:
    backend: local-ollama
    model: qwen2.5-coder:7b
  vision:
    backend: local-ollama
    model: wise2-vision
  embeddings:
    backend: local-ollama
    model: nomic-embed-text
  architect:
    backend: gpu-ollama
    model: configured-heavy-model
```

Exact model tags are configuration, not hard-coded CLI behavior. The CLI should warn when a configured tag is absent and show the discovered alternatives through `wise models` / `wise doctor`.

## Remote Transport

Remote AI and operations are separate concerns.

### Remote AI

Preferred route:

- Tailscale/private WISE² network.
- Configurable GPU Ollama/Hermes endpoint.
- Connection and request timeouts.
- Clear local/remote route indicator.

### Remote operations

All privileged WISE² operations use the existing Control Bridge API. The Ghostty integration must not introduce a new arbitrary SSH command path for deploy/restart/log operations.

Examples:

```text
wise control status
wise control logs api
wise control restart <allowlisted-service>
wise control deploy <allowlisted-app>
wise control rollback <allowlisted-app>
```

The CLI maps these to Control Bridge contracts and preserves its authentication, allowlist, audit, confirmation, timeout, and redaction guarantees.

## Configuration

Recommended user-level configuration locations:

```text
~/.config/ghostty/config
~/.config/wise2/config.yaml
~/.config/wise2/routes.yaml
```

Recommended executable location:

```text
~/.local/bin/wise
```

Repository-owned templates/scripts should live under a focused directory such as:

```text
tools/ghostty/
  config/
  themes/
  scripts/
  install/
  README.md
```

The exact repository layout should follow existing `wise2-core` conventions discovered during implementation.

Secrets belong in the system keychain, environment injection, or an ignored user-only secret file with strict permissions. Repository templates contain placeholders only.

## Ghostty Visual Direction

The terminal should align with the existing WISE² command-center identity without sacrificing readability:

- deep black/carbon background;
- chrome/silver and cool white primary text;
- restrained neon/electric accent for active WISE² state;
- strong contrast for warnings/errors;
- compact status banner rather than excessive ASCII art;
- clear profile titles such as `WISE² // CODER // LOCAL M4` and `WISE² // ARCHITECT // GPU`;
- no visual treatment that obscures logs, code, stack traces, or command output.

Visual branding must remain presentation-only and should not become a runtime dependency.

## Shell Integration

The installer should support the user's normal macOS shell, with zsh as the expected primary target.

Shell integration should provide:

- PATH setup for `~/.local/bin` if missing;
- completion for `wise` subcommands;
- optional compact WISE² prompt/status segment;
- project-root discovery;
- no destructive modification of existing `.zshrc` content;
- idempotent managed blocks or sourced config files.

## `wise status`

`wise status` should return a concise dashboard-style text view containing:

- Mac architecture and available memory summary;
- local Ollama health;
- currently configured local role models and availability;
- GPU-host reachability;
- remote Ollama/Hermes health when configured;
- WISE² Control Bridge health;
- active project/repository and git branch when applicable;
- cloud tool availability without exposing credentials.

A `--json` form should provide machine-readable output.

## `wise doctor`

Diagnostics should check:

1. Ghostty installed and config load path recognized.
2. `wise` executable available on PATH.
3. arm64 shell/runtime consistency.
4. Ollama reachable locally.
5. required/configured local models present.
6. Tailscale installed and connected when remote routes are enabled.
7. GPU endpoint reachable.
8. Control Bridge reachable and authenticated without echoing secrets.
9. Claude/Codex CLIs present if configured.
10. config syntax valid.
11. no secret file has unsafe permissions.

Doctor output should provide a remediation command or action for each failed check where safe.

## Error and Fallback Behavior

- Local backend unavailable: report failure and offer/configure GPU fallback only when policy allows.
- GPU host unavailable: return a clear remote-unavailable error and remain local when possible.
- Control Bridge unavailable: do not substitute raw SSH for privileged operations.
- Cloud CLI unavailable: report it; never silently install or transmit data.
- Missing model: show configured tag plus locally/remote discovered candidates.
- Memory pressure: block or reroute heavy local model launch according to policy.
- Network timeout: bounded retries only; no infinite reconnect loop.

## Security

1. No secrets committed to Git.
2. No bearer tokens printed by `wise status`, `wise doctor`, debug logs, or shell history.
3. No user prompt is interpolated into an unquoted shell command.
4. Remote WISE² operational writes go through the Control Bridge allowlist.
5. Destructive operations denied by the Control Bridge remain unavailable through Ghostty.
6. Cloud handoffs clearly identify that data may leave local WISE² infrastructure.
7. Config and cache files use least-privilege permissions where credentials or sensitive metadata could appear.
8. Installer backs up user config before managed edits and never overwrites unrelated Ghostty or shell configuration.

## Packaging

The integration should be distributed as a reproducible package rather than an opaque archive.

Repository deliverables:

- Ghostty config/template.
- WISE² theme/profile fragments.
- `wise` CLI/router.
- role-routing configuration template.
- installer.
- uninstaller/rollback script.
- shell completion.
- status/doctor implementation.
- README with quick-start and recovery instructions.
- tests.

Any generated ZIP is a release artifact built from the repository contents and verified with a checksum. This avoids repeating the prior empty/corrupt archive failure mode.

## Testing

Required automated tests should cover:

1. command parsing and help output;
2. role-to-backend routing;
3. default local-first behavior;
4. explicit GPU routing;
5. no automatic cloud escalation;
6. model-missing behavior;
7. local Ollama unavailable behavior;
8. GPU endpoint unavailable behavior;
9. Control Bridge command mapping;
10. shell argument injection attempts;
11. secret redaction;
12. config parsing and invalid config handling;
13. `status --json` schema;
14. doctor checks using mocks;
15. installer idempotency;
16. config backup/restore behavior.

## Manual Verification on the Mac

After implementation:

1. Open Ghostty normally and confirm the WISE² config loads without warnings.
2. Run `wise doctor`.
3. Run `wise status`.
4. Run a local fast prompt and verify the request stays on `127.0.0.1:11434`.
5. Run a local coding prompt.
6. Run `wise models` and verify configured role mappings.
7. Run an explicit `wise gpu` prompt and confirm the GPU route is visibly identified.
8. Disconnect/block the GPU route temporarily and confirm safe local/error behavior.
9. Run a read-only `wise control status` call.
10. Confirm no token/secret appears in shell output or history.
11. Launch Claude/Codex only through explicit handoff commands and verify the route is labeled cloud.
12. Confirm Ghostty profile titles accurately indicate local/GPU/cloud context.

## Implementation Sequence

1. Inspect current `wise2-core` CLI/script conventions and existing local/remote AI configuration.
2. Define the `wise` command contract and configuration schema.
3. Implement local Ollama adapter and role router.
4. Implement status/models/doctor commands.
5. Implement GPU Ollama/Hermes transport through private/Tailscale addressing.
6. Implement Control Bridge client for approved operational commands.
7. Add explicit Claude/Codex handoff adapters.
8. Add Ghostty config, profiles, titles, and WISE² visual treatment.
9. Add zsh integration and completions.
10. Add installer, backup, uninstall/rollback, and release packaging.
11. Add unit/integration tests.
12. Verify on the M4 / 16 GB Mac against local Ollama and the WISE² remote environment.
13. Produce a checksum-verified release archive only after repository tests pass.

## Success Criteria

The integration is complete when Ghostty opens as a reliable WISE² operator console; `wise` provides one consistent command surface; routine chat, code, vision, and RAG tasks can remain local on the M4 Mac; heavy AI can be explicitly or policy-routed to the WISE² GPU host; privileged WISE² operations use the Control Bridge rather than arbitrary SSH; Claude/Codex are explicit cloud escalations; secrets are not exposed; the setup passes automated tests and `wise doctor`; and installation/rollback are reproducible from source-controlled files.
