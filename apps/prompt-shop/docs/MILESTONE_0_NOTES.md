# Milestone 0 Recovery Notes

## What was actually recovered

The surviving application source is a single React component containing both the
WISE TOUCH data and the working UI/interaction logic.

The complete original multi-file project was not present in the accessible
workspace/library at recovery time. Historical handoff text says a complete
package had previously been intended as seven ZIP parts.

## Recovery strategy

1. Preserve the recovered component behavior.
2. Supply a conventional Vite/React/Tailwind project shell.
3. Add an explicit route manifest without changing current tab behavior.
4. Add a minimal local brand asset and a production-assets landing folder.
5. Delay data extraction/normalization until Milestone 1.

## Milestone 1 boundary

Recommended first normalization:
- Move `DEFAULT_SYSTEMS` into `src/data/systems.js`
- Add stable IDs/slugs
- Normalize categories/tags
- Separate system/subsystem records
- Add validation
- Preserve prompt builder output byte-for-byte where practical
- Add URL routing only after regression checks
