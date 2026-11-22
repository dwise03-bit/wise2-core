#!/usr/bin/env bash
set -euo pipefail
# WISE² host agent: read-only monitor, fast-forward-only GitSync, allowlisted Commander.
ROOT="${WISE2_ROOT:-$HOME/wise2-core}"
STATE="${WISE2_STATE:-$HOME/.local/state/wise2}"
mkdir -p "$STATE"
log(){ printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$STATE/agent.log"; }
check(){ log "host=$(hostname) os=$(uname -s)"; df -h "$HOME" | tail -1; git -C "$ROOT" status --short; git -C "$ROOT" remote -v | head -2; }
sync(){ 
  test -d "$ROOT/.git" || { log "Missing repo: $ROOT"; return 2; }
  test -z "$(git -C "$ROOT" status --porcelain)" || { log "Dirty tree: sync refused"; return 3; }
  branch="$(git -C "$ROOT" symbolic-ref --quiet --short HEAD)" || { log "Detached HEAD: refused"; return 4; }
  git -C "$ROOT" fetch --prune origin
  git -C "$ROOT" merge --ff-only "origin/$branch"
  log "GitSync fast-forward verified: $branch $(git -C "$ROOT" rev-parse --short HEAD)"
}
case "${1:-health}" in
 health) check ;;
 sync) sync ;;
 commander) case "${2:-}" in health) check;; sync) sync;; *) log "Command not allowlisted"; exit 64;; esac ;;
 *) log "Unknown action"; exit 64 ;;
esac
