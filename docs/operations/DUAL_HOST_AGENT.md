# WISE² Dual-Host Agent (staged)
Install on **authorized** Ubuntu wise2 and Daniel's Mac, each with its own existing clone of wise2-core. No SSH credentials are stored, no auto-deployment, no force-push, and no privileged shell.
## Host installation
```bash
cd /path/to/wise2-core
git fetch origin feature/dual-host-monitor-gitsync-commander
git show origin/feature/dual-host-monitor-gitsync-commander:scripts/ops/wise2-host-agent.sh > /tmp/wise2-host-agent.sh
bash -n /tmp/wise2-host-agent.sh
mkdir -p "$HOME/.local/bin"
install -m 700 /tmp/wise2-host-agent.sh "$HOME/.local/bin/wise2-host-agent"
WISE2_ROOT="$PWD" "$HOME/.local/bin/wise2-host-agent" health
```
Set WISE2_ROOT to the existing repository path for later invocations. Run `wise2-host-agent sync` only after verifying the intended branch. It refuses dirty trees and non-fast-forward merges. For periodic monitoring use the host's existing trusted scheduler only after validating repo paths and access.
## Verification
`bash -n scripts/ops/wise2-host-agent.sh`; `WISE2_ROOT=/path/to/clone wise2-host-agent health`; `wise2-host-agent commander health`. The Commander subcommand is a **local allowlisted shim**, not an installed ChatGPT MCP server. Hermes integration and GitHub runner connectivity remain separate verification gates.
