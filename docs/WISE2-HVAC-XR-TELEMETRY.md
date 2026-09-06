# WISE² HVAC XR Telemetry — Operations Guide

**Status:** Live (telemetry slice)
**Spec:** `docs/superpowers/specs/2026-09-06-wise2-superpowers-hvac-xr-design.md`
**Plan:** `docs/superpowers/plans/2026-09-06-wise2-superpowers-hvac-xr.md`

Connects an ESP32 Pocket Node to the Meta Quest 3/3S XR Command Center through an
authenticated WISE² backend boundary. The backend is the trust boundary: it
validates identity, schema, units, and freshness, then exposes a read-only
snapshot. The XR client polls that snapshot and never renders stale data as live.

## Components

| Layer | Location | Role |
| --- | --- | --- |
| Shared contract | `packages/wise2-hvac-contracts` | `PocketNodeTelemetryEnvelope`, `HvacTelemetrySnapshot`, `parsePocketNodeTelemetry`, `buildTelemetrySnapshot` |
| API boundary | `packages/api/src/hvac-telemetry` | `POST /v1/hvac/telemetry`, `GET /v1/hvac/telemetry/:nodeId/latest` |
| XR adapter | `apps/wise2-xr/Assets/Scripts/Services/Wise2HvacApiClient.cs` | Read-only poll + offline fallback |
| XR state mapping | `apps/wise2-xr/Assets/Scripts/Contracts/HvacTelemetry.cs` | Pure `HvacStateMapper` (UnityEngine-free) |

Routes are served under the API's global `api` prefix, so the deployed paths are
`/api/v1/hvac/telemetry` and `/api/v1/hvac/telemetry/:nodeId/latest`.

## Ingestion — `POST /v1/hvac/telemetry`

Authenticated (JWT). Tenant context is taken from the token claims by
`TenantMiddleware`; a request without tenant context is rejected.

Safe example envelope (no credentials, illustrative values):

```json
{
  "schemaVersion": 1,
  "nodeId": "pocket-node-01",
  "capturedAt": "2026-09-06T15:00:00.000Z",
  "readings": [
    {
      "suctionPressure": { "value": 118.4, "unit": "psig" },
      "dischargePressure": { "value": 300.1, "unit": "psig" },
      "suctionLineTemp": { "value": 52.0, "unit": "degF" },
      "superheat": { "value": 11.5, "unit": "deltaF" },
      "subcooling": { "value": 9.0, "unit": "deltaF" },
      "voltage": { "value": 241.0, "unit": "V" },
      "current": { "value": 14.2, "unit": "A" }
    }
  ]
}
```

Validation rules (`parsePocketNodeTelemetry`):

- `schemaVersion` must be a positive number, `nodeId` a non-empty string,
  `capturedAt` a parseable ISO-8601 string, `readings` an array.
- Every measurement present must be `{ value: <finite number>, unit: <non-empty string> }`.
  Strings are **not** coerced into numbers; `"118.4"` is rejected.
- Unknown reading fields are ignored for forward compatibility.
- Malformed input is rejected with a stable `TelemetryParseError` code and a
  `400`; the raw payload is not echoed back.

Success response: `{ "nodeId": "pocket-node-01", "receivedAt": "<ISO>", "readings": 1 }`.

## Read — `GET /v1/hvac/telemetry/:nodeId/latest`

Authenticated. Returns the latest `HvacTelemetrySnapshot` for that node **within
the caller's tenant**. A node that has never reported for the tenant returns
`NO_TELEMETRY`.

```json
{
  "nodeId": "pocket-node-01",
  "connectionState": "CONNECTED",
  "quality": "ok",
  "capturedAt": "2026-09-06T15:00:00.000Z",
  "receivedAt": "2026-09-06T15:00:01.100Z",
  "ageSeconds": 42,
  "reading": { "suctionPressure": { "value": 118.4, "unit": "psig" } },
  "reason": null
}
```

## Freshness and state rules

| `connectionState` | Meaning |
| --- | --- |
| `CONNECTED` | A reading was captured within the freshness window (default 120s). |
| `DEGRADED` | Last reading is older than the freshness window, or its timestamp could not be read, or transport/auth failed. Last-known values may still be shown, never labeled live. |
| `NO_TELEMETRY` | No readings received for this node/tenant. |
| `DEMO` | The client is explicitly serving offline demo data. |

`quality` is `ok` / `degraded` / `invalid` and tracks `connectionState`. Every
non-`CONNECTED` state carries a short, safe `reason`.

## XR client behavior

- Base URL: `Wise2Config.ApiBaseUrl` (dev default `http://127.0.0.1:3010` when
  built with `WISE2_USB_DEV`, otherwise `https://api.wise2.net`).
- Bearer token: read at runtime from the `WISE2_XR_TOKEN` environment variable.
  **No token is stored in a serialized Unity asset or in source control.**
- The HVAC station polls every 15s. On transport, auth, or parse failure it falls
  back to the offline demo source and shows `DEGRADED` (or `DEMO`), never
  `CONNECTED`.
- `HvacStateMapper` maps `CONNECTED → Connected`, `DEMO → OfflineDemo`,
  `DEGRADED` / `NO_TELEMETRY → Degraded`. It has no `UnityEngine` dependency and is
  the pure seam for verifying state behavior.
- All other stations and the visual palette are unchanged. Offline navigation of
  the command center does not depend on this endpoint.

## Security boundaries

- Ingestion and read are authenticated and tenant-scoped.
- This slice is read/ingest only. No state-changing HVAC command is added; any
  outbound action remains behind `CommandPreview` and explicit confirmation.
- Unity never receives Discord tokens or database credentials.
- Logs record `nodeId`, tenant id, and a reading count only — no raw secrets and
  no unnecessary customer or job data.

## Verification

Focused tests (run before broader suites):

```bash
pnpm --filter @wise2/hvac-contracts test
pnpm --filter @wise2/hvac-contracts type-check
pnpm --filter @wise2/api test -- hvac-telemetry.service.spec.ts
```

Quest build / install (requires a machine with Unity 6000.0.x + Android Build
Support, OpenJDK, and SDK/NDK):

```bash
bash apps/wise2-xr/scripts/build-quest.sh
adb install -r Build/WISE2-XR.apk
```

Then open the HVAC station and confirm the state label matches the backend
(`CONNECTED` / `DEGRADED` / `NO TELEMETRY` / `DEMO`) and that pulling the Pocket
Node offline flips the station to `DEGRADED` rather than freezing on live values.

## Current limitations / follow-ups

- Snapshot storage is an in-memory latest-per-node cache in the API service.
  Durable persistence and reading history are a follow-up.
- Transport is polling. A streaming adapter can be added behind the same contract.
- Device provisioning uses a preconfigured `nodeId`; no provisioning system is
  introduced here.
- Diagnostics, work orders, and spatial equipment context are out of scope for
  this slice (see spec phasing).
