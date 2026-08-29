# WISE² iOS Fieldpiece Direct Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-safe direct-BLE Fieldpiece Tool Hub to the existing WISE² iOS app and prepare the refreshed WISE² app icon.

**Architecture:** CoreBluetooth is isolated behind Fieldpiece-specific transport and pure decoding/classification types. SwiftUI observes a ToolHubStore containing normalized devices/readings; unverified Fieldpiece packets fail closed rather than producing guessed HVAC data.

**Tech Stack:** Swift 5, SwiftUI, Combine, CoreBluetooth, XCTest, Xcode project target iOS 15+

**Spec:** `docs/superpowers/specs/2026-08-29-fieldpiece-ios-design.md`

## Global Constraints
- Existing bundle identifier remains `com.wise2.app`.
- Existing deployment floor remains iOS 15.0.
- Do not invent proprietary Fieldpiece UUIDs or packet layouts.
- Unknown packets must never emit normalized HVAC measurements.
- Preserve the WISE² dark visual system and use electric green for tool/status emphasis.
- Icon direction: near-black, metallic W²/WISE² mark, electric-green illumination, no tiny copy.

---

### Task 1: Testable tool-domain model and classifier
**Files:** Create `WISE2/Core/Tools/ToolModels.swift`, `WISE2/Core/Tools/FieldpieceDeviceClassifier.swift`, `WISE2Tests/FieldpieceDeviceClassifierTests.swift`; modify Xcode project to add test target and sources.
**Interfaces:** Produce `ToolDevice`, `ToolDeviceFamily`, `ToolMeasurementKind`, `ToolReading`, `HVACProbeRole`, and `FieldpieceDeviceClassifier.classify(name:)`.
- [ ] Add failing XCTest cases for JL3PR/JL3PC/JL3RH/JL3MN/SMAN recognition and unknown names.
- [ ] Run classifier tests and confirm RED because production types do not exist.
- [ ] Implement minimal value types and name classifier.
- [ ] Run tests and confirm GREEN.
- [ ] Commit.

### Task 2: Fail-closed protocol decoding boundary
**Files:** Create `WISE2/Core/Tools/FieldpieceProtocolProfile.swift`, `WISE2/Core/Tools/FieldpiecePacketDecoder.swift`, `WISE2Tests/FieldpiecePacketDecoderTests.swift`.
**Interfaces:** Produce `FieldpieceProtocolProfile`, `FieldpiecePacketDecoder.decode(data:characteristic:device:) -> [ToolReading]` and an empty verified-profile registry by default.
- [ ] Add failing tests proving unknown characteristics and empty registry return zero readings.
- [ ] Run and confirm RED.
- [ ] Implement registry/profile boundary and fail-closed decoder.
- [ ] Run and confirm GREEN.
- [ ] Commit.

### Task 3: CoreBluetooth discovery and connection manager
**Files:** Create `WISE2/Core/Tools/FieldpieceBLEManager.swift`, `WISE2/Core/Tools/ToolHubStore.swift`; modify `WISE2/Info.plist`, `WISE2/App/WISE2App.swift`.
**Interfaces:** `FieldpieceBLEManager` publishes Bluetooth state and discovered/connected devices; `ToolHubStore` exposes `devices`, `readings`, `isScanning`, `bluetoothMessage`, `startScanning()`, `stopScanning()`, `connect(_:)`, `disconnect(_:)`.
- [ ] Add store-level tests using a transport protocol/fake transport before concrete CoreBluetooth wiring.
- [ ] Confirm RED.
- [ ] Implement transport protocol, store and CoreBluetooth manager with generic service discovery and no guessed UUID filtering.
- [ ] Add `NSBluetoothAlwaysUsageDescription` and `NSBluetoothPeripheralUsageDescription`.
- [ ] Run tests/build and confirm GREEN.
- [ ] Commit.

### Task 4: Levelled-up Tool Hub UI
**Files:** Create `WISE2/Views/Tools/ToolHubView.swift`, `WISE2/Views/Tools/ToolDeviceCard.swift`, `WISE2/Views/Tools/LiveReadingCard.swift`; modify `WISE2/Views/Navigation/MainTabView.swift`.
**Interfaces:** Tool Hub consumes environment `ToolHubStore`; Work surface routes into Tool Hub.
- [ ] Add view/store behavior tests where practical for scan state and role labels.
- [ ] Implement premium dark Tool Hub with electric-green scan/status treatment, large digital readings, device family, RSSI, connection state and role chips.
- [ ] Replace Work placeholder with HVAC Work surface and Tool Hub navigation.
- [ ] Build for iPhone simulator and confirm no layout/compiler failures.
- [ ] Commit.

### Task 5: Diagnostics-ready aggregation
**Files:** Create `WISE2/Core/Tools/HVACReadingSnapshot.swift`, `WISE2Tests/HVACReadingSnapshotTests.swift`; modify Tool Hub UI to show derived-ready grouping.
**Interfaces:** `HVACReadingSnapshot` groups latest readings by `HVACProbeRole` and measurement kind without calculating values from missing/unverified inputs.
- [ ] Add failing tests for latest-reading selection and missing-input behavior.
- [ ] Confirm RED.
- [ ] Implement snapshot aggregation.
- [ ] Confirm GREEN.
- [ ] Surface grouped values in Tool Hub.
- [ ] Commit.

### Task 6: App icon asset integration
**Files:** Create/modify `WISE2/Assets.xcassets/AppIcon.appiconset/Contents.json` plus generated PNG icon sizes; modify Xcode project resources if necessary.
**Interfaces:** Xcode continues to use `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon`.
- [ ] Generate approved 1024x1024 black/metallic/electric-green WISE² master icon with no tiny copy.
- [ ] Produce required iPhone/iPad/App Store sizes for the target configuration.
- [ ] Validate Contents.json filenames and pixel dimensions.
- [ ] Build and confirm asset catalog compiles.
- [ ] Commit.

### Task 7: Physical Fieldpiece validation harness
**Files:** Create `WISE2/Core/Tools/BLECaptureRecord.swift`, optional debug-only capture view, `docs/fieldpiece-protocol-validation.md`.
**Interfaces:** Capture peripheral name, advertised service UUIDs, discovered service/characteristic UUIDs, characteristic properties and raw notification bytes for developer validation; never upload automatically.
- [ ] Add tests for deterministic capture serialization with sensitive identifiers excluded.
- [ ] Implement debug capture export.
- [ ] Connect each available Fieldpiece tool and record verified protocol evidence.
- [ ] Add verified protocol profiles only after repeatable value comparison against the physical tool/Job Link display.
- [ ] Run full tests/build.
- [ ] Commit.

### Task 8: Final verification
- [ ] Run all XCTest targets.
- [ ] Build Debug for an iPhone simulator.
- [ ] Build Release for generic iOS device without signing.
- [ ] Verify Bluetooth-off and permission-denied UX.
- [ ] Verify unknown BLE devices cannot emit readings.
- [ ] Verify Tool Hub navigation and icon asset catalog.
- [ ] Review diff for secrets, captured hardware identifiers and accidental proprietary guesses.
