# WISE² ComfyUI — full integration

ComfyUI SDXL on **gpu-nmls-1** (`100.68.145.5:8188` via Tailscale).

## Surfaces

| Surface | How |
|---------|-----|
| **CLI** | `bash scripts/comfyui-wise2.sh generate "prompt"` |
| **Studio** | Content Factory → ComfyUI panel |
| **Discord** | `/generate-image`, `/generate-campaign`, `/comfyui-status` |
| **Python** | `from comfyui_client import generate_image` |

## Quick start (Mac)

```bash
bash scripts/gpu-generation-status.sh
bash scripts/comfyui-wise2.sh generate "WISE² neon logo"
bash scripts/comfyui-wise2.sh download wise2
```

Env:

```bash
COMFYUI_API_URL=http://100.68.145.5:8188   # Mac / agents
COMFYUI_API_URL=http://127.0.0.1:8188      # on VPS
```

## Discord (Mac bot)

```bash
bash scripts/fix-discord.sh                   # one-shot fix + start
bash scripts/start-discord-bot-when-ready.sh  # sleep until gateway reset, then start
bash scripts/start-discord-bot.sh             # start immediately (gateway open)
bash scripts/setup-discord-mac.sh --start
bash scripts/test-discord-e2e.sh
```

Slash commands deploy without gateway (REST):

```bash
cd services/bot && WISE2_DISCORD_DEPLOY_ONLY=1 node index.js
```

## VPS deploy

```bash
bash scripts/deploy-comfyui-vps.sh
bash scripts/setup-discord-tailscale.sh
```

## Related

- [GPU_GENERATION_SETUP.md](GPU_GENERATION_SETUP.md)
- [GPU_IMAGE_GENERATION_GUIDE.md](../GPU_IMAGE_GENERATION_GUIDE.md)
- [WISE2_DISCORD_SETUP.md](WISE2_DISCORD_SETUP.md)
