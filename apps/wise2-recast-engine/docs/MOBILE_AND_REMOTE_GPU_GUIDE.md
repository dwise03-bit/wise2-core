# Mobile (iPhone) Access & Free Remote GPU Configuration Guide

## 1. Operating WISE² RECAST ENGINE from Your iPhone (Tailscale)

Your ThinkPad X1 (`100.113.115.115`) and iPhone (`iphone175` · `100.68.111.109`) are already connected on Tailscale!

1. Copy `.env.example` to `.env` in `wise2-recast-engine\`.
2. Set a strong access password (>= 12 characters) and enable LAN/Tailscale binding:
   ```env
   WISE2_PORT=47231
   WISE2_BIND_ALL=1
   WISE2_ACCESS_PASSWORD=Your-Strong-16-Char-Passphrase!
   ```
3. Launch WISE² via `START_WISE2_RECAST.bat`.
4. Allow inbound TCP port `47231` on Windows Firewall for Tailscale interface (one-time admin PowerShell):
   ```powershell
   New-NetFirewallRule -DisplayName "WISE2 Recast Engine (Tailscale)" -Direction Inbound -Protocol TCP -LocalPort 47231 -RemoteAddress 100.64.0.0/10 -Action Allow
   ```
5. On your iPhone (with Tailscale connected), open Safari and go to:
   ```text
   http://100.113.115.115:47231/
   ```
6. Enter your `WISE2_ACCESS_PASSWORD`, tap **Share → Add to Home Screen** to install as a full-screen **OBSIDIAN // FORGED** iOS Web App!

## 2. Free & Self-Hosted Remote GPU Backends (Zero Mandatory Subscriptions)

Because your Lenovo ThinkPad X1 uses Intel Iris Xe integrated graphics (no NVIDIA CUDA) and has ~5.7 GB free disk, heavy MiniMax H3 / FLUX.3 Klein inference runs on remote GPUs:

### Option A: WISE² Tailscale GPU Node (`gpu-nmls-1`) — FREE (Self-Hosted)
- Your Tailscale mesh already lists `gpu-nmls-1.tail44396d.ts.net` (`100.66.102.124`, currently offline).
- When `gpu-nmls-1` is powered on with ComfyUI 0.41.2+ on port `8188`, select **Remote ComfyUI Server** in the **GPU Backends** tab and click **Test ComfyUI**.

### Option B: Kaggle Free GPU (T4 x2 · 30 GB RAM · 30 hrs/week FREE) — Recommended Free Cloud
1. Upload `deploy/kaggle/WISE2_OpenJutsu_Kaggle.ipynb` to Kaggle Notebooks.
2. Enable **Accelerator: GPU T4 x2** and **Internet: ON**.
3. Run all cells and copy the printed `https://xxxx.trycloudflare.com` URL.
4. Paste it into **WISE² Command Center → GPU Backends → Kaggle Free GPU**, click **Test ComfyUI**, then **Save & Activate**.

### Option C: Google Colab Free GPU (T4 15 GB VRAM) — Free Cloud
1. Upload `deploy/colab/WISE2_OpenJutsu_Colab.ipynb` to Google Colab (`Runtime → Change runtime type → T4 GPU`).
2. Run all cells, copy the `https://xxxx.trycloudflare.com` URL, and paste it into **GPU Backends → Google Colab**.
3. *Verified Resource Limit:* Free Colab's ~12.7 GB system RAM cap suits 480p 4–6s clips, relighting, and color grading; use Kaggle (30 GB RAM) or a 64 GB RAM host for long MiniMax H3 chains.

### Option D: Optional Paid Fallback (RunPod) — Disabled by Default
- See `deploy/runpod/README.md`. Never activated without `WISE2_ALLOW_PAID_BACKENDS=true` and explicit confirmation.
