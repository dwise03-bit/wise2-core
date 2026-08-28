# WISE2 Control Bridge Operations

The Control Bridge is a restricted operator API for WISE2 production infrastructure. It enables ChatGPT, the iOS Command Center, and other approved clients to inspect and operate the WISE² services without exposing arbitrary shell access or secrets.

**Architecture:** Node.js + Fastify, running in Docker on the same host as the WISE² services.

**Security:** No arbitrary shell commands, no secret reads, no database operations, no firewall mutation, no credential exposure. All operations are on an explicit allowlist, all writes are audited, and all responses exclude secrets.

## Deployment

The Control Bridge runs as a service in `docker-compose.production.yml`:

```bash
docker compose -f docker-compose.production.yml up -d control-bridge
```

## Configuration

Required environment variable:

```bash
WISE2_CONTROL_TOKEN=<random-48-byte-base64-token>
```

Generate with:

```bash
openssl rand -base64 48
```

Optional overrides:

| Variable | Default | Purpose |
|----------|---------|---------|
| `WISE2_CONTROL_HOST` | `127.0.0.1` | Bind address (keep as localhost) |
| `WISE2_CONTROL_PORT` | `3099` | Server port |
| `WISE2_REPO_DIR` | `/home/dwise/wise2-core` | Repository root for Git/Docker compose |
| `WISE2_COMPOSE_FILE` | `/home/dwise/wise2-core/docker-compose.production.yml` | Canonical compose file |
| `WISE2_AUDIT_FILE` | `/data/control-bridge/audit.jsonl` | Audit log path |
| `WISE2_DEPLOYMENT_FILE` | `/data/control-bridge/deployments.jsonl` | Deployment metadata path |
| `WISE2_OLLAMA_URL` | `http://host.docker.internal:11434/api/tags` | Ollama health check |
| `WISE2_HERMES_URL` | `http://host.docker.internal:3012/api/health` | Hermes health check |
| `WISE2_PUBLIC_URL` | `https://wise2.net` | Public WISE² URL |
| `WISE2_API_HEALTH_URL` | `http://host.docker.internal:3010/api/health` | API health check |
| `WISE2_ALLOWED_SERVICES` | See config.ts | Restartable Docker services |
| `WISE2_ALLOWED_APPS` | See config.ts | Deployable applications |
| `WISE2_CONTROL_RATE_LIMIT_MAX` | `60` | Max requests per window |
| `WISE2_CONTROL_RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |

## Access & Ingress

**Binding:** The bridge binds to `127.0.0.1:3099` only. Do not expose to the public internet.

**Recommended ingress:**

1. **Tailscale private networking** (preferred)
   - Deploy control-bridge behind Tailscale HTTPS
   - Access from authenticated Tailscale clients only
   - No public IP exposure

2. **Private reverse proxy** (alternative)
   - nginx/caddy on the same host
   - TLS termination
   - Source IP restriction (private subnet only)
   - Proxy `/v1/control/` to `http://127.0.0.1:3099`

3. **SSH port forward** (development only)
   ```bash
   ssh -L 3099:127.0.0.1:3099 user@gpu-nmls.tailscale.net
   curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
     http://localhost:3099/v1/control/status
   ```

## Authentication

All endpoints except `/v1/control/health` require:

```bash
Authorization: Bearer <WISE2_CONTROL_TOKEN>
```

Use constant-time token comparison. Token is never logged, returned, or cached in responses.

## Endpoints

### Health & Status

**`GET /v1/control/health`** — No auth required; liveness check for Docker healthcheck.

```bash
curl -fsS http://127.0.0.1:3099/v1/control/health
# { "ok": true, "requestId": "...", "action": "health", "timestamp": "...", "data": { "status": "ok" } }
```

**`GET /v1/control/status`** — Aggregate infrastructure health. Returns per-component status (healthy/degraded/down).

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/status
```

**`GET /v1/control/audit?limit=100`** — Retrieve audit log entries (limit: 100–500). Auth required.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  "http://127.0.0.1:3099/v1/control/audit?limit=100"
```

### Host Metrics

**`GET /v1/control/host/metrics`** — CPU, RAM, disk, uptime, load.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/host/metrics
```

**`GET /v1/control/host/gpu`** — GPU utilization, memory, temperature (via nvidia-smi). Gracefully unavailable if GPU absent.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/host/gpu
```

### Docker

**`GET /v1/control/docker/services`** — List running services in the production compose.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/docker/services
```

**`GET /v1/control/docker/stats`** — All-container stats (memory, CPU, I/O).

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/docker/stats
```

**`GET /v1/control/docker/:service/logs?lines=200`** — Service logs (default 200 lines, max 500). Auth required; service must be allowlisted.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  "http://127.0.0.1:3099/v1/control/docker/api/logs?lines=100"
```

Logs are redacted of secrets (token, env vars).

**`POST /v1/control/docker/:service/restart`** — Restart an allowlisted service. Auth required; audited. Polls for health after restart.

```bash
curl -X POST -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/docker/api/restart
```

### Git

**`GET /v1/control/git/status`** — Git repository status (clean/dirty, file changes).

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/git/status
```

**`GET /v1/control/git/revision`** — Current branch and commit SHA.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/git/revision
```

### AI & Services

**`GET /v1/control/ollama/status`** — Ollama service health probe.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/ollama/status
```

**`GET /v1/control/ollama/models`** — Loaded Ollama models and their status.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/ollama/models
```

**`GET /v1/control/hermes/status`** — Hermes service health probe.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/hermes/status
```

### Web

