# October 7, 23:14 recording — audit and implementation handoff

## Verified inventory
The 56.7-second recording names OpenMontage, codebase-memory-mcp, Agent Reach, Anthropic Cybersecurity Skills and Voicebox. Frames reviewed at four-second intervals. Voicebox was already pinned in this arsenal, so it was retained without duplication. Four missing projects were downloaded and added as source submodules. Exact revisions and licenses are in repositories.lock.json.

## Download and verify
Run from the existing wise2-core checkout:
```bash
git pull --ff-only
python WISE2-AI-ARSENAL/tools/sources.py
python WISE2-AI-ARSENAL/tools/sources.py --check
```
Sources remain separate upstream projects. GitHub Download ZIP does not include their contents. The initializer downloads only the AI Arsenal entries, not the whole game's source collection.

## Apply to WISE²
1. OpenMontage: read upstream/openmontage/AGENT_GUIDE.md and PROJECT_CONTEXT.md, then the pinned README. Python 3.10+, Node 18+ and FFmpeg are prerequisites. On the actual production host, run `make setup` from its directory. Start with a short edit using existing approved WISE² footage and music, then verify the exported MP4. Paid provider keys are optional and local; existing consumer subscriptions do not automatically grant API credits. OpenMontage carries AGPLv3; keep its LICENSE and review the deployment arrangement before incorporating modified source into a hosted product.
2. Codebase Memory MCP: follow the pinned README's OS-specific binary/build installation. Register its MCP executable with the target coding client, restart that client, and index one existing first-party project. Verify a known symbol and dependency query. This is code graph memory, distinct from the already present Claude-Mem session memory. Do not treat promotional token-saving percentages as measured WISE² results.
3. Agent Reach: create a dedicated Python 3.10+ virtual environment on the target research host, install the pinned local checkout with `python -m pip install .`, then run `agent-reach install --env=auto --safe` and `agent-reach doctor`. The pinned version's default installer checks dependencies; additional channel backends are separate. Pilot a public page or RSS source for OWL EYE. Verify output URL, date and content before adding an adapter. Channel availability depends on network, backend tools and sometimes account access.
4. Cybersecurity Skills: use the pinned skills/ directory as a searchable reference library. Select a relevant defensive workflow for an owned WISE² project, inspect prerequisites, and validate its findings. This is a community project, not an Anthropic product or a security scanner automatically activated by downloading it. No production scan was performed by this import.
5. Voicebox: use the existing pinned copy and existing INTEGRATION.md voice workflow. Do not add a second copy.

## Codex task
Initialize and verify the arsenal, inspect the actual target project's architecture, then implement one integration at a time in first-party folders. First produce an OpenMontage edit from existing assets; next verify Codebase Memory MCP symbol queries on that project; then add one read-only Agent Reach research adapter with evidence URLs; finally apply a relevant defensive security workflow. Report source checkout, dependency installation, runtime registration and production output separately. Preserve canonical IMP/Wise Villain likeness and supplied W² logos. No crowns.

## Validation boundary
This import verifies source commits, README/license availability, manifest and submodule consistency. It does not activate MCP clients, download voice models, install production dependencies or deploy these services on the user's PC/VPS.
