# WISE² Business OS — Agent Takeover Handoff

**Locked:** 2026-08-29
**Repo:** `dwise03-bit/wise2-core`
**Primary app:** `apps/wise2-ios`
**Architecture spec:** `docs/superpowers/specs/2026-08-29-wise2-business-os-design.md`

## Mission

Finish the WISE² iOS Business OS as the secure native command center for running WISE². Do not redesign the architecture from scratch. Preserve existing working iOS/auth/networking and Control Bridge code, then implement the approved vertical slices.

## Required reading before edits

1. `docs/superpowers/specs/2026-08-29-wise2-business-os-design.md`
2. `docs/superpowers/specs/2026-08-27-wise2-control-bridge-design.md`
3. `docs/superpowers/specs/2026-08-28-wise2-cloud-design.md`
4. `docs/superpowers/plans/2026-08-29-wise2-business-os.md` once present
5. this file

## Known existing iOS foundation

The project already has a SwiftUI application foundation with WISE² design colors, Keychain/JWT authentication, `APIClient`, `AppState`, a five-tab navigation shell, auth flow, and initial home/dashboard concepts. Inspect current source before changing anything.

## Locked product navigation

`Command | CRM | Work | AI | More`

Global WISE² Command Orb available across the authenticated app.

`More` contains Phone, Clients, Cloud, Studio, Money, Academy, Trading, Settings.

## Locked technical rules

- iOS is a control plane, not the authoritative database.
- `wise2-core` owns business logic and authoritative business state.
- Use a versioned `/api/v1/business-os` facade.
- Privileged infrastructure actions use named capabilities through the Control Bridge.
- Never expose arbitrary SSH/shell execution in iOS.
- Sensitive production/destructive actions require confirmation and LocalAuthentication where appropriate.
- Server-side RBAC/capability checks are mandatory.
- Preserve Keychain/JWT auth unless tests prove replacement is necessary.
- Keep Trading separately permissioned.
- Do not hard-code customers.
- Offline mutations are limited to safe capture workflows until server acknowledgment is possible.

## Vertical slice order

1. Business OS shell + shared contracts
2. Command dashboard + universal command entry
3. CRM/revenue
4. Clients + projects/work
5. AI workforce + approvals
6. Phone/comms
7. Cloud/deployments
8. HVAC workspace
9. Studio/growth
10. Finance/admin
11. Trading entry/capability gate

Do not attempt all slices in one giant rewrite.

## Credit-saver operating mode

- Inspect before generating.
- Make targeted edits.
- Do not rebuild working components.
- Use focused tests first.
- Avoid repeated screenshots/visual analysis unless needed for a UI defect.
- Use local/GPU models for routine assistance when practical.
- Escalate to premium model reasoning only for difficult blockers.

## Mandatory end-of-session update

Before handing off, replace the status section below with current facts.

### Status

- Branch: `main` at handoff creation; verify before work.
- Locked design commit: `2b5bcff02eb6d4dfd2549b96bd5135086dc3f17b`
- Current slice: implementation planning
- Implementation changes: none made by this handoff
- Tests: not run by this handoff; no implementation was changed
- Blockers: implementation plan must be created/read before coding
- Next exact action: read the locked spec, create/read `docs/superpowers/plans/2026-08-29-wise2-business-os.md`, then execute Task 1 with tests before implementation.

## Takeover prompt

You are taking over the WISE² Business OS implementation in `dwise03-bit/wise2-core`.

Do not start by redesigning or asking broad product questions. Read the required files above, inspect `apps/wise2-ios`, inspect the existing Control Bridge, and report the current branch/commit plus the first implementation task. Follow the implementation plan task-by-task using test-driven development. Preserve working code. Do not expose arbitrary remote shell execution. Keep privileged operations named, allowlisted, authenticated, audited, and server-authorized. Update this handoff before stopping so the next Cursor/Claude/Codex session can continue without chat history.
