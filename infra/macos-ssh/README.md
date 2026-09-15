# WISE2 macOS SSH baseline

Version-controlled, sanitized recovery assets for the Mac-to-GPU SSH path.

## Security rules
- Never commit private keys, passwords, `authorized_keys`, or live secrets.
- `ssh-config.template` contains public routing metadata only.
- Host-key policy is `accept-new`; existing changed keys still fail closed.

## Runtime baseline
- Mac user key: `~/.ssh/id_ed25519` (local only).
- GPU alias: `gpu-nmls` via Tailscale `100.68.145.5`.
- Keepalive: 30 seconds, 3 missed replies.
- Guard runs at login and every 300 seconds through launchd.

## Verification
Run `bash infra/macos-ssh/verify.sh` on the Mac. A healthy machine prints
`LOCAL_SSH_OK`, `GPU_SSH_OK`, and `WISE2_SSH_BASELINE_OK`.
