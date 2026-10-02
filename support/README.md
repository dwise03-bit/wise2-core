# WISE² Remote Support (consent-based) — architecture contract

> This is the DESIGN. No remote-support daemon is installed or enabled yet.
> Admin access uses OpenSSH over Tailscale (see docs/REMOTE-ACCESS.md).

## Non-negotiable requirements

- **Explicit client authorization** before any session.
- **Consent-based sessions** — the person at the machine approves each session.
- **Auditable session logs** — who, when, what, written to `support/sessions/`.
- **Revocation** — a session can be ended immediately by the local user.
- **Hard-disable control** — a single switch that disables remote support.
- **Separate opt-in for unattended support** — never on by default; distinct,
  explicit, revocable consent.

## Explicitly forbidden

- Covert or unauthorized remote access.
- Always-on unattended access without the separate opt-in above.
- Exposing any support channel to the public Internet.

## Status

Design only. Implementation requires Daniel's approval of the consent + audit
model before any code or service is created.
