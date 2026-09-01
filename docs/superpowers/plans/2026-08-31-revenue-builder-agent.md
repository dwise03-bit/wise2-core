# Revenue Builder Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a resume-safe PromptOS Revenue Builder orchestrator and `/revenue-build` command that executes and verifies the existing Revenue Command Center plan without bypassing QA or deployment gates.

**Architecture:** Keep the orchestrator thin. It reads the approved revenue plan and a persisted checkpoint, routes the active task to existing PromptOS specialists, requires verification before advancing, and delegates production promotion to the existing Infrastructure agent and GitHub deployment workflow.

**Tech Stack:** PromptOS markdown agents, Claude Code command files, JSON checkpoint state, Git/GitHub Actions, existing WISE² TypeScript/Docker deployment stack.

**Spec:** `docs/superpowers/specs/2026-08-31-revenue-builder-agent-design.md`

## Global Constraints

- Work on `feat/revenue-command-center`; do not use `main` as the implementation branch.
- Do not store credentials or secrets in prompts or checkpoint files.
- Do not advance a task when its required verification fails.
- Do not deploy when required revenue-path components are mocked or stubbed.
- Require human approval for destructive production changes, unapproved commercial-policy changes, credential changes, mass outreach, consent bypasses, and protected-branch force pushes.
- Reuse existing Developer, CRM, Discord, Sales, QA, and Infrastructure agents.
- Reuse the existing GitHub deployment pipeline.
- Minimize expensive model usage by resuming from checkpoint state and loading only active-task context.

---

### Task 1: Revenue Builder PromptOS Agent

**Files:**
- Create: `promptos/agents/revenue-builder.md`
- Reference: `promptos/agents/developer.md`
- Reference: `promptos/agents/infrastructure.md`
- Reference: `docs/superpowers/plans/2026-08-31-revenue-command-center.md`

**Interfaces:**
- Consumes: revenue implementation plan, specialist PromptOS agents, checkpoint JSON.
- Produces: deterministic routing instructions and gate rules used by `/revenue-build`.

- [ ] **Step 1: Create the agent prompt with explicit role and inputs**

Define the role as an orchestrator for the Revenue Command Center plan. Require it to read `CLAUDE.md`, the revenue plan, and checkpoint before executing.

- [ ] **Step 2: Define routing table**

Route code/schema/API work to Developer; CRM semantics to CRM; Discord actions to Discord; commercial boundaries to Sales; verification to QA; production deployment to Infrastructure.

- [ ] **Step 3: Define checkpoint protocol**

Require `status`, `currentTask`, `completedTasks`, `lastVerifiedCommit`, `lastVerification`, `blocker`, and `updatedAt`. A task may enter `completedTasks` only after verification succeeds.

- [ ] **Step 4: Define stop conditions and deployment gate**

Encode every safety and deployment condition from the spec verbatim enough that the agent cannot interpret a failing test as deployable.

- [ ] **Step 5: Review prompt for duplicated specialist responsibilities**

Expected: the new prompt coordinates existing agents and does not copy their full implementation instructions.

- [ ] **Step 6: Commit**

```bash
git add promptos/agents/revenue-builder.md
git commit -m "feat: add revenue builder orchestrator agent"
```

---

### Task 2: Revenue Build Claude Command

**Files:**
- Create: `.claude/commands/revenue-build.md`
- Reference: `promptos/agents/revenue-builder.md`

**Interfaces:**
- Consumes: command argument string: empty, `status`, `next`, `resume`, `verify`, or `deploy`.
- Produces: instructions that load and execute the Revenue Builder agent in the requested mode.

- [ ] **Step 1: Create command entrypoint**

The command must load `promptos/agents/revenue-builder.md` and pass the user-selected mode. Empty mode resolves to `resume`.

- [ ] **Step 2: Encode mode behavior**

`status` performs no writes; `next` attempts one incomplete task; `resume` continues until blocked/completed; `verify` runs only current verification; `deploy` first evaluates the full deployment gate.

- [ ] **Step 3: Add invalid-mode handling**

For any other argument, return the supported modes and perform no implementation or deployment action.

- [ ] **Step 4: Add anti-shortcut rule**