**`GET /v1/control/web/wise2`** — Public WISE² (wise2.net) and internal API health.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/web/wise2
```

Returns:
```json
{
  "public": { "status": "healthy", "data": { "url": "https://wise2.net", "statusCode": 200, "latencyMs": 42 } },
  "api": { "status": "degraded", "error": "..." }
}
```

### Deployment

**`POST /v1/control/deploy/:app`** — Trigger deployment of an allowlisted app. Records deployment metadata; uses GitHub Actions workflow. Auth required; audited.

```bash
curl -X POST -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/deploy/api
```

**`GET /v1/control/deploy/:deploymentId`** — Retrieve deployment status and result.

```bash
curl -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/deploy/deployment-uuid
```

**`POST /v1/control/rollback/:app`** — Rollback an app to its previous known-good revision. Auth required; audited.

```bash
curl -X POST -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" \
  http://127.0.0.1:3099/v1/control/rollback/api
```

## Response Envelope

All responses follow a standard structure:

**Success:**
```json
{
  "ok": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "docker.services",
  "target": "api",
  "timestamp": "2026-08-28T09:00:00Z",
  "data": { ... }
}
```

**Failure:**
```json
{
  "ok": false,
  "requestId": "...",
  "action": "docker.restart",
  "target": "api",
  "timestamp": "...",
  "error": {
    "code": "SERVICE_NOT_ALLOWED",
    "message": "Service is not allowlisted",
    "detail": "Attempted service: unknown-service"
  }
}
```

## Audit Logging

Every write operation (restart, deploy, rollback) creates an audit entry in `data/control-bridge/audit.jsonl`:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "actor": "chatgpt",
  "action": "docker.restart",
  "target": "api",
  "source": "192.0.2.1",
  "startedAt": "2026-08-28T09:00:00Z",
  "endedAt": "2026-08-28T09:00:05Z",
  "ok": true,
  "exitCode": 0
}
```

Secrets (token, env vars) are never recorded.

## Deployment Metadata

Deployment and rollback records are stored in `data/control-bridge/deployments.jsonl`:

```json
{
  "id": "deployment-uuid",
  "app": "api",
  "previousRevision": "abc123...",
  "targetRevision": "def456...",
  "status": "healthy",
  "createdAt": "2026-08-28T09:00:00Z",
  "completedAt": "2026-08-28T09:00:30Z",
  "health": { "ok": true, "detail": "API responding to health checks" }
}
```

## Service Allowlists

**Restartable services:** postgres, redis, mongodb, api, ollama, open-webui, website, dashboard, admin, studio, command-center, worker, prometheus, grafana

**Deployable apps:** website, dashboard, admin, studio, command-center, api, worker

These are configured in `docker-compose.production.yml` environment variables and can be customized per deployment.

## Local Health Checks

Same-host health wrapper (does not SSH to itself):

```bash
scripts/control-health-local.sh
scripts/control-health-local.sh --json
```

## ChatGPT Integration

Example ChatGPT commands mapped to Control Bridge endpoints:

| User Request | Endpoint |
|---------------|----------|
| "WISE² status" | `GET /v1/control/status` |
| "Show GPU usage" | `GET /v1/control/host/gpu` |
| "Check wise2.net" | `GET /v1/control/web/wise2` |
| "Show API logs" | `GET /v1/control/docker/api/logs` |
| "What models are loaded?" | `GET /v1/control/ollama/models` |
| "Restart API" | `POST /v1/control/docker/api/restart` |
| "Deploy website" | `POST /v1/control/deploy/website` |
| "Rollback API" | `POST /v1/control/rollback/api` |

## Token Rotation

To rotate the control token:

1. Generate a new token:
   ```bash
   NEW_TOKEN=$(openssl rand -base64 48)
   ```

2. Store it in production secrets.

3. Update the container environment and restart:
   ```bash
   docker compose -f docker-compose.production.yml up -d --no-deps control-bridge
   ```

Old audit entries remain valid; the token itself is not recorded.

## Troubleshooting

### Bridge not responding

Check liveness:
```bash
curl -i http://127.0.0.1:3099/v1/control/health
```

If it times out, verify the container is running:
```bash
docker ps --filter name=wise2-control-bridge-prod
docker logs wise2-control-bridge-prod
```

### Authentication errors

Verify the token is passed correctly:
```bash
echo "Authorization: Bearer $WISE2_CONTROL_TOKEN"
```

### Service not found

Verify the service is in the allowlist and running:
```bash
docker compose -f docker-compose.production.yml ps <service-name>
```

### Rate limit (HTTP 429)

The bridge allows 60 requests per 60 seconds per source IP. Wait or adjust `WISE2_CONTROL_RATE_LIMIT_MAX`.

## Security Boundaries

The Control Bridge will NOT:
- Accept arbitrary shell commands
- Read or return .env files or secret environment variables
- Drop databases or delete volumes
- Modify firewall rules
- Rotate SSH keys
- Expose bearer tokens in logs or responses
- Perform automatic database rollbacks

These restrictions are enforced at the application level and cannot be bypassed through request parameters.

## Monitoring

Subscribe to audit log updates for operational visibility:

```bash
tail -f data/control-bridge/audit.jsonl | jq .
```

Monitor container logs:

```bash
docker logs -f wise2-control-bridge-prod
```

## Version & Support

- Version: 0.1.0 (MVP)
- Supported clients: ChatGPT via OpenAI plugin, WISE² iOS Command Center
- Ingress: Tailscale private HTTPS or local reverse proxy only
- SLA: None (community-supported MVP)
