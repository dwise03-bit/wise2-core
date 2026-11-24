# WISE² Clip Engine — OBSIDIAN // FORGED

Integration staging for v2.0 Precision Lyrics Studio. This directory is not yet a runnable application: the existing v2.0 source archive and artwork must be imported before deployment.

## Deployment contract
Use only the canonical Ubuntu `wise2` host, following `docs/operations/CANONICAL_SINGLE_SERVER.md`. Run the existing single-server audit before selecting ports or storage. Keep the Python/FastAPI/FFmpeg service isolated from the NestJS core. Bind its backend to loopback, use authenticated same-origin reverse proxy access, and do not expose unauthenticated upload or media endpoints. Preserve private per-user storage and enforce authorization before enabling multi-user access.

The baseline archive contains app-source/Dockerfile and compose.yaml; review worker lifecycle, ASR dependencies, persistence, resource limits, and upload security before deploying. Preserve approved OBSIDIAN // FORGED and IMP assets. Real song transcription, forced alignment and browser interaction remain unverified.

Acceptance: authenticated browser access, real audio-derived lyrics, caption editing, full-HD export with original audio, restart recovery, and rollback. No Windows installer required for browser clients.
