# WISE² Revenue Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing WISE² platform and agent library into a repeatable client acquisition, audit, package, build, deploy, support, and upsell system that prioritizes revenue while preserving the approved WISE² visual identity.

**Architecture:** Keep `wise2-core` as the canonical platform and `.agents/skills` as reusable agent IP. Build one revenue pipeline around existing CRM, automation, deployment, brand, and product capabilities instead of creating duplicate platforms. Client-facing work passes through a shared WISE² design system and visual QA gate; production changes retain existing deployment and rollback controls.

**Tech Stack:** Existing wise2-core stack; `.agents/skills`; Claude Code/Codex adapters; Hermes; n8n where already available; existing CRM/API; Playwright; existing deployment stack; GitHub Actions.

**Spec:** Approved WISE² operating direction from 2026-09-03: 40% sales/client delivery, 25% reusable skills and automation, 20% visual quality, 15% controlled tool experimentation.

## Global Constraints

- Revenue/client delivery is the first priority.
- Reuse existing services and skills before adding dependencies.
- `.agents/skills` remains the canonical reusable agent-skill layer.
- Preserve locked client brands and supplied human likenesses.
- Never expose secrets or commit production `.env` files.
- Never bypass production tests, health checks, or rollback safeguards.
- Premium AI is escalation capacity; deterministic/local/GPU paths handle routine work when safe.
- Every public client surface must pass responsive visual QA before release.
- No new tool is adopted without a concrete WISE² use case and measurable benefit.

---

## File Structure

The executor must first map the existing repository and reuse equivalent files where they already exist. The intended additions are focused and should not duplicate existing implementations:

- `.agents/skills/wise2-client-launch/SKILL.md` — canonical client-launch workflow.
- `.agents/skills/wise2-revenue-operator/SKILL.md` — lead-to-revenue orchestration rules.
- `.agents/skills/wise2-visual-qa/SKILL.md` — customer-facing visual release gate.
- `docs/operations/REVENUE-OPERATIONS.md` — operating model, ownership, stages, and KPIs.
- `docs/operations/CLIENT-DELIVERY-CHECKLIST.md` — human-readable launch checklist.
- `docs/design/WISE2-VISUAL-RELEASE-GATE.md` — visual acceptance criteria.
- Existing CRM/API/workflow files — extend only after discovery identifies their exact paths and tests.

### Task 1: Repository and Revenue-System Discovery

**Files:**
- Read: `.agents/brand-context.md`
- Read: `.agents/skills/**/SKILL.md` for relevant sales, CRM, client, deployment, QA, brand, and automation skills
- Read: `docs/ARCHITECTURE.md`
- Create or Modify: `docs/operations/REVENUE-OPERATIONS.md`

**Interfaces:**
- Consumes: current wise2-core architecture and existing skill inventory.
- Produces: a verified map of existing lead, CRM, build, deployment, support, and automation capabilities with exact file paths for later tasks.

- [ ] **Step 1:** Search the repository for `lead`, `crm`, `client`, `sales`, `quote`, `invoice`, `deploy`, `playwright`, `n8n`, `stripe`, `checkout`, and `discord` and record exact owning files/services.
- [ ] **Step 2:** Inventory existing `.agents/skills` that overlap client launch, branding, sales, automation, deployment, QA, and support.
- [ ] **Step 3:** Identify duplicate or conflicting revenue workflows; mark each as KEEP, MERGE, or RETIRE. Do not delete anything in this task.
- [ ] **Step 4:** Write `docs/operations/REVENUE-OPERATIONS.md` with the verified pipeline: `Lead -> Audit -> Package -> Quote/Checkout -> Build -> Visual QA -> Deploy -> Onboard -> Support -> Upsell`, and map each stage to existing code/services.
- [ ] **Step 5:** Review the document against actual paths and commit only the discovery/operating-model documentation.

### Task 2: Canonical Client Launch Skill

**Files:**
- Create or consolidate: `.agents/skills/wise2-client-launch/SKILL.md`
- Test: use the repository's existing skill validation mechanism; if none exists, add a focused structural test alongside existing agent-skill tests.

**Interfaces:**
- Consumes: client identity, audit findings, selected WISE² offers, approved brand assets, payment/authorization state.
- Produces: `ClientLaunchPlan` containing scope, package, assets, required integrations, build tasks, QA gates, deployment target, onboarding tasks, and upsell opportunities.

