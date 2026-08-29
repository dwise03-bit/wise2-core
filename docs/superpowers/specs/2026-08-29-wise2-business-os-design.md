# WISE² Business OS — iOS Control Plane Design

**Status:** Locked design
**Date:** 2026-08-29
**Primary repo:** `dwise03-bit/wise2-core`
**iOS app:** `apps/wise2-ios`
**Bundle ID:** `com.wise2.app`
**Minimum iOS:** 15.0

## 1. Goal

Turn the existing WISE² iOS Command Center into the mobile operating system for running WISE² as a business. The app must unify sales, CRM, customers, projects, communications, AI agents, cloud/deployments, HVAC operations, studio/growth, finance/admin, and separately permissioned WISE² Trading without duplicating backend systems inside the phone.

The iOS app is the control plane. `wise2-core` remains the business brain and system integration layer.

## 2. Existing Foundation To Preserve

The existing iOS project already provides:

- SwiftUI application shell
- WISE² design tokens/colors
- Keychain-backed auth infrastructure
- JWT/session handling via `AuthManager`
- shared `APIClient`
- shared `AppState`
- five-tab navigation shell
- dashboard metrics, alerts, and service-health concepts
- app target at `apps/wise2-ios/WISE2.xcodeproj`

Do not replace these foundations unless a concrete incompatibility is proven by tests.

The existing WISE² Control Bridge is the privileged operator layer for infrastructure and deployment actions. Reuse its allowlisting, audit logging, health checks, deployment metadata, and production packaging rather than exposing SSH or arbitrary shell access from iOS.

## 3. Architectural Decision

### Chosen approach: Native WISE² Business OS over stable backend interfaces

The app will remain a native SwiftUI client. It will communicate with a WISE² API gateway/business facade inside `wise2-core`. Backend modules own authoritative business state, background jobs, integrations, and privileged execution.

Avoid two rejected alternatives:

1. **Thin web wrapper:** too limited for a premium mobile command center and poor for device-native auth, notifications, camera, audio, and field workflows.
2. **Business logic in iOS:** duplicates backend logic, creates inconsistent state, and makes automation/deployment unsafe.

## 4. Product Navigation

Keep the top-level mobile navigation intentionally small:

1. **Command**
2. **CRM**
3. **Work**
4. **AI**
5. **More**

A persistent WISE² Command Orb is globally available for text/voice commands.

`More` exposes Phone, Clients, Cloud, Studio, Money, Academy, Trading, and Settings.

## 5. Core Modules

### 5.1 Command

Purpose: executive home screen and universal action surface.

Must surface:

- revenue today / month
- recurring revenue where available
- hot leads and overdue follow-ups
- appointments and active jobs
- unpaid invoices / outstanding balances where available
- active client issues
- AI-agent activity and approvals
- infrastructure/service health
- deployment alerts
- quick actions
- global command input

The command input routes natural-language requests to a backend command router. Commands resolve to named, permissioned capabilities rather than raw shell commands.

Examples:

- `show hot leads`
- `show clients with overdue invoices`
- `deploy <client/site>`
- `restart <service>`
- `rollback <deployment>`
- `assign lead`
- `draft follow-up`
- `summarize today's business`

### 5.2 CRM + Revenue

Canonical customer lifecycle:

`Lead -> Qualified -> Proposal -> Won -> Onboarding -> Active -> Renewal/Reactivation`

Capabilities:

- lead inbox
- pipeline stages
- customer/contact profiles
- lead source and attribution
- notes and activities
- calls/messages/email references
- proposals/estimates
- invoices/payment status references
- subscriptions/service plans
- follow-up tasks
- review requests
- reactivation campaigns
- revenue analytics

Business operating loop:

`Attract -> Respond -> Qualify -> Book -> Dispatch -> Sell -> Follow Up -> Review -> Reactivate`

### 5.3 Work

Unified execution layer for internal and client work:

- projects
- jobs/work orders
- dispatch
- calendar/task references
- deliverables
- approvals
- files/documents
- site/app deployment status
- client onboarding checklists
- field work

HVAC is a specialized Work workspace, not a separate business silo.

HVAC capabilities include:

- customer/equipment history
- work orders
- diagnostics
- measurements
- photos/notes
- Fieldpiece/device integrations through supported connectors/services
- reports
- invoice/estimate references
- offline-tolerant field capture with later sync

### 5.4 AI Workforce

The AI module exposes WISE² agent roles behind one job/approval model:

