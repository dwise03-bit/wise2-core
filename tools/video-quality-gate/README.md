# WISE² Cinematic Video Quality Gate

Production pipeline: Hermes → Living Hive → Creative Build → Video Audit → Approval → Export → Independent Verification → Deployment → Sauce Vault.

This feature branch provides the audit/export implementation and default brand profile. Requirements: Python 3, ffmpeg, ffprobe. No extra Python packages.

Audit: `python3 tools/video-quality-gate/video_gate.py input.mp4 --config tools/video-quality-gate/brand.example.json --out report --contact-sheet`

Approved export only: add `--export --start 2 --duration 10` and use a fresh output directory.

Audits never overwrite input. Export refuses existing output. Exit code 2 indicates a failed gate. Inspect JSON reports and contact sheets before client approval. 4K scaling does not add source detail; color sampling is only a drift indicator. Audio -14 LUFS is a configurable web target, not universal.
