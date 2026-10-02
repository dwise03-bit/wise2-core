#!/usr/bin/env bash
# WISE² shared shell helpers. Source this; do not execute directly.
# No secrets. No eval. Safe to run read-only.

WISE2_ROOT="${WISE2_ROOT:-/opt/wise2}"
export WISE2_ROOT

# Colors (disabled if not a TTY)
if [ -t 1 ]; then
  C_RESET=$'\033[0m'; C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'
  C_GREEN=$'\033[38;5;46m'; C_CYAN=$'\033[38;5;51m'
  C_YELLOW=$'\033[38;5;220m'; C_RED=$'\033[38;5;196m'
  C_NAVY=$'\033[38;5;27m'; C_SILVER=$'\033[38;5;250m'
else
  C_RESET=; C_DIM=; C_BOLD=; C_GREEN=; C_CYAN=; C_YELLOW=; C_RED=; C_NAVY=; C_SILVER=
fi

wise2_pass() { printf '%s[ PASS ]%s %s\n' "$C_GREEN" "$C_RESET" "$1"; }
wise2_warn() { printf '%s[ WARN ]%s %s\n' "$C_YELLOW" "$C_RESET" "$1"; }
wise2_fail() { printf '%s[ FAIL ]%s %s\n' "$C_RED" "$C_RESET" "$1"; }
wise2_info() { printf '%s[ INFO ]%s %s\n' "$C_CYAN" "$C_RESET" "$1"; }
wise2_hr()   { printf '%s------------------------------------------------------------%s\n' "$C_DIM" "$C_RESET"; }

wise2_have() { command -v "$1" >/dev/null 2>&1; }

# Check a systemd unit; echoes PASS/WARN based on active state
wise2_check_unit() {
  local unit="$1" label="${2:-$1}"
  if systemctl is-active --quiet "$unit" 2>/dev/null; then
    wise2_pass "$label (active)"
  else
    wise2_warn "$label (not active)"
  fi
}
