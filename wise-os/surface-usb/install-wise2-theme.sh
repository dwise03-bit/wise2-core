#!/usr/bin/env bash
# WISE² Linux OS desktop theme: GNOME Shell top bar + accent color, GDM login
# screen branding, and a Plymouth boot splash. Does NOT replace GNOME itself —
# Files, Settings, the Activities overview, and a real taskbar all still work
# exactly as GNOME intends, just themed. Run as your normal desktop user
# (sudo is used internally where system-level changes are needed):
#   bash install-wise2-theme.sh
#
# UNVERIFIED: this was written and syntax-checked on macOS, which has no
# GNOME Shell, GDM, or Plymouth to test against. The first real test of
# every piece in this file happens when you run it on the Surface.
set -Eeuo pipefail
[[ $(uname -s) == Linux && $EUID -ne 0 ]] || { echo 'Run as your normal desktop user in Ubuntu Linux.'; exit 1; }
command -v gsettings >/dev/null || { echo 'GNOME (gsettings) not found; run wise2-setup.sh on a GNOME desktop first.'; exit 1; }

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WALLPAPER="${1:-$SOURCE_DIR/wise2-wallpaper-2256x1504.png}"
[[ -f "$WALLPAPER" ]] || { echo "Wallpaper not found at $WALLPAPER"; exit 1; }

step() { printf '\n== %s ==\n' "$*"; }

step "Packages (GNOME Shell theming + Plymouth)"
sudo apt-get update
sudo apt-get install -y gnome-shell-extensions gnome-tweaks dconf-cli plymouth plymouth-themes
# Not installed: gnome-shell-extension-manager (the GUI "Extension Manager"
# app). It isn't in every Ubuntu 24.04 mirror by default and isn't needed —
# the gnome-extensions CLI and gsettings calls below do the whole job.
# Install it yourself later if you want the GUI: sudo apt-get install gnome-shell-extension-manager

step "GTK/icon theme and accent color (per-user, built into GNOME 46)"
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark' || true
gsettings set org.gnome.desktop.interface gtk-theme 'Yaru-dark' || true
gsettings set org.gnome.desktop.interface icon-theme 'Yaru-dark' || true
# GNOME 46+ ships a built-in accent-color setting; 'green' is the closest
# stock option to the WISE² neon-green brand mark (#00FF7F). This is a real
# GNOME setting, not a fabricated one, but the accent list is fixed by GNOME
# itself — there is no 'custom hex' option here.
gsettings set org.gnome.desktop.interface accent-color 'green' || true

step "WISE² GNOME Shell theme (top bar + overview colors)"
SHELL_THEME_DIR="$HOME/.local/share/themes/WISE2/gnome-shell"
mkdir -p "$SHELL_THEME_DIR"
cat > "$SHELL_THEME_DIR/gnome-shell.css" <<'EOF'
/* WISE² Linux OS — minimal GNOME Shell override.
   Brand: navy #050607, neon green #00FF7F, cyan #00D9FF, gold #C4A369.
   Intentionally narrow: only the top bar and overview background are
   touched, so every other GNOME Shell surface keeps its normal, readable
   default styling instead of a hand-rolled (and untested) full theme. */

#panel {
  background-color: #050607;
  border-bottom: 1px solid #1c8f4a55;
}
#panel .panel-button {
  color: #d3d8dc;
}
#panel .panel-button:hover,
#panel .panel-button:active,
#panel .panel-button:focus,
#panel .panel-button.clock-display:hover {
  background-color: #0d1f15;
  color: #00FF7F;
}
#panel .clock {
  color: #00FF7F;
  font-weight: 600;
}

#searchEntry:focus {
  border-color: #00FF7F;
}
EOF
# Deliberately not touching the overview background: that part of GNOME
# Shell's theme goes through several selectors that shift across point
# releases, and a wrong one there risks an unreadable overview, not just a
# missed color. The top bar and search focus ring above are stable,
# low-risk selectors that have held across recent GNOME versions.

gnome-extensions enable user-theme@gnome-shell-extensions.gcampax.github.com 2>/dev/null || \
  echo "NOTE: user-theme extension not auto-enabled (log out/in once, then: gnome-extensions enable user-theme@gnome-shell-extensions.gcampax.github.com)"
gsettings set org.gnome.shell.extensions.user-theme name 'WISE2' || true

step "Wallpaper"
mkdir -p "$HOME/.local/share/backgrounds"
install -m 0644 "$WALLPAPER" "$HOME/.local/share/backgrounds/wise2.png"
gsettings set org.gnome.desktop.background picture-uri      "file://$HOME/.local/share/backgrounds/wise2.png" || true
gsettings set org.gnome.desktop.background picture-uri-dark "file://$HOME/.local/share/backgrounds/wise2.png" || true
gsettings set org.gnome.desktop.background picture-options  'zoom' || true

