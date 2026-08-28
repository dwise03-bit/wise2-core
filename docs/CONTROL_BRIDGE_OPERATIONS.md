# WISE2 Control Bridge Operations

The Control Bridge is a restricted operator API for WISE2 production. It is not a remote shell and it does not expose arbitrary command execution.

## Runtime

- Service: `control-bridge`
- Port: `127.0.0.1:3099`
- Compose: `docker-compose.production.yml`
- Token: `WISE2_CONTROL_TOKEN`
- Audit log: `data/control-bridge/audit.jsonl`
- Deployment metadata: `data/control-bridge/deployments.jsonl`

Generate a long random token and store it only in the production environment:

```bash
openssl rand -base64 48
```

## Access

Preferred access is through Tailscale-private networking or an HTTPS reverse proxy that only listens on trusted private ingress. Do not publish port `3099` directly to the public internet.

For Tailscale, keep the bridge bound locally and access it from an authenticated node or subnet route. For HTTPS, proxy `/v1/control/` to `http://127.0.0.1:3099` and require TLS plus the bearer token.

## API Checks

```bash
curl -fsS http://127.0.0.1:3099/v1/control/health
curl -i http://127.0.0.1:3099/v1/control/status
curl -fsS -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" http://127.0.0.1:3099/v1/control/status
curl -fsS -H "Authorization: Bearer $WISE2_CONTROL_TOKEN" http://127.0.0.1:3099/v1/control/web/wise2
```

The unauthenticated status request must return `401`.

## Supported Actions

- Read host metrics, GPU metrics, Docker service summaries, bounded logs, Git status, Git revision, Ollama status/models, Hermes status, and WISE2 web health.
- Restart only allowlisted Docker compose services.
- Create deployment and rollback metadata only for allowlisted apps.

Denied by design: arbitrary shell commands, arbitrary Git commands, secret reads, environment dumps, database drops/resets, firewall mutation, volume/container deletion, Docker prune, reboot, and shutdown.

## Local Health

Run same-host health checks locally:

```bash
scripts/control-health-local.sh
scripts/control-health-local.sh --json
```
