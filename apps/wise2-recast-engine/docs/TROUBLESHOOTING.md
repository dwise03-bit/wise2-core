# WISE² RECAST ENGINE — Troubleshooting & Dependency Manifest

## Common Issues & Fixes

| Symptom | Cause | Resolution |
|---|---|---|
| `Local NVIDIA rendering is blocked` | Running on ThinkPad X1 Intel Iris Xe (no CUDA) | Expected safety guard. Use **GPU Backends** → Remote ComfyUI, Kaggle Free GPU, or Google Colab Free GPU. |
| Job stays in `awaiting_gpu_backend` | ComfyUI server is offline or tunnel URL expired | Start ComfyUI / Colab / Kaggle notebook, paste new URL in **GPU Backends**, click **Test ComfyUI**, then **Retry** on the job. |
| Job shows `missing_comfy_nodes` | Remote ComfyUI is missing OpenJutsu custom node packs | Install listed packs from `CUSTOM_NODES_REPORT.md` into `ComfyUI/custom_nodes/` and restart ComfyUI. |
| `403 Set WISE2_ACCESS_PASSWORD` from iPhone | Accessed over LAN/Tailscale without a password configured | Set `WISE2_ACCESS_PASSWORD` (>= 12 chars) and `WISE2_BIND_ALL=1` in `.env` and restart. |
| `400 Uploaded file failed magic-byte verification` | File extension doesn't match actual container bytes | Re-export as standard MP4/MOV/WebM or PNG/JPG/WebP. |
| `507 Insufficient disk space` | Less than 250 MB free on `C:` | Free space on `C:` or point `WISE2_DATA_DIR` to an external SSD. |
| ComfyUI stalls when seeking MP4 on Windows | Windows aiohttp `sendfile` bug | Launch ComfyUI with `$env:AIOHTTP_NOSENDFILE = "1"`. |

## Dependency Manifest

- **Python (>= 3.11, verified on 3.13.14):** `fastapi>=0.115,<1`, `uvicorn[standard]>=0.30,<1`, `python-multipart>=0.0.9,<1`, `opencv-python-headless==4.10.0.84`; dev: `pytest`, `httpx>=0.27,<1`; optional ASR: `faster-whisper`.
- **Node.js (>= 22.6, verified on v24.18.1, OpenJutsu upstream):** `next@16.4.6` (security-patched), `react@19.3.1`, `react-dom@19.3.1`, `@comfyorg/sdk@0.5.0`, `typescript@7.0.2`.
- **OpenJutsu Proxy (isolated `.venv-proxy`):** `comfy-api-proxy==0.1.6` + `patch_proxy.py` live-progress fix.
- **Media:** `ffmpeg` + `ffprobe` (verified on FFmpeg `9.0.2`).
- **Required Remote ComfyUI Custom Nodes (12 packs + websocket fix):** Listed in `app/backends.py` (`OPENJUTSU_REQUIRED_PACKS`) and auto-installed by the Colab & Kaggle notebooks.
