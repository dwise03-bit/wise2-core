# WISE² GPU generation — unified setup

One GPU stack for **Cursor**, **Codex**, **Claude**, **Hermes**, **Studio**, and **Discord**.

## Host

| | |
|--|--|
| Tailscale | `100.68.145.5` |
| ComfyUI | `:8188` (SDXL 1.0) |
| MusicGen | `:4900` |
| GPU | GTX 1660 SUPER · 6 GB |

## Agent env (Mac)

```bash
source scripts/gpu-env.sh
# COMFYUI_API_URL=http://100.68.145.5:8188
```

## Commands

```bash
bash scripts/gpu-generation-status.sh
bash scripts/comfyui-wise2.sh status|generate|download|ui|campaign
bash scripts/setup-discord-mac.sh --start
bash scripts/deploy-comfyui-vps.sh
```

## Integration map

```
ComfyUI (VPS GPU)
    ├── scripts/comfyui_client.py      ← Python generators
    ├── apps/studio/api/comfyui/*      ← Studio UI
    ├── services/bot/lib/comfyui.js    ← Discord /generate-image
    └── Cursor / Codex / Claude        ← COMFYUI_API_URL in env
```

See [COMFYUI_WISE2.md](COMFYUI_WISE2.md) for details.
