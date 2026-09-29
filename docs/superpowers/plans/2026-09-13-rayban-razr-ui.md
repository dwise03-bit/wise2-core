# Ray-Ban Razr UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-safe Ray-Ban Meta companion UI to WISE2 Field Tech and install a verified debug APK on the connected Motorola Razr 2025.

**Architecture:** Reuse the existing MetaWearablesBridge boundary and AppContainer provider. Add a Compose screen and navigation route that expose connection/capability state without simulating production SDK access. Keep Meta DAT activation isolated behind the existing provider.

**Tech Stack:** Android, Kotlin, Jetpack Compose, Navigation Compose, coroutines/StateFlow, Gradle, ADB.

**Spec:** Approved in chat on 2026-09-13.

## Global Constraints
- Preserve existing Field Tech functionality and current main working tree.
- Work only in feat/rayban-razr-ui worktree.
- Never report a simulated Ray-Ban connection as real.
- Explicit capture only; no continuous raw audio/video storage.
- TDD before production behavior changes.

---

### Task 1: Wearable UI state
- [ ] Write failing state/model tests.
- [ ] Run tests and verify RED.
- [ ] Implement minimal state mapping around MetaWearablesBridge.
- [ ] Run tests and verify GREEN.

### Task 2: Ray-Ban companion screen and navigation
- [ ] Write navigation/UI-facing tests where practical.
- [ ] Add RayBanScreen with status, Ask WISE2, capture actions, job/context panel, and safe unavailable state.
- [ ] Add Destination and NavGraph wiring.
- [ ] Add a discoverable entry point from Field Tech.
- [ ] Run unit tests and assembleDebug.

### Task 3: Razr installation and verification
- [ ] Confirm Razr serial ZY22LG75SH remains authorized over USB.
- [ ] Install debug APK only to that serial.
- [ ] Launch package and inspect activity/process/logcat for crash.
- [ ] Verify existing Field Tech screens still launch.
- [ ] Record Meta DAT as unavailable unless official credentials/SDK are actually configured.
