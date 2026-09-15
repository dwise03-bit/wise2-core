# WISE² Quest Command Center Design

Date: 2026-09-12
Status: Approved design for implementation planning
Target repo: `dwise03-bit/wise2-core`
Target app: `apps/wise2-xr`
Android package: `com.wise2.xrcommandcenter`

## Objective

Build the WISE² Quest experience as a single XR client that presents the same operational data in two modes:

1. **FIELD mode** — passthrough mixed reality over real HVAC equipment.
2. **COMMAND mode** — a cinematic WISE² Command World for broader operational control.

Both modes must share one active work-order/session context so switching modes never resets job state, measurements, AI context, notes, media, or completion status.

## Product Direction

The Quest client is not a separate system of record. It is a spatial interface over the existing WISE² stack.

The canonical data flow is:

`Pocket Node / Bluetooth tools / Field Agent -> WISE² API + Context Engine -> Quest XR -> CRM / Revenue OS / Discord / AI Phone / job history`

Field Agent remains the primary mobile field client. Quest adds spatial diagnostics, collaboration, simulation, and command visualization. Business OS and Revenue OS consume the same customer, asset, job, and invoice objects.

## Visual Language

The approved visual target is the cinematic WISE² Command Center concept:

- dark navy/black environment
- chrome/metallic WISE² surfaces
- electric blue/cyan system lighting
- neon green FIELD state
- gold REVENUE state
- purple AI/communications state
- holographic glass panels
- animated data routes
- volumetric lighting
- a central WISE² owl / intelligence core
- spatial districts arranged around the command center

The experience should feel premium, immersive, and intentional while remaining readable and performant on Meta Quest 3S.

## Core Experience

### Launch behavior

On Quest launch:

1. Resolve the signed-in technician identity.
2. Query the WISE² session service for an active job.
3. If one active job exists, enter that job automatically.
4. If no active job exists, show the Today / Dispatch queue.
5. If multiple eligible jobs exist, require explicit selection before entering the workspace.

### Persistent session

The active session is keyed by shared WISE² identifiers:

- technician ID
- customer ID
- work-order ID
- asset/equipment ID
- session ID

The same identifiers must be used by Field Agent, Quest, Business OS, Revenue OS, AI Phone, CRM, and the Context Engine.

## FIELD Mode

FIELD mode uses passthrough mixed reality and anchors diagnostic panels around the real equipment.

### Required stations

- Live Gauges
- Bluetooth Tools
- AI Diagnostics
- Equipment / Asset
- Work Order
- Photos / Capture
- Electrical Schematic
- Refrigerant Flow
- Alerts
- Communications
- Complete Job
- COMMAND portal

### Interaction model

Support:

- hand tracking
- Quest controllers
- gaze selection
- voice commands

Users must be able to:

- grab and move panels
- pin a panel near a physical component
- expand a schematic into a larger spatial view
- assign a Bluetooth reading to a system point
- ask WISE² questions aloud
- switch FIELD <-> COMMAND without session loss

## COMMAND Mode

COMMAND mode is the full WISE² spatial operating environment.

### Core districts

- Field Agent OS
- Business OS
- Revenue OS
- AI & Communications
- Devices & Hardware
- XR Simulation Lab
- Analytics
- Team / Collaboration
- Marketplace / Integrations

The active work order remains visible as a persistent job object while the user moves between districts.

## Shared Job Completion

Job completion is a shared backend action, not a phone-only or Quest-only action.

The same completion workflow must execute from either Field Agent or Quest:

1. validate required job data
2. validate required media / notes
3. finalize labor and parts
4. create or finalize invoice
5. capture customer signoff when required
6. persist completion event once
7. synchronize CRM / Revenue OS / Context Engine / Discord / AI Phone follow-up

The backend must enforce idempotency so completing the same job from two clients cannot create duplicate invoices, duplicate completion events, or duplicate customer notifications.

## Bluetooth Tool Hub

Bluetooth integrations must use a normalized measurement bus rather than brand-specific UI logic.

### Initial tool categories

- pressure probes / manifold data
- pipe temperature clamps
- return / supply psychrometers
- micron gauge
- refrigerant scale
- electrical clamp / meter
- WISE² Pocket Node

Each adapter converts source-specific data into normalized measurements with:

- source device ID
- measurement type
- value
- unit
- timestamp
- signal quality
- battery state when available
- assigned equipment point
- confidence / source classification

UI components consume normalized measurements only.

## Diagnostic System Twin

The XR client includes a live system twin with two major visual engines.

### Refrigerant Flow

Render the refrigeration circuit spatially and animate flow using measured data when available.

The visual must clearly distinguish:

- measured values
- expected/reference values
- inferred state
- simulated values

The system must never present inferred or simulated state as a live sensor measurement.

### Electrical Schematic

Render interactive wiring diagrams and component relationships.

Energized paths may change color only when the state is supported by actual measurements or explicit simulation state. Unknown state must remain visually distinct from confirmed energized/de-energized state.

The AI assistant can explain likely paths and recommend tests, but must not fabricate voltage/current state.

## AI Assistant

The Quest assistant uses the same active-job context as Field Agent.

