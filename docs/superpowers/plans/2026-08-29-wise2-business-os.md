# WISE² Business OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing WISE² SwiftUI Command Center into a secure mobile Business OS that operates WISE² through stable `wise2-core` APIs and the existing Control Bridge.

**Architecture:** Keep the iOS app as a native control plane and add a versioned `/api/v1/business-os` backend facade. Build independent vertical slices behind typed Swift clients/stores. Authoritative state and privileged execution stay server-side; sensitive operator actions remain named, allowlisted, authorized, audited, and confirmation-gated.

**Tech Stack:** SwiftUI, Swift 5, iOS 15+, XCTest, Foundation/URLSession, Keychain, LocalAuthentication, Node.js/TypeScript backend in `wise2-core`, PostgreSQL, Redis/worker infrastructure, existing WISE² Control Bridge.

**Spec:** `docs/superpowers/specs/2026-08-29-wise2-business-os-design.md`

## Global Constraints

- Primary iOS app path is `apps/wise2-ios`.
- Bundle identifier remains `com.wise2.app`.
- Minimum deployment target remains iOS 15.0 unless an existing project setting proves otherwise.
- Preserve existing Keychain/JWT auth, `APIClient`, and working app shell unless tests prove a targeted change is necessary.
- iOS never becomes the authoritative business database.
- All privileged infrastructure mutations use named server-side capabilities; no arbitrary SSH/shell API is permitted.
- Authorization is enforced server-side; hidden UI is not authorization.
- Trading remains separately permissioned.
- Existing customers are API data, never hard-coded app modules.
- Use test-first implementation and small commits.
- Update `docs/handoffs/WISE2_BUSINESS_OS_HANDOFF.md` at every session boundary.

---

## File Structure Map

Before Task 1, inspect the current repository and preserve equivalent existing paths when present. The target responsibility map is:

- `apps/wise2-ios/WISE2/Core/Networking/APIClient.swift` — transport only; preserve existing auth/header behavior.
- `apps/wise2-ios/WISE2/Core/Networking/BusinessOSClient.swift` — typed Business OS endpoints.
- `apps/wise2-ios/WISE2/Core/Models/BusinessOSModels.swift` — shared transport/domain DTOs used across first slices.
- `apps/wise2-ios/WISE2/Features/Command/CommandStore.swift` — Command feature state.
- `apps/wise2-ios/WISE2/Features/Command/CommandScreen.swift` — executive dashboard and command entry.
- `apps/wise2-ios/WISE2/Features/CRM/CRMStore.swift` — CRM feature state.
- `apps/wise2-ios/WISE2/Features/CRM/CRMScreen.swift` — pipeline UI.
- `apps/wise2-ios/WISE2/Features/Work/WorkStore.swift` and `WorkScreen.swift` — jobs/projects.
- `apps/wise2-ios/WISE2/Features/AI/AIWorkforceStore.swift` and `AIWorkforceScreen.swift` — agent jobs/approvals.
- `apps/wise2-ios/WISE2/Features/More/MoreScreen.swift` — module launcher.
- `apps/wise2-ios/WISE2/Views/Navigation/MainTabView.swift` — locked five-tab shell.
- `apps/wise2-ios/WISE2Tests/` — unit/contract decoding tests.
- Backend paths: locate the existing API module/package first; create a focused `business-os` module alongside current route/module conventions rather than inventing a second server.

---

### Task 1: Lock the Business OS Shell and Typed Contracts

**Files:**
- Inspect/Modify: `apps/wise2-ios/WISE2/Views/Navigation/MainTabView.swift`
- Create: `apps/wise2-ios/WISE2/Core/Models/BusinessOSModels.swift`
- Create: `apps/wise2-ios/WISE2/Core/Networking/BusinessOSClient.swift`
- Create/Modify: `apps/wise2-ios/WISE2Tests/BusinessOSModelsTests.swift`
- Create/Modify: `apps/wise2-ios/WISE2Tests/BusinessOSClientTests.swift`

**Interfaces:**
- Consumes: existing `APIClient` authenticated request mechanism.
- Produces: `BusinessOSClient`, `BusinessDashboard`, `BusinessOperation`, `BusinessOSModule`, and the locked five-tab navigation identifiers.

- [ ] **Step 1: Inspect current iOS files and test target**

Run from repo root:

```bash
find apps/wise2-ios -maxdepth 5 -type f | sort
sed -n '1,240p' apps/wise2-ios/WISE2/Core/Networking/APIClient.swift
sed -n '1,240p' apps/wise2-ios/WISE2/Views/Navigation/MainTabView.swift
```

