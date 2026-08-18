# Milestone 9 — Video provider adapters

Video generation now uses a vendor-neutral server architecture.

## Components

- `VideoProviderAdapter`: provider contract and capability metadata
- `ProviderRegistry`: runtime registration, removal, discovery, and configuration state
- `VideoJobManager`: asynchronous queue, submission, status, timestamps, results, and safe failures
- `/api/video/providers`: provider discovery
- `/api/video/jobs`: asynchronous submission and job listing
- `/api/video/jobs/:id`: job status

Runway, Kling, Luma, Pika, Replicate, and fal.ai are discoverable planned adapters. They intentionally report `configured: false` until a real provider adapter and server-side credential are supplied. Unconfigured submissions return a sanitized HTTP 503 response rather than attempting generation.
