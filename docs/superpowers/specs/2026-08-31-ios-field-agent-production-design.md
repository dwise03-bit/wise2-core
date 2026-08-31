# WISE² iOS Field Agent Production Design

## Goal

Ship a road-ready WISE² Field Tech iOS client that connects verified Fieldpiece tools, works through weak/no connectivity, synchronizes full CRM job data, and is installable/updateable from a permanent wise2.net technician portal.

## Scope

This design covers three coordinated surfaces:

1. Native iOS Fieldpiece tool capture and technician workflow.
2. Offline-first CRM persistence and synchronization.
3. wise2.net technician install/update portal and signed iOS distribution handoff.

The existing `apps/wise-hvac-demo` production web app remains the browser CRM/field fallback. Existing production behavior must not be broken.

## Existing Baseline

- Native iOS app: `apps/wise2-ios`.
- Existing CoreBluetooth manager and Fieldpiece domain models already exist under `apps/wise2-ios/WISE2/Core/Bluetooth`.
- Existing HVAC field web app: `apps/wise-hvac-demo`.
- Existing production field jobs route through WISE² fieldtech APIs.
- Existing web field workflow already includes TODAY, JOB, TOOLS, IMP, repair, notes, attachments, report and closeout.
- Existing offline support is partial; a durable sync worker does not yet exist.

## Technician Experience

Primary workflow:

`TODAY -> CUSTOMER -> EQUIPMENT -> TOOLS -> LIVE -> IMP -> REPAIR -> TEST OUT -> NOTES -> SIGNATURE -> COMPLETE`

The technician must be able to finish the call without network connectivity after the job has been cached.

### Today

- Show assigned jobs for the signed-in technician.
- Cache the day's jobs locally.
- Show customer, site, arrival window, priority, current status and last sync state.
- Allow technician to select a job and continue offline.

### Customer and Equipment

- Customer/contact details.
- Site address and navigation handoff.
- Equipment make/model/serial/asset tag.
- Equipment history and prior repairs when cached.
- Add equipment photo, nameplate photo and QR/asset identifier.

### Tools

- Scan native BLE with CoreBluetooth.
- Recognize supported Fieldpiece devices by verified identifiers/protocols.
- Allow explicit technician role assignment when a device cannot be safely inferred.
- Show signal strength, connection state, last reading and last-seen time.
- Reconnect known tools automatically during the active job when safe.
- Never convert arbitrary manufacturer bytes into a production measurement unless the Fieldpiece frame/characteristic is verified.

Initial roles:

- low-side pressure
- high-side pressure
- suction-line temperature
- liquid-line temperature
- return psychrometer
- supply psychrometer
- multimeter/amperage when supported
- static pressure/manometer when supported

Unsupported or unverified devices remain visible as unsupported/unknown and never produce trusted measurements.

### Live Measurements

Measurements are attached to the active work order with:

- job ID
- equipment ID when available
- probe/device ID
- tool role
- measurement key
- value
- engineering unit
- captured timestamp
- source (`fieldpiece`, `manual`, `derived`)
- verification state

Supported derived values are calculated only when required inputs are present and valid:

- superheat
- subcooling
- Delta-T
- TESP
- stability state

No fabricated or simulated production data.

### IMP Diagnostics

- Feed verified live/manual measurements into the existing WISE² IMP flow.
- Preserve evidence-based diagnostic output.
- Persist the diagnostic input snapshot and result to the job.
- Allow the technician to record guided-test outcomes and next-best-test results.

### Repair and Test-Out

- Record repair performed.
- Capture test-in and test-out measurement snapshots.
- Compare before/after values.
- Technician explicitly records verification result.

### Closeout

- Technician notes.
- Photo/video/voice attachments.
- Customer signature.
- Service report preview.
- Completion state.
- If offline, completion is queued locally and clearly marked `SAVED LOCALLY` until server acknowledgement.

## Offline-First Architecture

### Local Store

Use a durable native store for:

- cached technician identity/session metadata
- assigned jobs
- customer/site/equipment snapshot
- measurements
- diagnostics
- repairs
- notes
- attachment metadata
- signature metadata
- completion events
- sync queue

Secrets/tokens remain in Keychain, not the general local database.

### Sync Queue