- Executive IMP
- Sales IMP
- Marketing IMP
- Customer Success IMP
- Operations IMP
- Finance IMP
- Developer IMP
- Content IMP
- HVAC Diagnostic IMP

Each agent has:

- current jobs
- completed jobs
- approvals waiting on a human
- logs/result summaries
- model/provider used
- cost/usage metadata where available
- failure/retry state

Routine work defaults to local/GPU models when capable. Premium model escalation is explicit and policy-driven.

### 5.5 Communications

Unified conversation layer for:

- WISE² Phone
- SMS/WhatsApp where configured
- email
- voicemail
- transcripts/recordings references
- inbound qualification
- opted-in follow-up
- appointment booking
- human takeover

Qualified leads enter a shared claim queue. Claiming must be atomic to prevent double ownership.

### 5.6 Clients

Every customer receives a 360-degree workspace containing:

- identity/contact details
- brand assets
- website/app projects
- hosting/domain references
- CRM history
- phone/conversation history
- campaigns
- deliverables
- invoices/subscriptions
- support issues
- analytics
- permissions/access metadata

Do not hard-code existing customers into the app. Existing and future clients are records returned by the API.

### 5.7 WISE² Cloud

Expose operational controls for:

- VPS/server inventory
- websites
- domains/DNS status
- containers/services
- uptime
- CPU/RAM/storage telemetry
- logs
- backups
- SSL status
- deploy
- restart
- rollback
- health check
- reseller subscriptions/plans

All privileged mutations route through the Control Bridge or equivalent named operator capability.

No arbitrary shell execution from iOS.

High-impact operations require explicit confirmation; destructive or production-sensitive operations require Face ID / LocalAuthentication when supported.

### 5.8 Studio + Growth

Business-growth workspace for:

- websites
- social campaigns
- graphics/video jobs
- jingles/audio projects
- QR/digital card assets
- AI audit leads
- proposals
- client packages
- campaign attribution

Where data exists, connect:

`campaign -> lead -> opportunity -> customer -> revenue`

### 5.9 Business / Money

Expose management views for:

- revenue
- recurring revenue
- expenses
- outstanding invoices
- subscriptions
- profit by customer/service when available
- service catalog
- pricing
- contracts/documents
- SOPs
- Academy/training
- team access
- company analytics

The first version may aggregate payment/invoice references from existing providers; it must not fabricate accounting state when no authoritative provider exists.

### 5.10 WISE² Trading

Trading remains a separately permissioned workspace. It must not share ordinary operating-business money actions by default.

Trading navigation may appear in `More`, but access requires a distinct role/capability gate.

### 5.11 Control / Developer Operations

Expose controlled operational visibility for:

- GitHub repo/deployment references
- build/deploy status
- production versions
- service health
- agent monitoring
- audit logs
- feature flags where implemented
- emergency named controls

Named capabilities include examples such as:

- `healthCheck`
- `deploy`
- `restart`
- `rollback`

Never provide an iOS UI for arbitrary remote command execution.

## 6. Backend Boundaries

### iOS owns

- presentation
- device-native navigation
- local transient UI state
- secure token storage
- Face ID / LocalAuthentication gate
- push notification presentation
- camera/audio/file capture
- offline capture queue for supported field data
- user intent submission

### wise2-core owns

- authoritative business records
- CRM lifecycle rules
- customer/project/job state
- command authorization
- AI job orchestration
- queueing/background work
- communications/provider integration
- audit events
- deployment/operator actions
- billing/payment references
- analytics aggregation

### infrastructure owns

- PostgreSQL authoritative persistence
- Redis queues/cache where applicable
- worker execution
- GPU/local-model inference
- VPS/container operations
- provider-specific integrations

## 7. API Contract Strategy

Create a versioned mobile/business API facade instead of letting iOS call many unrelated internal services directly.

Recommended root namespace:

`/api/v1/business-os`

Resource groups:

- `/command`
- `/dashboard`
- `/leads`
- `/customers`
- `/opportunities`
- `/projects`
- `/jobs`
- `/agents`
- `/conversations`
- `/cloud`
- `/deployments`
- `/studio`
- `/finance`
- `/hvac`
- `/audit`

Every mutation returns a stable operation envelope containing:

- operation id
- status
- user-facing message
- result payload when available
- audit event id for privileged actions

Long-running work returns a job/operation id that can be polled or updated through push/websocket/SSE infrastructure as available.

## 8. Security

Required controls:

