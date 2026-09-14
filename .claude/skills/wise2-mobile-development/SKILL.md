---
name: wise2-mobile-development
description: Build, debug, verify, and release WISE2 iOS, Android, React Native, Expo, BLE, and mobile companion apps. Use for Field Tech, Capture, Command Center mobile, Pocket Node controllers, and mobile hardware integrations.
---
# WISE2 Mobile Development

Use this skill for all WISE2 phone/tablet app work. Inspect the target app before editing and preserve existing architecture, signing, package IDs, and working native integrations.

## Routing
- `AUTO` is default: use local tooling/models first and escalate only when needed.
- `LOCAL` forces local WISE2/Ollama workflows where supported.
- `CLOUD` is reserved for tasks that materially benefit from hosted reasoning.
- Prefer `wise2-fast` for quick edits, `qwen2.5-coder:7b` for routine coding, and cloud Claude only for hard blockers/review.

## Platform selection
- Fast customer apps, Capture, Command Center: React Native + Expo when hardware access permits.
- BLE/HVAC/Pocket Node: shared React Native UI plus minimal native Swift/Kotlin modules.
- iPhone-only deep hardware: Swift + SwiftUI.
- Android/Razr deep hardware: Kotlin + Jetpack Compose.
- Quest companions: Unity/OpenXR with Android/Kotlin bridge only where needed.

## Mandatory lifecycle
`INSPECT -> PLAN -> TEST RED -> IMPLEMENT -> BUILD -> LAUNCH -> READ LOGS -> INTERACT -> FIX -> TEST -> RELEASE BUILD -> PREFLIGHT`

Never call mobile work complete from source inspection alone. Run `bash scripts/mobile/verify.sh`, then perform the platform-specific checks in IOS.md, ANDROID.md, or EXPO.md. Physical-device behavior must be tested on physical hardware when the feature depends on camera, microphone, BLE, NFC, GPS, sensors, background execution, or USB.
