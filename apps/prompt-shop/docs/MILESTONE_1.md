# Milestone 1 — Catalog normalization

The recovered catalog now has a compatibility-preserving normalized data layer.

## Data boundaries

- `src/data/legacyCatalog.js` stores the recovered catalog and category presentation tokens unchanged.
- `src/data/catalog.js` creates first-class System and Subsystem records with stable IDs and slugs.
- `src/components/WiseTouchDirectoryCleanRebuild.jsx` consumes the normalized Systems while retaining the recovered UI fields and behavior.

Subsystem IDs are scoped to their parent System. This preserves both occurrences of `SATURDAY MORNING™` and `VOID JAW™` without collisions.

Generated descriptions provide every Subsystem with its own documentation field. The four recovered fine-art descriptions remain exact overrides.

## Deferred fields

Timestamps are `null`, relationship and use-case arrays are empty, and documentation status is `baseline` until authoritative content or database records exist. No facts were fabricated during normalization.

## Validation

Run `npm test` to validate record counts, unique IDs, parent integrity, preserved legacy fields, duplicate-name handling, and description coverage.
