# WISE² RECAST — GPU Backend Audit & Repair Report

**Audit Date:** 2026-11-25  
**Target System:** Lenovo ThinkPad X1 (`21HRS17B00`) · Intel Core i7-1365U · 15.67 GB RAM · Intel Iris Xe Graphics · ~5.7 GB free disk on `C:`.

## 1. Root Cause of `AWAITING_GPU_BACKEND` (`http://100.66.102.124:8188`)

| Check | Result | Finding |
|---|---|---|
| Tailscale peer `100.66.102.124` (`gpu-nmls-1.tail44396d.ts.net`) | **OFFLINE** | `last seen 16d ago, tx 8580 rx 0`; `tailscale ping` timed out |
| TCP Port `8188` / `22` on `100.66.102.124` | **CLOSED / TIMEOUT** | Host unreachable over Tailscale |
| Other SSH/Tailscale hosts (`gpu-nmls`, `wise2-surface`, `173.208.147.165`) | **CLOSED / TIMEOUT** | No other remote GPU machine online |
| `gpu-nmls-1` GPU spec (`wise2-core/docs/GPU_GENERATION_SETUP.md`) | **GTX 1660 SUPER (6 GB VRAM)** | **Insufficient VRAM** — SDXL-only; cannot execute OpenJutsu MiniMax H3 + Qwen3-VL 8B/32B + SAM 3.1 (requires ≥16 GB NVIDIA VRAM + 32–64 GB RAM + ~45 GB disk) |
| Local ThinkPad X1 AI runtimes | **No CUDA / PyTorch / OpenVINO / DirectML** | Only `fastapi`, `uvicorn`, `cv2`, `numpy`, `httpx`, `PIL`, `comfy_api_proxy` installed; `5.67 GB` free disk cannot hold 45 GB H3 weights |

## 2. Repairs Implemented

1. **Removed Hardcoded Obsolete Endpoints:** Stripped `http://100.66.102.124:8188` / `100.68.145.5:8188` from defaults (`app/gpu_manager.py`, `.env.example`) and automatically scrubbed stale legacy DB values on load.
2. **Centralized WISE² GPU Manager (`app/gpu_manager.py`):** Manages all 9 execution backends (`local-cpu`, `local-intel-xe`, `local-openvino`, `local-nvidia`, `remote-comfyui`, `kaggle-gpu`, `google-colab`, `wise2-gpu-server`, `runpod`) plus **`AUTO` Smart Selector**. Never reports a backend as `connected` without a verified live TCP + HTTP `/queue` health check.
3. **Repaired Job Queue (`app/recast.py`, `app/recast_router.py`):**
   - Added `/api/recast/preflight` and `/api/gpu/diagnostics` for pre-submission verification.
   - Added automatic compatible fallback across healthy free GPU backends.
   - Preserves 100% of uploaded videos, character profiles, seeds, and workflow settings when rendering cannot start.
   - Added **Retry Without Re-Uploading** (`/api/recast/jobs/{id}/retry`) and **Clone Job Without Re-Uploading** (`/api/recast/jobs/{id}/clone`).
   - Strictly separates `workflow_compiled` (pre-AI input clip) from `ai_render_completed` (verified AI output MP4 with SHA-256 distinctness check). Never substitutes FFmpeg for AI character replacement.

## 3. Initial 5-Second 480p Silk Vision Test Status

- **Single Character Reference Registered:** `Distorted Wisdom Silk Vision (Single Ref)` from `C:\WISE2\SILK_RUNNER_CODEX_START\assets\male_model_reference.jpeg` (clean single-character studio photo instead of multi-panel reference board).
- **Test Job Prepared (Zero Re-Upload):** Cloned uploaded 24s video (`1bcddc005e51`) into `480p · 5.0s · start=0 · seed=42 · backend=auto`.
- **Unavoidable Hardware/Service Blocker:** No NVIDIA ≥16 GB GPU is locally installed or online on Tailscale, and no cloud notebook tunnel URL is active yet. The 5s test job AND the original 24s job are preserved and ready for 1-click **Retry (No Re-Upload)** as soon as you launch the free Kaggle GPU notebook (`deploy/kaggle/WISE2_OpenJutsu_Kaggle.ipynb`, T4 × 2 · 30 GB RAM · 30 hrs/week free) or Google Colab (`deploy/colab/WISE2_OpenJutsu_Colab.ipynb`) and paste the printed `https://*.trycloudflare.com` URL into **WISE² GPU Manager**.
