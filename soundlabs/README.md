# WISE² Sound Labs | open-source MVP

Self-hosted music-to-visual production. No Suno API or proprietary runtime required.

## Components
- ACE-Step 1.5: optional local music generation worker, separate installation and model license review
- FFmpeg: waveform-driven visualizer and export
- FastAPI: local jobs API, with Hermes integration via authenticated internal adapter in a later phase
- Local filesystem: isolated project assets, no public file upload endpoint

## Start
```bash
cd soundlabs
docker compose up --build -d
curl -fsS http://127.0.0.1:8094/health
```

## Render from an authorized local audio file
Copy an audio file into `soundlabs/data/input/song.mp3`, then:
```bash
curl -fsS -X POST http://127.0.0.1:8094/render -H 'Content-Type: application/json' -d '{"filename":"song.mp3","title":"WISE² SOUND LABS"}'
```
Output is saved under `data/output/`. This MVP renders an audio-reactive waveform MP4, **not** generative video or lip-sync. Use an authenticated proxy and job queue before exposing publicly.

## Guardrails
- Loopback binding only, input filename validated, no arbitrary filesystem paths
- Container non-root, resource limits and no-new-privileges
- Do not expose port 8094 to the internet
- Do not auto-download multi-GB AI weights on the existing storage-constrained server
- Commercial rights require checking model weights and every dependency, not only code licenses

## Next integration
Hermes job orchestration, per-client authorization, media vault, ACE-Step worker, ComfyUI/Wan worker on a suitable GPU, timeline UI, CI, deployment checks. No production deployment claimed.
