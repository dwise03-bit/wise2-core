# Hardware / Field Integration

## Verify capability first

For proprietary devices, glasses, cameras, sensors or vendor ecosystems, verify the current supported SDK/API and platform restrictions before promising direct control or data access.

## BLE

- Discover by service/characteristic UUID, not device display name alone.
- Model connection state explicitly.
- Add timeout/retry/backoff.
- Handle permission differences by OS version.
- Persist only identifiers that remain valid across reconnects.
- Make parsing deterministic and testable outside the UI.

## Wi-Fi / LAN devices

- Expect changing IPs; prefer discovery or stable device identity.
- Handle hotspot/no-internet local networks.
- Use TLS/authentication when crossing untrusted networks.
- Do not hardcode infrastructure addresses unless they are intentionally provisioned configuration.

## Camera / audio / capture

- Request permissions at the point of use.
- Surface recording state clearly.
- Protect client/private data and support redaction/deletion workflows.
- Plan for interruptions, backgrounding, low storage and upload failures.
- Queue media sync rather than losing capture when offline.

## Field apps

Prioritize:
- large, glove-friendly controls;
- readable sunlight contrast;
- offline queueing;
- battery-aware scanning/streaming;
- clear sync/connection indicators;
- resumable work orders and media uploads.
