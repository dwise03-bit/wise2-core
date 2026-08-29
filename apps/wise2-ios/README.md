# WISE2 Command Center iOS

Native SwiftUI command center for Daniel Wise's WISE2 business operating system.

## Current Scope

- Product: WISE2 Command Center (business operations client)
- Scheme: `WISE2`
- Bundle identifier: `com.wise2.commandcenter.ios`
- Deployment target: iOS 16.0+
- Signing: automatic, team `9N5L62DHKJ`
- API default: `https://wise2.net/api/v1`
- Auth: live Nest JWT by default; Keychain session restore on launch
- DEBUG escape hatch: **Continue as Operator** on AuthGate (local fixtures; or `MOCK_API=true`)

## Business operations surfaces

| Tab | Live Nest sources |
|-----|-------------------|
| Home | Hermes daily brief (MRR, customers, projects, alerts, active work) |
| AI | Hermes chat + create/list/approve/reject actions (Face ID for critical) |
| Work | Customers + prospects CRM, brief projects, Hermes approvals/activity |
| Systems | `/api/health`, Hermes health, `system/apis/health` |
| More | `auth/me` + `billing/me` (read-only) |

Operating scopes (`ALL BUSINESSES`, `CRM & Pipeline`, …) map to Hermes modes. They are AI context labels until a memberships/tenant list API ships — not fabricated multi-company KPIs.

Critical actions are queued as Hermes approvals and must be enforced by backend capabilities before execution.

## Verification

```bash
xcodebuild build -scheme WISE2 -destination 'generic/platform=iOS Simulator'
```

Tests are currently blocked because the `WISE2` scheme has no configured test action or test target.
