# WISE2 VISUAL QUALITY STANDARD

Status: MANDATORY across WISE2 visual work.

## Core Contract

GENERATED != APPROVED. COMPILED != VISUALLY VERIFIED.
No WISE2 visual asset ships until it passes real-size visual QA in its actual delivery context.

## Authority and Preservation

1. Current explicit user instruction wins.
2. Approved reference and identity-locked assets are source of truth.
3. Never regenerate, redraw, beautify, or silently replace locked faces, people, logos, mascots, devices, products, or approved artwork.
4. Inspect existing assets before generating replacements.
5. A generated asset is a candidate only. Claude must inspect it before calling it final.

## Universal Production Gate

Before approval, verify: composition, silhouette, hierarchy, typography, contrast, crop/safe area, artifact-free rendering, brand fidelity, reference fidelity, and actual-size readability.
Reject and correct any output with tiny focal subjects, excessive dead space, hairline detail that disappears, unreadable text, weak contrast, malformed anatomy/geometry, generic AI styling, incorrect crop, or drift from locked assets.

The QA result must be explicit: PASS or FAIL. A known failure cannot be waived by saying the asset is close, polished, generated successfully, or technically valid.

## App Icon Gate

App icons require a dedicated small-size test. The 1024 px master alone is never sufficient.
Inspect representative renderings at 1024, 180, 120, 60, 40, and 29 px and inspect a simulated or actual platform home-screen context when practical.

Required checks:
- one immediately recognizable focal symbol
- strong silhouette at 29-60 px
- focal artwork uses the available field intentionally; no accidental large dead zone
- critical identity does not depend on hairline rings, tiny labels, micro-text, or miniature ornament
- adequate foreground/background contrast at small size
- safe composition under iOS/Android icon masking and crop
- no baked-in platform squircle unless the platform asset specification requires it
- no text unless it remains intentionally legible at delivery size
- no AI artifacts, malformed marks, or altered identity-locked artwork

If the icon fails at any required delivery size, mark APP ICON QA: FAIL and regenerate/redesign before export or deployment.

## UI / Web / Marketing / Hardware Gate

UI and web: inspect representative mobile, tablet, and desktop renderings; preserve functionality and reference composition.
Marketing/master sheets: inspect the final export at intended social/print/viewing scale; text and hierarchy must survive compression/cropping.
Hardware/product renders: use actual approved device imagery when required; never invent a substitute product and present it as the real device.

## Completion Report

For visual work report, as applicable:
VISUAL QA: PASS / FAIL / NOT APPLICABLE
REAL-SIZE QA: PASS / FAIL / NOT APPLICABLE
REFERENCE FIDELITY: PASS / FAIL / NOT APPLICABLE
IDENTITY LOCK: PASS / FAIL / NOT APPLICABLE
APP ICON QA: PASS / FAIL / NOT APPLICABLE
KNOWN DIFFERENCES: explicit list

Do not claim completion while a required gate is FAIL.
