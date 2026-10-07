#!/usr/bin/env bash
set -euo pipefail
test "$(id -u)" -eq 0 || { echo "Run as root"; exit 1; }
install -d /usr/share/plymouth/themes/wise2
cp /home/dwise/.local/share/wise2/branding/wise2-logo.svg /usr/share/plymouth/themes/wise2/wise2-logo.svg
cat >/usr/share/plymouth/themes/wise2/wise2.plymouth <<'PLY'
[Plymouth Theme]
Name=WISE2
Description=WISE2 Linux boot experience
ModuleName=script
[script]
ImageDir=/usr/share/plymouth/themes/wise2
ScriptFile=/usr/share/plymouth/themes/wise2/wise2.script
PLY
cat >/usr/share/plymouth/themes/wise2/wise2.script <<'PLY'
Window.SetBackgroundTopColor(0.005,0.008,0.015);
Window.SetBackgroundBottomColor(0.005,0.008,0.015);
logo = Image("wise2-logo.svg");
sprite = Sprite(logo);
sprite.SetX(Window.GetWidth()/2 - logo.GetWidth()/2);
sprite.SetY(Window.GetHeight()/2 - logo.GetHeight()/2);
PLY
plymouth-set-default-theme -R wise2
cp -a /etc/os-release /etc/os-release.wise2-backup
cat >/etc/os-release <<'OS'
PRETTY_NAME="WISE² Linux 1.0"
NAME="WISE² Linux"
VERSION_ID="1.0"
VERSION="1.0 (Ubuntu 24.04 LTS base)"
ID=wise2
ID_LIKE="ubuntu debian"
HOME_URL="https://wise2.net"
SUPPORT_URL="https://wise2.net"
BUG_REPORT_URL="https://wise2.net"
OS
update-initramfs -u
echo 'WISE² system branding installed'
