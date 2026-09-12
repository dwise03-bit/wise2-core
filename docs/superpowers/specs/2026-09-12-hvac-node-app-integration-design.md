# WISE² HVAC Node App Integration Design

Date: 2026-09-12
Status: Approved direction, implementation not started

## Objective

Integrate WISE² HVAC Node hardware into the existing WISE² Field Tech Android app so one HVAC Node screen can discover, pair with, read from, and manage both the Raspberry Pi 5 HVAC Node Ultra and Arduino UNO Q HVAC Node Pro. Reuse WISE² Core, current Field Tech architecture, existing HVAC models/calculations, offline-first repositories, and the current device-tracking/API patterns instead of creating a standalone backend or duplicate mobile app.

## Existing architecture to preserve

The existing Android app lives at `apps/fieldtech-android/` (`com.wise2.fieldtech`) and follows Compose UI -> ViewModels -> repositories -> Room/Retrofit, with offline-first behavior. Domain models are Android-independent. The project already contains `ReadingSnapshot`, `HvacCalculations`, `DiagnosticEngine`, `FieldToolAdapter`, `ToolManager`, Retrofit networking, Room persistence, WorkManager sync, CameraX capture, and secure token storage.

WISE² Core also already contains HVAC relationships in Prisma and a proven device-state pattern used by the K10 IMP, including an API endpoint and device registry/state tracking. The HVAC Node integration should generalize these patterns rather than create parallel infrastructure.

## Recommended architecture

Use one normalized `HvacNodeDevice` contract in the mobile app and backend. Hardware-specific adapters translate Pi 5 and UNO Q payloads into the same normalized telemetry model.

Data flow:

`Sensors -> Node hardware -> Node agent -> BLE and/or local Wi-Fi -> Field Tech ToolManager -> normalized ReadingSnapshot/HvacNodeSnapshot -> local Room cache -> UI + HvacCalculations + DiagnosticEngine -> WISE² Core API -> work order/equipment history -> alerts/Discord/CRM integrations`

Cloud access is not required for basic readings, calculations, or diagnostics. The app remains useful when disconnected and syncs queued writes when connectivity returns.

## Hardware support

### Raspberry Pi 5 HVAC Node Ultra

Primary transport: local Wi-Fi using a small authenticated node API/WebSocket service.
Fallback transport: Bluetooth Low Energy for discovery, pairing, status, and reduced-rate telemetry.

Pi 5 responsibilities:
- read pressure, temperature, RH, current/voltage, and optional accessory sensors;
- timestamp and validate samples;
- expose local status/telemetry;
- store a short local ring buffer during phone disconnects;
- support camera/OCR and future local-AI modules without making them required for V1;
- sync through the phone or directly to WISE² Core when configured.

### Arduino UNO Q HVAC Node Pro

Use the same external device contract. The Linux side handles networking, persistence, local services, and optional AI; the real-time MCU side handles deterministic sensor polling and hardware I/O. The adapter presented to the app must be indistinguishable from the Pi 5 adapter after normalization.

## Mobile app design

Add one `HVAC Node` destination to the existing Field Tech navigation.

Primary states:
1. No node connected — scan/pair screen.
2. Connecting — identity, signal, transport, firmware, battery/power status.
3. Live — pressures, temperatures, RH, electrical readings, superheat, subcooling, delta-T, psychrometrics, alerts, and connection quality.
4. Diagnostics — feed normalized readings into existing calculation and diagnostic domains.
5. Job attachment — associate a live session/readings/photos/report with current work order and equipment.
6. History — locally cached sessions plus cloud-synced historical readings.

Do not create separate Pi and UNO screens. A compact hardware badge may identify `NODE ULTRA / PI5` or `NODE PRO / UNO Q`, while controls and workflow remain identical.

## App components

Extend, do not replace, the existing Bluetooth/tool layer:
- `FieldToolAdapter`: generalized capability interface for field hardware.
- `Pi5HvacNodeAdapter`: Wi-Fi-first + BLE fallback implementation.
- `UnoQHvacNodeAdapter`: Wi-Fi/BLE implementation using the same normalized contract.
- `ToolManager`: discovery, active-device selection, reconnect, transport switching, state flow.

Add normalized domain objects:
- `HvacNodeDevice`
- `HvacNodeCapabilities`
- `HvacNodeSnapshot`
- `HvacNodeConnectionState`
- `HvacNodeSession`
- `HvacNodeAlert`

Reuse `ReadingSnapshot` where compatible; use explicit mappers rather than breaking current consumers.

## Normalized telemetry contract

V1 fields:
- device ID, model, firmware, timestamp, sequence number;
- suction pressure and liquid/discharge pressure;
- suction line and liquid line temperature;
- supply and return dry-bulb temperature;
- supply and return RH when available;
- voltage/current channels when available;
- battery/input-power state when available;
- sensor health/quality flags;
- connection quality and transport;
- optional refrigerant selection supplied by the technician/job.

Derived values such as superheat, subcooling, delta-T and psychrometrics should remain calculated in the existing pure Kotlin domain layer so results can be unit tested and do not depend on hardware firmware.

## WISE² Core API

Add a generic HVAC node API namespace rather than model-specific endpoints:
- `POST /api/hvac/nodes/register`
- `POST /api/hvac/nodes/{deviceId}/sessions`
- `POST /api/hvac/nodes/{deviceId}/telemetry/batch`
- `GET /api/hvac/nodes/{deviceId}`
- `GET /api/hvac/nodes/{deviceId}/latest`
- `POST /api/hvac/nodes/{deviceId}/alerts`

