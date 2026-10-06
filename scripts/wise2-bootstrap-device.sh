#!/usr/bin/env bash
# WISE² device bootstrap — run ONCE per device after Tailscale is joined
# and the WISE² tree is cloned.
#
# Idempotent; safe to re-run. Does not install anything that requires
# user interaction beyond the initial sudo prompt.
#
# What this script does:
#   1. tailscale set --operator=$SUDO_USER
#        -> the invoking user can run most tailscale CLI without sudo.
#   2. tailscale set --ssh
#        -> enables Tailscale SSH on this node (RunSSH=true), so other
#           tailnet peers can `ssh <user>@<this-host>` using tailnet
#           identity. Access policy is still enforced by the tailnet ACL
#           (see docs/TAILNET-SSH-POLICY.md).
#   3. Install the wise2-sync user timer under the invoking user.
#
# What this script does NOT do:
#   - touch the tailnet ACL (that's a dashboard / API action).
#   - mint any credentials.
#   - enable systemd units as root.
#
# Usage:
#   sudo bash scripts/wise2-bootstrap-device.sh
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "ERROR: must run with sudo (needs tailscale set + daemon reload)" >&2
  exit 2
fi

TARGET_USER="${SUDO_USER:-}"
if [[ -z "${TARGET_USER}" || "${TARGET_USER}" == "root" ]]; then
  echo "ERROR: this script must be invoked via sudo as a regular user" >&2
  echo "       (we use \$SUDO_USER to decide who owns the timer + operator)" >&2
  exit 2
fi

TARGET_HOME=$(getent passwd "${TARGET_USER}" | cut -d: -f6)
if [[ -z "${TARGET_HOME}" ]]; then
  echo "ERROR: cannot find home dir for ${TARGET_USER}" >&2
  exit 2
fi

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)

say() { printf '[bootstrap] %s\n' "$*"; }

# ---------- 1. tailscale operator ----------
if ! command -v tailscale >/dev/null; then
  say "SKIP: tailscale CLI not installed on this device"
else
  CURRENT_OP=$(tailscale debug prefs 2>/dev/null | sed -n 's/.*"OperatorUser": "\([^"]*\)".*/\1/p' | head -1 || true)
  if [[ "${CURRENT_OP}" == "${TARGET_USER}" ]]; then
    say "OK: tailscale operator already set to ${TARGET_USER}"
  else
    say "setting tailscale operator = ${TARGET_USER}"
    tailscale set "--operator=${TARGET_USER}"
  fi

  # ---------- 2. tailscale SSH ----------
  RUN_SSH=$(tailscale debug prefs 2>/dev/null | sed -n 's/.*"RunSSH": \(true\|false\).*/\1/p' | head -1 || true)
  if [[ "${RUN_SSH}" == "true" ]]; then
    say "OK: tailscale SSH already enabled"
  else
    say "enabling tailscale SSH"
    tailscale set --ssh
  fi
fi

# ---------- 3. wise2-sync user timer ----------
UNIT_SRC="${REPO_ROOT}/services"
UNIT_DST="${TARGET_HOME}/.config/systemd/user"
LOG_DIR="${TARGET_HOME}/.local/share/wise2"

if [[ -f "${UNIT_SRC}/wise2-sync.user.service" && -f "${UNIT_SRC}/wise2-sync.user.timer" ]]; then
  say "installing wise2-sync user timer under ${TARGET_USER}"
  sudo -u "${TARGET_USER}" mkdir -p "${UNIT_DST}" "${LOG_DIR}"
  install -m 0644 -o "${TARGET_USER}" -g "${TARGET_USER}" \
    "${UNIT_SRC}/wise2-sync.user.service" "${UNIT_DST}/wise2-sync.service"
  install -m 0644 -o "${TARGET_USER}" -g "${TARGET_USER}" \
    "${UNIT_SRC}/wise2-sync.user.timer"   "${UNIT_DST}/wise2-sync.timer"
  # Enable + start as the target user. Needs linger if they're not logged in,
  # but WISE² already enables linger for dwise per the Command Center setup.
  sudo -u "${TARGET_USER}" XDG_RUNTIME_DIR="/run/user/$(id -u "${TARGET_USER}")" \
    systemctl --user daemon-reload
  sudo -u "${TARGET_USER}" XDG_RUNTIME_DIR="/run/user/$(id -u "${TARGET_USER}")" \
    systemctl --user enable --now wise2-sync.timer
  say "OK: wise2-sync.timer enabled for ${TARGET_USER}"
else
  say "SKIP: ${UNIT_SRC}/wise2-sync.user.* not found"
fi

say "done. Verify with:"
say "  tailscale debug prefs | grep -E 'OperatorUser|RunSSH'"
say "  sudo -u ${TARGET_USER} systemctl --user list-timers | grep wise2-sync"
