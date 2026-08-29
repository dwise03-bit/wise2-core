# WISE2 Decision Log

Load `CLAUDE.md`, then load `promptos/agents/executive.md`.

For the user-provided decision topic:

1. Define the decision being made.
2. Identify affected systems, customers, and operators.
3. List considered options.
4. State the chosen option and rationale.
5. Record consequences, boundaries, and rollback path.
6. Create a new ADR in `data/decisions/YYYY-MM-DD-slug.md`.
7. Append a reference to today's daily log.

Use this ADR shape:

```markdown
# ADR: Title

- **Date**: YYYY-MM-DD
- **Status**: Proposed | Accepted | Superseded

## Context

## Decision

## Consequences

## Boundaries

## Rollback
```

Do not rewrite historical ADRs unless the user explicitly asks.
