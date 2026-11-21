# WISE² Workflow Standard

This repository defines the default workflow for every WISE² UI, product, and
coding-agent task. Apply it across Claude Code, Codex, Cursor, human-led work,
and downstream repositories that install this pack.

## Standard loop

`REFERENCE → INSPECT → REA (WHEN NEEDED) → MEASURE → BUILD → RUN → CAPTURE → COMPARE → CORRECT → VERIFY → REPORT`

1. Identify the approved reference. This may be a supplied design, an approved
   screenshot, an existing route, or `https://wise2.net` when the task explicitly
   names the live site as the reference.
2. Inspect the relevant route, components, tokens, assets, fonts, integrations,
   and existing behavior before editing.
3. Use REA when source inspection alone cannot explain behavior, compatibility,
   or an existing implementation. Analyze only authorized targets. Keep REA
   discovery read-only unless the task explicitly authorizes runtime changes.
   Record the target and version, evidence, analysis limits, and unresolved
   questions; treat conclusions as hypotheses until verified against the build.
4. Record the largest structural and visual mismatches internally.
5. Implement the smallest targeted change that preserves working architecture,
   functionality, branding, and identity-locked assets.
6. Run the applicable app, checks, tests, and build.
7. Capture or inspect the rendered target at the approved viewport.
8. Compare against the reference, correct the largest mismatches, and repeat as
   needed.
9. Verify representative desktop, tablet, and mobile widths where applicable.
10. Report technical checks, visual QA, preserved assets/functionality, and known
    differences honestly. When REA was used, include its evidence and limits in
    the project verification record and Sauce Vault.

## REA checkpoint

REA is an on-demand analysis tool for authorized binaries, JavaScript or Electron
apps, .NET assemblies, websites, and runtime behavior. Use it before design or
implementation when an opaque target needs investigation, and during verification
when deeper behavior evidence is needed. Skip it for greenfield work or routine
changes that source review already explains. REA findings do not replace project
tests, visual review, or independent verification.

## Authority

The user's current instruction and the approved reference take precedence over
this standard. The full rules, including zero creative drift and identity-locked
asset handling, live in `WISE2_UI_CONSTITUTION.md` and are mandatory for UI work.

## Completion gate

Do not call a visual task complete from source inspection alone. A rendered
result must be inspected and compared whenever a reference is part of the task.
Stop once the requested result is verified; do not add unrelated polish or
redesign.
