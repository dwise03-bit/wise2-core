# WISE2 Research

Load `CLAUDE.md`, then load:

- `promptos/agents/executive.md`
- `promptos/agents/research.md`
- another specialist prompt if the topic clearly requires it.

Research workflow for the user-provided topic:

1. Restate the research question and scope.
2. Search current sources when the answer depends on recent facts, vendor docs, laws, pricing, APIs, or market state.
3. Prefer primary sources: official docs, standards, filings, source repositories, or direct vendor pages.
4. Capture citations with URLs and access dates.
5. Separate facts from inference.
6. Summarize implications for WISE2.
7. Save durable findings to `data/projects/` or `data/decisions/` only when they affect future execution.

Append a short research entry to `data/daily-logs/<today>.md`.
