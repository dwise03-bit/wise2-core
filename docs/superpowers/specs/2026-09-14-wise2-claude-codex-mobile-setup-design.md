# WISE² Claude + Codex Mac/VPS Mobile Development Setup

## Goal

Make Claude Code and Codex use the same WISE² operating model on the Mac and VPS, while making the Mac the authoritative Android/iOS execution host and preventing local-model resource exhaustion.

## Architecture

### Shared contract

- `AGENTS.md`: canonical repository instructions for Codex and compatible agents.
- `CLAUDE.md`: concise Claude-specific adapter; references the same routing, security, testing, and deployment rules.
- `promptos/agents/`: specialist prompts remain the business/domain routing layer.
- `.agents/skills/`: canonical reusable WISE² workflows.
- `.claude/skills/`: Claude-compatible wrappers or symlinks that expose the same workflows.
- `.codex/skills/`: Codex-compatible wrappers where the app requires a local skill entry.

### Agent profiles

- `claude-vps`: hosted Claude or remote approved model; primary for architecture and large changes.
- `claude-local`: explicitly invoked small Ollama model; one request, one loaded model, safe memory limits.
- `codex-mac`: primary Mac execution profile; runs local tests, Xcode, Android SDK, simulators, and devices.
- `codex-vps`: remote Linux profile; runs API, web, database, Docker, and CI-style checks.

### Sync

`wise2-sync` performs read-only status checks, fetches the selected Git revision, validates the shared contract, and reports drift. It does not copy secrets or overwrite uncommitted work. A separate explicit deploy command handles VPS mutation.

### Mobile workflow

- iOS: Mac-only `xcodebuild`, `simctl`, `devicectl`, and result-bundle capture.
- Android: Mac-side Gradle wrapper, lint, emulator/device tests, and ADB.
- VPS: API contract tests, shared package tests, static analysis, and optional Android-compatible CI checks.
- Signing and provisioning remain Mac-local and are never sent to the VPS.

## Safety and performance

- Remove large-model automatic fallback from Claude and Codex.
- Keep local Ollama at one parallel request and one loaded model.
- Set bounded timeouts for remote commands and build jobs.
- Require clean or explicitly acknowledged Git state before sync/deploy.
- Keep all tokens and signing material in local environment/keychain storage.
- Add preflight checks before mobile builds and deployments.

## Initial implementation slice

1. Add shared Claude/Codex adapter files and the nine WISE² skills identified in the research report.
2. Add Mac/VPS profile scripts and `wise2-sync`/preflight commands.
3. Add iOS and Android skill workflows with safe detection and build/test commands.
4. Add read-only VPS health and drift checks.
5. Verify on the Mac without starting a heavy local model; verify VPS commands through the existing SSH/Tailscale path.

## Non-goals

- No bidirectional cloud filesystem sync.
- No automatic production deployment.
- No copying Apple signing credentials to the VPS.
- No installation of every third-party plugin or MCP server.
