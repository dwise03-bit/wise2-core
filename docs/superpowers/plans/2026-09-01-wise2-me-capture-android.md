# WISE² ME Capture Android Implementation Plan

## Status

Planning checkpoint created from the implementation handoff on 2026-09-01. A V1 scaffold was implemented and validated through APK installation on the connected Motorola device.

The referenced approved design spec, `docs/superpowers/specs/2026-09-01-wise2-me-capture-android-design.md`, is not present in the current checkout. Implementation should not proceed past project scaffolding until that source of truth is restored or supplied.

## Scope

Create `apps/wise2-me-capture-android/`, a native Kotlin + Jetpack Compose app with package `com.wise2.mecapture` supporting offline-first video/audio capture, durable clip metadata, Library playback, CLIENT consent gating, processing states, and explicit AI approval/rejection.

## Work plan

1. Restore/read the approved design spec and project UI constitution/workflow standard; extract exact screens, states, copy, colors, and interaction requirements.
2. Mirror the repository's current Android conventions from `apps/fieldtech-android`: Gradle/Kotlin/Compose setup, Java 17, Android SDK configuration, test layout, and secure build configuration.
3. Define small domain/data boundaries: clip model and processing/consent enums, Room entities/DAO/database, app-private media storage, repository, and interfaces for transcription, analysis, indexing/OCR/speaker separation, and synchronization.
4. Implement runtime permission handling for camera/microphone and explicit opt-in location; enforce CLIENT consent before recording and preserve privacy boundaries between client material and personal AI training material.
5. Implement Capture, Library, clip detail, AI Studio, and Profile/Settings flows with large field controls and approved visual styling.
6. Add CameraX recording, front/rear switching, recording indicator/timer, safe pause/resume behavior, local persistence, and Media3 playback.
7. Add WorkManager hooks for deferred processing/synchronization without making capture depend on network availability.
8. Add unit/UI tests for state transitions, consent gating, approval/rejection, persistence, and restart behavior.
9. Build and install the debug APK; validate on the connected Motorola Razr with ADB, including capture, playback, restart persistence, CLIENT consent, and AI approval. Inspect logcat.
10. Produce a release APK, SHA-256/checksum metadata, and the separate `wise2.net/apps/me-capture` download page only after the hardware smoke test passes.

## Verification commands

```text
cd apps/wise2-me-capture-android
./gradlew test
./gradlew assembleDebug
adb devices
adb install -r <APK confirmed by Gradle output>
```

## Current blockers

- Approved design spec is missing from this checkout; the handoff was used as the functional source of truth.
- `WISE2_UI_CONSTITUTION.md` and `WISE2_WORKFLOW_STANDARD.md` were not found during initial repository inspection.
- Device launch/logcat smoke check passed; interactive capture/playback validation remains pending because the current scaffold still needs the CameraX recording pipeline.
- The separate `wise2.net` repository is not present in this checkout, so its download page cannot be implemented from here without that repository/context.

## Decisions to preserve

- Raw recordings are never automatically approved for AI.
- CLIENT recording requires an explicit consent gate.
- Raw source media remains separate from derived AI/training artifacts.
- No credentials are embedded in the APK; providers remain behind interfaces.
- Local app-private storage is the default and capture remains usable offline.
