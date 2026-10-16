# WISE² OpenKnowledge AI Knowledge Core — Partner Handoff
Date: 2026-10-09
Status: GitHub documentation handoff; installation and testing still required
Owner: WISE² | Pilot repository: dwise03-bit/wise2-core

## Goal
Pilot OpenKnowledge as an AI-readable shared Markdown knowledge base connecting Codex, Claude Code, and Cursor without replacing existing Obsidian, Notion, or project tooling. Keep knowledge portable, reviewable and Git-versioned.

## Official sources
- Source: https://github.com/inkeep/open-knowledge
- Docs: https://openknowledge.ai/docs
- Codex integration: https://github.com/inkeep/open-knowledge/blob/main/docs/content/integrations/codex.mdx
- MCP reference: https://github.com/inkeep/open-knowledge/blob/main/docs/content/reference/mcp.mdx

## Scope and guardrails
- Phase 1 is a contained pilot. Do not copy all company information into the knowledge base.
- DO NOT clone the whole upstream OpenKnowledge application into wise2-core. Install from the official package / official desktop release on an authorized workstation, and pin/review the version.
- No secrets, API keys, customer PII, banking details, or private client records in Git.
- No blind write access for autonomous agents. Start read-only workflows and require human approval for edits/pushes.
- Confirm repository visibility before committing internal plans: wise2-core is presently PUBLIC.
- Keep Obsidian and existing Notion docs functional; migrate only after proven tests.
- Avoid generated docs loops; commit only reviewed material.

## Proposed folder layout
knowledge/
  README.md
  company/overview.md
  systems/ai-agents.md
  projects/wise2-core.md
  projects/owl-eye.md
  projects/truck-wiser.md
  decisions/README.md
  handoffs/README.md
These are suggested paths, not files yet created.

## Partner implementation steps
1. Confirm Windows workstation details, existing Node.js/Git versions, and existing Codex, Claude, Cursor configurations. Back up tool configs.
2. Check the current OpenKnowledge release and its Windows support. Official CLI installation path (Node.js 24+ and git): `npm install -g @inkeep/open-knowledge`. Prefer official desktop build if suitable.
3. From a local dedicated knowledge pilot directory, run `ok init`; inspect resulting configuration changes and agent permissions before acceptance.
4. Start local editor with `ok start --open` when using CLI. Confirm editor can see sample .md files.
5. Validate MCP agent tools in Codex, Claude Code, and Cursor; use the OpenKnowledge-provided skill/config registration from `ok init`, rather than inventing MCP paths.
6. Add two or three non-sensitive project documents. Test search, document retrieval, backlink navigation and preview.
7. Test a controlled agent edit (with human approval), inspect diffs/frontmatter and Git history, and verify that another agent sees the updated version.
8. Use a dedicated branch/PR for production knowledge changes; review before merge. Never enable unattended Git pushes without explicit approval.
9. Record observed version, OS, setup commands, installed agent tools, config diffs, tests, blockers and rollback.

## Acceptance tests
- [ ] Local editor launches reliably
- [ ] Markdown docs remain editable with ordinary tools
- [ ] Codex retrieves and cites the correct pilot doc
- [ ] Claude Code retrieves the same content
- [ ] Cursor retrieves the same content
- [ ] An approved agent edit creates an auditable diff/history
- [ ] Git can roll back the test change
- [ ] No credentials or private information are committed
- [ ] Existing workspaces and AI settings still work

## Rollback
Disable OpenKnowledge MCP entries in agent configurations, restore backed-up configs, stop the editor, and revert the pilot branch. Do not delete the existing Obsidian vault or Notion workspace.

## Handoff for Codex / Partner
Audit this repository and existing tool configurations. Implement a LOCAL, reversible OpenKnowledge pilot following the steps above. Verify actual CLI syntax against current upstream docs. Create minimal docs and a setup script ONLY after reviewing existing repository conventions. Run the acceptance tests, capture outputs, and open a PR for review. Do not claim agent integration or testing passed unless demonstrated. Do not merge or deploy without approval.

## Deliverables for completion
1. setup-and-verification.md with exact machine environment and commands
2. knowledge/ sample docs and architecture notes
3. MCP / skill configuration notes, without secrets
4. test-results.md with PASS/FAIL and evidence
5. rollback.md
6. PR URL and commit SHA
