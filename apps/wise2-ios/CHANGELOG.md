# Changelog

## 2026-08-29

- Restored AuthGate + live Nest default: Keychain session restore on launch, Sign Out returns to login, DEBUG **Continue as Operator** keeps fixture preview.
- Operator-preview now includes a full Hermes approval loop (create/list/approve/reject), richer CRM/projects/systems fixtures, and Home chrome bound to AuthManager + brief alerts.
- Set Command Center up as a WISE² business operations client: Hermes chat modes, live approvals create/approve/reject, customers+prospects CRM, Hermes activity feed, billing/me account profile, and scope switcher mapped to Hermes modes.
- Home active work + alerts bind to Hermes daily brief; Systems incidents/uptime use live metrics only.
- Wired Command Center networking to live Nest `/api/v1` contracts: `accessToken`/`refreshToken` auth, `GET /auth/me`, Hermes chat + daily brief, customers CRM, systems health composite.
- Home screen now renders live Hermes/customer metrics (no hardcoded revenue/client tiles; failures surface instead of fake healthy data).
- BackendConnector is a retry facade over the shared APIClient (no duplicate models / wrong base URL).

## 2026-08-28

- Rewired the app from the WISE2 Wealth prototype shell to the WISE2 Command Center tab order: Home, AI, Work, Systems, More.
- Rebuilt Home as an executive Business OS dashboard with business switching, portfolio metrics, revenue trend, AI quick actions, business cards, attention feed, active work, and system health.
- Upgraded WISE2 AI with suggested commands, timeline, bottom safe-area composer, voice-ready control, approval previews, rejection, audit history, and Face ID gating for critical actions.
- Expanded Work into native CRM, projects, tasks, documents, and activity surfaces scoped by business context.
- Expanded Systems into truthful read-only infrastructure visibility with WISE2 API, PostgreSQL, Redis, workers, GPU/Ollama, websites, and automations.
- Expanded More into native destinations for billing, analytics, files, communications, AI Phone, team, permissions, integrations, audit log, account, security, settings, and support.
- Raised the deployment target to iOS 16.0 for `NavigationStack`.
- Changed the default API URL to TLS: `https://wise2.net/api/v1`.
