# WISE² CLIP ENGINE × OPENJUTSU — RECAST ENGINE (v2.0)

An independently controlled, open-source AI video production & character-recasting platform uniting **WISE² Clip Engine v1.7**, **OpenJutsu (`D3voz/openjutsu`)**, **ComfyUI**, and the **VENOM COLLECTOR** modular adapter registry inside the **OBSIDIAN // FORGED Command Center**.

## Quick Start (Windows — One Click)

1. Run hardware-safe setup & audit:
   ```bat
   scripts\windows\INSTALL_WISE2_RECAST.bat
   ```
2. Launch the Command Center (API + Worker + Browser):
   ```bat
   START_WISE2_RECAST.bat
   ```
3. Stop all processes cleanly:
   ```bat
   scripts\windows\STOP_WISE2_RECAST.bat
   ```
4. Run diagnostics at any time:
   ```bat
   scripts\windows\DIAGNOSE_WISE2_RECAST.bat
   ```

## Architecture

- **OBSIDIAN // FORGED Command Center (`web/index.html`)**: Mobile-first PWA (48px+ iPhone touch targets, bottom mobile nav, iOS `playsinline` video preview) preserving 100% of WISE² Clip Engine v1.7 (`Studio`, `Timeline Editor`, `Social Drafts`, `Brand Templates`, `Diagnostics`) alongside the dedicated **WISE² RECAST ENGINE**, **Character Vault**, **GPU Backends**, and **VENOM Collector** modules.
- **Hardware Safety Guard (`app/hardware.py`)**: Detects CPU, GPU, VRAM, RAM, free disk, CUDA, Python, Node.js, FFmpeg, Tailscale, and existing AI installs. Automatically blocks heavy local GPU inference on unsupported integrated graphics (e.g. Lenovo ThinkPad X1 Intel Iris Xe).
- **Multi-Backend GPU Orchestrator (`app/backends.py`)**:
  - `local-nvidia` (auto-enabled only on >=12 GB NVIDIA CUDA hardware)
  - `remote-comfyui` (WISE² Tailscale `gpu-nmls-1` or any LAN/tunnel ComfyUI host)
  - `google-colab` (FREE T4/L4 GPU via `deploy/colab/WISE2_OpenJutsu_Colab.ipynb`)
  - `kaggle-gpu` (FREE dual T4 + 30 GB RAM via `deploy/kaggle/WISE2_OpenJutsu_Kaggle.ipynb`)
  - `runpod` (Optional paid fallback — **disabled by default**, requires explicit opt-in)
- **Persistent Character & Product Vault (`app/recast.py`)**: SQLite + SHA-256 reference image vault so approved talent/products are selected in one tap without re-uploading.
- **Security & Remote Auth (`app/auth.py`)**: Loopback-safe by default; setting `WISE2_ACCESS_PASSWORD` (>=12 chars) enables signed HttpOnly session cookies + Bearer/Basic auth + brute-force backoff + magic-byte media verification.

## Documentation

- [Security, Source & License Audit](docs/SECURITY_AND_LICENSE_AUDIT.md)
- [Mobile (iPhone) & Free Remote GPU Guide](docs/MOBILE_AND_REMOTE_GPU_GUIDE.md)
- [VENOM Collector 117-Repo Audit](docs/VENOM_COLLECTOR_AUDIT.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
