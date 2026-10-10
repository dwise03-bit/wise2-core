# Milestone 5 — WT Favorites

The recovered `wt-favorites` implementation now persists Systems, Subsystems, Hybrids, and Prompts in one versioned store.

## Compatibility

Legacy JSON arrays of System names are migrated automatically to version 2 records and written back under the same localStorage key. No competing storage implementation was introduced.

## Supported records

- Systems open their WT Docs view.
- Subsystems open their individual WT Docs view.
- Hybrids retain their weighted sources and reusable generated prompt.
- Prompts retain their production text and source identity.

WT Search's Favorites filter consumes the same unified IDs, so saved Systems and Subsystems appear in filtered search results.
