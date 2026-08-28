# WISE² Control Bridge

Secure, allowlisted host-control API for WISE². It intentionally has no arbitrary shell, secret retrieval, database wipe, or firewall endpoints.

## Deploy on the WISE² host

Generate a token and keep it out of Git:

```bash
export CONTROL_AUTH_TOKEN="$(openssl rand -hex 32)"
export CONTROL_WRITE_ENABLED=false
docker compose -f docker-compose.production.yml -f docker-compose.control.yml up -d --build control-bridge
```

The bridge is published only on `127.0.0.1:8787`. Reach it remotely through the approved Tailscale/HTTPS ingress rather than opening port 8787 publicly.

## Smoke test

```bash
curl -fsS -H "Authorization: Bearer $CONTROL_AUTH_TOKEN" http://127.0.0.1:8787/v1/control/health
curl -fsS -H "Authorization: Bearer $CONTROL_AUTH_TOKEN" http://127.0.0.1:8787/v1/control/docker/services
curl -fsS -H "Authorization: Bearer $CONTROL_AUTH_TOKEN" http://127.0.0.1:8787/v1/control/ollama/status
curl -fsS -H "Authorization: Bearer $CONTROL_AUTH_TOKEN" http://127.0.0.1:8787/v1/control/web/wise2
```

## Write actions

Restart is disabled by default. After read-only smoke tests pass, explicitly set `CONTROL_WRITE_ENABLED=true` and recreate only the bridge. Restarts remain restricted to `CONTROL_ALLOWED_SERVICES`.

```bash
export CONTROL_WRITE_ENABLED=true
docker compose -f docker-compose.production.yml -f docker-compose.control.yml up -d control-bridge
curl -fsS -X POST -H "Authorization: Bearer $CONTROL_AUTH_TOKEN" http://127.0.0.1:8787/v1/control/docker/api/restart
```

Every attempted write is appended to `/data/audit.jsonl` in the persistent `control_bridge_data` volume.

## Tests

```bash
node --test services/control-bridge/test/*.test.js
```
