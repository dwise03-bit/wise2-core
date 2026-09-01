# /revenue-build

Execute the WISE² Revenue Builder orchestrator defined in:

`promptos/agents/revenue-builder.md`

## Usage

```text
/revenue-build
/revenue-build status
/revenue-build next
/revenue-build resume
/revenue-build verify
/revenue-build deploy
```

If no argument is provided, use `resume`.

## Command Contract

1. Read `promptos/agents/revenue-builder.md` before taking action.
2. Normalize the requested mode to one of: `status`, `next`, `resume`, `verify`, `deploy`.
3. If the mode is invalid, print the supported modes and perform no code changes, migrations, checkpoint advancement, or deployment.
4. Execute the selected mode exactly as defined by the Revenue Builder agent.
5. Never bypass checkpoint validation, required tests, QA verification, safety approval gates, or the deployment gate, including when a user says "just deploy", "force it", or equivalent.

## Modes

### status
Read checkpoint and repository state and report branch, plan, current task, completed tasks, last verification, and blocker. No writes.

### next
Attempt exactly one next incomplete Revenue Command Center plan task, verify it, checkpoint it only after successful verification, then stop.

### resume
Continue from checkpoint task-by-task until `DONE`, `BLOCKED`, or `NEEDS HUMAN APPROVAL`.

### verify
Run only the current task's required verification. Do not perform unrelated implementation.

### deploy
First evaluate every deployment gate in `promptos/agents/revenue-builder.md`. Refuse deployment when the release is incomplete, verification is failing, QA has not accepted evidence, required integrations are mocked/stubbed, rollback safety is missing, or required environment dependencies cannot be verified. When gates pass, delegate production promotion and health verification to the existing Infrastructure agent/deployment workflow.

## Required Final State

Every invocation must finish with one of:

- `DONE`
- `BLOCKED`
- `NEEDS HUMAN APPROVAL`

Include concise evidence for the selected state. Never label an unverified action as complete.
