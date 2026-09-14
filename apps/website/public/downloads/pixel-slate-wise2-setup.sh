#!/usr/bin/env bash
# WISE² Pixel Slate command-console bootstrap for ChromeOS Linux.
set -euo pipefail

readonly WISE2_BIN_DIR="$HOME/.local/bin"
readonly WISE2_STATUS="$WISE2_BIN_DIR/wise2-status"
readonly WISE2_CONNECT="$WISE2_BIN_DIR/wise2-connect"

usage() {
  cat <<'EOF'
WISE² Pixel Slate setup

Usage:
  bash pixel-slate-wise2-setup.sh [--dry-run]

Installs a small, local WISE² command-console toolkit inside ChromeOS Linux.
It does not connect to, modify, or deploy to a VPS.
EOF
}

run() {
  if [[ "${DRY_RUN:-false}" == "true" ]]; then
    printf 'DRY RUN: '
    printf '%q ' "$@"
    printf '\n'
    return 0
  fi
  "$@"
}

install_status_command() {
  run mkdir -p "$WISE2_BIN_DIR"
  if [[ "${DRY_RUN:-false}" == "true" ]]; then
    printf 'DRY RUN: install wise2-status at %s\n' "$WISE2_STATUS"
    return 0
  fi

  cat > "$WISE2_STATUS" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf '◈ WISE² PIXEL SLATE COMMAND\n\n'
printf 'DEVICE: %s\n' "$(hostname)"
printf 'TIME:   %s\n\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')"

printf '%s\n' '── WISE² Site ──'
if curl -fsS --max-time 8 https://www.wise2.net/ >/dev/null; then
  printf '%s\n' 'wise2.net: ONLINE'
else
  printf '%s\n' 'wise2.net: CHECK CONNECTION'
fi

printf '\n%s\n' '── Linux Workspace ──'
printf 'OS: %s\n' "$(. /etc/os-release && printf '%s' "$PRETTY_NAME")"
printf 'Storage: %s\n' "$(df -h "$HOME" | awk 'NR == 2 {print $3 " used of " $2}')"
EOF
  chmod +x "$WISE2_STATUS"
}

install_connect_command() {
  if [[ "${DRY_RUN:-false}" == "true" ]]; then
    printf 'DRY RUN: install wise2-connect at %s\n' "$WISE2_CONNECT"
    return 0
  fi

  cat > "$WISE2_CONNECT" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  printf 'Usage: wise2-connect <tailscale-host-or-ip>\n' >&2
  exit 64
fi

exec ssh "$1"
EOF
  chmod +x "$WISE2_CONNECT"
}

configure_path() {
  local profile="$HOME/.bashrc"
  local path_line='export PATH="$HOME/.local/bin:$PATH"'
  if [[ "${DRY_RUN:-false}" == "true" ]]; then
    printf 'DRY RUN: ensure ~/.local/bin is on PATH in %s\n' "$profile"
    return 0
  fi
  touch "$profile"
  grep -qxF "$path_line" "$profile" || printf '\n%s\n' "$path_line" >> "$profile"
}

main() {
  DRY_RUN=false
  case "${1:-}" in
    '') ;;
    --dry-run) DRY_RUN=true ;;
    --help|-h) usage; return 0 ;;
    *) usage >&2; return 64 ;;
  esac

  if ! command -v apt-get >/dev/null; then
    printf 'This installer must run inside the ChromeOS Linux Terminal.\n' >&2
    return 1
  fi

  run sudo apt-get update
  run sudo apt-get install -y curl git htop jq openssh-client ripgrep tmux
  install_status_command
  install_connect_command
  configure_path

  cat <<'EOF'

WISE² Pixel Slate setup is ready.

Next:
  1. Restart the Linux Terminal, then run: wise2-status
  2. Install and sign in to Tailscale from Google Play on the Slate.
  3. Connect to a known WISE² node: wise2-connect <tailscale-host-or-ip>
  4. In Chrome, install https://www.wise2.net as an app.
EOF
}

main "$@"