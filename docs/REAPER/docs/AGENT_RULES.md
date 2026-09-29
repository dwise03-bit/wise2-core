# REAPER V1 — AGENT RULES

Any coding agent MUST:

1. Read docs/MASTER_BUILD_KIT.md first.
2. Read the supporting spec relevant to the active milestone.
3. Read BUILD_STATUS.md and HANDOFF_MANIFEST.md before coding.
4. Implement only the requested/current milestone unless explicitly told otherwise.
5. Do not redesign the architecture casually.
6. Fix root causes instead of deleting features.
7. Preserve and extend test coverage.
8. Document assumptions and deviations.
9. Use TODO only for genuinely deferred external dependencies.
10. Never mark mock integration as live.
11. Never silently weaken acceptance criteria.

Core invariants:
- Business Health and Digital Execution remain separate.
- UNKNOWN is not zero or failure.
- Major findings require evidence.
- Providers remain swappable.
- Audits remain asynchronous.
- External sends remain approval-gated.
- Pricing is never hallucinated.
- Prospect history is preserved.
- No sensitive-person profiling.
- No private scraping.
- No secrets in frontend code or logs.
- Scoring formula changes require versioning.
