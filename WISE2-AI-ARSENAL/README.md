# WISE² AI Arsenal

All six repositories visible in the October 7 recording are registered as Git submodules at verified upstream commit SHAs. These are actual source checkouts after initialization, not copied promotional links. Upstream updates do not silently change these pins.

## Download all sources

From your existing wise2-core checkout:

```bash
git pull --ff-only
python WISE2-AI-ARSENAL/tools/sources.py
python WISE2-AI-ARSENAL/tools/sources.py --check
```

On Windows, use `py` if `python` is unavailable. Requires Git, Python 3 and access to github.com. A fresh clone can use `git clone --recurse-submodules https://github.com/dwise03-bit/wise2-core.git`. GitHub Download ZIP omits submodule contents.

## Tools and application

| Source | WISE² application | Setup after download |
|---|---|---|
| [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice/tree/b8693242f1f78f29a8fe63cbe180c1fd2b455ecc) | Coding practices for Codex/Claude project work | Read the pinned README in `WISE2-AI-ARSENAL/upstream/claude-code-best-practice` |
| [mcp-for-blender](https://github.com/ahujasid/mcp-for-blender/tree/7a0373ec9199183cb460068c4f96aed9c579fb4f) | 3D asset creation for IMP, game environments and cinematic sites | Read the pinned README in `WISE2-AI-ARSENAL/upstream/mcp-for-blender` |
| [voicebox](https://github.com/jamiepine/voicebox/tree/8af7efe62fab8d33e2a5dfbedabaa45f68a5184f) | Local voice studio for Wise Villain and authorized collaborator audio | Read the pinned README in `WISE2-AI-ARSENAL/upstream/voicebox` |
| [ai-hedge-fund](https://github.com/virattt/ai-hedge-fund/tree/78b779c1389e2d1452dc29606d2c4126d859b964) | EVERY DAY TRADER research and paper-trading experiments | Read the pinned README in `WISE2-AI-ARSENAL/upstream/ai-hedge-fund` |
| [archon](https://github.com/coleam00/Archon/tree/194538dff3e455e335af2c67b950bc42c08b54bc) | Repeatable WISE² build, validate and review workflows | Read the pinned README in `WISE2-AI-ARSENAL/upstream/archon` |
| [claude-mem](https://github.com/thedotmack/claude-mem/tree/71ddd11735d6dc38a6356fe376921fc216f2aa38) | Persistent coding-session memory | Read the pinned README in `WISE2-AI-ARSENAL/upstream/claude-mem` |

Blender MCP is now named `mcp-for-blender`; the recording shows its previous name. Archon's current default branch is `dev`, which is explicitly recorded in the lock.

## What is ready

Source pins, download/verification tooling, license inventory, and implementation handoff are committed. These tools are not yet installed on your PC or connected to the running WISE² services. Dependency installation, model downloads, API credentials, Blender addon activation and host plugin configuration occur on the target machine.

Read [INTEGRATION.md](INTEGRATION.md) for the concrete application sequence. Each submodule preserves its own license. Retain attribution and review model-specific terms for downloaded voice models separately from the Voicebox application license.