For live phone-to-node operation, telemetry should not need to round-trip through the VPS. The app consumes local node data immediately, caches locally, and batches sync to Core.

## Persistence

Add generic node/device/session/telemetry entities to Prisma and Room. Preserve existing HVAC property/equipment relationships. A session may optionally reference a work order, customer/property, and equipment asset.

High-frequency raw samples should not be written individually to the primary relational database forever. V1 stores configurable interval snapshots/events plus session summaries; raw high-rate data can stay on-device or be batched/compressed with retention limits.

## Authentication and security

- Never hard-code WISE² cloud secrets on field hardware.
- Node pairing creates a per-device credential/token.
- Local node API is authenticated after pairing.
- Cloud API continues to use existing app authentication.
- Device credentials are revocable from WISE² Core.
- Validate payload size, ranges, timestamps, sequence numbers, and device identity server-side.
- BLE provisioning must not expose cloud tokens.

## Offline behavior

The phone is the primary field controller. Live readings, calculations, diagnostics, notes, and session recording must work without internet. Room queues session/telemetry/report mutations and WorkManager syncs later using the existing offline-first pattern.

The node keeps a small local ring buffer so brief Bluetooth/Wi-Fi interruptions do not create gaps. Reconnection resumes by sequence number and deduplicates samples.

## Failure handling

- Lost connection: show stale-data state immediately; never present stale values as live.
- Bad sensor: mark channel unavailable/invalid; continue healthy channels.
- Node clock drift: preserve node timestamp but record phone receipt timestamp and flag large skew.
- Cloud unavailable: queue sync with bounded retry/backoff.
- Duplicate samples: dedupe by device ID + session ID + sequence number.
- Unsupported capability: hide/disable the associated UI rather than synthesize data.

## WISE² ecosystem integration

V1:
- Field Tech live HVAC Node screen;
- work order/equipment attachment;
- WISE² Core persistence;
- diagnostic calculations;
- report generation;
- offline sync.

V1.1:
- Discord alerts for critical readings/events;
- CRM/customer equipment history;
- remote supervisor view.

Later, behind capability flags:
- camera/OCR model/serial capture;
- local AI diagnostic assistant;
- Ray-Ban/Meta hands-free workflow;
- Quest spatial visualization;
- direct-node cloud sync.

## UI direction

Use the established WISE² HVAC blue/orange ice/fire language: dark navy/black surfaces, electric blue cooling metrics, orange heating/attention states, metallic W² marks, large legible gauges, and technician-first controls. UI must prioritize readability outdoors and in mechanical rooms over decorative effects.

## Testing

Unit tests:
- telemetry DTO -> normalized domain mapping;
- pressure/temperature/RH/electrical range validation;
- calculations using existing `HvacCalculations`;
- connection state transitions;
- sequence/dedup logic;
- offline queue behavior.

Integration tests:
- simulated Pi/UNO adapters through `ToolManager`;
- Wi-Fi disconnect/reconnect;
- BLE fallback;
- session attachment to job/equipment;
- batch upload and retry;
- malformed/partial payload handling.

Android verification:
- run `./gradlew test`;
- run `assembleDebug` through the existing Android build container when required;
- install/test on a physical Android field phone before calling the integration production-ready.

Backend verification:
- migration validation;
- API auth and validation tests;
- ingest/idempotency tests;
- query latest/session history;
- verify no existing K10/HVAC flows regress.

Hardware acceptance:
- compare node sensor readings against trusted instruments;
- validate sensor ranges/calibration;
- verify reconnect behavior and offline session recovery;
- do not ship derived HVAC recommendations until sensor accuracy is characterized.

## Rollout

1. Implement normalized domain/device contract with simulated adapter.
2. Add mobile HVAC Node screen and offline session persistence.
3. Add generic Core API/schema.
4. Implement Raspberry Pi 5 adapter/agent first.
5. Implement UNO Q adapter against the same contract.
6. Bench-test sensors and calibration.
7. Field-test on Android.
8. Enable Core/Discord/CRM integrations after telemetry reliability is proven.

## Rollback protection

- Keep existing `SimulatedToolAdapter` and current Field Tech flows intact.
- Add new node functionality behind a feature flag until field verification passes.
- Database changes must be additive for initial rollout.
- Do not remove or rename K10 endpoints/models as part of this work.
- Preserve current app auth and offline queue behavior.
- Hardware adapters remain isolated behind `FieldToolAdapter`/`ToolManager` so a node-specific failure cannot break the rest of Field Tech.

## Definition of done

The feature is complete only when:
- one HVAC Node screen discovers and connects to both Pi 5 Ultra and UNO Q Pro;
- both devices produce the same normalized domain snapshots;
- live readings remain usable without internet;
- superheat/subcooling/delta-T/psychrometric calculations use real normalized sensor values;
- sessions attach to jobs/equipment and sync to Core;
- reconnect/dedup/offline recovery is verified;
- server authentication/validation tests pass;
- Android unit/build tests pass;
- a physical Android phone has been tested with real node hardware;
- sensor readings are compared against reference instruments;
- no existing Field Tech, HVAC, K10, or authentication flow is broken.
