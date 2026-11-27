# RunPod Optional Paid GPU Fallback (DISABLED BY DEFAULT)

> **BILLING SAFETY GUARD:** WISE² RECAST ENGINE **never** activates or bills RunPod automatically. To enable RunPod as a fallback for heavy 736p/1080p MiniMax H3 renders, you must explicitly authorize it.

## Recommended Pod Spec (for full OpenJutsu MiniMax H3 + FLUX.3 Klein)
- **GPU:** RTX 4090 (24 GB VRAM) or A40 / L40S (48 GB VRAM)
- **System RAM:** >= 64 GB
- **Volume Disk:** >= 80 GB (for MiniMax H3 INT8, Qwen3-VL 32B/8B, SAM 3.1, FLUX.3 Klein, SolarRenderer)
- **Exposed HTTP Port:** `8188` (ComfyUI)

## Explicit Activation Steps
1. Set environment variable in `.env`:
   ```env
   WISE2_ALLOW_PAID_BACKENDS=true
   RUNPOD_COMFYUI_URL=https://<pod-id>-8188.proxy.runpod.net
   ```
2. In **WISE² Command Center → GPU Backends → RunPod**, enter your pod URL and explicitly save with paid authorization enabled.
3. Stop or terminate your RunPod pod immediately after exporting finished MP4s to stop per-minute billing.
