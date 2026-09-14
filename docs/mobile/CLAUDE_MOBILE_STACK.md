# WISE2 Claude Mobile Super Stack

This repository-local stack standardizes how Claude/Codex agents work on WISE2 iOS and Android products without replacing each app's native build system.

## Entry point
Claude should load `.claude/skills/wise2-mobile-development/SKILL.md` for mobile implementation, debugging, hardware integration, build, or release work. Platform references live beside it.

## WISE2 targets
- Field Tech: Android today; shared/native evolution based on hardware requirements.
- Capture: mobile-first recording/context capture with native permission testing.
- Command Center: Expo/React Native preferred for shared UI.
- HVAC / Pocket Node: shared UI with native BLE modules where required.
- iPhone hardware workflows: SwiftUI when native access is the priority.
- Razr/Android hardware workflows: Kotlin/Compose when native access is the priority.
- Quest companion: Unity/OpenXR plus Android bridge as needed.

## Verification gate
Run `bash scripts/mobile/stack-contract.sh` to validate the stack itself and `bash scripts/mobile/verify.sh` to inspect workstation prerequisites. These checks do not replace app-specific unit, lint, simulator/emulator, physical-device, release, or store-preflight testing.

## Cost discipline
AUTO routes local-first. Routine coding should prefer local WISE2 models; cloud Claude/Codex is for difficult architecture, debugging, or final review. Do not load unnecessary MCP servers into every session: activate device/build tooling only for the current platform.

## Definition of done
A mobile change is not done until the relevant tests pass, a real build succeeds, the changed path launches and is exercised, runtime logs are checked, hardware-dependent behavior is verified on a physical device, and release/store checks pass when shipping.
