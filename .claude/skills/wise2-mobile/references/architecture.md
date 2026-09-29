# WISE2 Mobile Architecture

## Default shape

Use the mobile app as a client of existing WISE2 services rather than creating a parallel backend.

Recommended layers:
- Presentation: SwiftUI or Jetpack Compose.
- Domain: use cases / business rules isolated from UI.
- Data: repositories abstract remote + local sources.
- Local persistence: platform-native or existing project choice.
- Sync: idempotent queued writes with retry/backoff and visible sync state.
- Networking: typed API client, explicit timeout/retry policy, structured errors.
- Authentication: reuse existing WISE2 identity/session flows.
- Observability: structured app logs, crash reporting if already approved, build/version metadata.

## AI features

Keep AI routing aligned with WISE2 AUTO/LOCAL/CLOUD policy. Prefer local/existing infrastructure for routine inference. Treat cloud calls as explicit fallbacks or higher-capability routes. Never hardcode model/provider secrets in the app bundle.

## Integration priority

Before adding a new service, inspect whether WISE2 already provides:
1. authentication/user records;
2. CRM/customer/work-order records;
3. file/media storage;
4. notifications/Discord alerts;
5. AI context/history;
6. device telemetry endpoints;
7. existing mobile/web API contracts.

Reuse first. Add new services only when the existing contract cannot safely support the requirement.
