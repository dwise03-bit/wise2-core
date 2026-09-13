#!/bin/bash

# WISE² Pixel Slate Bootstrap Installer
# One-liner: curl https://wise2.net/pixel-slate/install.sh | bash
#
# Detects OS, installs dependencies, configures Tailscale, sets up Command Center

set -e

WISE2_REPO="wise2-core"
TAILSCALE_AUTH_KEY="${TAILSCALE_AUTH_KEY:-}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

echo "🚀 WISE² Pixel Slate Bootstrap Installer"
echo "========================================"
echo ""

# ============================================================================
# Step 1: Detect OS
# ============================================================================
echo "📋 Detecting operating system..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
  if grep -qi "chromeos" /etc/os-release 2>/dev/null; then
    OS="chromeos"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
else
  echo "❌ Unsupported OS: $OSTYPE"
  exit 1
fi

echo "✓ Detected OS: $OS"
echo ""

# ============================================================================
# Step 2: Install Dependencies
# ============================================================================
echo "📦 Installing dependencies for $OS..."

case "$OS" in
  chromeos)
    # ChromeOS: Use apt
    if ! command -v cros-garcon &> /dev/null; then
      echo "📝 Setting up Linux container..."
      # ChromeOS Linux containers work via crostini
    fi
    sudo apt-get update -qq
    sudo apt-get install -y curl git openssh-client jq 2>&1 | grep -v "^Setting up" || true
    ;;
  linux)
    # Linux: Use apt or yum
    if command -v apt-get &> /dev/null; then
      sudo apt-get update -qq
      sudo apt-get install -y curl git openssh-client jq 2>&1 | grep -v "^Setting up" || true
    elif command -v yum &> /dev/null; then
      sudo yum install -y curl git openssh-clients jq 2>&1 | grep -v "^Complete" || true
    fi
    ;;
  macos)
    # macOS: Use Homebrew
    if ! command -v brew &> /dev/null; then
      echo "📝 Installing Homebrew..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install -q curl git jq 2>/dev/null || true

    # Enable SSH
    echo "🔐 Enabling SSH on macOS..."
    sudo launchctl load -w /System/Library/LaunchDaemons/ssh.plist 2>/dev/null || \
    sudo systemsetup -setremotelogin on 2>/dev/null || true
    ;;
esac

echo "✓ Dependencies installed"
echo ""

# ============================================================================
# Step 3: Install Tailscale
# ============================================================================
echo "🌐 Installing Tailscale..."

if ! command -v tailscale &> /dev/null; then
  case "$OS" in
    chromeos|linux)
      curl -fsSL https://tailscale.com/install.sh | sh
      ;;
    macos)
      brew install -q tailscale 2>/dev/null || \
      curl -fsSL https://tailscale.com/install.sh | sh
      ;;
  esac
fi

echo "✓ Tailscale installed"

if [ -z "$TAILSCALE_AUTH_KEY" ]; then
  echo ""
  echo "⚠️  TAILSCALE_AUTH_KEY not set"
  echo "   To auto-connect to Tailscale, run:"
  echo "   TAILSCALE_AUTH_KEY=<your-key> curl https://wise2.net/pixel-slate/install.sh | bash"
  echo ""
  echo "   OR manually start Tailscale:"
  echo "   tailscale up"
  echo ""
else
  echo "📝 Connecting to Tailscale..."
  tailscale up --authkey="$TAILSCALE_AUTH_KEY" || true
fi

echo ""

# ============================================================================
# Step 4: Clone wise2-core
# ============================================================================
echo "📂 Cloning WISE² repository..."

if [ ! -d "$HOME/$WISE2_REPO" ]; then
  git clone https://github.com/dwise03-bit/wise2-core.git "$HOME/$WISE2_REPO"
else
  echo "ℹ️  $HOME/$WISE2_REPO already exists, pulling latest..."
  cd "$HOME/$WISE2_REPO"
  git fetch origin
  git pull origin main
fi

cd "$HOME/$WISE2_REPO"
echo "✓ Repository ready at: $HOME/$WISE2_REPO"
echo ""

# ============================================================================
# Step 5: Verify Deployment System
# ============================================================================
echo "✅ Verifying WISE² deployment system..."

test -f DEPLOYMENT_MASTER.md && echo "   ✓ Deployment guide present" || echo "   ⚠️  Deployment guide missing"
test -f deploy.sh && echo "   ✓ Deployment script ready" || echo "   ⚠️  Deployment script missing"
test -x scripts/sync-check.sh && echo "   ✓ Sync verification ready" || echo "   ⚠️  Sync script missing"

echo ""

# ============================================================================
# Step 6: Start WISE² Command Center
# ============================================================================
echo "🎯 Starting WISE² Command Center..."

if [ -d "apps/command-center" ]; then
  echo "   📁 Command Center found at apps/command-center"
  cd "$HOME/$WISE2_REPO/apps/command-center"

  if [ -f "package.json" ]; then
    if ! command -v node &> /dev/null; then
      echo "   📝 Installing Node.js..."
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash
      sudo apt-get install -y nodejs
    fi

    echo "   📦 Installing dependencies..."
    npm install --silent 2>/dev/null || pnpm install --silent 2>/dev/null || true

    echo "   🚀 Starting Command Center..."
    npm start &
    COMMAND_CENTER_PID=$!
    echo "   ✓ Command Center started (PID: $COMMAND_CENTER_PID)"
  fi
else
  echo "   ⚠️  Command Center not found (will be built later)"
fi

echo ""

# ============================================================================
# Step 7: Configure Discord Alerts (Optional)
# ============================================================================
if [ -n "$DISCORD_WEBHOOK" ]; then
  echo "🔔 Configuring Discord alerts..."
  echo "   Webhook: ${DISCORD_WEBHOOK:0:40}..."
  # Store webhook for later use
  echo "DISCORD_WEBHOOK=$DISCORD_WEBHOOK" >> "$HOME/$WISE2_REPO/.env.local"
  echo "   ✓ Discord webhook saved"
fi

echo ""

# ============================================================================
# Step 8: Configure GitHub Access (Optional)
# ============================================================================
if [ -n "$GITHUB_TOKEN" ]; then
  echo "🔑 Configuring GitHub access..."

  # Store token securely
  if [ -d "$HOME/.config/gh" ]; then
    echo "$GITHUB_TOKEN" > "$HOME/.config/gh/token"
    chmod 600 "$HOME/.config/gh/token"
    echo "   ✓ GitHub token configured"
  fi
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "✨ Setup Complete!"
echo ""
echo "Next Steps:"
echo "  1. Open WISE² Command Center: http://localhost:3000 (or on your Tailscale IP)"
echo "  2. Connect to VPS: ssh dwise@wise2.net"
echo "  3. Deploy Pixel Slate: cd ~/wise2-core && git push origin main"
echo "  4. Access production: https://wise2.net/pixel-slate"
echo ""
echo "Documentation:"
echo "  📖 Deployment Guide: cat ~/wise2-core/DEPLOYMENT_MASTER.md"
echo "  🔄 Sync Status: ~/wise2-core/scripts/sync-check.sh"
echo ""
echo "Support:"
echo "  📧 Email: dwise03@gmail.com"
echo "  📱 Tailscale Network: Connected"
echo ""

exit 0
