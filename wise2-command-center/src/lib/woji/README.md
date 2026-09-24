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

## Locked execution protocol

`🏃🏁📦` means: execute remaining approved work inside authorized scope, preserve locks, checkpoint risky work, test, repair, retest, verify completion, update project state, and package the handoff.

The engine must stop rather than silently override a lock, bypass permissions, expose secrets, perform an unapproved destructive action, or claim verified completion without passing acceptance criteria.

## Next implementation targets

1. Persist Project Registry records.
2. Add Memory Map lock reasons and lock levels.
3. Add Event Log and Checkpoint adapters.
4. Add permissions evaluation.
5. Add Orchestrator/Router execution interfaces.
6. Add API endpoint for Control Deck clients.
7. Add unit/integration tests and wire into Command Center UI.