The command must explicitly prohibit skipping checkpoint validation, required tests, QA, or the deployment gate even if asked to "just deploy".

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/revenue-build.md
git commit -m "feat: add revenue build command"
```

---

### Task 3: Resume Checkpoint Bootstrap

**Files:**
- Create: `data/projects/revenue-command-center-builder.example.json`
- Modify: `promptos/agents/revenue-builder.md`

**Interfaces:**
- Consumes: example checkpoint schema.
- Produces: runtime checkpoint at `data/projects/revenue-command-center-builder.json` when absent.

- [ ] **Step 1: Add versioned example state**

Use exactly these fields and initial values:

```json
{
  "plan": "docs/superpowers/plans/2026-08-31-revenue-command-center.md",
  "branch": "feat/revenue-command-center",
  "status": "not_started",
  "currentTask": 1,
  "completedTasks": [],
  "lastVerifiedCommit": null,
  "lastVerification": null,
  "blocker": null,
  "updatedAt": null
}
```

- [ ] **Step 2: Require safe initialization**

Update the agent prompt so absence of the runtime checkpoint causes initialization from this schema, while an existing checkpoint is validated rather than overwritten.

- [ ] **Step 3: Require branch mismatch stop**

If checkpoint branch and current Git branch differ, report `BLOCKED` and do not change code until the mismatch is intentionally resolved.

- [ ] **Step 4: Commit**

```bash
git add data/projects/revenue-command-center-builder.example.json promptos/agents/revenue-builder.md
git commit -m "feat: add revenue builder checkpoint protocol"
```

---

### Task 4: PromptOS Routing Registration

**Files:**
- Modify: `CLAUDE.md`
- Modify: `promptos/agents/README.md` if the registry table exists there.

**Interfaces:**
- Consumes: `promptos/agents/revenue-builder.md`.
- Produces: discoverable routing for `revenue-build`, `revenue command center`, and execution/resume intents.

- [ ] **Step 1: Add Revenue Builder to agent registry**

Register the file, purpose, and triggers without changing existing specialist triggers.

- [ ] **Step 2: Add command to command palette**

Document `/revenue-build` and its five modes.

- [ ] **Step 3: Preserve generic deploy routing**

Do not replace Infrastructure as the general `deploy` specialist. Revenue Builder is selected only for Revenue Command Center implementation/execution context.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md promptos/agents/README.md
git commit -m "docs: register revenue builder agent"
```

---

### Task 5: Static Verification and Dry-Run Review

**Files:**
- Verify: `promptos/agents/revenue-builder.md`
- Verify: `.claude/commands/revenue-build.md`
- Verify: `data/projects/revenue-command-center-builder.example.json`
- Verify: `CLAUDE.md`

**Interfaces:**
- Consumes: all artifacts from Tasks 1-4.
- Produces: evidence that the orchestrator is internally consistent before it is allowed to execute the revenue implementation plan.

- [ ] **Step 1: Validate JSON syntax**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('data/projects/revenue-command-center-builder.example.json','utf8')); console.log('checkpoint json ok')"
```

Expected: `checkpoint json ok` and exit 0.

- [ ] **Step 2: Verify required paths exist**

Run:

```bash
test -f promptos/agents/revenue-builder.md && test -f .claude/commands/revenue-build.md && test -f docs/superpowers/plans/2026-08-31-revenue-command-center.md && test -f docs/superpowers/specs/2026-08-31-revenue-builder-agent-design.md
```

Expected: exit 0.

- [ ] **Step 3: Verify safety terms are present**

Run:

```bash
grep -q "NEEDS HUMAN APPROVAL" promptos/agents/revenue-builder.md && grep -q "deploy" .claude/commands/revenue-build.md && grep -q "verification" promptos/agents/revenue-builder.md
```

Expected: exit 0.

- [ ] **Step 4: Dry-run `/revenue-build status` behavior**

Review the command and agent instructions without changing code. Expected report includes branch, plan, current task, completed tasks, last verification, and blocker.

- [ ] **Step 5: Dry-run incomplete deployment refusal**

Review `/revenue-build deploy` with the initial checkpoint. Expected: deployment is refused because the revenue implementation plan is incomplete.

- [ ] **Step 6: Commit any verification corrections**

```bash
git add promptos/agents/revenue-builder.md .claude/commands/revenue-build.md data/projects/revenue-command-center-builder.example.json CLAUDE.md promptos/agents/README.md
git commit -m "test: verify revenue builder orchestration"
```

---

### Task 6: Execute Revenue Command Center Plan

**Files:**
- Read: `docs/superpowers/plans/2026-08-31-revenue-command-center.md`
- Update runtime checkpoint: `data/projects/revenue-command-center-builder.json`
- Modify implementation files only as directed by that plan.

**Interfaces:**
- Consumes: verified Revenue Builder agent and approved Revenue Command Center implementation plan.
- Produces: implemented, tested Revenue Command Center release slices with checkpoint evidence.

- [ ] **Step 1: Run `/revenue-build next`**

Expected: exactly one next incomplete plan task is routed and attempted.

- [ ] **Step 2: Verify task-specific tests**

Expected: tests named by the revenue implementation plan pass before checkpoint advancement.

- [ ] **Step 3: Persist checkpoint**

Record completed task, verified commit, verification evidence, clear blocker, and timestamp.

- [ ] **Step 4: Repeat through `/revenue-build resume`**

Stop automatically on a failed verification, safety approval gate, missing environment dependency, or completed plan.

- [ ] **Step 5: Run `/revenue-build deploy` only after full gate passes**

Expected: QA verifies the selected release, Infrastructure uses the existing deployment pipeline, production smoke tests run, and any failure triggers stop/rollback behavior rather than a false success report.

---

## Self-Review

- Spec coverage: orchestrator, routing, command modes, checkpoint/resume, credit saver, safety gates, deployment gate, Discord lifecycle reporting policy, and success criteria are covered.
- Placeholder scan: no TBD/TODO/implement-later steps are present.
- Interface consistency: the plan path, feature branch, checkpoint path, modes, and status vocabulary match the design spec.
