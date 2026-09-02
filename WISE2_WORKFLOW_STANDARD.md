# WISE² Workflow Standard

This repository defines the default workflow for every WISE² UI, product, and
coding-agent task. Apply it across Claude Code, Codex, Cursor, human-led work,
and downstream repositories that install this pack.

## Standard loop

`REFERENCE → INSPECT → MEASURE → BUILD → RUN → CAPTURE → COMPARE → CORRECT → VERIFY → REPORT`

1. Identify the approved reference. This may be a supplied design, an approved
   screenshot, an existing route, or `https://wise2.net` when the task explicitly
   names the live site as the reference.
2. Inspect the relevant route, components, tokens, assets, fonts, integrations,
   and existing behavior before editing.
3. Record the largest structural and visual mismatches internally.
4. Implement the smallest targeted change that preserves working architecture,
   functionality, branding, and identity-locked assets.
5. Run the applicable app, checks, tests, and build.
6. Capture or inspect the rendered target at the approved viewport.
7. Compare against the reference, correct the largest mismatches, and repeat as
   needed.
8. Verify representative desktop, tablet, and mobile widths where applicable.
9. Report technical checks, visual QA, preserved assets/functionality, and known
   differences honestly.

## Authority

The user's current instruction and the approved reference take precedence over
this standard. The full rules, including zero creative drift and identity-locked
asset handling, live in `WISE2_UI_CONSTITUTION.md` and are mandatory for UI work.

## Completion gate

Do not call a visual task complete from source inspection alone. A rendered
result must be inspected and compared whenever a reference is part of the task.
Stop once the requested result is verified; do not add unrelated polish or
redesign.
