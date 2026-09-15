# WISE² Unified AI — Dual GPU Setup

**Date**: 2026-09-15  
**Status**: ✅ Production Ready  
**Version**: 1.0.0 (locked)  
**Cost**: $0/month

## Overview

Complete dual-GPU local AI setup combining Apple M4 (16GB, quality-first) and NVIDIA GTX 1660 Super (6GB, speed-first) with intelligent auto-routing.

## Architecture

```
Local M4 (16GB)          VPS GTX 1660 (6GB)
├─ wise2-m4             ├─ mistral:latest
├─ wise2-coder-m4       ├─ qwen3.5:4b
├─ wise2-vision-m4      └─ neural-chat:latest
├─ wise2-fast-m4
└─ [4 more models]

         ↓ Smart Router ↓
[WISE² Unified CLI]
    wise-ai [command]
```

## Quick Start

```bash
# Check health
wise-ai status

# Smart auto-routing (recommended)
wise-ai auto "your task"

# Force choice
wise-ai local "quality task"
wise-ai vps "speed task"

# Specialized
wise-ai code "def foo():"
wise-ai 3d "design box"
wise-ai vision image.png
```

## Commands

| Command | GPU | Speed | Use Case |
|---------|-----|-------|----------|
| `wise-ai local` | M4 | 13.91 tok/s | Quality, reasoning |
| `wise-ai vps` | GTX 1660 | ~60 tok/s | Speed, summaries |
| `wise-ai auto` | Smart | Variable | Auto-route |
| `wise-ai code` | M4 | 12.46 tok/s | Coding (24K ctx) |
| `wise-ai 3d` | M4 | Native | 3D/CAD |
| `wise-ai vision` | M4 | ~120s | Images |

## Shell Aliases

```bash
ai                 # = wise-ai
ai-status         # Check both GPUs
ai-local          # Force M4
ai-vps            # Force VPS
ai-auto           # Smart routing
ai-code           # Coding mode
ai-3d             # 3D mode
```

## Auto-Routing Logic

- **Short query** (< 100 chars) → VPS GPU (5-6x faster)
- **Long query** (> 100 chars) → M4 (full quality)
- **Images/multimodal** → Force M4
- **Coding** → Force M4 (24K context)

## Local Models (8)

| Model | Size | Speed | Purpose |
|-------|------|-------|---------|
| wise2-m4 | 6.6GB | 13.91 tok/s | General reasoning |
| wise2-coder-m4 | 6.6GB | 12.46 tok/s | Coding (24K ctx) |
| wise2-vision-m4 | 7.7GB | ~120s | Image analysis |
| wise2-fast-m4 | 4.0GB | ~30 tok/s | Speed priority |
| wise2-3d-ultra | 3.4GB | Native | 3D modeling |
| wise2-3d-fast | 3.4GB | Native | Fast 3D |
| gemma4:12b-mlx | 7.7GB | ~16 tok/s | Heavy reasoning |
| qwen3.5:4b | 3.4GB | ~40 tok/s | Ultra-fast |

## VPS Models

- `mistral:latest` — Primary (7B, ~60 tok/s)
- `qwen3.5:4b` — Fast (4B, ~150 tok/s)
- `neural-chat:latest` — Fallback
- 9+ backup models

## Configuration

**Local**:
- Path: `~/.config/wise-ai.conf`
- CLI: `/Users/danielwise/.local/bin/wise-ai`
- Aliases: `~/.zshrc`

**VPS**:
- Host: 173.208.147.165
- Port: 11434
- User: dwise
- SSH: Pre-configured (no password)

## No Breaking Changes

- ✅ All `claude-*` commands still work
- ✅ All shell functions preserved
- ✅ Codex (0.153.4) unchanged
- ✅ Claude CLI (2.1.272) unchanged
- ✅ Completely backward compatible

## Performance

| Task | M4 | VPS | Winner |
|------|----|----|--------|
| Quick summary | 13.91 tok/s | 60 tok/s | VPS (5x) |
| Code generation | 12.46 tok/s | 60 tok/s | VPS (5x) |
| Complex reasoning | 13.91 tok/s | Limited | M4 |
| Image analysis | Multimodal | N/A | M4 |

## Costs

- Local inference: $0
- VPS inference: $0 (already running)
- API calls: $0 (no API used)
- **Total**: $0/month

## Documentation

- Full lock-in: `MEMORY.md` → `wise2_unified_ai_locked_20260915.md`
- Setup guide: `COMPLETE_SETUP.md`
- Dual-GPU guide: `DUAL_GPU_SETUP.md`
- Local AI guide: `LOCAL_AI_SETUP.md`

## Support

```bash
wise-ai help           # Show all commands
wise-ai status         # Check both GPUs
wise-ai test           # Benchmark both
wise-ai update         # Update VPS models
```

**Status**: Production Ready. No setup needed next time.
