# WISE² Remote Command v1 (read-only diagnostics)

This is a **local diagnostics agent**, not a ChatGPT connector or a replacement for interactive remote desktop. It cannot execute arbitrary commands or flash devices. It is intentionally not internet-facing.

## Prerequisites

- Python 3.10+ on macOS or Linux
- Tailscale installed and authenticated on both the Mac and the operator machine
- For ESP32 diagnostics: `python3 -m pip install pyserial esptool`
- SSH access enabled on the Mac (System Settings > General > Sharing > Remote Login) and restricted to authorized users
- Firewall and SSH access limited to the Tailscale network; never expose TCP 8765 publicly

## Mac quick start

Run from the repository root:

```bash
cd tools/wise2-remote-command
python3 -m unittest -v test_agent.py
export WISE2_REMOTE_TOKEN="$(python3 -c 'import secrets;print(secrets.token_urlsafe(48))')"
python3 agent.py --host 127.0.0.1 --port 8765
```

Save the token in your password manager. Never paste it in ChatGPT, commit it to GitHub, or include it in shell logs. This foreground launch is deliberately not an unattended installation.

From an authorized machine on the same Tailscale network, open a tunnel:

```bash
ssh -N -L 8765:127.0.0.1:8765 mac-user@mac-tailnet-host
```

On the operator machine, with the token stored locally:

```bash
curl http://127.0.0.1:8765/health
curl -sS -X POST http://127.0.0.1:8765/v1/diagnostics \
  -H "Authorization: Bearer $WISE2_REMOTE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"task":"esp32.ports"}'
```

## Available read-only diagnostics

- `system.info`: OS and kernel
- `system.disk`: disk usage
- `system.memory`: memory information
- `system.uptime`: uptime
- `network.tailscale`: VPN status
- `esp32.ports`: USB serial device enumeration
- `esp32.tool_version`: esptool version

All subprocesses use fixed argument arrays, never a shell. Each command has a 12-second timeout, capped output, and JSONL audit entries in `~/.wise2-remote-audit.jsonl`. Failed authentication is also logged.

## Safety and rollout gates

1. Run tests on macOS and Ubuntu.
2. Verify token rejection and successful authorized read-only commands.
3. Confirm the server listens on **127.0.0.1 only**.
4. Confirm SSH tunnel access over Tailscale and that port 8765 is not publicly reachable.
5. Review the audit log, ensure no secrets are logged, and verify a restart.
6. Only after these gates, consider a separately approved, narrowly scoped ESP32 flashing workflow with backup/verification and human confirmation.

## Integration limitations

The ChatGPT GitHub connector can review and change repository files but cannot invoke this local HTTP API or connect to SSH tunnels. A separately connected, authorized command-execution integration is required before ChatGPT can operate the Mac. The agent does not claim to provide one. Do not deploy it as a public website or put the bearer token in a dashboard.

**Status:** source and tests staged for review. Not installed, connected to ChatGPT, or verified on the user's Mac.
