# Wise² Core Vault — Getting Started

This is an **AI-first** knowledge base for Wise² Core. Every note is structured for Claude to retrieve and synthesize, not just for human reading.

## What This Vault Does

1. **Records decisions** — Every architectural choice, brand decision, deployment call gets its own note
2. **Detects patterns** — Claude finds unnamed patterns across 100+ notes and writes synthesis pages
3. **Reconciles contradictions** — Conflicting claims are flagged and resolved
4. **Compounds over time** — More notes = more context = smarter AI partner

## The AI-First Schema

Every note you create or that Claude creates follows this structure:

```markdown
---
type: decision | architecture | project | meeting | daily | deployment
date: 2026-07-07
tags: [wise2, infrastructure, critical]
ai-first: true
---

# Note Title

## For future Claude

[Summary of what Claude needs to know about this decision/note. One paragraph. Include who made it, why, and the key constraints.]

## Context

[Background that led to this decision.]

## Decision

[The actual decision or outcome.]

## Rationale

[Why this was chosen over alternatives.]

## Implications

[What this means for the codebase, team, or product.]

## Related

- [[Related Note 1]]
- [[Related Note 2]]
- [[Related Decision]]

---

**Confidence:** high | medium | low  
**Source:** Meeting notes (2026-07-06) | Architecture review | Founder decision  
**Last reviewed:** 2026-07-07
```

## Directory Structure

- **daily/** — Daily summaries, logs, recaps (one per day)
- **projects/** — Active projects: goals, status, blockers
- **architecture/** — System design, module definitions, infrastructure
- **decisions/** — Architecture decisions (ADRs), rationale, implications
- **deployments/** — Launch prep, deployment logs, status
- **research/** — Captured research, market signals, competitive analysis
- **meetings/** — Meeting notes, action items, decisions made
- **tasks/** — Task tracking, assignments, dependencies
- **people/** — Team members, stakeholders, roles

## Commands You Can Use

### Recording Work
- `/obsidian-save` — Extract decisions from a session
- `/obsidian-daily` — Create today's daily note
- `/obsidian-task` — Create a tracked task
- `/obsidian-person` — Document a team member
- `/obsidian-project` — Start a project tracker

### Analysis & Synthesis
- `/obsidian-synthesize` — Find patterns, write synthesis pages
- `/obsidian-reconcile` — Resolve contradictions
- `/obsidian-challenge` — Question assumptions
- `/obsidian-review` — Audit the vault

### Research & Capture
- `/research` — Capture web research
- `/research-deep` — Thorough investigation
- `/youtube` — Transcribe and analyze video
- `/podcast` — Transcribe and ingest podcast
- `/obsidian-ingest` — Add audio, video, screenshots

### Maintenance
- `/obsidian-health` — Audit vault status
- `/obsidian-architect` — Auto-document codebase
- `/obsidian-export` — Export vault to markdown

## Starting Your First Note

Run this to create today's daily note:

```
/obsidian-daily
```

Claude will create a note with:
- Date, mood, focus areas
- Section for today's wins
- Section for blockers
- Section for decisions made
- Links to related projects/decisions

## The Compounding Effect

After 2-3 weeks of daily notes:
- Run `/obsidian-synthesize` → Claude finds patterns you didn't see
- Run `/obsidian-reconcile` → Contradictions get resolved
- Run `/obsidian-review` → Vault health audit shows connections

The vault's value increases exponentially as it grows. More notes = more context = better Claude partner.

## Anti-Patterns to Avoid

❌ **Don't:** Create notes without frontmatter  
✅ **Do:** Every note starts with `---` frontmatter with type, date, tags

❌ **Don't:** Write for humans only  
✅ **Do:** Write `## For future Claude` preamble that Claude can understand

❌ **Don't:** Claim facts without source attribution  
✅ **Do:** Mark all external claims with `(as of 2026-07, source.com)`

❌ **Don't:** Leave unknowns unmarked  
✅ **Do:** Mark unknowns as `TBD` with a question to research

❌ **Don't:** Nest wikilinks — just link once at top  
✅ **Do:** Link each entity (person, project, decision) once in the note

---

## Next Steps

1. Create your first daily note: `/obsidian-daily`
2. Document the landing page decision: `/obsidian-save`
3. Map the architecture: `/obsidian-architect`
4. Schedule a weekly review: `/obsidian-recurring`

---

**Vault Status:** 🟢 Active  
**Last Updated:** 2026-07-07  
**Owner:** Daniel Wise
