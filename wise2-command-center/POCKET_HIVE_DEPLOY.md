# WISE² Pocket Hive release gate

Prototype URL when the existing Next.js command center is deployed: `/woji/pocket-hive.html`.

## Checks
1. From `wise2-command-center`, run `npm ci && npm run type-check && npm run build` with Node >=20.9.
2. Confirm `GET /woji/pocket-hive.html` returns 200 and shows UNVERIFIED.
3. Confirm `GET /woji/api/health/server` returns JSON with `verified:false` and `status:unknown`.
4. Connect a server-side authenticated collector, per-device identity, freshness timestamps, and explicit failure semantics before claiming ONLINE.
5. Deploy via allowlisted WISE² Commander workflow, then independently verify from a separate network.

Do not expose SSH keys, Tailscale credentials, command execution, or arbitrary URLs through the public health endpoint. This PR does not deploy itself.
