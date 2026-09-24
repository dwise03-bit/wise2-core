# WOJI Control Engine V1

Contract: **WOJI-CONTRACT/1.0**

This implementation turns the approved WOJI language into executable project-control primitives inside WISE² Command Center.

## V1 scope

- Locked command registry and normalized `⏩ → ⏭️` alias.
- Chain parser for commands such as `👌💚🔒⏭️`.
- Explicit authority metadata: read, plan, write, execute, deploy, complete.
- Specialist routing metadata for code, visual, video, web/app, docs, QA, handoff, and integrations.
- Project state contract covering progress, locks, missing pieces, blockers, active work, QA, handoff readiness, and next action.
- Completion gate: `💯` is valid only at 100% with no gaps/blockers and at least one passing QA check.
- Completion-chain selector for stalled or partially complete projects.
- Immutable permission denials and explicit `🛡️❌` outcomes.
- Lock-conflict enforcement with explicit `⚠️🔒` outcomes.
- Protected pre-operation checkpoints, restore, resume, and event history.
- A real chain executor consumed by the Command Center Control Deck.

## Locked execution protocol

`🏃🏁📦` means: execute remaining approved work inside authorized scope, preserve locks, checkpoint risky work, test, repair, retest, verify completion, update project state, and package the handoff.

The engine must stop rather than silently override a lock, bypass permissions, expose secrets, perform an unapproved destructive action, or claim verified completion without passing acceptance criteria.

## Control Deck

The `/woji` route uses `executeWojiChain` directly. UI actions therefore pass through the same parser, command contract, permission checks, completion gate, locks, checkpoint logic, event recorder, and state transitions covered by integration tests.

The in-memory registry remains the V1 adapter. A durable project-registry adapter can replace it without changing the command contract or executor.
