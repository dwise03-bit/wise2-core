# WISE² Superpowers Workflow

**Status:** Active
**Applies to:** every repository change conceived, approved, planned, implemented, and verified in `wise2-core`.

This document is the entry point for design and implementation work in this repository. It
governs the development lifecycle. It does not replace runtime behavior: **PromptOS**
(`promptos/`) remains the runtime agent-routing system. **Superpowers** governs how
repository changes move from intent to verified result. Both operate together and neither
duplicates the other.

Read alongside `AGENTS.md`, `CLAUDE.md`, `promptos/README.md`, `.agents/brand-context.md`,
and — for any UI task — `WISE2_UI_CONSTITUTION.md` and `WISE2_WORKFLOW_STANDARD.md`. This
file references those rules rather than restating them.

## Lifecycle

1. **Inspect.** Read the repository, applicable instructions, current status, and existing
   assets before proposing change. Inspect only files relevant to the request; prefer
   targeted search over repo-wide scans.
2. **Classify.** Decide whether the request is a *spike*, *bounded* change, or
   *architectural* work (definitions below).
3. **Brainstorm and get approval (architectural only).** Surface intent and constraints,
   present alternatives, and obtain approval section by section before writing a spec. This
   brainstorming approval gate is a hard prerequisite: architectural implementation does not
   begin without it.
4. **Write the design spec.** Store it in `docs/superpowers/specs/` as
   `YYYY-MM-DD-<slug>-design.md`. Self-review it for placeholders, contradictions,
   ambiguity, and scope creep before sharing.
5. **Written-spec review.** Obtain review of the spec before a plan is created.
6. **Write the implementation plan.** Store it in `docs/superpowers/plans/` as
   `YYYY-MM-DD-<slug>.md` with task-by-task, checkbox-tracked steps and explicit
   verification commands. Implementation begins only after the plan is approved where the
   task requires approval.
7. **Implement.** Make the smallest safe change per task. Reuse existing code, components,
   configs, and assets. Preserve pre-existing worktree changes and stage only files that
   belong to the current task. Write focused tests first.
8. **Verify and stop.** Run the smallest relevant tests before broader suites. Verify
   behavior, security boundaries, and relevant build paths. A build or hardware check that
   cannot run locally is reported as an explicit environment limitation, never represented
   as passed. Stop once the requested result is verified; do not add unrelated polish.

## Classification

- **Spike:** time-boxed investigation or throwaway proof. No spec required. Findings are
  written up; code is not merged without re-entering this lifecycle as a bounded change.
- **Bounded:** a localized change with a clear blast radius (one module, one route, one
  contract) that preserves existing architecture. A short plan or a well-formed task list
  is sufficient; no architectural brainstorming gate.
- **Architectural:** changes that introduce or alter a contract, service boundary, data
  model, cross-package dependency, or system-wide convention. Requires the brainstorming
  approval gate, a design spec, written-spec review, and an approved implementation plan.

## Artifact locations

| Artifact | Location | Naming |
| --- | --- | --- |
| Design spec | `docs/superpowers/specs/` | `YYYY-MM-DD-<slug>-design.md` |
| Implementation plan | `docs/superpowers/plans/` | `YYYY-MM-DD-<slug>.md` |
| Workflow governance | `docs/superpowers/workflow.md` | this file |
| Operational guide (post-implementation) | `docs/` | `WISE2-<AREA>.md` |

## Self-review checks (before sharing a spec or plan)

- No placeholder markers (`TODO`, `TBD`, `FIXME`, `???`, `<...>`), no "figure out later".
- No internal contradictions between goals, non-goals, and component responsibilities.
- No ambiguous ownership: every contract, route, and secret has one stated owner.
- Scope matches the request; non-goals are explicit.
- Decisions that depend on repository inspection are named as such and deferred to the
  plan, not guessed.

## Implementation handoff

The approved plan is the handoff. Each task lists the files it may create or modify, the
interfaces it produces, the focused test command, and the expected result. A worker
implements one task at a time, runs that task's verification, commits with the message
given in the plan, and does not modify files outside the task's declared set.

## Focused verification

- Run the narrowest test that proves the task (`pnpm --filter <pkg> test -- <file>`)
  before any full suite.
- Type-check only the touched packages.
- For security-sensitive slices, confirm no secrets are tracked, remote state-changing
  actions remain preview- and confirmation-gated, and degraded/no-data states stay visible
  and distinct from healthy states.
- Report Quest/hardware/deploy checks that cannot run locally as environment limitations.

## WISE² Credit Saver rules (apply at every stage)

- Reuse existing working code, components, configs, and assets. Do not rebuild working
  features.
- Inspect only files relevant to the current task. Prefer targeted search over repo-wide
  scans. Do not repeatedly reread unchanged files.
- Make the smallest safe change. Batch related changes when safe.
- Run focused tests before full suites.
- Avoid unnecessary screenshots, summaries, refactors, and dependencies.
- Fix root causes instead of trying random patches.
- Preserve existing architecture and branding.
- Stop when the requested result is verified. Do not continue polishing after the task is
  complete.

Before expensive work, ask internally: "Can this be accomplished with a smaller targeted
action?" The goal is maximum verified progress per credit.

## Relationship to PromptOS

PromptOS routes runtime requests to specialist agents through prompt modules in
`promptos/agents/`. Superpowers is a development-time discipline for changing this
repository. A Superpowers task may add or modify a PromptOS prompt module, but Superpowers
adds no second runtime router and no parallel orchestration layer.
