#!/bin/bash
set -euo pipefail
if [[ ${EUID} -ne 0 ]]; then echo "Run with sudo: sudo bash install-wise2-defense.sh"; exit 1; fi
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR=/opt/wise2-defense
APP_DIR="$INSTALL_DIR/app"
echo "WISE² Defense IMP installer"
if [[ -r /proc/device-tree/model ]]; then tr -d '\0' </proc/device-tree/model; echo; else echo "Non-Raspberry Pi host detected; files will install but kiosk/hardware require Pi validation."; fi
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm sqlite3 curl rtl-sdr usbutils unclutter rsync chromium
id wise2 >/dev/null 2>&1 || useradd --system --home-dir "$INSTALL_DIR" --shell /usr/sbin/nologin wise2
install -d -o wise2 -g wise2 -m 0750 "$APP_DIR" "$INSTALL_DIR/data" "$INSTALL_DIR/logs" "$INSTALL_DIR/scripts" /etc/wise2-defense
chmod 0755 "$INSTALL_DIR/scripts"
rsync -a --delete --exclude node_modules --exclude data/ "$SOURCE_DIR/" "$APP_DIR/"
cp "$SOURCE_DIR/scripts/"*.sh "$INSTALL_DIR/scripts/"
chmod 0755 "$INSTALL_DIR/scripts/"*.sh
if [[ ! -f /etc/wise2-defense/wise2-defense.env ]]; then install -m 0640 -o root -g wise2 "$SOURCE_DIR/config/wise2-defense.env.example" /etc/wise2-defense/wise2-defense.env; fi
cd "$APP_DIR"
npm ci --omit=dev
sqlite3 "$INSTALL_DIR/data/wise2-defense.db" < "$SOURCE_DIR/data/schema.sql"
chown -R wise2:wise2 "$APP_DIR" "$INSTALL_DIR/data" "$INSTALL_DIR/logs"
chmod 0750 "$INSTALL_DIR/data" "$INSTALL_DIR/logs"
install -m 0644 "$SOURCE_DIR/systemd/"*.service "$SOURCE_DIR/systemd/"*.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now wise2-defense.service wise2-health.timer
systemctl enable wise2-sdr.service wise2-mesh.service
if command -v chromium >/dev/null 2>&1 || command -v chromium-browser >/dev/null 2>&1; then
  KIOSK_USER="$(sed -n 's/^[[:space:]]*autologin-user[[:space:]]*=[[:space:]]*//p' /etc/lightdm/lightdm.conf 2>/dev/null | tail -1)"
  if [[ -z "$KIOSK_USER" ]] || ! id "$KIOSK_USER" >/dev/null 2>&1; then KIOSK_USER=wise2; fi
  KIOSK_HOME="$(getent passwd "$KIOSK_USER" | cut -d: -f6)"
  install -d -o "$KIOSK_USER" -g "$KIOSK_USER" -m 0755 "$KIOSK_HOME/.config/labwc" "$KIOSK_HOME/.config/lxsession/LXDE-pi"
  printf '%s &\n' "$INSTALL_DIR/scripts/kiosk.sh" > "$KIOSK_HOME/.config/labwc/autostart"
  printf '@%s\n' "$INSTALL_DIR/scripts/kiosk.sh" > "$KIOSK_HOME/.config/lxsession/LXDE-pi/autostart"
  chown "$KIOSK_USER:$KIOSK_USER" "$KIOSK_HOME/.config/labwc/autostart" "$KIOSK_HOME/.config/lxsession/LXDE-pi/autostart"
fi
sleep 2
"$INSTALL_DIR/scripts/health.sh"
echo "Installation complete. Configure secrets only in /etc/wise2-defense/wise2-defense.env. Reboot was not forced."
