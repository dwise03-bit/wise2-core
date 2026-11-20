#!/usr/bin/env bash
# Non-destructive WISE2 recovery files staging to a mounted removable USB.
set -Eeuo pipefail
command -v lsblk >/dev/null
command -v findmnt >/dev/null
command -v sha256sum >/dev/null
if [[ $# -ne 1 ]]; then echo "Usage: bash $0 /path/to/verified/usb/mount"; exit 2; fi
target=$(realpath -e -- "$1")
[[ "$target" != "/" ]] || { echo "Refusing root filesystem"; exit 1; }
source=$(findmnt -n -T "$target" -o SOURCE)
mountpoint=$(findmnt -n -T "$target" -o TARGET)
[[ "$mountpoint" == "$target" ]] || { echo "Target must be a filesystem mountpoint"; exit 1; }
[[ "$source" == /dev/* ]] || { echo "Target is not a block device mount"; exit 1; }
dev=$(lsblk -no PKNAME "$source" | head -1)
[[ -n "$dev" ]] || dev=$(basename "$source")
tran=$(lsblk -dn -o TRAN "/dev/$dev" | tr -d ' ')
[[ "$tran" == usb ]] || { echo "Refusing non-USB device: $source (transport=$tran)"; exit 1; }
[[ -w "$target" ]] || { echo "USB mount is not writable"; exit 1; }
echo "USB mount: $target device: $source parent: /dev/$dev"
echo "No formatting, deletion or bootloader writes will be performed."
dest="$target/WISE2-Recovery-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -- "$dest"
base=https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/ops/recovery
for name in pocket-node5-usb-audit.sh pocket-node5-ssh-reconnect.sh enable-persistent-access.sh STATUS-2026-11-19.md SELF-HOSTED-RUNNER-SETUP.md; do
 curl -fL --retry 2 --connect-timeout 10 -o "$dest/$name" "$base/$name"
done
(cd "$dest" && sha256sum -- * > SHA256SUMS && sha256sum -c SHA256SUMS)
sync
echo "VERIFIED STAGED: $dest"
echo "NOTE: ZIP chat attachment was NOT transferred; USB is NOT confirmed bootable."
