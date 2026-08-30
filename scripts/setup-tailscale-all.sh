#!/usr/bin/env bash
# Legacy entry point — use scripts/tailscale-setup.sh
exec "$(dirname "$0")/tailscale-setup.sh" "$@"
