---
name: wise2-mobile
description: Build, repair, test, sign, release, and maintain production WISE2 mobile apps across native iOS/iPadOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose), including shared WISE2 API integration, offline-first data, GitHub workflows, physical-device installation, camera/audio/BLE/Wi-Fi hardware integrations, app icons, release signing, APK/IPA distribution, and mobile UI quality control. Use for WISE2 app creation, mobile feature work, Xcode/Gradle failures, device deployment, App Store/Play Store preparation, Ray-Ban/camera/sensor companion features, and any request to ship or troubleshoot a WISE2 mobile app.
---

# WISE2 Mobile

## Operating mode

Treat every mobile app as part of the WISE2 Business OS, not as an isolated project. Reuse existing authentication, APIs, CRM/customer records, Context Engine, alerts, media pipelines, and deployment infrastructure whenever compatible.

Prefer native implementations for production WISE2 device-centric apps:
- iOS/iPadOS: Swift + SwiftUI.
- Android: Kotlin + Jetpack Compose.
- Use cross-platform frameworks only when the existing project already depends on one or the user explicitly requests it.

Follow this production workflow:

`INSPECT -> BACKUP/BRANCH -> CHANGE -> TEST -> BUILD -> INSTALL -> VERIFY -> RELEASE -> DOCUMENT`

Never claim a build, installation, deployment, signing operation, device test, or release succeeded unless the relevant command or device state was actually verified.

## Start every task

1. Inspect the repository, branch, uncommitted work, mobile project type, build files, signing configuration, and relevant environment variables without exposing secrets.
2. Preserve working functionality and another developer's uncommitted changes.
3. Identify the narrowest change that satisfies the request.
4. Load only the relevant reference:
   - iOS/SwiftUI: `references/ios.md`
   - Android/Compose: `references/android.md`
   - UI and icon quality: `references/ui-quality.md`
   - physical device / simulator / emulator: `references/device-testing.md`
   - signing and release: `references/release.md`
   - BLE, Wi-Fi, camera, audio, Ray-Ban-like or field hardware: `references/hardware.md`
   - shared WISE2 integration and architecture: `references/architecture.md`
5. Run `scripts/mobile_preflight.sh <repo-path>` before substantial build or release work when shell access is available.

## Routing rules

### iOS

For `.xcodeproj`, `.xcworkspace`, `Package.swift`, `.swift`, or iOS build/signing requests, follow `references/ios.md`.

Default to modern SwiftUI patterns, structured concurrency, platform-native navigation, accessibility, and explicit permission handling. Avoid replacing a working UIKit or mixed codebase just to standardize it.

### Android

For `build.gradle`, `build.gradle.kts`, `settings.gradle`, `AndroidManifest.xml`, `.kt`, APK/AAB or Android device requests, follow `references/android.md`.

Default to Jetpack Compose, coroutines/Flow, lifecycle-aware state, offline-first repositories, and existing dependency-injection/storage choices.

### Mobile UI quality

For visual polish, app icons, layout, animations, design-system work, or when generated UI looks generic, follow `references/ui-quality.md`.

Do not accept placeholder-looking mobile UI as production-ready. Match the established WISE2 design language and any supplied canonical reference image before creating new visual conventions.

### Device deployment and verification

For USB-connected phones/tablets, simulators, emulators, installation, logs, permissions or launch failures, follow `references/device-testing.md`.

A successful compile is not a successful device deployment. Verify installation, launch, primary navigation, required permissions, network access, and key device-specific function on the actual requested target when available.

### Signing and release

For TestFlight, App Store Connect, Play Console, APK/AAB/IPA, provisioning, certificates, Fastlane, versioning, or wise2.net downloads, follow `references/release.md`.

Never expose certificates, signing passwords, API keys, private keys, keystore passwords, or provisioning secrets in chat, logs, source control, generated screenshots, or build artifacts.

### Hardware and field integrations

For BLE, Wi-Fi peripherals, sensors, ESP32/SBC nodes, cameras, microphones, Ray-Ban/Meta-style companion flows, background connectivity, or field capture, follow `references/hardware.md`.

Design around capability detection and graceful degradation. Never assume a proprietary device API exists; verify the vendor-supported SDK/API path before implementing it.

## WISE2 integration rules

- Reuse existing WISE2 auth and customer identity when available.
- Prefer the existing WISE2 API/Context Engine over duplicate databases or one-off services.
- Route alerts and operational events through established WISE2 notification/Discord infrastructure when appropriate.
- Design offline-first for HVAC/field apps: queue writes locally, sync idempotently, expose sync state, and avoid data loss during connectivity changes.
- Store secrets only in approved secret stores/environment configuration, never source files.
- Keep local AI routing compatible with WISE2 AUTO/LOCAL/CLOUD policy when the app includes AI features.

## Quality gates

Before declaring completion, verify the applicable gates:

1. Source control is clean enough to distinguish the task changes from unrelated work.
2. Static analysis/lint passes or remaining warnings are explicitly documented.
3. Unit tests for changed logic pass.
4. UI/instrumented tests relevant to the change pass when present.
5. iOS/Android build succeeds for the requested configuration.
6. App installs on the requested simulator/emulator or physical device when available.
7. App launches without an immediate crash.
8. Primary requested flow works.
9. Permissions and network/error states are handled.
10. Release artifact is signed only when requested and signing credentials are available securely.
11. Artifact/version/source commit are traceable.
12. Final response states exactly what changed, what was verified, and any remaining blocker.

## Cost and context discipline

Keep the skill router concise. Load only the relevant reference files. Use local build tools, existing CI, and local models for routine transformations before spending cloud-model usage on repetitive work. Escalate to heavier reasoning for architecture, hard build failures, security-sensitive work, or multi-system debugging.

## Handoff format

When a coding agent must continue the work, produce a compact execution handoff containing:
- objective;
- current branch/repo/path;
- confirmed architecture;
- files/services to inspect;
- exact requirements;
- constraints and secrets policy;
- implementation sequence;
- test/build/install commands;
- deployment/release steps;
- verification checklist;
- rollback protection;
- definition of done.
