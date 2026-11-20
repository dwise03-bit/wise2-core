# WISE² Canonical Operations Scope — 2026-11-20

## Production truth
- **Only production server:** Ubuntu hostname `wise2`. Confirm its actual Tailscale address and storage layout from the machine before using them.
- MacBook: Apple/iOS development workstation; not a production host.
- Pocket Node 5, Android TV, Surface, and other devices: clients/edge devices, not production servers.
- Old VPS `173.208.147.165`, `gpu-nmls`, and other historic host references: **retired/inaccessible for active operations**. Preserve as historical references; do not delete DNS, secrets, GitHub history, machines or volumes automatically.

## Existing documentation is not live evidence
`README.md` claims 'production ready' based on a July 2026 snapshot, yet records a broken dashboard on port 3002. `CLAUDE.md` includes the old VPS IP and its disk assumptions. Neither document is authoritative for today's deployment. Validate against `wise2` before using any ports, addresses, credentials, or storage paths.

## Read-only audit
From an authorized shell on `wise2`, with a checkout of this repository:
```bash
bash scripts/ops/single-server-audit.sh
```
The report is saved locally in the executing user's home directory. Review it for private data before sharing. Do not upload raw network/process inventories to public channels.

## Cleanup sequence
1. Snapshot live `wise2` services, Docker volumes, mounts, Nginx vhosts, DNS dependencies and TLS.
2. Build an inventory: canonical domain, route, repo, owner, service, verification timestamp, project-board item.
3. Compare historical server references in workflows/configuration against verified active targets. Make a patch list; do not blindly search-and-replace.
4. Back up affected configurations. Change only confirmed stale references, preserving migration history and rollback.
5. Validate syntax, dry-run deployments, probe endpoints, independently verify. Log results to existing issue #224 and GitHub Projects board when board access is available.
6. Prioritize investor-critical paths: wise2.net, Hermes, Revenue OS, Telnyx, business mail, Discord, client landing pages.

## AI cost policy
Ollama on `wise2` first when capacity permits. Claude/Cursor/Grok only for escalations. Never assume local-model availability without checking memory/GPU health.

## Notification policy
Daniel and Darrin: urgent calls/leads/payments/outages/deployments/approvals immediately; routine events in a daily digest. SMS requires verified routing and recipient consent. Do not forward OTPs, secrets or full customer records into Discord.