step "GDM login screen (background + accent, system-wide via dconf)"
sudo install -d -m 0755 /usr/share/backgrounds/wise2
sudo install -m 0644 "$WALLPAPER" /usr/share/backgrounds/wise2/login-background.png
sudo install -d -m 0755 /etc/dconf/profile /etc/dconf/db/gdm.d
printf 'user-db:user\nsystem-db:gdm\nfile-db:/usr/share/gdm/greeter-dconf-defaults\n' | sudo tee /etc/dconf/profile/gdm >/dev/null
cat <<'EOF' | sudo tee /etc/dconf/db/gdm.d/01-wise2-login >/dev/null
[org/gnome/desktop/background]
picture-uri='file:///usr/share/backgrounds/wise2/login-background.png'
picture-uri-dark='file:///usr/share/backgrounds/wise2/login-background.png'
picture-options='zoom'

[org/gnome/desktop/interface]
color-scheme='prefer-dark'
accent-color='green'
EOF
sudo dconf update

step "Plymouth boot splash (WISE² Linux OS)"
PLY_DIR=/usr/share/plymouth/themes/wise2
sudo install -d -m 0755 "$PLY_DIR"
cat <<'EOF' | sudo tee "$PLY_DIR/wise2.plymouth" >/dev/null
[Plymouth Theme]
Name=WISE2
Description=WISE² Linux OS boot splash
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/wise2
ScriptFile=/usr/share/plymouth/themes/wise2/wise2.script
EOF
# Text-only script: no external image assets, so there is nothing here that
# can go missing or render as a broken-image icon. Solid navy background
# (#050607) with a centered "WISE²" wordmark that pulses while booting, and
# a thin green progress bar across the bottom tracking real boot progress.
cat <<'EOF' | sudo tee "$PLY_DIR/wise2.script" >/dev/null
Window.SetBackgroundTopColor(0.02, 0.024, 0.027);
Window.SetBackgroundBottomColor(0.02, 0.024, 0.027);

logo.image = Image.Text("WISE² LINUX OS", 0.84, 0.95, 0.47, 1, "DejaVu Sans Condensed Bold 46");
logo.sprite = Sprite(logo.image);
logo.sprite.SetX(Window.GetWidth()  / 2 - logo.image.GetWidth()  / 2);
logo.sprite.SetY(Window.GetHeight() / 2 - logo.image.GetHeight() / 2);

bar_width = Window.GetWidth() * 0.3;
bar_x = Window.GetWidth() / 2 - bar_width / 2;
bar_y = Window.GetHeight() / 2 + 70;

bar_bg.image = Rectangle(bar_width, 3, 0.1, 0.13, 0.14);
bar_bg.sprite = Sprite(bar_bg.image);
bar_bg.sprite.SetX(bar_x);
bar_bg.sprite.SetY(bar_y);

bar_fg.image = Rectangle(1, 3, 0, 1, 0.5);
bar_fg.sprite = Sprite(bar_fg.image);
bar_fg.sprite.SetX(bar_x);
bar_fg.sprite.SetY(bar_y);

fun progress_callback(duration, progress) {
  logo.sprite.SetOpacity(0.55 + 0.45 * Math.Sin(duration * 2.4));
  fill_width = bar_width * progress;
  if (fill_width < 1) fill_width = 1;
  bar_fg.image = Rectangle(fill_width, 3, 0, 1, 0.5);
  bar_fg.sprite.SetImage(bar_fg.image);
}
Plymouth.SetBootProgressFunction(progress_callback);
EOF
sudo plymouth-set-default-theme -R wise2 && echo "Plymouth theme set and initramfs rebuilt." \
  || echo "WARNING: plymouth-set-default-theme failed; boot splash NOT changed. Run 'sudo plymouth-set-default-theme -l' to see available themes and debug."

cat <<'DONE'

WISE² desktop theme applied (GNOME Shell top bar, accent color, wallpaper,
GDM login background, Plymouth boot splash).

UNVERIFIED — this machine (macOS) cannot render GNOME Shell, GDM, or
Plymouth, so none of the above has been visually checked. Reboot to see
the Plymouth splash and GDM login screen; log out/in (or reboot) to see
the GNOME Shell top bar theme. If the User Themes extension didn't
auto-enable, open Extensions and turn it on manually, then log out/in.

This themes GNOME's own surfaces (top bar, login screen, boot splash). It
does not replace GNOME with a custom shell — Files, Settings, and the
Activities overview are still standard GNOME, just styled.
DONE
