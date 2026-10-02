# WISE² Remote Access

> Last updated: 2026-10-02. Private-mesh only. No public exposure.

## Supported path: OpenSSH over Tailscale

This is the **validated, supported** way to administer WISE² Surface remotely.

```bash
# From any authorized device on the tailnet:
ssh dwise@100.97.230.73
# or, with MagicDNS:
ssh dwise@wise2-surface
```

- OpenSSH `ssh.service` is active + enabled; listening on port 22.
- Reachable over the LAN (192.168.1.14) and the Tailscale mesh (100.97.230.73).
- **No router port-forwarding.** SSH is not exposed to the public Internet.

## Tailscale notes

- This node: `wise2-surface` = `100.97.230.73`.
- Tailscale SSH feature is enabled on the host, **but the tailnet ACL does not
  currently authorize Tailscale SSH**, so use standard OpenSSH (above).
- **Do not modify the tailnet ACL automatically.** ACL changes are Daniel's.

## Hardening already in place / recommended

- Key-based auth preferred; avoid password auth over any network.
- Keep SSH reachable primarily via the tailnet; the LAN listener is acceptable
  on a trusted home network.
- Do **not** add `PermitRootLogin yes`. Administer as `dwise`, escalate with sudo.

## WISE² Remote Support (consent-based) — see support/README.md

The remote-support architecture (distinct from admin SSH) must require:
explicit client authorization · consent-based sessions · auditable session logs ·
revocation · a hard-disable control · and a **separate opt-in** for unattended
support. No covert or unauthorized remote access is ever built.

## Recovery if remote access breaks

See `/opt/wise2/recovery/RECOVERY.md` → SSH recovery / Tailscale recovery /
network recovery. Physical console access is always the fallback.