Context may include:

- customer and work order
- asset history
- live normalized measurements
- photos and video
- Bluetooth tool state
- refrigerant model
- electrical schematic state
- technician notes
- relevant CRM / phone context

Routing should follow WISE² local-first policy:

`LOCAL -> existing infrastructure -> cloud AI only when needed`

The assistant is advisory. It must label measured, expected, inferred, and simulated information distinctly.

## Communications and AI Phone

Communications attach to the active work order.

Quest must surface:

- incoming customer calls
- call / text customer actions
- AI Phone handoff state
- recent transcript summary
- outbound ETA / completion messages
- follow-up status

A Quest completion event may trigger the same post-job communications workflow as Field Agent.

## Ray-Ban Meta Workflow

Ray-Ban Meta glasses are treated as a lightweight capture/voice edge to the active Field Agent session, not as a full XR display.

Supported workflow targets:

- POV photo / video capture into the work order
- voice notes
- nameplate / equipment capture
- hands-free WISE² query initiation through the paired phone workflow

Captured content must resolve to the same customer, asset, work order, and session IDs used by Quest and Field Agent.

## Team Collaboration

Every work order can become a shared team room.

### Collaboration functions

- multiple technicians on one session
- remote expert join
- shared live measurements
- shared media
- shared AI thread
- technician presence
- assigned tasks
- synchronized diagnostic state

Remote experts must see the same source labels for measured / expected / inferred / simulated data.

## Simulation Lab

Simulation uses the same UI and diagnostic engines as live operation but swaps the measurement source.

Source modes:

- `LIVE`
- `SIMULATION`

Initial simulation scenarios:

- normal cooling
- low refrigerant charge
- restricted airflow
- open pressure switch
- contactor / control fault

Simulation values must be visually labeled and must never be written to production equipment history as live measurements.

Simulation Lab also supports multiplayer training where one user injects a fault and another diagnoses it.

## Error Handling

### Connectivity loss

- cache the active job locally
- preserve panel layout and session state
- queue supported writes
- show explicit offline state
- reconcile on reconnect

### Sensor loss

- mark stale measurements with timestamp and source state
- stop live animation based on stale data
- retain last-known value only if clearly labeled as stale

### Session conflict

Use backend versioning / event IDs to prevent duplicate completion, invoice, signature, and notification actions.

### Unsupported Bluetooth device

Expose discovery diagnostics without pretending the device is supported. Unknown services/characteristics may be logged for adapter development, with secrets and personal data redacted.

## V1 Implementation Slice

The first production slice intentionally limits scope to the shell needed to prove the architecture.

### Build in V1

- Command World shell
- FIELD / COMMAND mode switch
- central WISE² intelligence core
- active-job persistent panel
- Field Agent station
- Revenue station
- AI / Communications station
- Today / Dispatch fallback
- simulation measurement provider
- normalized session model
- shared Complete Job UI contract stubbed to existing backend capabilities where necessary

### Defer until after shell validation

- broad real Bluetooth hardware support
- production refrigerant animation driven by live probes
- production energized electrical schematic state
- Ray-Ban automation
- multiplayer remote expert transport
- complete Revenue OS workflows

These features are designed now but implemented after the XR shell, session persistence, and simulation path are stable.

## Testing Strategy

### Editor / unit tests

- session state persistence
- FIELD / COMMAND switch without state loss
- normalized measurement parsing
- source classification
- completion idempotency client behavior
- simulation/live source separation

### Quest device tests

- launch into active job
- dispatch fallback
- hand tracking
- controller navigation
- passthrough FIELD mode
- COMMAND mode frame rate and readability
- mode switching
- offline transition and reconnect

### Integration tests

- Field Agent starts job -> Quest resolves same job
- Quest changes supported work-order state -> Field Agent receives update
- simulated measurement -> XR diagnostic panel
- complete job from Quest -> one backend completion event
- complete job from phone and Quest near-simultaneously -> no duplicate finalization

## Performance Constraints

- prioritize stable Quest 3S frame rate over excessive visual effects
- use level-of-detail and pooled effects for city/command visuals
- minimize transparent overdraw
- keep active diagnostic text readable at normal working distance
- degrade nonessential effects before degrading interactive UI

## Security and Data Rules

- no secrets embedded in Unity assets or source
- use authenticated WISE² APIs
- redact tokens and credentials from logs
- minimize customer data cached on-device
- encrypt sensitive persisted session data using platform-appropriate storage
- respect role permissions for financial, CRM, and customer actions

## Definition of Done for V1

V1 is complete when a technician can:

1. launch the existing Quest app
2. resolve an active or selected WISE² job
3. enter FIELD mode
4. view simulated diagnostic measurements
5. switch to COMMAND mode
6. visit the Field Agent, Revenue, and AI stations
7. retain the same active job/session across the transition
8. invoke the shared completion flow without duplicate actions
9. lose and restore connectivity without losing the active session
10. run the experience on Quest 3S with stable, usable interaction and readable UI

No production claim is complete until the APK is built, installed on Quest 3S, launched successfully, and the above acceptance flow is verified on-device.
