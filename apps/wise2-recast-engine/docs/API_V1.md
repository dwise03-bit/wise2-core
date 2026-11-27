# WISE² API v1.6

Interactive docs: `/docs` and `/openapi.json`.

## Core jobs
- `POST /api/jobs` multipart `file` → `{job_id, status_url, queue}` (202). Queues durable job.
- `GET /api/jobs` → list of jobs.
- `GET /api/jobs/{job}` → status, progress, stage, message, clips, transcript, highlight_candidates.
- `POST /api/jobs/{job}/retry` → requeue failed/interrupted (202).
- `POST /api/jobs/{job}/cancel` → cooperative cancel.
- `POST /api/jobs/batch/render` → queue multiple job IDs.

## Resumable uploads
- `POST /api/uploads` → `{upload_id, chunk_url, complete_url}`.
- `PUT /api/uploads/{id}/chunks?offset=N` → append chunk (offset must match received).
- `POST /api/uploads/{id}/complete` → assemble, ffprobe-validate, queue job.

## Transcription and captions
- `POST /api/jobs/{job}/captions/transcribe?model_size=tiny` → local faster-whisper (optional). Explicit error if unavailable.
- `PUT /api/jobs/{job}/captions` → save edited word timestamps.
- `POST /api/jobs/{job}/captions/render` → burn ASS into clip.

## Highlights
- `POST /api/jobs/{job}/highlights/analyze` → transcript-aware ranking (or scene fallback). Returns candidates with scores and reasons.
- `GET /api/jobs/{job}/highlights` → stored candidates.
- `POST /api/jobs/{job}/highlights/{index}/render` → render one candidate.

## Publishing (BLOCKED)
- `POST /api/publishing/preflight` → always `ready_for_live_publish: false`.
- Token store / disconnect / draft endpoints exist but do not contact platforms.

## Worker
Launch separately: `python -m app.worker`.
Recovers abandoned jobs, processes queue with retries, integrates ASR + ranking when available.

## Security
Local prototype. No auth. Do not expose publicly. Path and size guards on uploads.