Expected: identify the actual existing source/test layout before edits. If a listed target path differs, use the existing equivalent and record it in the handoff.

- [ ] **Step 2: Write failing decoding tests for shared contracts**

Add tests that decode this fixture and assert exact values:

```json
{
  "revenueToday": 425.50,
  "revenueMonth": 8320.00,
  "hotLeadCount": 4,
  "activeJobCount": 3,
  "unpaidInvoiceCount": 2,
  "criticalAlertCount": 1
}
```

Swift assertions must cover all six fields on `BusinessDashboard`.

- [ ] **Step 3: Run the focused test and verify failure**

Run the repository's existing iOS test command. If none is documented, use:

```bash
xcodebuild test -project apps/wise2-ios/WISE2.xcodeproj -scheme WISE2 -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
```

Expected: FAIL because `BusinessDashboard` does not exist yet. If the named simulator is unavailable, select an installed iPhone simulator and record the exact destination in the handoff.

- [ ] **Step 4: Implement minimal shared models**

Create Codable/Equatable models with these required signatures:

```swift
struct BusinessDashboard: Codable, Equatable {
    let revenueToday: Double
    let revenueMonth: Double
    let hotLeadCount: Int
    let activeJobCount: Int
    let unpaidInvoiceCount: Int
    let criticalAlertCount: Int
}

enum BusinessOSModule: String, CaseIterable, Codable {
    case command, crm, work, ai, phone, clients, cloud, studio, money, academy, trading, settings
}

struct BusinessOperation<Payload: Codable & Equatable>: Codable, Equatable {
    let operationId: String
    let status: String
    let message: String
    let auditEventId: String?
    let result: Payload?
}
```

- [ ] **Step 5: Write failing client request tests**

Test that the typed client requests `GET /api/v1/business-os/dashboard` and decodes `BusinessDashboard`. Reuse the repository's existing URLProtocol/mock transport pattern if present; do not introduce a third-party networking dependency.

- [ ] **Step 6: Implement `BusinessOSClient` minimally**

Required public interface:

```swift
protocol BusinessOSServing {
    func dashboard() async throws -> BusinessDashboard
}

final class BusinessOSClient: BusinessOSServing {
    func dashboard() async throws -> BusinessDashboard
}
```

Delegate auth/header/transport mechanics to existing `APIClient` rather than duplicating token logic.

- [ ] **Step 7: Lock navigation to Command / CRM / Work / AI / More**

Update the existing tab shell only enough to expose these five top-level destinations. Placeholder feature screens may be minimal text views for tabs not yet implemented, but must compile and must not contain fake business data.

- [ ] **Step 8: Run tests and build**

Run focused tests, then:

```bash
xcodebuild build -project apps/wise2-ios/WISE2.xcodeproj -scheme WISE2 -destination 'generic/platform=iOS Simulator'
```

Expected: PASS/build succeeds.

- [ ] **Step 9: Commit**

```bash
git add apps/wise2-ios docs/handoffs/WISE2_BUSINESS_OS_HANDOFF.md
git commit -m "feat(ios): establish Business OS shell and contracts"
```

---

### Task 2: Add the Backend Business OS Dashboard Facade

**Files:**
- Locate existing API module with `find apps packages services -maxdepth 4 -type f 2>/dev/null | grep -E '(controller|route|module|server)'`.
- Create focused `business-os` route/service files using the repository's established backend pattern.
- Test in the matching backend test directory.

**Interfaces:**
- Consumes: existing auth middleware, CRM/job/invoice/health services where available.
- Produces: authenticated `GET /api/v1/business-os/dashboard` returning the six-field `BusinessDashboard` contract from Task 1.

- [ ] **Step 1: Locate backend conventions and authoritative sources**

```bash
find apps packages services -maxdepth 5 -type f 2>/dev/null | grep -E '(controller|routes|module|service|spec|test)' | head -200
```

Inspect the nearest existing authenticated endpoint and service tests. Record selected backend paths in the handoff before editing.

- [ ] **Step 2: Write failing endpoint test**

The authenticated endpoint test must assert HTTP 200 and this exact JSON shape (values may be fixture values):

```json
{
  "revenueToday": 0,
  "revenueMonth": 0,
  "hotLeadCount": 0,
  "activeJobCount": 0,
  "unpaidInvoiceCount": 0,
  "criticalAlertCount": 0
}
```

Also write an unauthenticated test expecting the repository's standard unauthorized status.

- [ ] **Step 3: Run focused backend test and verify failure**

Use the package's existing test script discovered in Step 1. Expected: route missing/failing.

- [ ] **Step 4: Implement dashboard aggregator**

