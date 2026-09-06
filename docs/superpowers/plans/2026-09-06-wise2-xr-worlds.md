# WISE² XR Worlds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a native Meta Quest 3S WISE² WORLD vertical slice that boots into Command City, preserves a persistent XR session, connects to WISE² services, streams into HVAC World through a spatial portal, and returns without losing state.

**Architecture:** A dedicated Unity Quest project owns presentation and XR interaction while wise2-core remains the server-authoritative API/event/Context Engine backend. A DontDestroyOnLoad XR Core provides narrow services to Addressables-loaded world scenes. Command City and HVAC are the only content worlds required for v0.1.

**Tech Stack:** Unity, C#, Meta XR SDK, OpenXR, Unity Addressables, Unity Test Framework, Android/Quest APK, HTTP/WebSocket WISE² gateway.

**Spec:** `docs/superpowers/specs/2026-09-06-wise2-xr-worlds-design.md`

## Global Constraints
- Target Meta Quest 3S.
- Persistent XR Core + streamable Addressables worlds.
- Command City is the home world.
- HVAC is the first destination world.
- Preserve the approved WISE² dark navy/black, chrome, cyan/electric-blue visual DNA.
- Quest owns XR/rendering/input; server/GPU infrastructure owns expensive AI/business logic.
- Do not embed long-lived secrets in the APK.
- Maintain a stable 72 Hz baseline; enable 90 Hz only when measured content budget allows.
- Controllers and hand tracking must both be supported.
- Live service failure must degrade to explicit offline/demo mode rather than terminate the experience.

---

### Task 1: Create the dedicated WISE2-XR Unity project and persistent service contracts

**Files:**
- Create: `WISE2-XR/Assets/WISE2/Core/IWise2Service.cs`
- Create: `WISE2-XR/Assets/WISE2/Core/Wise2Runtime.cs`
- Create: `WISE2-XR/Assets/WISE2/Core/RuntimeState.cs`
- Test: `WISE2-XR/Assets/WISE2/Tests/EditMode/Wise2RuntimeTests.cs`

**Interfaces:**
- Produces: `IWise2Service.InitializeAsync(CancellationToken)`, `Wise2Runtime.State`, `Wise2Runtime.Get<T>()`, and persistent runtime registration used by all later tasks.

- [ ] Write an EditMode test that registers a fake service, initializes the runtime, verifies `Ready` state, and verifies `Get<T>()` returns the same instance.
- [ ] Run the Unity EditMode test and verify it fails before the runtime exists.
- [ ] Implement `RuntimeState { Booting, Connecting, Ready, Offline, Failed }`, service registration, deterministic initialization, cancellation, and `DontDestroyOnLoad` persistence.
- [ ] Run the EditMode suite and verify the runtime tests pass.
- [ ] Commit with `feat(xr): add persistent WISE2 runtime core`.

### Task 2: Add WISE² authentication, HTTP health, WebSocket events, and offline mode

**Files:**
- Create: `WISE2-XR/Assets/WISE2/Integrations/Wise2GatewayClient.cs`
- Create: `WISE2-XR/Assets/WISE2/Integrations/Wise2Session.cs`
- Create: `WISE2-XR/Assets/WISE2/Integrations/Wise2EventStream.cs`
- Create: `WISE2-XR/Assets/WISE2/Core/OfflineModeService.cs`
- Test: `WISE2-XR/Assets/WISE2/Tests/EditMode/GatewayTests.cs`
- Backend modify/create: XR gateway routes in `wise2-core` following the repository's existing API conventions.

**Interfaces:**
- Consumes: `IWise2Service` and runtime state from Task 1.
- Produces: `Wise2Session.IsAuthenticated`, `Wise2GatewayClient.HealthAsync()`, `Wise2EventStream.ConnectAsync()`, and `OfflineModeService.IsOffline`.

- [ ] Write tests using a fake transport for healthy, unauthorized, timeout, reconnect, and offline fallback cases.
- [ ] Verify the tests fail before gateway classes exist.
- [ ] Implement short-lived token session handling, health request, reconnecting event stream with bounded backoff, and explicit offline state.
- [ ] Add the minimum backend XR health/session/event contract needed by the client; reuse existing auth rather than creating a second identity system.
- [ ] Run client tests plus the relevant wise2-core backend tests.
- [ ] Commit with `feat(xr): connect Quest runtime to WISE2 gateway`.

