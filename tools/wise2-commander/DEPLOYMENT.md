# WISE² Commander staging deployment

**State: not deployed.** The container is packaged for a separately approved staging rollout.

1. Run the Commander CI and container build workflows on the feature branch. Do not merge on a failing check.
2. On the authorized host, create an isolated staging folder and clone the reviewed commit. Do not reuse production secrets.
3. Supply a new random 32+ character WISE2_MCP_BEARER_TOKEN and a least-privilege GITHUB_TOKEN via a host-only environment file (never commit them).
4. Start with `docker compose -f tools/wise2-commander/compose.staging.yml up -d --build`. The port binds to loopback only.
5. Verify unauthorized calls return HTTP 401, authenticated MCP initialize and tools/list work, and deployment dispatch is disabled.
6. For external access, use a dedicated HTTPS reverse proxy and a supported ChatGPT authentication integration. Static bearer-token gateway is for staging only; it does not implement OAuth discovery, token issuance or refresh.
7. Conduct threat-model and authentication review before publishing any public URL or enabling state-changing tools.

No production Nginx, Cloudflare, Tailscale, Desktop Commander or existing application service is changed by these repository files.