Create one focused service that reads real authoritative services when they exist. For a metric whose provider is not yet implemented, return `0` and document the missing provider in code/test naming; never fabricate random/sample production metrics.

- [ ] **Step 5: Implement authenticated route**

Mount exactly:

```text
GET /api/v1/business-os/dashboard
```

Use existing auth middleware and standard error envelope conventions.

- [ ] **Step 6: Run focused and package tests**

Expected: authenticated test PASS; unauthorized test PASS; no existing package tests regress.

- [ ] **Step 7: Commit**

```bash
git add <discovered-backend-paths> docs/handoffs/WISE2_BUSINESS_OS_HANDOFF.md
git commit -m "feat(api): add Business OS dashboard facade"
```

---

### Task 3: Build the Command Dashboard and Universal Command Entry

**Files:**
- Create: `apps/wise2-ios/WISE2/Features/Command/CommandStore.swift`
- Create: `apps/wise2-ios/WISE2/Features/Command/CommandScreen.swift`
- Create: `apps/wise2-ios/WISE2/Features/Command/CommandOrb.swift`
- Modify: `apps/wise2-ios/WISE2/Views/Navigation/MainTabView.swift`
- Test: `apps/wise2-ios/WISE2Tests/CommandStoreTests.swift`
- Backend: add `/api/v1/business-os/command` route/service in Task 2's discovered module.

**Interfaces:**
- Consumes: `BusinessOSServing.dashboard()`.
- Produces: `CommandStore.load()`, `CommandStore.submit(_:)`, and POST `/api/v1/business-os/command`.

- [ ] **Step 1: Write failing store tests**

Test states: initial, loading, successful dashboard, failed dashboard. Inject a fake `BusinessOSServing`; do not use global network state in tests.

- [ ] **Step 2: Implement `CommandStore`**

Required shape:

```swift
@MainActor
final class CommandStore: ObservableObject {
    @Published private(set) var dashboard: BusinessDashboard?
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?
    func load() async
}
```

- [ ] **Step 3: Write backend command-router negative tests first**

Assert that an unknown capability such as `shell` or `exec` is rejected. Assert an unauthenticated command is rejected. Assert a recognized read-only command can be resolved to a named handler.

- [ ] **Step 4: Implement named command router**

Initial allowed intents only:

```text
show_hot_leads
show_business_summary
health_check
```

Return a `BusinessOperation` envelope. Do not implement free-form shell execution.

- [ ] **Step 5: Add typed client submit method**

Extend `BusinessOSServing` with:

```swift
func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult>
```

Define `CommandResult` with a user-facing summary and optional deep-link module.

- [ ] **Step 6: Build Command UI**

Render dashboard metric cards from live store state, alert/error states, command text entry, and the persistent Command Orb. No fake production metrics.

- [ ] **Step 7: Run iOS/backend tests and build**

Expected: all focused tests PASS and iOS simulator build succeeds.

- [ ] **Step 8: Commit**

```bash
git add apps/wise2-ios <business-os-backend-path> docs/handoffs/WISE2_BUSINESS_OS_HANDOFF.md
git commit -m "feat: add WISE2 command center workflow"
```

---

### Task 4: Implement CRM Pipeline and Atomic Lead Claiming

**Files:**
- Create: `apps/wise2-ios/WISE2/Features/CRM/CRMModels.swift`
- Create: `apps/wise2-ios/WISE2/Features/CRM/CRMStore.swift`
- Create: `apps/wise2-ios/WISE2/Features/CRM/CRMScreen.swift`
- Test: `apps/wise2-ios/WISE2Tests/CRMStoreTests.swift`
- Backend: add `/leads`, `/opportunities`, and `/leads/:id/claim` under the Business OS facade using existing CRM persistence/services.

**Interfaces:**
- Produces stages: `lead`, `qualified`, `proposal`, `won`, `onboarding`, `active`, `renewal`, `reactivation`.
- `POST /api/v1/business-os/leads/:id/claim` must be atomic and return conflict when already claimed.

- [ ] **Step 1: Write backend lifecycle and concurrent-claim tests**

Tests must prove valid stages serialize exactly and two claim attempts cannot both succeed.

- [ ] **Step 2: Implement minimal CRM facade using authoritative storage**

Reuse existing customer/lead models where present. Do not create duplicate customer tables merely for mobile.

- [ ] **Step 3: Write Swift decoding/store tests**

Test pipeline grouping, loading/error state, and claim conflict presentation.

- [ ] **Step 4: Implement CRM store and screen**

Provide pipeline overview, lead list, lead detail, and claim action. Keep UI optimized for one-handed iPhone use.

- [ ] **Step 5: Run tests/build and commit**

