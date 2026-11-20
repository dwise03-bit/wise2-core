# WISE² Direct Asset Transfer and Deployment Contract

Status: design committed; NOT deployed or reachable.

## Goal
Phone-first transfer of images, videos, ZIPs and website builds to named WISE² projects, with server-side validation, publishing and rollback. One authoritative Ubuntu server; MacBook reserved for iOS/macOS work.

## Required components
1. Authenticated HTTPS upload gateway at a verified WISE² domain; no public anonymous upload and no shared permanent upload key. Short-lived per-user auth with project-scoped permissions.
2. Project registry: slug, owner, domain, repo, deploy adapter, media root, staging and production targets. Never derive filesystem paths directly from user-supplied slugs.
3. Streaming multipart/resumable uploads with size quotas, MIME and magic-byte checks, checksums, malware scanning, and storage outside the web root.
4. Media pipeline: originals retained, optimized web formats generated, metadata tracked, versions and attribution recorded.
5. Deployment workers: stage files, validate paths, run build/tests, atomic publish, health-check and rollback. Never publish ZIP contents without safe extraction checks.
6. Audit trail: who uploaded what, project, SHA-256, timestamps, deployment id, outcome and rollback link.
7. Hermes integration via authenticated job queue; no shell command execution from uploaded filenames or arbitrary requests.
8. Private Tailscale SSH for administrative access; GitHub runner as bounded automation, not an open remote shell.
9. Recovery: verified backups and Pocket Node USB staging, separately audited.

## Minimum API
POST /v1/projects/{projectId}/uploads (returns uploadId and scoped transfer instructions)
GET /v1/uploads/{uploadId} (status, checksum)
POST /v1/projects/{projectId}/deployments (references vetted uploadId, target staging|production)
GET /v1/deployments/{deploymentId} (state, logs, health, rollback id)
POST /v1/deployments/{deploymentId}/rollback (authorized)

## Acceptance checks
- Authenticated phone upload works end to end on test project.
- Wrong-project and anonymous upload rejected.
- Image renders on staging; production requires explicit promotion.
- Large interrupted upload resumes safely.
- Bad archive path traversal rejected.
- Checksum of original matches server record.
- Failed health check automatically restores prior version.
- Each operation appears in audit logs.

## Immediate execution dependencies
- Confirm server-side management execution path (runner online or another authorized connector).
- Inventory existing site roots, domain mappings and deploy tooling before changes.
- Choose verified gateway domain and TLS, then deploy to staging first.
