# Applying the AI Arsenal to WISE²

## 1. Coding workflow
Initialize the sources and verify all pins. Use claude-code-best-practice as a reference when writing project plans, focused tasks and validation commands. Do not overwrite current project instructions with upstream CLAUDE.md. Introduce Archon into one test project first; its pinned README documents Bun, Claude Code and GitHub CLI prerequisites, source installation and the setup wizard. Its current version is a workflow harness; the older Python RAG version is archived upstream.

## 2. Games and cinematic sites
Use upstream/mcp-for-blender/addon.py and the pinned README to install the Blender addon on the machine running Blender, configure the matching MCP server, and connect locally. Build one IMP scene, export a glTF/GLB, then inspect materials, scale, mesh count and load time in the existing game project. Preserve the canonical IMP reference and supplied W² logo. No crowns. Do not replace the existing game engine just to use the addon.

## 3. Voice production
Follow Voicebox's pinned README for the target OS and install/run it locally. Use Wise Villain's own uploaded voice and authorized collaborators. Generate one short sample before downloading additional models. Export WAV for the existing mix workflow. Voice generation is distinct from mastering and music lip sync; do not promise those features based on this repository alone. Record hardware, model and model-license details before service integration.

## 4. EVERY DAY TRADER
Run ai-hedge-fund in an isolated environment following its pinned README (source development uses Poetry; its current CLI is aihf). Configure required market-data and model-provider credentials locally. Use paper-trading/backtesting output as a research input. Its README describes an educational proof of concept and does not execute real trades. Integrate a read-only report adapter before any dashboard connection.

## 5. Durable coding memory
Follow claude-mem's pinned README for the actual host (Claude Code, Codex or supported harness). Register the plugin/hooks rather than assuming a global npm SDK install activates memory. Keep provider and data-path settings local. Verify that a new session recalls one harmless test observation. Keep API keys and private client audio out of committed memory exports.

## Implementation brief for Codex
Work in the existing wise2-core project. Run the source initializer and verifier. Inspect current architecture before creating adapters. Begin with the Blender-to-game asset smoke test and one repeatable coding workflow. Add Voicebox and Claude-Mem on the actual host, then an isolated paper-trading report adapter. Keep the upstream pins unchanged while implementing adapters in first-party project directories. Test each integration against a real output; report source availability separately from runtime activation and production deployment. Do not fetch all models or install every service into a shared environment.

## Provenance and licensing
The attached 123.93-second recording shows all six projects; reviewed with a 3-second frame interval. Metadata, default branches, README files and commit pins were fetched from the upstream GitHub repositories on 2026-10-08 UTC. See repositories.lock.json for exact sources and SPDX metadata. MIT applies to five projects; the verified Claude-Mem pin reports Apache-2.0. Older videos or forks may show different licenses; the pinned source license controls this checkout. Preserve upstream LICENSE/NOTICE files.
