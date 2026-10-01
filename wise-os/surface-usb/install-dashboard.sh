#!/usr/bin/env bash
set -Eeuo pipefail
[[ $(uname -s) == Linux && $EUID -ne 0 ]] || { echo 'Run as the Linux desktop user.'; exit 1; }
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP=/opt/wise2/command-center
[[ -f "$HERE/dashboard/package-lock.json" ]] || { echo 'Missing dashboard payload'; exit 1; }
sudo install -d -m 0755 "$APP"
sudo rsync -a "$HERE/dashboard/" "$APP/"
(cd "$APP" && sudo npm ci --omit=dev --ignore-scripts)
sudo id wise2-ui >/dev/null 2>&1 || sudo useradd --system --home-dir /var/lib/wise2-ui --shell /usr/sbin/nologin wise2-ui
sudo install -m 0644 "$HERE/wise2-command-center.service" /etc/systemd/system/wise2-command-center.service
sudo systemctl daemon-reload
sudo systemctl enable --now wise2-command-center.service
sudo systemctl restart wise2-command-center.service
curl --retry 15 --retry-connrefused --retry-delay 1 -fsS http://127.0.0.1:3080/api/health
mkdir -p "$HOME/.local/share/applications" "$HOME/.config/autostart"
install -m 0644 "$HERE/wise2-command-center.desktop" "$HOME/.local/share/applications/wise2-command-center.desktop"
install -m 0644 "$HERE/wise2-command-center.desktop" "$HOME/.config/autostart/wise2-command-center.desktop"
echo 'Dashboard health check passed at http://127.0.0.1:3080'
