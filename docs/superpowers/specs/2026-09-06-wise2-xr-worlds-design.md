# WISE² XR Worlds Design

## Goal
Turn the existing WISE² Quest experience into a native Meta Quest 3S multi-world spatial operating environment rather than a flat VR dashboard.

## Locked Architecture
Use a persistent WISE² XR Core with independently streamable worlds. Command City is the home world. Worlds load and unload additively through Unity Addressables while the player session, authentication, voice, IMP agents, notifications, networking, and context remain alive in the persistent core.

## Platform
- Target device: Meta Quest 3S
- Engine: Unity
- XR stack: Meta XR SDK + OpenXR
- Build target: Android APK for Quest 3S
- Interaction: controllers + hand tracking
- Locomotion: room-scale, teleport, and comfort movement
- Runtime modes: immersive VR plus passthrough MR where a world supports it
- Performance target: stable 72 Hz baseline with 90 Hz where content budget allows

## Persistent XR Core
The persistent core owns:
- session/auth state
- WISE² API client
- WebSocket event connection
- Context Engine client
- voice session
- IMP agent registry
- world/portal manager
- wrist UI shell
- user preferences and local cache
- notification routing
- telemetry and diagnostics

No world may duplicate or own these services.

## World System
Each world is an isolated Unity scene/addressable content group with a small manifest describing identity, dependencies, portals, mode support, and performance budget.

Initial world order:
1. Command City
2. HVAC Field World
3. Business War Room
4. WISE² Cloud World
5. Creative Studio
6. Client Worlds
7. Trading Observatory
8. Wise Defense World

### Command City
Command City is the canonical home world and spatial navigation hub. The visual baseline remains dark navy/black, electric blue/cyan glow, metallic chrome WISE² owl branding, cinematic isometric/futuristic city language, central WISE² Context Engine tower, live activity surfaces, and KPI visualization.

### HVAC Field World
First functional destination world. Supports immersive training and Quest passthrough MR. Canonical data path remains:
Pocket Node -> Wi-Fi/BLE -> WISE² Edge/API -> Quest 3S -> WISE² Context Engine.

The world provides live gauges, equipment diagnostics, work-order context, spatial equipment overlays, training stations, and MR anchoring beside real HVAC equipment.

## Portal Model
Navigation between worlds is represented by spatial portals rather than page navigation. Entering a portal requests the World Manager to preload the target world, validate required services, transition the player, and unload the previous non-persistent world after the new world is ready.

The persistent wrist menu provides Home, Worlds, AI, Voice, Notifications, Settings, and Exit as an always-available fallback.

## IMP Agents
IMP agents are persistent spatial AI assistants. Their identity and task state survive world transitions. Each world may provide specialized stations or behaviors for an IMP, but agent state belongs to XR Core and Context Engine services.

## Networking and AI
Quest handles rendering, tracking, input, spatial audio, lightweight local state, and interaction. Expensive AI inference and business logic stay on WISE² server/GPU infrastructure.

Primary flow:
Quest 3S -> WISE² XR Runtime -> WISE² API/WebSocket Gateway -> Context Engine -> CRM/HVAC/Cloud/Discord/Telnyx/AI services/Pocket Node services.

## Offline and Failure Behavior
If WISE² services are unavailable, XR Core enters demo/offline mode without crashing the world. Cached world metadata, non-sensitive local preferences, and demo interactions remain usable. Live surfaces clearly indicate stale/offline status. Portal transitions that depend on unavailable services fail gracefully and keep the player in the current world.

## Security
- No long-lived secrets embedded in the APK.
- Use short-lived authenticated tokens issued by WISE² services.
- Store only platform-appropriate local session material.
- Treat client/business data as server-authoritative.
- World content cannot directly access secrets; it consumes narrow XR Core interfaces.

## Vertical Slice v0.1
A successful first APK must provide this end-to-end flow:
1. Launch on Quest 3S.
2. Show WISE² owl boot sequence.
3. Initialize XR tracking and spatial calibration.
4. Enter Command City.
5. Activate Context Engine tower and wrist UI.
6. Connect to WISE² API/WebSocket or clearly enter offline/demo mode.
7. Present at least one persistent IMP agent interaction point.
8. Illuminate the HVAC portal.
9. Enter HVAC World through the portal.
10. Stream HVAC World without restarting the session.
11. Show at least one live or simulated HVAC data surface.
12. Return to Command City through a portal while preserving session/agent state.

## Recommended Repository Boundaries
The Unity app should live as a dedicated XR project rather than being mixed into backend runtime code. The backend remains in wise2-core and exposes XR-facing APIs/events. Recommended Unity structure:

Assets/WISE2/
- Core/
- XR/
- Worlds/
- Portals/
- IMP/
- Voice/
- UI/
- Integrations/
- Tests/

AddressableAssets/

If no existing Quest repository is available, create a dedicated WISE2-XR repository and keep wise2-core limited to gateway/API/event changes needed by XR.

## Non-Goals for v0.1
- Running a large LLM locally on Quest
- Building all worlds before validating Command City + HVAC
- Recreating web dashboards as floating 2D pages
- Multiplayer persistence
- Commerce/storefront systems
- Full digital-twin authoring tools

## Recommendations Locked With This Design
- Build the vertical slice before expanding the world count.
- Treat HVAC as the flagship proof of value because Quest 3S passthrough plus Pocket Node data differentiates WISE² from ordinary VR dashboards.
- Prefer spatial representations of business state over flat panels whenever the information can be understood physically.
- Keep all worlds service-driven and disposable so they can be unloaded without losing user state.
- Use server/GPU AI rather than consuming Quest thermal and memory budget with large local models.