### Task 3: Build Quest XR player shell and wrist UI

**Files:**
- Create: `WISE2-XR/Assets/WISE2/XR/Wise2XRRig.prefab`
- Create: `WISE2-XR/Assets/WISE2/XR/XRBootstrap.cs`
- Create: `WISE2-XR/Assets/WISE2/UI/WristMenuController.cs`
- Create: `WISE2-XR/Assets/WISE2/UI/WristMenu.prefab`
- Test: `WISE2-XR/Assets/WISE2/Tests/PlayMode/XRBootstrapTests.cs`

**Interfaces:**
- Consumes: `Wise2Runtime`.
- Produces: persistent player rig plus Home, Worlds, AI, Voice, Notifications, Settings, and Exit commands.

- [ ] Write PlayMode tests that verify only one persistent XR rig exists after a scene transition and that wrist commands publish the expected navigation intents.
- [ ] Configure OpenXR/Meta XR for Quest 3S, controllers, hand tracking, room-scale tracking, teleportation, and comfort locomotion.
- [ ] Implement XR bootstrap and wrist menu without putting world-specific logic in either component.
- [ ] Run PlayMode tests and a Quest development build smoke test.
- [ ] Commit with `feat(xr): add Quest player shell and wrist controls`.

### Task 4: Implement World Manager, manifests, Addressables loading, and portals

**Files:**
- Create: `WISE2-XR/Assets/WISE2/Worlds/WorldManifest.cs`
- Create: `WISE2-XR/Assets/WISE2/Worlds/WorldManager.cs`
- Create: `WISE2-XR/Assets/WISE2/Portals/WorldPortal.cs`
- Create: `WISE2-XR/Assets/WISE2/Portals/PortalTransitionController.cs`
- Test: `WISE2-XR/Assets/WISE2/Tests/PlayMode/WorldManagerTests.cs`

**Interfaces:**
- Consumes: runtime and persistent XR rig.
- Produces: `WorldManager.LoadWorldAsync(WorldId)`, `WorldManager.ReturnHomeAsync()`, `WorldManifest`, and portal transition events.

- [ ] Write tests for successful load, failed dependency validation, cancellation, unload-after-ready, return-home, and session preservation.
- [ ] Verify tests fail before implementation.
- [ ] Implement manifest validation and Addressables scene loading so the old non-persistent world unloads only after the target reports ready.
- [ ] Implement portals as clients of WorldManager rather than direct scene loaders.
- [ ] Run PlayMode tests and repeatedly transition between two lightweight test scenes to detect duplicate core/player objects.
- [ ] Commit with `feat(xr): add streamable world and portal system`.

### Task 5: Build Command City vertical-slice home world

**Files:**
- Create: `WISE2-XR/Assets/WISE2/Worlds/CommandCity/CommandCity.unity`
- Create: `WISE2-XR/Assets/WISE2/Worlds/CommandCity/CommandCityManifest.asset`
- Create: `WISE2-XR/Assets/WISE2/Worlds/CommandCity/ContextEngineTower.cs`
- Create: `WISE2-XR/Assets/WISE2/Worlds/CommandCity/CommandCityStatusBinder.cs`
- Test: `WISE2-XR/Assets/WISE2/Tests/PlayMode/CommandCityTests.cs`

**Interfaces:**
- Consumes: gateway status, runtime state, WorldManager.
- Produces: home spawn, Context Engine tower state, HVAC portal availability, spatial status surfaces.

- [ ] Write tests that map runtime states to tower/status presentation and gate the HVAC portal on manifest readiness rather than network availability alone.
- [ ] Construct the Quest-optimized Command City environment using the locked WISE² visual language and baked/optimized lighting where practical.
- [ ] Bind the tower to runtime connection state and provide unmistakable live/offline/demo presentation.
- [ ] Add HVAC portal and home spawn/navigation landmarks.
- [ ] Profile on Quest 3S and reduce draw calls, transparent overdraw, texture memory, shadow cost, and geometry until the 72 Hz baseline is stable in the vertical-slice route.
- [ ] Commit with `feat(xr): build Command City home world`.

### Task 6: Add persistent IMP agent shell and spatial voice hook

