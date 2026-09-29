# Claude + Codex Skills Research for WISE²

Date: 2026-09-14

## Decision

Use one repository-owned agent contract and expose it to both Claude Code and Codex:

- `AGENTS.md` remains the shared operating contract for Codex and repository-wide behavior.
- `CLAUDE.md` becomes a thin Claude adapter that points to the shared contract and Claude-specific workflows.
- Reusable workflows live in `.agents/skills/` and are mirrored by lightweight Claude wrappers in `.claude/skills/`.
- MCP is reserved for live external systems (VPS status, deployment, GitHub, observability); it is not used as a substitute for project instructions.
- Subagents are used for isolated review/research tasks, not for every edit.
- Hooks enforce cheap, deterministic checks after edits or before commits.

## Highest-value WISE² skills

1. `wise2-executive-routing` — maps requests to the existing PromptOS specialist prompts.
2. `wise2-codebase-navigation` — protects context by directing agents to the relevant app/package first.
3. `wise2-mobile-ios` — Swift/SwiftUI, Xcode schemes, `xcodebuild`, simulators, signing boundaries.
4. `wise2-mobile-android` — Gradle wrapper, Android Studio project structure, emulator/device testing, lint.
5. `wise2-api-contracts` — keeps iOS, Android, website, dashboard, and API changes synchronized.
6. `wise2-vps-operations` — read-only health checks first; deploy only through an explicit workflow.
7. `wise2-security-review` — secrets, auth, tenant boundaries, public/private network exposure.
8. `wise2-qa-gates` — chooses the smallest relevant test/build matrix and records results.
9. `wise2-release` — versioning, OTA/mobile release checks, rollback, and evidence capture.
10. `wise2-session-memory` — decisions, daily logs, and handoffs without copying secrets.

## Evidence

Claude Code's official extension guidance distinguishes persistent instructions (`CLAUDE.md`), reusable workflows (Skills), external live systems (MCP), isolated work (subagents), and lifecycle automation (hooks). It recommends keeping always-on project context focused and moving repeatable or conditional behavior into Skills.

- Anthropic, “Extend Claude Code”: https://code.claude.com/docs/en/features-overview
- Anthropic, “Create custom subagents”: https://code.claude.com/docs/en/subagents

OpenAI's official guidance supports repository-level agent instructions through `AGENTS.md`; Codex and other coding agents can share this contract. OpenAI's current API reference also models skills as reusable, versioned capabilities and MCP as a tool integration boundary.

- OpenAI, “How OpenAI uses Codex”: https://cdn.openai.com/pdf/6a2631dc-783e-479b-b1a4-af0cfbd38630/how-openai-uses-codex.pdf
- OpenAI, “Responses API — tools and skills”: https://developers.openai.com/api/reference/cli/resources/responses/methods/create

Android's official workflow supports Gradle-wrapper builds, command-line unit/instrumented tests, lint, and ADB-driven device testing. Apple's official workflow supports `xcodebuild`, `simctl`, `devicectl`, and `.xcresult` bundles for repeatable Mac-side builds and tests.

- Android Developers, “Build your app from the command line”: https://developer.android.com/build/building-cmdline
- Android Developers, “Test from the command line”: https://developer.android.com/studio/test/command-line
- Android Developers, “Improve your code with lint checks”: https://developer.android.com/studio/write/lint
- Apple Developer, “Xcode command-line tool reference”: https://developer.apple.com/documentation/xcode/xcode-command-line-tool-reference
- Apple Developer, “Running tests and interpreting results”: https://developer.apple.com/documentation/xcode/running-tests-and-interpreting-results

## Recommended topology

The Mac is the device-and-toolchain host. The VPS is the remote reasoning/build/CI host. Both check out the same Git revision and load the same repository contract. The Mac uses a small local Ollama model only when explicitly requested; Claude and Codex never silently fall back to a large local model.

The synchronization boundary is Git plus an explicit `wise2-sync` command. Secrets, signing keys, API tokens, and machine-specific paths remain outside Git. SSH/Tailscale provides transport; it does not become a second source of truth.

## Adversarial findings

- Full bidirectional filesystem sync would create conflicts and leak machine-specific state; avoid it.
- Running iOS builds on the VPS is not a substitute for the Mac because Xcode, simulators, and signing are Mac-bound.
- Installing every available MCP/skill would increase attack surface and context noise; start with the nine workflows above and add integrations only when a real task needs them.
- A VPS Claude session cannot safely mutate the Mac's simulator or signing environment without an explicit Mac-side command bridge.