- [ ] **Step 1:** Write a failing validation fixture requiring the skill to define purpose, triggers, required inputs, workflow, safety rules, output contract, and stop conditions.
- [ ] **Step 2:** Run the focused validation and confirm failure because `wise2-client-launch` is absent or incomplete.
- [ ] **Step 3:** Implement the skill with the canonical stages: Audit, Recommend, Price, Approve, Build, Verify, Deploy, Onboard, Measure, Upsell.
- [ ] **Step 4:** Add explicit safeguards: no paid provisioning without authorization; no deployment without tests; no client-brand mutation outside approved references; no invented credentials or DNS values.
- [ ] **Step 5:** Run validation and commit the independently usable client-launch skill.

### Task 3: Revenue Operator Skill

**Files:**
- Create or consolidate: `.agents/skills/wise2-revenue-operator/SKILL.md`
- Test: existing skill validation path.

**Interfaces:**
- Consumes: lead/customer record, conversation/audit data, offer catalog, sales status.
- Produces: next-best action, recommended offer/package, follow-up action, owner, deadline/trigger, and CRM update payload.

- [ ] **Step 1:** Write a failing fixture covering a new lead, warm follow-up, quote pending, won customer, and existing customer eligible for upsell.
- [ ] **Step 2:** Verify the fixture fails before implementation.
- [ ] **Step 3:** Implement deterministic routing rules before LLM judgment: known lifecycle states map to explicit actions; AI reasoning handles ambiguous qualification and packaging.
- [ ] **Step 4:** Add Credit Saver behavior: use existing structured CRM data before reading transcripts; summarize once and reuse; escalate to premium reasoning only for complex package design or negotiation.
- [ ] **Step 5:** Validate all five fixtures and commit.

### Task 4: CRM and Automation Wiring

**Files:**
- Modify: exact CRM/API/workflow files discovered in Task 1.
- Test: exact existing CRM/API/workflow tests discovered in Task 1.

**Interfaces:**
- Consumes: `ClientLaunchPlan` and Revenue Operator next-action output.
- Produces: persisted lifecycle stage and queued follow-up/build/onboarding actions.

- [ ] **Step 1:** Write failing tests for lifecycle transitions: `new -> audited -> quoted -> won -> building -> qa -> live -> active` plus `lost` and `paused`.
- [ ] **Step 2:** Run only the relevant CRM/API tests and confirm the new transition assertions fail.
- [ ] **Step 3:** Add the minimum schema/API/workflow changes needed to persist lifecycle stage and next action, following the repository's existing patterns.
- [ ] **Step 4:** Wire existing n8n/Hermes/worker infrastructure to consume the persisted next action rather than creating a second scheduler.
- [ ] **Step 5:** Test duplicate-event/idempotency behavior so repeated webhooks do not create duplicate onboarding or follow-up jobs.
- [ ] **Step 6:** Run relevant tests, inspect the diff for secrets, and commit.

### Task 5: Visual Release Gate

**Files:**
- Create or consolidate: `.agents/skills/wise2-visual-qa/SKILL.md`
- Create: `docs/design/WISE2-VISUAL-RELEASE-GATE.md`
- Modify: existing Playwright configuration/tests discovered in Task 1.

**Interfaces:**
- Consumes: deployed preview URL and approved brand context.
- Produces: `PASS`, `PASS_WITH_WARNINGS`, or `FAIL` plus viewport-specific evidence.

- [ ] **Step 1:** Add failing Playwright assertions for console errors, horizontal overflow, broken primary navigation, and primary CTA visibility on representative desktop and mobile viewports.
- [ ] **Step 2:** Run the focused visual smoke suite and record current failures without changing production behavior.
- [ ] **Step 3:** Implement `wise2-visual-qa` with hierarchy, typography, spacing, brand consistency, responsiveness, interaction, loading, empty, and error-state criteria.
- [ ] **Step 4:** Document that automated screenshot/evaluator signals supplement rather than replace human review for flagship brand work.
- [ ] **Step 5:** Make the existing deployment pipeline invoke the visual smoke suite for public/client-facing surfaces only; do not block backend-only changes on visual tests.
- [ ] **Step 6:** Run desktop/mobile smoke tests and commit.

### Task 6: Client Delivery Checklist and Handoff

**Files:**
- Create: `docs/operations/CLIENT-DELIVERY-CHECKLIST.md`
- Modify: existing onboarding/support docs only if Task 1 proves they need links to the canonical checklist.

**Interfaces:**
- Consumes: successful build, QA result, payment/authorization state, deployment target.
- Produces: completed client handoff with credentials delivered through approved secure channels, training/support state, and first upsell/review checkpoint.