**Files:**
- Create: `WISE2-XR/Assets/WISE2/IMP/ImpAgentRegistry.cs`
- Create: `WISE2-XR/Assets/WISE2/IMP/ImpAgentState.cs`
- Create: `WISE2-XR/Assets/WISE2/Voice/Wise2VoiceService.cs`
- Create: `WISE2-XR/Assets/WISE2/IMP/ImpInteractionStation.prefab`
- Test: `WISE2-XR/Assets/WISE2/Tests/EditMode/ImpAgentTests.cs`

**Interfaces:**
- Consumes: Context Engine/gateway services.
- Produces: persistent `ImpAgentState`, world-local interaction stations, and voice request/response events.

- [ ] Write tests proving IMP identity/task state survives simulated world unload/load and that a world station never owns authoritative agent state.
- [ ] Implement persistent agent registry and minimal spatial interaction station.
- [ ] Implement a voice-service boundary that sends recognized intent/audio metadata to WISE² services and receives response events; do not embed a large LLM in the APK.
- [ ] Run EditMode tests and verify state survives Command City/test-world transitions.
- [ ] Commit with `feat(xr): add persistent IMP and voice service shell`.

### Task 7: Build HVAC World and MR-ready data surface

**Files:**
- Create: `WISE2-XR/Assets/WISE2/Worlds/HVAC/HVACWorld.unity`
- Create: `WISE2-XR/Assets/WISE2/Worlds/HVAC/HVACManifest.asset`
- Create: `WISE2-XR/Assets/WISE2/Worlds/HVAC/HvacTelemetryBinder.cs`
- Create: `WISE2-XR/Assets/WISE2/Worlds/HVAC/SpatialGauge.prefab`
- Create: `WISE2-XR/Assets/WISE2/XR/PassthroughModeService.cs`
- Test: `WISE2-XR/Assets/WISE2/Tests/PlayMode/HVACWorldTests.cs`

**Interfaces:**
- Consumes: WISE² event stream and canonical Pocket Node -> Edge/API data contract.
- Produces: simulated/live HVAC telemetry presentation and passthrough-capable world mode.

- [ ] Write tests for telemetry updates, stale-data indication, simulated-data fallback, passthrough capability detection, and return-to-Command-City state preservation.
- [ ] Build a Quest-budget HVAC environment with one representative equipment station and spatial gauges.
- [ ] Bind gauges to live telemetry events with a deterministic simulated source when offline.
- [ ] Add Meta passthrough capability behind `PassthroughModeService`; keep immersive mode available when permission/capability is unavailable.
- [ ] Run the complete Command City -> HVAC -> Command City route on Quest 3S and verify session, IMP state, and connection state persist.
- [ ] Commit with `feat(xr): add HVAC world and passthrough foundation`.

### Task 8: Quest performance, resilience, APK pipeline, and acceptance test

**Files:**
- Create: `WISE2-XR/Assets/WISE2/Diagnostics/XRPerformanceMonitor.cs`
- Create: `WISE2-XR/Assets/WISE2/Tests/PlayMode/VerticalSliceAcceptanceTests.cs`
- Create: `WISE2-XR/README.md`
- Create: CI/build configuration appropriate to the repository chosen for the Unity project.

**Interfaces:**
- Consumes: all prior vertical-slice components.
- Produces: reproducible development APK and measurable acceptance criteria.

- [ ] Add an acceptance test covering boot -> Command City -> service state -> IMP station -> HVAC portal -> HVAC telemetry -> return home.
- [ ] Add runtime metrics for frame timing, memory pressure, world-load duration, gateway state, and reconnect count without collecting unnecessary sensitive content.
- [ ] Test cold launch, Wi-Fi loss/recovery, API timeout, repeated portal traversal, controller-only use, hand-only use, and passthrough denial.
- [ ] Profile the complete route on physical Quest 3S and require stable 72 Hz baseline before enabling 90 Hz mode.
- [ ] Produce and sideload a signed development APK, launch it on Quest 3S, and execute the acceptance route.
- [ ] Document Unity version, Meta/OpenXR package versions, build commands, sideload procedure, gateway configuration, and known limitations in README.
- [ ] Commit with `build(xr): complete Quest 3S vertical slice pipeline`.

## Post-v0.1 Recommendation Queue
After the vertical slice passes physical-headset acceptance, expand in this order: Business War Room -> WISE² Cloud World -> Creative Studio -> Client World template -> Trading Observatory -> Wise Defense World. Add multiplayer only after single-user persistence, portal transitions, and performance are stable.