- JWT/session auth preserved
- Keychain token storage preserved
- role/capability based authorization server-side
- no reliance on hidden iOS UI for authorization
- production/destructive action confirmation
- Face ID gate for sensitive device-side confirmation
- allowlisted infrastructure actions
- audit event for privileged mutations
- no secrets in Swift source
- no provider API keys shipped in the app
- no arbitrary SSH/shell from iOS
- request idempotency for retriable mutations
- atomic lead claiming

## 9. Reliability and Offline Behavior

The app must distinguish:

- online live state
- cached read state
- queued offline field capture
- failed operation requiring user action

Never show a privileged server mutation as successful until the backend acknowledges it.

Offline support is initially limited to safe capture workflows such as HVAC notes, photos metadata, measurements, and draft task/customer notes. Deployments, billing mutations, lead claiming, and other concurrency-sensitive actions require an online backend acknowledgment.

## 10. Design System

Visual identity:

- near-black/carbon base
- metallic/chrome surfaces and typography treatments where legible
- electric blue as primary operating accent
- green reserved for healthy/revenue/success states
- amber/red reserved for warning/failure/critical states
- dimensional cards
- restrained glow
- premium data visualization
- subtle motion that does not obstruct field use

The experience should feel like a business command observatory, not a generic admin dashboard.

Accessibility and usability requirements:

- Dynamic Type-safe layouts where practical
- minimum 44pt interactive targets
- status not communicated by color alone
- reduced-motion compatibility
- key field workflows usable one-handed
- iPhone-first layouts with scalable iPad presentation

## 11. State Management

Preserve `AppState` as the app-level state owner initially, but split feature state into focused observable stores as modules grow.

Recommended feature stores:

- `CommandStore`
- `CRMStore`
- `WorkStore`
- `AIWorkforceStore`
- `ClientsStore`
- `CloudStore`
- `CommsStore`
- `FinanceStore`

Avoid turning `AppState` into a giant catch-all object.

## 12. Implementation Slices

Implementation is delivered as independently testable vertical slices:

1. Business OS shell + shared contracts
2. Command dashboard + universal command entry
3. CRM/revenue pipeline
4. Clients + projects/work
5. AI workforce + approval queue
6. Phone/comms
7. Cloud + deployments via Control Bridge
8. HVAC specialized workspace
9. Studio/growth
10. Finance/admin
11. separately permissioned Trading entry

Each slice must be usable before the next begins.

## 13. Testing

Required layers:

- Swift unit tests for view models/stores, decoding, command routing client, auth-sensitive UI state
- API contract tests for business-os endpoints
- backend unit/integration tests for authorization, idempotency, lead claiming, operator actions
- mock API fixtures for SwiftUI previews and deterministic tests
- UI smoke tests for primary navigation and critical actions
- negative tests proving unauthorized roles cannot invoke privileged actions
- deployment/control tests proving iOS cannot request arbitrary shell execution

## 14. Observability

Track:

- app/API request correlation id
- business operation id
- audit event id for privileged actions
- agent job id
- deployment id
- user-visible failure reason

Sensitive tokens/secrets must never be included in logs.

## 15. Credit-Saver / Agent Handoff Rules

To prevent repeated rediscovery and unnecessary premium-model usage:

- read this design before changing Business OS architecture
- inspect current files before generating replacements
- preserve working modules
- prefer targeted edits over rewrites
- run focused tests before broad tests
- use local/GPU models for routine generation/test assistance when practical
- reserve Claude/Codex premium passes for difficult implementation or blockers
- every implementation session updates the handoff with changed files, test results, blockers, and next exact task
- do not regenerate visual assets unless the existing approved asset is unavailable or explicitly being replaced

## 16. Agent Handoff Contract

Cursor, Claude Code, Codex, or another engineer must begin by reading:

1. `docs/superpowers/specs/2026-08-29-wise2-business-os-design.md`
2. `docs/superpowers/specs/2026-08-27-wise2-control-bridge-design.md`
3. `docs/superpowers/specs/2026-08-28-wise2-cloud-design.md`
4. the Business OS implementation plan when created
5. the most recent Business OS handoff file

Every takeover must report:

- current branch and commit
- current vertical slice
- files already changed
- tests already run and results
- known blockers
- exact next task

No agent may silently change the locked architecture. Architecture changes require an explicit design amendment.

## 17. Definition of Done

WISE² Business OS is complete when the iOS app can securely provide a single operational surface for the modules above, authoritative state remains in `wise2-core`/provider systems, privileged actions are named/audited/permissioned, the most important flows are covered by automated tests, and a new engineer/agent can resume from the repo documentation without relying on chat history.