```bash
git commit -am "feat: add Business OS CRM pipeline"
```

---

### Task 5: Implement Clients and Work

**Files:**
- Create focused `Features/Clients` and `Features/Work` Swift files/stores/tests.
- Backend: `/customers`, `/projects`, `/jobs` Business OS facade routes/services.

**Interfaces:**
- Customer records are dynamic API data.
- Work items link to customer/project identifiers; no client-specific Swift types.

- [ ] **Step 1: Write backend tests for customer/project/job relationships**
- [ ] **Step 2: Implement facade reads/writes using existing authoritative models**
- [ ] **Step 3: Write Swift store tests for customer 360 and work queues**
- [ ] **Step 4: Implement Clients and Work screens**
- [ ] **Step 5: Verify no existing customer name is hard-coded in feature source**

Run:

```bash
grep -R -n -E 'CJays|Fergie|Ultra Wise|SenCere' apps/wise2-ios/WISE2/Features || true
```

Expected: no hard-coded client implementation entries.

- [ ] **Step 6: Run tests/build and commit**

---

### Task 6: Implement AI Workforce and Human Approval Queue

**Files:**
- Create: `Features/AI/AIWorkforceModels.swift`, `AIWorkforceStore.swift`, `AIWorkforceScreen.swift`
- Tests under `WISE2Tests`.
- Backend: `/agents`, `/agents/jobs`, `/agents/jobs/:id/approve`, `/agents/jobs/:id/reject`.

**Interfaces:**
- Agent job includes id, role, status, summary, provider/model metadata when available, cost metadata when available, and approval requirement.

- [ ] **Step 1: Write backend tests proving approval-required jobs cannot execute privileged action before approval**
- [ ] **Step 2: Implement agent facade over existing Hermes/agent infrastructure**
- [ ] **Step 3: Write Swift store tests for pending/approved/rejected/failed states**
- [ ] **Step 4: Implement agent list, job detail, approval queue, and usage display**
- [ ] **Step 5: Run tests/build and commit**

---

### Task 7: Implement Communications Workspace

**Files:**
- Create focused `Features/Comms` Swift files/tests.
- Backend: `/conversations` facade and provider adapters only for providers already configured.

**Interfaces:**
- Conversation channel enum supports phone, sms, whatsapp, email, voicemail without implying every provider is live.
- Human takeover state is explicit.

- [ ] **Step 1: Write provider-neutral backend contract tests**
- [ ] **Step 2: Implement facade returning only configured/authoritative provider data**
- [ ] **Step 3: Write Swift tests for conversation list/detail/takeover state**
- [ ] **Step 4: Implement Comms UI and route it from More**
- [ ] **Step 5: Run tests/build and commit**

---

### Task 8: Integrate WISE² Cloud and Control Bridge Safely

**Files:**
- Create focused `Features/Cloud` Swift files/tests.
- Reuse existing Control Bridge backend; add Business OS adapter only where needed.
- Modify `Info.plist` only if LocalAuthentication/privacy keys actually require it.

**Interfaces:**
- Read operations: inventory, health, deployment metadata.
- Mutation capabilities: `deploy`, `restart`, `rollback`, `healthCheck` only when the server advertises/authorizes them.

- [ ] **Step 1: Write negative backend tests rejecting `shell`, `exec`, arbitrary command strings, and unauthorized capabilities**
- [ ] **Step 2: Write Swift tests proving sensitive action requires confirmation state before request dispatch**
- [ ] **Step 3: Implement `SensitiveActionAuthorizer` using LocalAuthentication**

Required interface:

```swift
protocol SensitiveActionAuthorizing {
    func authorize(reason: String) async -> Bool
}
```

- [ ] **Step 4: Implement Cloud store/UI over named Control Bridge operations**
- [ ] **Step 5: Verify source contains no SSH private key/token literals**

```bash
grep -R -n -E 'BEGIN (RSA|OPENSSH) PRIVATE KEY|sshpass|Authorization: Bearer [A-Za-z0-9]' apps/wise2-ios/WISE2 || true
```

Expected: no matches containing embedded credentials.

- [ ] **Step 6: Run Control Bridge tests, Business OS tests, iOS tests/build and commit**

---

### Task 9: Add HVAC Specialized Work Workspace

**Files:**
- Create focused `Features/HVAC` Swift models/store/screens/tests.
- Backend: `/hvac` facade over existing HVAC/field-service data and supported device integration services.

**Interfaces:**
- Offline-safe drafts: notes, measurement records, photo metadata, draft task/customer notes.
- Server-required actions: claims, invoices, deployments, concurrency-sensitive changes.

