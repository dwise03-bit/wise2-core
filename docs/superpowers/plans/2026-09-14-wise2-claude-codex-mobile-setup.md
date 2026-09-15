# WISE² Claude + Codex Mobile Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Claude Code and Codex share WISE² project context across Mac and VPS while providing safe local-model routing and repeatable Android/iOS development workflows.

**Architecture:** Keep `AGENTS.md` and PromptOS as the source of truth. Add small adapter files and shell commands that select Mac or VPS execution explicitly; never synchronize secrets or overwrite uncommitted work. The Mac owns Xcode, simulators, Android SDK, devices, and signing; the VPS owns Linux/API/Docker checks.

**Tech Stack:** Markdown agent instructions, POSIX shell, Git, SSH/Tailscale, Ollama, Xcode CLI, Android Gradle wrapper/ADB.

**Spec:** `docs/superpowers/specs/2026-09-14-wise2-claude-codex-mobile-setup-design.md`

## Global Constraints

- Use Git as the synchronization boundary; do not implement bidirectional filesystem sync.
- Keep secrets, API tokens, signing keys, and provisioning profiles out of Git and the sync payload.
- Do not silently fall back to a large local model.
- Mac-only iOS operations use `xcodebuild`, `simctl`, `devicectl`, and local signing.
- Android workflows use the repository Gradle wrapper and ADB where available.
- VPS operations are read-only unless an explicit deploy command is invoked.
- Preserve unrelated existing worktree changes.

### Task 1: Shared agent adapters and skills

**Files:**
- Create: `CLAUDE.md`
- Create: `.agents/skills/wise2-executive-routing/SKILL.md`
- Create: `.agents/skills/wise2-codebase-navigation/SKILL.md`
- Create: `.agents/skills/wise2-mobile-ios/SKILL.md`
- Create: `.agents/skills/wise2-mobile-android/SKILL.md`
- Create: `.agents/skills/wise2-api-contracts/SKILL.md`
- Create: `.agents/skills/wise2-vps-operations/SKILL.md`
- Create: `.agents/skills/wise2-security-review/SKILL.md`
- Create: `.agents/skills/wise2-qa-gates/SKILL.md`
- Create: `.agents/skills/wise2-release/SKILL.md`
- Create: `.agents/skills/wise2-session-memory/SKILL.md`
- Create: `.claude/skills/wise2-sync/SKILL.md`

**Interfaces:** Skills reference existing `AGENTS.md`, `promptos/agents/`, `WISE2_UI_CONSTITUTION.md`, and `WISE2_WORKFLOW_STANDARD.md`; none may require credentials.

- [ ] Write the thin `CLAUDE.md` adapter with project identity, instruction precedence, and links to the shared contract.
- [ ] Write each focused skill with trigger description, safe commands, inputs, outputs, and failure behavior.
- [ ] Add Claude sync skill that calls the repository sync command without embedding secrets.
- [ ] Validate Markdown links and ensure no skill exceeds the always-on context intended for its scope.
- [ ] Commit: `docs: add shared Wise2 agent skills`

### Task 2: Mac/VPS profiles and safe sync commands

**Files:**
- Create: `scripts/wise2-sync.sh`
- Create: `scripts/wise2-preflight.sh`
- Create: `scripts/wise2-mobile.sh`
- Create: `scripts/wise2-vps.sh`
- Modify: `README.md` or create `docs/WISE2_AGENT_SETUP.md` with installation and usage.

**Interfaces:**
- `wise2-sync.sh [--check|--fetch]` checks Git state, fetches origin, reports branch/commit drift, and refuses destructive overwrite.
- `wise2-preflight.sh [mac|vps|mobile]` exits nonzero for missing required tools and prints remediation.
- `wise2-mobile.sh ios|android|status` delegates only to local platform tools.
- `wise2-vps.sh status|check` uses SSH to the configured VPS host and does not deploy.

- [ ] Write shell tests as command-level fixtures using temporary repositories and mocked `ssh`/`xcodebuild`/`adb` binaries.
- [ ] Implement sync with `git status --porcelain`, `git fetch`, and explicit divergence reporting.
- [ ] Implement preflight checks without failing optional tools when the selected profile does not need them.
- [ ] Implement mobile dispatch with clear Mac-only iOS messaging.
- [ ] Implement read-only VPS status/check commands with bounded SSH timeouts.
- [ ] Run `shellcheck` if installed and execute each command in `--help`/`status` mode.
- [ ] Commit: `feat: add Wise2 Mac and VPS agent profiles`

### Task 3: Claude and Codex model routing

**Files:**
- Modify: `~/.claude/settings.json` on the Mac only; document the change in `docs/WISE2_AGENT_SETUP.md`.
- Modify: `~/.zshrc` on the Mac only; preserve the existing small-model resource limits.
- Create: `config/agents/wise2-profiles.env.example`

**Interfaces:** Profiles expose `claude-vps`, `claude-local`, `codex-mac`, and `codex-vps`; the example file contains placeholders only.

- [ ] Add explicit hosted/VPS and local profile functions without storing credentials in the repository.
- [ ] Keep local Ollama at one request, one loaded model, bounded keep-alive, and the 1.5B safe fallback.
- [ ] Make unavailable hosted models fail visibly instead of silently selecting a large local model.
- [ ] Add profile diagnostics that print endpoint/model names but never tokens.
- [ ] Validate with environment scrubbing and a dry-run mode.
- [ ] Commit: `feat: add explicit Wise2 model profiles`

### Task 4: Mobile development workflows

**Files:**
- Modify: `apps/wise2-ios/README.md` or create `apps/wise2-ios/WISE2_AGENT_WORKFLOW.md`
- Create: `apps/wise2-ios/scripts/wise2-ios-check.sh`
- Create: `apps/wise2-ios/scripts/wise2-ios-test.sh`
- Create: `apps/wise2-android/WISE2_AGENT_WORKFLOW.md` if an Android app exists; otherwise document the current absence and scaffold no fake project.
- Create: `apps/wise2-android/scripts/wise2-android-check.sh` only when an Android Gradle project is present.

**Interfaces:** iOS scripts detect the Xcode project/workspace and scheme before invoking `xcodebuild`; Android scripts detect `gradlew` before invoking Gradle/ADB.

- [ ] Detect actual iOS schemes and available simulators without hardcoding an unavailable device.
- [ ] Run build/test commands with result-bundle output under ignored build artifacts.
- [ ] Detect Android project structure and expose `./gradlew test`, `lint`, and connected-test commands.
- [ ] Add a status command that reports missing SDKs/devices without attempting installation.
- [ ] Commit: `feat: add Wise2 mobile development workflows`

### Task 5: Verification and handoff

**Files:**
- Modify: `docs/WISE2_AGENT_SETUP.md`
- Create: `docs/WISE2_AGENT_VERIFICATION.md`

- [ ] Run repository-level Markdown/script validation.
- [ ] Run Mac preflight and record available Xcode, Android, SSH, Tailscale, and Ollama capabilities.
- [ ] Run VPS read-only preflight through the configured host if connectivity is available.
- [ ] Verify no secrets are staged with `git diff --cached` and secret-pattern scanning.
- [ ] Document commands that require the user’s local password, device approval, or Apple signing access.
- [ ] Commit: `docs: verify Wise2 agent setup`
