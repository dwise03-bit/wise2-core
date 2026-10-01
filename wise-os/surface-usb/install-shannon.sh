#!/usr/bin/env bash
# Installs Shannon (KeygraphHQ/shannon), an open-source AI pentester, AGPLv3.
# https://github.com/KeygraphHQ/shannon — pinned to release v3.3.0.
# Wired to the local Ollama instance wise2-setup.sh already installs, so scans
# run with zero API cost against repos under /opt/wise2 (wise2-core by default).
set -Eeuo pipefail
[[ $(uname -s) == Linux && $EUID -ne 0 ]] || { echo 'Run as the Linux desktop user.'; exit 1; }

SHANNON_VERSION="3.3.0"
SHANNON_HOME="$HOME/.local/share/wise2/shannon"
DEFAULT_TARGET_REPO="/opt/wise2/core"

command -v docker >/dev/null || { echo 'Docker is required for the Shannon worker container; run wise2-setup.sh first.'; exit 1; }
docker info >/dev/null 2>&1 || { echo 'Docker daemon is not running. Start it (sudo systemctl start docker) and rerun.'; exit 1; }
command -v node >/dev/null || { echo 'Node.js 18+ is required; run wise2-setup.sh first.'; exit 1; }
command -v ollama >/dev/null || { echo 'Ollama is required for the local-model path; run wise2-setup.sh first.'; exit 1; }

mkdir -p "$SHANNON_HOME"

# Pick a model: prefer the model wise2-setup.sh already pulled.
MODEL_ID="$(cat /etc/wise2/default-model 2>/dev/null || true)"
MODEL_ID="${MODEL_ID:-llama3.2:3b}"

cat > "$SHANNON_HOME/models.json" <<EOF
{
  "providers": {
    "ollama": {
      "baseUrl": "http://host.docker.internal:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "${MODEL_ID}" }
      ]
    }
  }
}
EOF

cat > "$SHANNON_HOME/env" <<EOF
# Shannon credentials for the local Ollama provider. Any value works for
# SHANNON_AI_API_KEY; Ollama ignores it. Point SHANNON_AI_MODEL at a model
# you have pulled (ollama list) if you change it from the default below.
export SHANNON_AI_API_KEY=ollama
export SHANNON_AI_MODEL=ollama:${MODEL_ID}
EOF

# Cache the pinned npx package so the first real run doesn't stall on a
# cold download, and confirm the CLI resolves.
npx --yes "@keygraph/shannon@${SHANNON_VERSION}" --version

mkdir -p "$HOME/.local/bin" "$HOME/.local/share/applications"
cat > "$HOME/.local/bin/wise2-shannon" <<EOF
#!/usr/bin/env bash
# WISE² wrapper for Shannon (local Ollama provider, no API cost).
# Usage: wise2-shannon [-u URL] [-r REPO] [shannon args...]
set -Eeuo pipefail
source "$SHANNON_HOME/env"
URL="\${WISE2_SHANNON_TARGET:-http://127.0.0.1:3080}"
REPO="${DEFAULT_TARGET_REPO}"
ARGS=()
while [[ \$# -gt 0 ]]; do
  case "\$1" in
    -u) URL="\$2"; shift 2;;
    -r) REPO="\$2"; shift 2;;
    *) ARGS+=("\$1"); shift;;
  esac
done
if [[ \${1:-} == setup ]]; then
  exec npx --yes "@keygraph/shannon@${SHANNON_VERSION}" setup
fi
exec npx --yes "@keygraph/shannon@${SHANNON_VERSION}" start \\
  -u "\$URL" -r "\$REPO" --models-config "$SHANNON_HOME/models.json" "\${ARGS[@]}"
EOF
chmod +x "$HOME/.local/bin/wise2-shannon"

cat > "$HOME/.local/share/applications/wise2-shannon.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=WISE² Shannon Security
Comment=AI pentester (Keygraph Shannon) — scans WISE2_SHANNON_TARGET against /opt/wise2/core
Exec=gnome-terminal -- bash -c '"$HOME/.local/bin/wise2-shannon"; read -r -p "Press Enter to close"'
Icon=security-high
Categories=Development;Security;
EOF

echo "Shannon ${SHANNON_VERSION} ready, wired to local Ollama model ${MODEL_ID}."
echo "Launch: wise2-shannon -u <target-url> -r <repo-path>   (defaults: http://127.0.0.1:3080, ${DEFAULT_TARGET_REPO})"
echo "Only scan apps you own/are authorized to test. Shannon actively executes exploits — see its Safety docs."
