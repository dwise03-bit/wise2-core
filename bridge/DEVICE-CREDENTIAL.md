# WISE² Control-Bridge Device Credential — wise2-surface (DESIGN; not minted)

> **Design only — no credential minted or installed.** Awaiting Daniel's
> go-ahead per CLAUDE.md §12. Never share human/ChatGPT credentials with Surface.

## Principles

- **Per-device identity** — Bearer value distinct from the human/ChatGPT token
  so revoking Surface does not revoke anyone else.
- **Least privilege by default** — Surface starts **read-only**. No signing
  key issued unless and until Daniel explicitly authorizes a write profile set
  for this device.
- **Independently revocable** — removed by rotating this one Bearer (and, if
  granted, this one signing-key entry) on the VPS; no shared secret to churn.
- **Auditable** — all requests already append to the control-bridge audit
  journal (actor + keyId + requestId + idempotency key).
- **Protected storage** — credential files at
  `/opt/wise2/bridge/credentials/control-token` and (if ever) `signing-key`,
  both **0600, owner dwise, git-ignored** by `**/credentials*` in root
  `.gitignore`.
- **Browser never receives these** — only the server-side client / Command
  Center proxy reads them.

## Two levels (chosen by Daniel at wiring time)

1. **Read-only Bearer (recommended first step).** A dedicated
   `device:wise2-surface` Bearer in the production environment; Surface can
   call every GET under `/v1/control/*` but every POST is refused because
   `WISE2_REQUIRE_SIGNED_WRITES=true` and this device has no signing key.
2. **Scoped write access (later, by request).** Add a
   `wise2-surface:<32+ char secret>` entry to `WISE2_OPS_SIGNING_KEYS` and
   restrict `WISE2_ALLOWED_PROFILES` (per-deploy env) to the minimum profile
   set — e.g. `status, services, logs, diagnose` first; `restart` only after a
   separate approval. Store the secret in `credentials/signing-key` (0600).

## Issuance flow (when approved)

1. Daniel generates a Bearer value server-side (and, if applicable, a signing
   secret), adds them to the VPS environment, restarts control-bridge.
2. Values delivered **out-of-band** to Surface; written to the 0600 credential
   files by Daniel (or an approved installer). **Claude does not mint them.**
3. `bridge.conf`: set `BRIDGE_ENABLED=true` + `BRIDGE_BASE_URL=<tailnet>`.
4. `wise2 bridge` reports CONFIGURED → REACHABLE → AUTHENTICATED → READY.

## Revocation

- **Read-only:** remove/rotate the Surface Bearer in the VPS environment and
  restart the container; delete the local `credentials/control-token`. Surface
  immediately drops to AUTHENTICATED=no.
- **Writes:** additionally remove the `wise2-surface:*` entry from
  `WISE2_OPS_SIGNING_KEYS`; delete `credentials/signing-key`.