Every mutating field action creates an idempotent sync operation with:

- operation ID
- entity type
- entity ID
- job ID
- payload
- created time
- retry count
- last error
- server acknowledgement state

The queue must:

- preserve operation ordering within a job when required
- retry transient failures with backoff
- distinguish retryable vs terminal errors
- survive app termination
- resume on app launch and network restoration
- never drop locally completed work without an explicit technician-visible error state

Server writes must use idempotency keys where supported. If the existing API lacks idempotency support, the client must include stable operation IDs and the API track processed operation IDs before the workflow is considered fully production-safe.

### Conflict Rules

- Measurements and attachments are append-only.
- Technician notes use last-local-edit wins until server acknowledgement, with server revision retained for audit.
- Job status transitions are monotonic except where the server explicitly allows rollback.
- Server assignment/reassignment wins for ownership, but locally captured field evidence remains attached and syncable.

## Authentication and Roles

- Google sign-in / existing WISE² session remains the identity source unless the production auth API changes.
- Store refresh/session secrets in Keychain.
- Cache the minimum identity data required for offline operation.
- Enforce field technician role access in the API; hiding screens in iOS is not sufficient authorization.
- Expired credentials do not erase unsynced local work. The app asks for re-authentication before sync.

## iOS Distribution

Permanent technician portal:

`https://wise2.net/fieldtech`

Portal responsibilities:

- identify iPhone/iPad visitors
- display current WISE² Field Tech build/version
- show install/update CTA
- show release notes and minimum iOS version
- show backend/API status
- provide QR code for another device
- redirect to the currently approved Apple distribution target

Initial production distribution should use TestFlight unless the organization's Apple account is configured for another lawful signed distribution method. A raw unsigned/ad-hoc IPA is not considered a general road-install solution.

The portal must keep a stable URL even if the underlying TestFlight/App Store/managed-distribution target changes.

## API Contract Direction

The iOS app should consume the existing WISE² fieldtech API where contracts already exist and add only the smallest missing endpoints required for:

- job sync bootstrap
- measurement append/batch append
- diagnostic snapshot/result persistence
- repair/test-out persistence
- attachment metadata upload lifecycle
- signature metadata
- idempotent sync-operation acknowledgement
- job completion

All API errors returned to the iOS app must be mapped to typed client errors: auth, forbidden, validation, conflict, transient network/server, unsupported operation.

## Security

- TLS for all network traffic.
- Keychain for credentials.
- Local database protected by iOS data protection.
- No secrets in logs.
- No customer PII in debug analytics events.
- Attachments are associated with authenticated jobs and use server-authorized upload destinations.
- BLE identifiers/measurements are scoped to active technician workflows.

## Observability

Capture non-sensitive telemetry for:

- login success/failure category
- job bootstrap success/failure
- BLE discovery/connect/disconnect
- verified vs unsupported tools
- sync queue depth
- sync success/retry/terminal failure
- completion acknowledgement
- app build/version

## Testing

### Unit

- Fieldpiece role mapping.
- Verified frame/characteristic decoding.
- measurement validation and derived calculations.
- sync queue ordering, retry and idempotency.
- conflict rules.
- typed API error mapping.

### Integration

- iOS local store + sync worker against mocked fieldtech API.
- offline capture -> reconnect -> successful server sync.
- expired auth with unsynced work retained.
- repeated sync operation does not duplicate measurements/completion.

### Field Device

- supported Fieldpiece probes on a physical iPhone.
- Bluetooth permission denied/re-enabled.
- tool out-of-range/reconnect.
- airplane-mode service call.
- weak LTE recovery.
- app kill/relaunch with queued work.

### Release

- archive/sign succeeds.
- TestFlight upload or configured signed distribution succeeds.
- `wise2.net/fieldtech` points to the approved current build.
- production smoke test confirms login, assigned-job load, one field capture path and sync health.

## Definition of Done

A technician can install/update from `wise2.net/fieldtech`, sign in, cache assigned calls, drive into a low/no-service environment, complete the service workflow with supported Fieldpiece tools or manual entry, retain all work locally, reconnect later, synchronize the full job to WISE² CRM without duplicate records, and receive server acknowledgement that the call is complete.

Production must never label simulated/unverified BLE bytes as real Fieldpiece measurements.