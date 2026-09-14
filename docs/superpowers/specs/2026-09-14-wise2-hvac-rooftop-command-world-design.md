# WISE² HVAC Rooftop Command World Design

**Date:** 2026-09-14
**Status:** Approved by Daniel Wise
**Target:** Meta Quest 3 / 3S, `apps/wise2-xr`

## Goal
Boot directly into a full-scale commercial rooftop HVAC world matching the approved WISE² HVAC visuals, with spatial CRM, dispatch, pricing, diagnostics, work orders, training and AI surfaces integrated around interactive RTUs.

## Existing foundation to preserve
- Unity/OpenXR Quest client in `apps/wise2-xr`.
- Existing `Wise2HvacApiClient`, `ContractorOsApiClient`, Sound Labs client, offline demo state and approval/security boundaries.
- Existing Quest build script and Android/OpenXR configuration.
- No secrets, privileged credentials or direct database access in Unity.

## World architecture
`XRCommandCenterRuntime` remains the composition root but delegates the rooftop scene to focused components under `Assets/Scripts/HvacWorld/`.

The default boot world contains:
1. Full roof deck with parapet/safety rails and service walk paths.
2. Multiple commercial RTUs with condenser fans, intake/return/supply duct sections, control-panel doors, disconnects and service clearances.
3. Spatial component hotspots for inspect/diagnose actions.
4. CRM/Dispatch wall containing Clients, Leads, Quotes, Work Orders, Dispatch, Scheduling, Invoices, Contracts, Equipment, PM, Inventory, Reports, Photos, Team, Automation and Integrations.
5. Diagnostic station with live/offline HVAC telemetry state.
6. Pricing/quote station with service fees and Add to Quote / Generate Quote / Convert to Work Order flow surfaces.
7. Training station with Component ID, Troubleshooting, Safety and PM modes.
8. WISE² AI/Hermes station for contextual assistance; privileged actions remain preview/approval gated.
9. Rooftop map / job context panel.

## Interaction model
Quest users can walk/teleport physically through the rooftop. Controller/hand ray selection uses colliders on spatial buttons and equipment hotspots. Interactions are routed through small `RooftopInteractable` components rather than hard-coded into the runtime.

## Visual direction
- Dark gunmetal HVAC equipment, galvanized ductwork, realistic rooftop concrete/membrane surface.
- WISE² black/chrome base with cyan/electric-blue system glow and neon green healthy/success states.
- World-space panels use readable high-contrast text and limited transparency for standalone Quest performance.
- The roof itself remains bright/realistic; UI carries the cinematic WISE² treatment.

## Data behavior
- HVAC telemetry continues through `Wise2HvacApiClient`; network failure falls back to explicit demo/degraded states.
- CRM/job data continues through existing backend adapters; the world never presents missing remote data as live.
- Spatial quote/pricing data starts as local display data and can later bind to backend price-book APIs without changing world layout.

## Performance constraints
- Quest 3S standalone is the baseline.
- Use primitive/procedural geometry for the first shippable world, enabling later replacement with optimized authored meshes.
- Avoid per-frame allocations in world systems.
- Limit dynamic lights; prefer one directional/key light plus emissive-looking materials.
- Use simple colliders, LOD-ready equipment roots and no expensive transparent full-screen layers.

## Security
- No API secrets or customer credentials serialized in Unity assets.
- Existing backend remains the trust boundary.
- Privileged actions require preview and confirmation.
- Logs must not contain secrets.

## Verification
- Pure menu/layout tests run under Unity Test Framework where available.
- Rooftop world root and required stations must be created at runtime.
- Existing telemetry/offline behavior remains intact.
- `bash apps/wise2-xr/scripts/build-quest.sh` must compile the project on a machine with Unity Android support.
- Final hardware verification requires `adb install -r Build/WISE2-XR.apk` and launch on Quest 3S.
