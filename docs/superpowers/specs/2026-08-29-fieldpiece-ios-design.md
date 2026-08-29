# WISE² iOS Fieldpiece Direct Integration Design

## Goal
Add a first-class HVAC Tool Hub to the existing WISE² SwiftUI iOS app that discovers and connects to Fieldpiece Job Link BLE instruments directly, normalizes live measurements for WISE² diagnostics, and remains safe when a device protocol has not yet been verified.

## Architecture
Use CoreBluetooth behind a `ToolTransport` boundary. `FieldpieceBLEManager` owns discovery, connection state, service/characteristic discovery, RSSI and reconnect behavior. `FieldpieceDeviceClassifier` identifies likely supported product families from verified advertisement/name evidence. `FieldpiecePacketDecoder` is deliberately fail-closed: only verified protocol profiles may emit measurements. Unknown services/packets are exposed as diagnostic metadata, never guessed into HVAC readings.

A normalized `ToolReading` model carries measurement type, value, unit, source device, assigned HVAC role and timestamp. SwiftUI consumes a `ToolHubStore`, not CoreBluetooth directly. This keeps future WISE² probes, Testo adapters, or other transports independent of the UI.

## UX
Add a premium WISE² Tool Hub reachable from the Work area. It shows Bluetooth readiness, scanning state, connected/discovered instruments, RSSI, battery when verified, role assignment, and live measurement cards. The visual language remains dark WISE² with electric green status/accent treatment and high-contrast digital values.

## Initial device families
Design classifiers and UI labels for JL3PR pressure probes, JL3PC pipe clamps, JL3RH psychrometers, JL3MN manometers, compatible SMAN manifolds, and compatible wireless electrical meters. Device-family recognition must not imply packet decoding support.

## Safety boundary
Do not invent proprietary Fieldpiece GATT UUIDs or packet layouts. Generic BLE discovery is allowed. Measurement decoding is enabled only by a verified `FieldpieceProtocolProfile` sourced from official documentation/SDK or captured-and-validated protocol evidence.

## App integration
Inject `ToolHubStore` at the app root. Replace the current Work placeholder with a WISE² HVAC work surface containing a Tool Hub entry and diagnostics-ready live data. Add Bluetooth usage strings to Info.plist. Add a test target for pure model/classifier/decoder behavior and use protocol abstractions so tests do not require Bluetooth hardware.

## Icon
Refresh the WISE² app icon to the approved black/electric-green direction: near-black base, dimensional metallic W²/WISE² mark, electric-green illumination and edge energy, no small secondary copy. Asset generation is separate from protocol implementation; Xcode must reference a complete AppIcon asset catalog before release.

## Success criteria
- iPhone can scan for BLE peripherals and display Fieldpiece candidates without crashing.
- Connection state and RSSI update live.
- Unknown/unverified packets never become fake measurements.
- Verified decoder profiles can emit normalized ToolReading values without UI changes.
- Tool Hub works in dark mode on iPhone and scales cleanly to iPad when the target is enabled.
- Bluetooth denial/unavailable states are clearly explained.
- Core logic is unit-testable without physical probes.
