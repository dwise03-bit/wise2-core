# WISE² Business OS — Agent Takeover Handoff

**Locked:** 2026-08-29
**Repo:** `dwise03-bit/wise2-core`
**Primary app:** `apps/wise2-ios`
**Architecture spec:** `docs/superpowers/specs/2026-08-29-wise2-business-os-design.md`
**Implementation plan:** `docs/superpowers/plans/2026-08-29-wise2-business-os.md`

## Mission

Finish the WISE² iOS Business OS as the secure native command center for running WISE². Do not redesign the architecture from scratch. Preserve working iOS/auth/networking and Control Bridge code and execute the approved vertical slices.

## Required reading

1. `docs/superpowers/specs/2026-08-29-wise2-business-os-design.md`
2. `docs/superpowers/specs/2026-08-27-wise2-control-bridge-design.md`
3. `docs/superpowers/specs/2026-08-28-wise2-cloud-design.md`
4. `docs/superpowers/plans/2026-08-29-wise2-business-os.md`
5. this file

## Locked navigation

`Command | CRM | Work | AI | More`

`More`: Phone, Clients, Cloud, Studio, Money, Academy, Trading, Settings.

## Locked technical rules

- iOS is the control plane, never the authoritative database.
- `wise2-core` owns business logic/state.
- Mobile facade is `/api/v1/business-os`.
- Privileged infrastructure mutations are named capabilities through the Control Bridge.
- No arbitrary SSH/shell execution from iOS.
- Sensitive production/destructive actions require explicit confirmation and LocalAuthentication where appropriate.
- RBAC/capability authorization is server-side.
- Preserve Keychain/JWT auth.
- Trading is separately permissioned.
- Customers are dynamic API records, never hard-coded Swift modules.

## Credit-saver mode

Inspect before generating. Make targeted edits. Preserve working components. Run focused tests first. Do not repeat visual analysis without a UI defect. Prefer local/GPU assistance for routine work and premium model passes for hard blockers.

## Current implementation status — 2026-08-29

- Branch: `feat/wise2-business-os`
- Locked design commit: `2b5bcff02eb6d4dfd2549b96bd5135086dc3f17b`
- Current slice: Task 1 / Task 3 foundation — Business OS shell, contracts, and Command UI.
- Added `WISE2/Core/Models/BusinessOSModels.swift` with dashboard/module/operation contracts.
- Updated `APIClient.swift` with reusable authenticated GET/POST transport while preserving Keychain bearer auth.
- Added `WISE2/Core/Networking/BusinessOSClient.swift` targeting `/business-os/dashboard` and `/business-os/command` relative to the existing `/v1` API base.
- Added `WISE2/Features/Command/CommandStore.swift`.
- Added `WISE2/Features/Command/CommandScreen.swift` with live-state metric cards and command composer; it contains no fake production metrics.
- Updated `MainTabView.swift` to the locked `Command | CRM | Work | AI | More` shell and module launcher.
- Updated the Xcode project source list to include the new Business OS Swift files.
- Backend discovery: primary API source exists under `apps/api/src`; existing route directory currently contains `apps/api/src/routes/trading.ts`. Inspect app bootstrap/package conventions before mounting Business OS routes.

## Verification status / blocker

The ChatGPT execution container cannot resolve `github.com`, so an isolated local checkout and `xcodebuild` verification could not be performed in this session. Do **not** claim the current branch builds until it is checked on a Mac/Xcode runner. Repository writes were made through the authenticated GitHub connector. The repo has GitHub workflows, but no iOS build result has yet been verified for this branch.

Before adding more vertical slices, run on a Mac checkout:

```bash
git fetch origin
git checkout feat/wise2-business-os
xcodebuild -project apps/wise2-ios/WISE2.xcodeproj -scheme WISE2 -destination 'generic/platform=iOS Simulator' build
```

If the project file needs repair, preserve the new Swift source files and regenerate/fix only project references. Then add an iOS test target if still absent and execute Task 1 tests from the implementation plan.

## Next exact actions for Cursor / Claude Code

1. Checkout `feat/wise2-business-os`.
2. Build the iOS target immediately and fix compile/project-reference errors before feature expansion.
3. Add/verify XCTest target and BusinessOS model/client tests from Task 1.
4. Inspect `apps/api` bootstrap/package files and existing auth middleware.
5. Implement authenticated `GET /api/v1/business-os/dashboard` and `POST /api/v1/business-os/command` with negative tests rejecting `shell`/`exec` capabilities.
6. Run focused backend and iOS tests.
7. Continue Task 4 CRM only after Command slice is green.
8. Update this file with exact test output, blockers, changed files, current commit, and next task before stopping.

## Copy/paste takeover prompt

You are taking over WISE² Business OS in `dwise03-bit/wise2-core` on branch `feat/wise2-business-os`. Work in credit-saver mode. Read the locked Business OS spec, Control Bridge spec, Cloud spec, implementation plan, and this handoff before editing. Do not redesign the architecture. First run the iOS build and repair only concrete failures. Then finish Task 1 tests and the Business OS backend dashboard/command facade. Never expose arbitrary shell/SSH. Privileged actions must be named, allowlisted, authenticated, server-authorized, audited, idempotent where retriable, and confirmation-gated when sensitive. Preserve existing working modules. Continue vertical slices in plan order only after tests are green. Before stopping, update this handoff with branch/commit, changed files, exact tests/results, blockers, and next exact task.
