#!/usr/bin/env bash
set -Eeuo pipefail
[[ $(uname -s) == Linux && $EUID -ne 0 ]] || { echo 'Run as the Linux desktop user.'; exit 1; }
REACH_REF=a19a171fa980a0785849596492e0af4db800c82f
REACH_ENV="$HOME/.local/share/wise2/agent-reach"
python3 -m venv "$REACH_ENV"
"$REACH_ENV/bin/python" -m pip install "https://github.com/Panniantong/Agent-Reach/archive/${REACH_REF}.zip"
mkdir -p "$HOME/.local/bin" "$HOME/.local/share/applications"
if [[ -e "$HOME/.local/bin/agent-reach" && ! -L "$HOME/.local/bin/agent-reach" ]]; then
  echo 'Existing agent-reach command preserved; use the WISE² launcher for this installation.'
else
  ln -sfn "$REACH_ENV/bin/agent-reach" "$HOME/.local/bin/agent-reach"
fi
cat > "$HOME/.local/share/applications/wise2-research.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=WISE² Research — Agent-Reach
Comment=Check internet research channel availability
Exec=gnome-terminal -- bash -c '"$REACH_ENV/bin/agent-reach" doctor; read -r -p "Press Enter to close"'
Icon=system-search
Categories=Network;
EOF
"$REACH_ENV/bin/agent-reach" --help
echo 'Agent-Reach installed. Use WISE² Research to check channels and configure the accounts you need.'
