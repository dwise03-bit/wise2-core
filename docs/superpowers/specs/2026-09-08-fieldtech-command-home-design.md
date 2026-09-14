# WISE² Field Tech Command Home Design

**Date:** 2026-09-08

## Goal
Replace the current WISE² Field Tech home dashboard with the approved command-style visual while keeping the existing native Android application, data model, offline behavior, and real navigation intact. Every visible action on the new home screen must either execute a real workflow or be clearly disabled with an explicit unavailable state; no decorative dead buttons.

## Canonical Target
- Repository: `dwise03-bit/wise2-core`
- App: `apps/fieldtech-android`
- Platform: native Android, Kotlin + Jetpack Compose
- Preserve existing package/application identity and existing auth/data/backend contracts.
- Extend existing navigation and repositories rather than creating a replacement application.

## Visual Direction
Use the approved WISE² Field Tech command dashboard as the source of truth:
- black/carbon background
- electric cyan/blue highlights
- metallic silver WISE² typography
- compact technician-first information density
- online/sync/GPS status immediately visible
- prominent job cards with status, address, view, navigate, and call actions
- quick actions arranged as touch-safe cards
- tools/integrations strip
- persistent bottom navigation
- large `NEW JOB` and `SCAN EQUIPMENT` calls to action

The UI must remain usable at 360dp, 390dp, and 412dp widths and respect safe areas and system bars.

## Home Screen Information Architecture
1. Brand/header area with WISE² Field Tech identity, notification/settings controls, technician identity, online/GPS state.
2. Sync banner showing synced, pending changes, offline, or error state with last sync timestamp.
3. Greeting/date/location summary.
4. Primary shortcut row: Scan Equipment, New Job, Customers, Work Orders, Parts & Inventory, Call/Text, AI Assist.
5. Today's Jobs section. Each job exposes:
   - status
   - customer
   - address
   - equipment/service context when available
   - View Job
   - Navigate
   - Call
6. Quick Actions section:
   - Diagnose
   - Live Readings
   - Create Report
   - Checklists
   - Asset Scan
   - Voice Note
7. Tools & Integrations:
   - Fieldpiece / Bluetooth tools
   - Bluetooth devices
   - Wi-Fi/network state
   - cloud sync
   - WISE² AI
8. Primary bottom CTAs: New Job and Scan Equipment.
9. Bottom navigation: Home, Jobs, Customers, Messages, More.

## Functional Routing
Reuse existing destinations wherever they already exist. Add destinations only for workflows that currently lack a route.

Required real actions:
- View Job -> existing Job Detail
- Diagnose -> existing Diagnose route for active/selected job
- Live Readings -> existing Live Readings route
- Settings -> existing Settings route
- AI Assist -> existing agent/IMP route
- Scan Equipment / Asset Scan -> existing equipment scanner flow
- Create Report -> existing report flow using active/selected job
- Navigate -> Android geo intent for job address
- Call -> Android dial intent using customer phone when present
- Voice Note -> existing voice-note/capture workflow when present
- Fieldpiece/Bluetooth -> existing tool connection path
- New Job -> existing creation flow if present; otherwise add a native New Job screen backed by the existing job repository/API contract
- Customers / Work Orders / Parts & Inventory / Messages / Checklists -> route to existing screens if present. If a backend/domain capability exists without a screen, add a focused screen. If neither capability nor contract exists, render a disabled card with a concise `Not configured` state rather than fabricating data.

## State Model
`HomeViewModel` remains the owner of home state. Extend `HomeUiState` as needed for:
- jobs
- isOnline
- pendingSyncCount
- lastSyncAt
- technician display name
- GPS enabled/available state
- selected or active job
- tool connection summary
- notification/message counts where existing data sources provide them

Do not hard-code real customer/job data into production state.

## Navigation and Side Effects
Navigation stays in `WiseNavGraph`. Composables emit callbacks; they do not directly own a `NavController` except existing app patterns that require it.

External side effects such as dialer and maps launch through small testable helpers so UI tests can verify intents without launching external apps.

## Error and Offline Behavior
- Offline: keep cached jobs visible, show offline state, and prevent workflows that require fresh network data from pretending to succeed.
- Pending sync: show count and preserve the existing pending-sync mechanism.
- Missing phone/address: disable Call/Navigate for that job with accessible state.
- No active job: job-specific quick actions ask the technician to select a job or remain disabled; they must not navigate with an empty job ID.
- Tool disconnected: show disconnected state and route to connection UI.

## Testing
Minimum coverage:
- home renders 0, 1, and multiple jobs
- pending sync / synced / offline states
- active-job action routing uses a non-empty job ID
- disabled state when no active job exists
- View Job, Diagnose, Live Readings, Report, Scan Equipment, Settings, AI actions invoke correct callbacks
- Call and Navigate are enabled only when their required data exists
- bottom navigation callbacks work
- 360dp-width Compose screenshot/layout test has no clipped primary actions
- existing repository/ViewModel tests continue passing

## Build Verification
Before completion:
- run unit tests for the Field Tech module
- run lint or compile checks available in the module
- run `assembleDebug`
- verify the APK output exists
- install with `adb install -r` and smoke test when an Android device is reachable
- do not claim the APK is complete unless the build succeeds

## Non-Goals
- Do not rewrite the app in Capacitor or create a second Field Tech APK.
- Do not change backend contracts solely for visual parity.
- Do not invent customer records, inventory quantities, messages, or tool readings.
- Do not add unrelated XR reconstruction work as part of this home-screen redesign.
