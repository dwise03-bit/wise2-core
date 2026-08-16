#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
BIG_BYTE_SRC="$PROJECT_DIR/pi/big-byte"
BIN_SRC="$PROJECT_DIR/pi/bin"
BIG_BYTE_DIR="/opt/wise2/big-byte"
STATE_DIR="$BIG_BYTE_DIR/state"
QUEUE_DIR="$BIG_BYTE_DIR/queue"
ETC_DIR="/etc/wise2"
SECRETS_DIR="$ETC_DIR/secrets"
USER_NAME="${WISE2_USER:-wise2}"
GROUP_NAME="${WISE2_GROUP:-wise2}"

log() {
  printf '[wise2-install] %s\n' "$*"
}

ensure_user() {
  if ! id "$USER_NAME" >/dev/null 2>&1; then
    sudo useradd --system --create-home --home-dir /home/$USER_NAME --shell /bin/bash "$USER_NAME"
  fi

  if ! getent group "$GROUP_NAME" >/dev/null 2>&1; then
    sudo groupadd --system "$GROUP_NAME"
  fi

  sudo usermod -aG audio,video,input,render,netdev,dialout "$USER_NAME" >/dev/null 2>&1 || true
}

install_files() {
  sudo install -d -m 0755 -o root -g root "$BIG_BYTE_DIR" "$STATE_DIR" "$QUEUE_DIR" "$ETC_DIR" "$SECRETS_DIR"
  sudo install -d -m 0755 -o "$USER_NAME" -g "$GROUP_NAME" "$STATE_DIR" "$QUEUE_DIR"

  sudo install -m 0755 "$BIG_BYTE_SRC/wise2-big-byte.mjs" "$BIG_BYTE_DIR/wise2-big-byte.mjs"
  sudo install -m 0644 "$BIG_BYTE_SRC/wise2-big-byte.service" /etc/systemd/system/wise2-big-byte.service
  sudo install -m 0644 "$BIG_BYTE_SRC/wise2-big-byte-kiosk.service" /etc/systemd/system/wise2-big-byte-kiosk.service
  sudo install -m 0644 "$BIG_BYTE_SRC/wise2-big-byte-health.service" /etc/systemd/system/wise2-big-byte-health.service
  sudo install -m 0644 "$BIG_BYTE_SRC/wise2-big-byte-health.timer" /etc/systemd/system/wise2-big-byte-health.timer

  for script in wise2-big-byte-status wise2-big-byte-health wise2-big-byte-logs wise2-big-byte-update wise2-big-byte-rollback; do
    sudo install -m 0755 "$BIN_SRC/$script" "/usr/local/bin/$script"
  done

  if [ ! -f "$ETC_DIR/big-byte.env" ]; then
    sudo install -m 0640 "$PROJECT_DIR/.env.pi.example" "$ETC_DIR/big-byte.env"
  fi

  if [ ! -f "$ETC_DIR/node.json" ]; then
    node --input-type=module - <<'NODE' | sudo tee "$ETC_DIR/node.json" >/dev/null
import crypto from 'node:crypto';
import os from 'node:os';

const payload = {
  platform: 'WISE2',
  role: 'big-byte-command-node',
  deviceClass: 'raspberry-pi',
  profile: process.env.WISE2_DEVICE_PROFILE || 'Big Byte',
  environment: 'production-big-byte',
  nodeId: process.env.WISE2_NODE_ID || crypto.randomUUID(),
  nodeName: process.env.WISE2_NODE_NAME || os.hostname(),
  createdAt: new Date().toISOString(),
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
NODE
    sudo chmod 0640 "$ETC_DIR/node.json"
  fi
}

enable_services() {
  sudo systemctl daemon-reload
  sudo systemctl enable wise2-big-byte.service
  sudo systemctl enable wise2-big-byte-health.timer
  sudo systemctl enable wise2-big-byte-kiosk.service || true
  sudo systemctl restart wise2-big-byte.service
  sudo systemctl start wise2-big-byte-health.timer
}

main() {
  log "Installing WISE² Big Byte runtime"
  ensure_user
  install_files
  enable_services
  log "Installation complete"
  log "Big Byte status: sudo wise2-big-byte-status"
  log "Health check: sudo wise2-big-byte-health"
}

main "$@"