- [ ] **Step 1:** Write the checklist with explicit gates for scope approval, payment/authorization, asset approval, build, QA, DNS/deployment, analytics, CRM, phone/automation if purchased, backup, client training, support owner, and 7/30-day review.
- [ ] **Step 2:** Add a rule that credentials are never embedded in the checklist or Git history.
- [ ] **Step 3:** Link the checklist from the canonical client-launch skill.
- [ ] **Step 4:** Validate links/skill structure and commit.

### Task 7: Revenue Dashboard / KPI Contract

**Files:**
- Modify: existing dashboard/API files discovered in Task 1; do not create a new dashboard app.
- Test: existing dashboard/API tests.

**Interfaces:**
- Consumes: CRM lifecycle records and workflow outcomes.
- Produces: counts and conversion metrics for leads, audits, quotes, wins, active builds, live clients, recurring-revenue clients, and blocked launches.

- [ ] **Step 1:** Write failing API/data-layer tests for the KPI aggregation contract.
- [ ] **Step 2:** Implement the smallest aggregation endpoint/query that fits the current architecture.
- [ ] **Step 3:** Add one compact revenue panel to the existing WISE² command surface showing pipeline counts and blocked items; reuse the current design system.
- [ ] **Step 4:** Add responsive UI tests and visual smoke coverage.
- [ ] **Step 5:** Run tests and commit.

### Task 8: Controlled Tool Experiment Queue

**Files:**
- Create or Modify: `docs/operations/AI-TOOL-EXPERIMENTS.md`

**Interfaces:**
- Consumes: candidate tool, claimed WISE² benefit, current equivalent, expected cost/risk.
- Produces: `ADOPT`, `KEEP_TESTING`, or `REJECT` with evidence.

- [ ] **Step 1:** Define the experiment template: problem, current solution, candidate, measurable hypothesis, setup cost, recurring cost, security/data impact, success metric, rollback, decision date.
- [ ] **Step 2:** Seed only the current high-value experiments; do not add duplicate coding agents, workflow platforms, or observability suites without a demonstrated gap.
- [ ] **Step 3:** Require a measurable improvement in at least one of revenue, delivery time, visual quality, reliability, security, or operating cost before adoption.
- [ ] **Step 4:** Commit the experiment policy.

### Task 9: End-to-End Pilot Client

**Files:**
- Use existing demo/test fixtures; do not insert a real customer's private data into tests.
- Modify tests/workflows identified in Tasks 1-7.

**Interfaces:**
- Consumes: synthetic qualified lead.
- Produces: synthetic client progressed through audit, package, quote, build assignment, QA, simulated deploy gate, onboarding, and active lifecycle state.

- [ ] **Step 1:** Create a synthetic test client fixture with no real PII.
- [ ] **Step 2:** Run the lead-to-active workflow and capture the first failing stage.
- [ ] **Step 3:** Fix only integration defects exposed by the pilot, using focused tests before implementation.
- [ ] **Step 4:** Repeat until the synthetic client reaches `active` without duplicate jobs and with visual/deployment gates represented.
- [ ] **Step 5:** Run the relevant full test groups, inspect logs/diff, and commit.

### Task 10: Production Readiness Gate

**Files:**
- Modify: existing release/deployment documentation and CI only where required by earlier tasks.

**Interfaces:**
- Consumes: completed tasks and test evidence.
- Produces: release recommendation with explicit blockers/warnings.

- [ ] **Step 1:** Run repository lint/typecheck/unit/integration tests appropriate to changed packages.
- [ ] **Step 2:** Run Playwright smoke tests for affected public surfaces.
- [ ] **Step 3:** Run existing health/doctor/deployment validation commands without destructive operations.
- [ ] **Step 4:** Inspect `git diff` and run the repository's secret scan/security checks.
- [ ] **Step 5:** Verify rollback path and ensure no paid service, DNS change, production migration, or customer communication occurs without required authorization.
- [ ] **Step 6:** Produce a release report: PASS, PASS WITH WARNINGS, or BLOCKED, with exact evidence and remaining human actions.

## Self-Review

- Spec coverage: revenue/client delivery, reusable skills/automation, visual QA, controlled experimentation, Credit Saver, and production safety are all represented.
- Placeholder scan: execution paths that depend on repository discovery are explicitly resolved in Task 1 before modification; no implementation task is allowed to guess a path.
- Type consistency: `ClientLaunchPlan`, lifecycle stages, visual QA verdicts, and tool-experiment verdicts are stable contracts throughout the plan.

## Execution Order

Tasks 1-3 establish canonical knowledge and contracts. Task 4 connects those contracts to the existing CRM/automation stack. Tasks 5-7 add quality, handoff, and revenue visibility. Task 8 prevents tool sprawl. Tasks 9-10 prove the system end-to-end before production release.
