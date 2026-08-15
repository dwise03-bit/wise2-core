---
name: obsidian-second-brain
description: AI-first vault management, synthesis, and research for Wise² Core documentation and decision logs
type: system
category: documentation
---

# Obsidian Second Brain for Wise² Core

An evolution of Karpathy's LLM Wiki pattern: a vault that rewrites itself.

## What it does

- **Auto-synthesis:** Detects patterns, reconciles contradictions, generates insights
- **Scheduled agents:** Nightly deployments, weekly reviews, health audits run autonomously
- **AI-first schema:** Every note has structure for Claude retrieval (preambles, frontmatter, wikilinks)
- **Multi-source ingestion:** Research, video, audio, web feeds
- **Propagation:** Every write cascades through linked notes and indices

## For Wise² Core

Use this skill to:
- `/obsidian-save` — extract decisions from meetings/sessions into structured notes
- `/obsidian-synthesize` — detect patterns across architecture, deployments, incidents
- `/obsidian-reconcile` — resolve contradictions in infrastructure state
- `/obsidian-health` — audit vault and infrastructure status
- `/obsidian-architect` — auto-document codebase changes
- `/research` — capture external research into vault
- `/obsidian-ingest` — add audio, video, screenshots to vault

## Commands (44 total)

**Vault (16):** save, daily, log, task, person, capture, find, recap, board, project, calendar, recurring, world, etc.

**Thinking (13):** challenge, emerge, connect, reconcile, synthesize, review, decide, distill, learn, panel, etc.

**Research (8):** research, research-deep, notebooklm, x-read, x-pulse, youtube, podcast, ingest

**Meta (7):** init, health, export, architect, visualize, retrieval-eval, create-command

## The AI-First Rule

Every note follows a canonical schema:
- `## For future Claude` preamble
- Rich frontmatter: type, date, tags, confidence levels
- `[[wikilinks]]` for entities
- Recency markers: `(as of 2026-07, source.com)`
- No fabrication: never invent facts, mark unknowns as TBD

See `obsidian-second-brain-references/ai-first-rules.md` for the full spec.

## Architecture

**One source, many platforms:**
- `obsidian-second-brain-commands/` — 44 command definitions
- `obsidian-second-brain-scripts/` — Python deterministic work layer
- `obsidian-second-brain-references/` — specs and schemas

**Pattern:** Command describes intent → Python script does deterministic work → Claude synthesizes output → Hooks validate writes

## Key Design Principles

1. Every write is AI-first (structure for retrieval, not just human reading)
2. Deterministic work in scripts (parsing, fetching, scanning)
3. Contradiction detection and auto-reconciliation
4. Propagation (every write updates linked notes, indices, logs)
5. Scheduled agents for nightly/weekly autonomous work
6. Vault compounds over time (more notes → more context → better AI partner)

## Setup

Already installed in `.claude/skills/`:
- `obsidian-second-brain-commands/` — 44 command .md files
- `obsidian-second-brain-scripts/` — Python engine
- `obsidian-second-brain-references/` — specs and templates
- `obsidian-second-brain.md` — full operating manual
- `obsidian-architecture.md` — system design

## Next: Wire It Up

To enable commands:
1. Set `OBSIDIAN_VAULT_PATH` env var to your vault location
2. Call `/obsidian-init` to bootstrap vault structure
3. Use any of the 44 commands to manage, synthesize, research, or schedule

See `obsidian-second-brain.md` for full command reference and usage patterns.
