# WISE² Revenue Builder Agent Design

**Date:** 2026-08-31
**Branch:** `feat/revenue-command-center`
**Status:** Approved design

## Goal

Add a dedicated PromptOS orchestrator that can resume and execute the existing Revenue Command Center implementation plan, coordinate specialist agents, enforce verification gates, and hand verified changes to the existing WISE² deployment pipeline.

## Scope

The Revenue Builder Agent is an orchestrator, not a replacement for existing agents. It delegates implementation, validation, Discord integration, sales-policy review, QA, and deployment to existing PromptOS specialists.

Primary implementation target:

`docs/superpowers/plans/2026-08-31-revenue-command-center.md`

Primary working branch:

`feat/revenue-command-center`

## Architecture

```text
User / Discord / Claude Code command
        |
        v
Revenue Builder Agent
        |
        +--> Developer Agent       code, migrations, tests
        +--> CRM Agent             data contracts and CRM semantics
        +--> Discord Agent         command-center integration
        +--> Sales Agent           closer and offer-policy validation
        +--> QA Agent              verification gates
        +--> Infrastructure Agent  deployment and rollback
        |
        v
Verified checkpoint state
        |
        v
Existing GitHub deployment pipeline
```

## Responsibilities

The Revenue Builder Agent MUST:

1. Read `CLAUDE.md` and the revenue implementation plan before action.
2. Work only on `feat/revenue-command-center` unless the user explicitly changes the target.
3. Detect completed work before re-running tasks.
4. Execute the revenue plan task-by-task.
5. Delegate specialist work to existing PromptOS agents rather than duplicating their prompts.
6. Run the task-specific tests defined by the implementation plan.
7. Stop on repeated verification failure, missing credentials, unsafe migrations, or destructive ambiguity.
8. Persist a checkpoint after every verified task.
9. Never claim production readiness when mocks or stubs remain in the required revenue flow.
10. Never deploy if required tests fail.
11. Never push implementation directly to `main` as the working branch.
12. Use the existing WISE² deployment workflow for production promotion.
13. Run post-deploy health checks and smoke tests before reporting success.
14. Report `DONE`, `BLOCKED`, or `NEEDS HUMAN APPROVAL` with evidence.

## Specialist Routing

### Developer

Use for code, schema changes, APIs, tests, refactors, and implementation commits.

### CRM

Use for lead, opportunity, deal, offer, follow-up, attribution, and assignment semantics.

### Discord

Use for channels, commands, lead cards, buttons, approvals, notifications, and role-aware actions.

### Sales

Use for qualification scoring, approved offers, objection handling boundaries, closing authority, and escalation rules.

### QA

Use after every implementation task and before deployment. QA has veto authority over progression when required verification fails.

### Infrastructure

Use only after implementation and QA gates pass. Infrastructure owns deployment, rollback readiness, Docker/service verification, and production health checks.

## Execution State

Persist resume state in:

`data/projects/revenue-command-center-builder.json`

Expected shape:

```json
{
  "plan": "docs/superpowers/plans/2026-08-31-revenue-command-center.md",
  "branch": "feat/revenue-command-center",
  "status": "in_progress",
  "currentTask": 1,
  "completedTasks": [],
  "lastVerifiedCommit": null,
  "lastVerification": null,
  "blocker": null,
  "updatedAt": null
}
```

If the file is absent, initialize it. If present, validate the branch and plan before resuming.

## Command Surface

Add a Claude Code command:

`.claude/commands/revenue-build.md`

Invocation:

`/revenue-build`

Optional modes:

- `/revenue-build status` — report checkpoint, blockers, branch, and last verification without changing code.
- `/revenue-build next` — execute only the next incomplete verified task.
- `/revenue-build resume` — continue until a blocker, approval gate, or completion.
- `/revenue-build verify` — run the current task's verification and report evidence.
- `/revenue-build deploy` — permitted only when all implementation tasks and pre-deploy QA gates pass.

Default behavior for `/revenue-build` is `resume`.

## Credit-Saver Policy

The orchestrator MUST minimize expensive model use:

- read checkpoint state before rereading broad repository context;
- load only the specialist prompts needed for the active task;
- prefer targeted file reads and targeted tests;
- do not regenerate plans already committed;
- do not re-analyze unchanged files;
- prefer local project models/tools for routine classification or summarization when available;
- reserve higher-cost reasoning for architecture conflicts, failures, migrations, and security-sensitive decisions.

## Safety Gates

The agent MUST stop and report `NEEDS HUMAN APPROVAL` before:

- irreversible production data changes;
- destructive migrations without a tested rollback;
- changing commercial pricing/discount authority outside approved configuration;
- changing Telnyx or Discord credentials;
- deleting production customer data;
- mass outbound outreach not already approved;
- bypassing consent or opt-out controls;
- force-pushing protected branches.

## Deployment Gate

Deployment is allowed only when all conditions are true:

1. All plan tasks required for the selected release slice are marked complete.
2. Required tests pass.
3. No required revenue-path component remains mocked or stubbed.
4. Database migrations have rollback instructions and have been validated.
5. Telnyx/Discord/CRM environment dependencies are present or explicitly verified by the deployment environment.
6. QA signs off on the release slice.
7. Infrastructure confirms the existing deployment workflow can deploy the target commit.

Production flow:

```text
feature branch implementation
        |
        v
QA verification
        |
        v
PR / merge to approved deploy branch
        |
        v
existing GitHub Actions deploy workflow
        |
        v
VPS Docker deployment
        |
        v
post-deploy smoke tests
        |
        v
DONE or rollback
```

## Discord Progress Reporting

When Discord credentials/channels are available, the agent should emit concise lifecycle updates to the existing command-center/status channels:

- task started
- task verified
- blocker found
- deployment started
- deployment succeeded
- deployment rolled back

Do not stream verbose model reasoning or every terminal command into Discord.

## Success Criteria

The agent is considered operational when:

1. `/revenue-build status` can identify the plan, branch, checkpoint, and blocker state.
2. `/revenue-build next` can route one implementation task to the correct specialist and persist a verified checkpoint.
3. `/revenue-build resume` can continue from the checkpoint without redoing completed tasks.
4. Failed verification prevents advancement.
5. `/revenue-build deploy` refuses to deploy an incomplete or failing release.
6. A fully verified release can be handed to the existing deployment pipeline and followed by production health checks.

## Non-Goals

- Replacing PromptOS.
- Replacing the existing Developer, Infrastructure, Discord, Sales, CRM, or QA agents.
- Creating another Discord bot identity.
- Creating a new deployment platform.
- Storing secrets in agent prompts or checkpoint files.
- Allowing autonomous production changes without verification gates.
