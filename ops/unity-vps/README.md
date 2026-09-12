# WISE² Unity VPS Live Preview

This keeps `apps/wise2-xr` as the single Unity source and uses the VPS as a headless build/preview host. The Mac opens the latest WebGL build over Tailscale; Quest continues to use the existing Android/OpenXR builder.

## Requirements

- Unity `6000.0.43f1` Linux Editor
- WebGL Build Support for the same editor version
- Docker + Docker Compose
- Tailscale connected on VPS and Mac
- A valid Unity license configured on the VPS without committing license material

## Build

From the repository root on the VPS:

```bash
chmod +x ops/unity-vps/*.sh
bash ops/unity-vps/build-webgl.sh
```

If Unity is installed somewhere else:

```bash
UNITY_EDITOR=/absolute/path/to/Editor/Unity bash ops/unity-vps/build-webgl.sh
```

Build logs are written to `apps/wise2-xr/Build/webgl-build.log` by default.

## Serve privately over Tailscale

```bash
bash ops/unity-vps/serve-webgl.sh
```

The script detects the VPS Tailscale IPv4 address and binds nginx only to that address. Default port is `8097`.

Current expected WISE² VPS target, subject to live verification:

```text
http://100.68.145.5:8097
```

Open that URL in Safari or Chrome on the Mac while both machines are connected to Tailscale.

## Verify

VPS:

```bash
curl -fsS http://$(tailscale ip -4 | head -n1):8097/health
docker compose -f ops/unity-vps/docker-compose.preview.yml ps
tail -n 80 apps/wise2-xr/Build/webgl-build.log
```

Mac:

```bash
curl -I http://100.68.145.5:8097/
open http://100.68.145.5:8097/
```

## Stop preview

```bash
docker compose -f ops/unity-vps/docker-compose.preview.yml down
```

## Quest build remains unchanged

The existing Quest builder remains `Wise2.XR.Editor.BuildQuest.PerformBuild`. This WebGL preview path does not replace or modify the Quest Android/OpenXR build.

## Rollback

Stop the preview container. The WebGL output is disposable and may be removed without touching Unity source or Quest builds:

```bash
docker compose -f ops/unity-vps/docker-compose.preview.yml down
rm -rf apps/wise2-xr/Build/WebGL
```
