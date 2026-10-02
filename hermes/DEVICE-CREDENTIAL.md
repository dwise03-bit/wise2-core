# WISE² Device Credential — wise2-surface (APPROVED DESIGN; not minted)

> Approved by Daniel 2026-10-02. **Design only — no credential minted or
> installed.** Never distribute JWT_SECRET to clients.

## Principles (approved)

- **Per-device identity** — credential subject `device:wise2-surface`.
- **Scoped permissions** — least-privilege claims (e.g. read context, read
  brain knowledge; no admin, no delete unless explicitly granted).
- **Independently revocable** — revoking this device must not affect others.
- **Auditable** — issuance + use logged server-side (device id, time, scope).
- **Protected storage** — token only in a 0600 owner-only file
  (`/opt/wise2/hermes/credentials/device-token`) or an OS credential store.
- **Browser never receives it** — only the server-side client/proxy reads it.
- **Never `JWT_SECRET`** on the client.

## Options (to be chosen with Daniel when wiring begins)

1. **Scoped device JWT (recommended, smallest change).** The Command Center /
   auth-gateway signs a long-lived-but-revocable JWT with
   `sub=device:wise2-surface`, a `scope` claim, and a `kid`/jti recorded in a
   Mongo `device_tokens` collection for revocation. The brain already verifies
   JWTs (shared secret stays server-side); add a revocation/jti check.
2. **Per-device API key.** A random key stored hashed in Mongo; brain validates
   via an `x-api-key`/Bearer lookup middleware (new, small). Simpler mental model,
   but adds a new auth path (currently no API-key support in code).

Current code supports **refresh tokens + scopes** but **no** service accounts,
machine tokens, API keys, or device flow — so option 1 reuses the most existing
machinery. Final choice is Daniel's.

## Issuance flow (when approved)

1. Daniel triggers issuance on the Command Center/auth-gateway (server-side).
2. Token delivered **out-of-band** to Surface; written to the 0600 credential
   file by Daniel (or an approved installer). Claude does **not** mint it.
3. `hermes.conf`: set `HERMES_ENABLED=true` + `HERMES_BASE_URL=<tailnet>`.
4. `wise2 hermes` / Command Center then show real CONFIGURED→…→READY states.

## Revocation

Remove/rotate the device token server-side (jti/key), delete the local file.
Surface immediately drops to AUTHENTICATED=no.