- [ ] **Step 1: Write tests for offline draft queue and later successful sync**
- [ ] **Step 2: Implement local draft queue with stable UUID/idempotency key**
- [ ] **Step 3: Implement HVAC customer/equipment/job/diagnostic views**
- [ ] **Step 4: Integrate device/provider data only through supported existing services; no undocumented SDK assumptions**
- [ ] **Step 5: Run offline/online transition tests and commit**

---

### Task 10: Add Studio/Growth and Finance/Admin Read Models

**Files:**
- Create focused `Features/Studio` and `Features/Finance` Swift files/tests.
- Backend: `/studio` and `/finance` facade services.

**Interfaces:**
- Studio attribution links campaign -> lead -> opportunity -> customer -> revenue when IDs exist.
- Finance returns authoritative provider/accounting/payment references only; absent providers produce explicit unavailable/zero states, never invented transactions.

- [ ] **Step 1: Write backend tests for missing-provider behavior**
- [ ] **Step 2: Implement read models over existing authoritative sources**
- [ ] **Step 3: Write Swift store tests for available/unavailable finance states**
- [ ] **Step 4: Implement Studio and Money screens routed from More**
- [ ] **Step 5: Run tests/build and commit**

---

### Task 11: Add Separately Permissioned Trading Entry

**Files:**
- Modify `Features/More/MoreScreen.swift`
- Add focused capability-gate model/tests; reuse existing auth role/capability source.

**Interfaces:**
- Trading module visibility/access derives from server-issued capability, e.g. `trading.access`.

- [ ] **Step 1: Write test proving user without trading capability cannot open Trading workspace**
- [ ] **Step 2: Implement capability gate**
- [ ] **Step 3: Add Trading launcher without mixing Trading balances/actions into Business Money**
- [ ] **Step 4: Run tests/build and commit**

---

### Task 12: End-to-End Hardening, UI Smoke Tests, and Handoff Verification

**Files:**
- Add/modify iOS UI tests under the existing UI test target.
- Add backend integration tests in the Business OS module.
- Update: `docs/handoffs/WISE2_BUSINESS_OS_HANDOFF.md`.

**Interfaces:**
- Validates the complete cross-slice contract without changing architecture.

- [ ] **Step 1: Add UI smoke test for authenticated navigation**

Verify the five primary destinations are reachable: Command, CRM, Work, AI, More.

- [ ] **Step 2: Add privileged-action negative integration test**

Prove an unauthorized user cannot deploy/restart/rollback and arbitrary shell remains impossible.

- [ ] **Step 3: Add request correlation assertions**

Verify privileged operation response/log metadata includes operation id and audit event id where required.

- [ ] **Step 4: Run full backend test suite relevant to Business OS/Control Bridge**

Use discovered package scripts; record commands/results in handoff.

- [ ] **Step 5: Run full iOS tests and Release build**

```bash
xcodebuild test -project apps/wise2-ios/WISE2.xcodeproj -scheme WISE2 -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
xcodebuild build -project apps/wise2-ios/WISE2.xcodeproj -scheme WISE2 -configuration Release -destination 'generic/platform=iOS'
```

Use an installed simulator/device destination if the example destination is unavailable.

- [ ] **Step 6: Update takeover handoff with evidence**

Record exact branch, commit, implemented slices, test commands/results, remaining blockers, and next task. Remove stale status lines rather than appending contradictory history.

- [ ] **Step 7: Commit final hardening documentation**

```bash
git add docs/handoffs/WISE2_BUSINESS_OS_HANDOFF.md apps/wise2-ios <business-os-backend-path>
git commit -m "test: harden WISE2 Business OS workflows"
```

---

## Self-Review Results

- Spec coverage: all locked modules are represented; implementation is deliberately vertical-slice based.
- Security coverage: server authorization, named Control Bridge capabilities, LocalAuthentication confirmation, idempotency, atomic lead claim, and arbitrary-shell rejection have explicit tests/tasks.
- Data integrity: no hard-coded clients and no fabricated accounting/provider state.
- Handoff continuity: every session must update one canonical handoff file.
- Placeholder scan: no TBD/TODO implementation placeholders are permitted; repository-specific backend paths are discovered before edits because the existing module layout must be preserved rather than guessed.

## Cursor / Claude / Codex Execution Instruction

Start with Task 1 only. Read the spec and handoff first. Inspect the repository before modifying files. Use TDD: failing focused test -> minimal implementation -> passing focused test -> broader build/test -> small commit. Update `docs/handoffs/WISE2_BUSINESS_OS_HANDOFF.md` before ending the session. Do not skip ahead into a giant rewrite.
