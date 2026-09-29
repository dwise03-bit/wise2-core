#!/bin/bash

# WISE² Pixel Slate Bootstrap Installer
# One-liner: curl https://wise2.net/pixel-slate/install.sh | bash
#
# Detects OS, installs dependencies, configures Tailscale, sets up Command Center

set -e

# ============================================================================
# Configuration & Variables
# ============================================================================
WISE2_REPO="wise2-core"
TAILSCALE_AUTH_KEY="${TAILSCALE_AUTH_KEY:-}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
LOG_FILE="${HOME}/.wise2-setup.log"
TOTAL_STEPS=8
CURRENT_STEP=0
START_TIME=$(date +%s)

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# Logging & Output Functions
# ============================================================================
log() {
  local level="$1"
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[${timestamp}] [$level] $message" >> "$LOG_FILE"
  echo "$message"
}

log_step() {
  CURRENT_STEP=$((CURRENT_STEP + 1))
  local message="$@"
  local progress="${CURRENT_STEP}/${TOTAL_STEPS}"
  echo ""
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  echo -e "${CYAN}[Step ${progress}] ${message}${NC}"
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  log "STEP" "Starting step ${CURRENT_STEP}: $message"
}

log_success() {
  echo -e "${GREEN}✓ $@${NC}"
  log "SUCCESS" "$@"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $@${NC}"
  log "WARNING" "$@"
}

log_error() {
  echo -e "${RED}✗ $@${NC}"
  log "ERROR" "$@"
}

log_info() {
  echo -e "${CYAN}ℹ️  $@${NC}"
  log "INFO" "$@"
}

log_spinner_start() {
  local message="$1"
  echo -n -e "${CYAN}⏳ ${message}...${NC}"
}

log_spinner_end() {
  local status="$1"  # 0 for success, 1 for failure
  if [ "$status" -eq 0 ]; then
    echo -e "\r${GREEN}✓ Done${NC}                    "
  else
    echo -e "\r${RED}✗ Failed${NC}                  "
  fi
}

prompt_yes_no() {
  local question="$1"
  local default="${2:-y}"  # y or n
  local prompt_char="[${default^^}/$([ "$default" = "y" ] && echo "n" || echo "Y")]"

  while true; do
    read -p "$(echo -e ${CYAN}${question}${NC} ${prompt_char}: )" -r response
    response=${response:-$default}
    case "$response" in
      [Yy]) return 0 ;;
      [Nn]) return 1 ;;
      *) echo -e "${RED}Please answer y or n${NC}" ;;
    esac
  done
}

retry_command() {
  local max_attempts=3
  local attempt=1
  local command="$@"

  while [ $attempt -le $max_attempts ]; do
    log_info "Attempt $attempt/$max_attempts: $command"
    if eval "$command"; then
      return 0
    fi

    if [ $attempt -lt $max_attempts ]; then
      log_warning "Attempt $attempt failed. Retrying in 3 seconds..."
      sleep 3
    fi
    attempt=$((attempt + 1))
  done

  log_error "Command failed after $max_attempts attempts: $command"
  return 1
}

# ============================================================================
# Header
# ============================================================================
echo ""
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       🚀 WISE² Pixel Slate Bootstrap Installer 2.0            ║"
echo "║           AI-Native Command Center for ChromeOS               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${BLUE}Setup started at $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}Log file: ${LOG_FILE}${NC}"
echo ""
log "INFO" "=== WISE² Pixel Slate Setup Started ==="
echo ""

# ============================================================================
# Step 1: Detect OS
# ============================================================================
log_step "Detecting Operating System"

log_spinner_start "Detecting OS"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
  if grep -qi "chromeos" /etc/os-release 2>/dev/null; then
    OS="chromeos"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
else
  log_spinner_end 1
  log_error "Unsupported OS: $OSTYPE"
  exit 1
fi
log_spinner_end 0

log_success "Detected OS: $OS"
echo ""

# Show system info
if [ "$OS" = "chromeos" ]; then
  log_info "ChromeOS Crostini environment detected"
  if command -v cros-garcon &>/dev/null; then
    log_info "cros-garcon available - Linux container is ready"
  fi
elif [ "$OS" = "macos" ]; then
  log_info "macOS $(sw_vers -productVersion) detected"
fi

if [ "$OS" = "linux" ] && ! [ -f /etc/os-release ]; then
  log_warning "Could not detect specific Linux distro"
fi
echo ""

# ============================================================================
# Step 2: Install Dependencies
# ============================================================================
log_step "Installing System Dependencies"

REQUIRED_DEPS=("curl" "git" "jq")
OPTIONAL_DEPS=("openssh-client" "wget" "nano" "htop" "rsync")
MISSING_DEPS=()

# Check which dependencies are missing
log_info "Checking for required dependencies..."
for dep in "${REQUIRED_DEPS[@]}"; do
  if ! command -v "$dep" &>/dev/null; then
    MISSING_DEPS+=("$dep")
    log_warning "Missing: $dep"
  else
    log_success "Already installed: $dep"
  fi
done
echo ""

if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
  log_success "All required dependencies already installed!"
else
  log_info "Will install ${#MISSING_DEPS[@]} missing dependencies"

  case "$OS" in
    chromeos|linux)
      if command -v apt-get &>/dev/null; then
        log_info "Using apt-get package manager"

        log_spinner_start "Updating package lists"
        if sudo apt-get update -qq 2>"${LOG_FILE}.err"; then
          log_spinner_end 0
        else
          log_spinner_end 1
          log_warning "Package list update had issues (continuing anyway)"
        fi

        log_spinner_start "Installing dependencies"
        INSTALL_CMD="sudo apt-get install -y ${MISSING_DEPS[@]}"
        if retry_command "$INSTALL_CMD" >/dev/null 2>&1; then
          log_spinner_end 0
          log_success "Dependencies installed via apt-get"
        else
          log_spinner_end 1
          log_error "Failed to install dependencies via apt-get"
          if prompt_yes_no "Show error details?" "y"; then
            cat "${LOG_FILE}.err"
          fi
          log_warning "Continuing anyway (some dependencies might be missing)"
        fi

      elif command -v yum &>/dev/null; then
        log_info "Using yum package manager"
        log_spinner_start "Installing dependencies"
        INSTALL_CMD="sudo yum install -y ${MISSING_DEPS[@]}"
        if retry_command "$INSTALL_CMD" >/dev/null 2>&1; then
          log_spinner_end 0
          log_success "Dependencies installed via yum"
        else
          log_spinner_end 1
          log_error "Failed to install dependencies via yum"
          log_warning "Continuing anyway"
        fi
      else
        log_error "No supported package manager found (apt-get or yum)"
        exit 1
      fi
      ;;

    macos)
      # Install Homebrew if needed
      if ! command -v brew &>/dev/null; then
        log_info "Homebrew not found, installing..."
        log_spinner_start "Installing Homebrew"
        if /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" >/dev/null 2>&1; then
          log_spinner_end 0
          log_success "Homebrew installed"
        else
          log_spinner_end 1
          log_error "Failed to install Homebrew"
          exit 1
        fi
      fi

      log_spinner_start "Installing dependencies via Homebrew"
      INSTALL_CMD="brew install ${MISSING_DEPS[@]}"
      if retry_command "$INSTALL_CMD" >/dev/null 2>&1; then
        log_spinner_end 0
        log_success "Dependencies installed via Homebrew"
      else
        log_spinner_end 1
        log_error "Failed to install dependencies"
        log_warning "Continuing anyway"
      fi

      # Enable SSH on macOS
      log_info "Ensuring SSH is enabled on macOS..."
      sudo launchctl load -w /System/Library/LaunchDaemons/ssh.plist 2>/dev/null || \
      sudo systemsetup -setremotelogin on 2>/dev/null || \
      log_warning "Could not enable SSH (may already be enabled)"
      ;;
  esac
fi

# Final verification
log_info "Final dependency verification..."
ALL_FOUND=true
for dep in "${REQUIRED_DEPS[@]}"; do
  if ! command -v "$dep" &>/dev/null; then
    log_error "Required dependency still missing: $dep"
    ALL_FOUND=false
  fi
done

if [ "$ALL_FOUND" = true ]; then
  log_success "All required dependencies verified!"
else
  log_error "Some required dependencies are still missing"
  log_info "Log file saved to: $LOG_FILE"
  exit 1
fi

echo ""

# ============================================================================
# Step 3: Install Tailscale
# ============================================================================
log_step "Installing & Configuring Tailscale"

if command -v tailscale &>/dev/null; then
  log_success "Tailscale already installed"
else
  log_info "Tailscale not found, installing..."

  case "$OS" in
    chromeos|linux)
      log_spinner_start "Installing Tailscale via curl"
      if retry_command "curl -fsSL https://tailscale.com/install.sh | sh" >/dev/null 2>&1; then
        log_spinner_end 0
        log_success "Tailscale installed"
      else
        log_spinner_end 1
        log_error "Failed to install Tailscale"
        exit 1
      fi
      ;;
    macos)
      log_info "Trying Homebrew first..."
      if brew install tailscale 2>/dev/null; then
        log_success "Tailscale installed via Homebrew"
      else
        log_warning "Homebrew install failed, trying curl..."
        log_spinner_start "Installing Tailscale via curl"
        if retry_command "curl -fsSL https://tailscale.com/install.sh | sh" >/dev/null 2>&1; then
          log_spinner_end 0
          log_success "Tailscale installed"
        else
          log_spinner_end 1
          log_error "Failed to install Tailscale"
          exit 1
        fi
      fi
      ;;
  esac
fi

# Configure Tailscale connection
echo ""
log_info "Configuring Tailscale connection..."

if tailscale status &>/dev/null; then
  TS_STATUS=$(tailscale status --json | jq -r '.Self.Online' 2>/dev/null || echo "unknown")
  if [ "$TS_STATUS" = "true" ]; then
    log_success "Tailscale already connected"
    TS_IP=$(tailscale ip -4 2>/dev/null || echo "N/A")
    log_info "Your Tailscale IP: $TS_IP"
  else
    log_info "Tailscale installed but not connected"
  fi
else
  log_warning "Could not check Tailscale status"
fi

echo ""
if [ -z "$TAILSCALE_AUTH_KEY" ]; then
  log_warning "TAILSCALE_AUTH_KEY not provided"
  echo ""
  if prompt_yes_no "Connect to Tailscale now?" "y"; then
    log_info "Starting Tailscale connection..."
    log_info "A browser window should open for authentication"
    if tailscale up; then
      log_success "Tailscale connected!"
      sleep 2
      TS_IP=$(tailscale ip -4)
      log_info "Your Tailscale IP: $TS_IP"
    else
      log_error "Tailscale connection failed"
      log_info "You can run 'tailscale up' manually later"
    fi
  else
    log_info "You can connect to Tailscale later with: tailscale up"
  fi
else
  log_info "Connecting to Tailscale with provided auth key..."
  log_spinner_start "Authenticating"
  if tailscale up --authkey="$TAILSCALE_AUTH_KEY" >/dev/null 2>&1; then
    log_spinner_end 0
    log_success "Tailscale connected!"
    TS_IP=$(tailscale ip -4)
    log_info "Your Tailscale IP: $TS_IP"
  else
    log_spinner_end 1
    log_error "Failed to connect to Tailscale"
    log_info "You can try again with: tailscale up"
  fi
fi

echo ""

# ============================================================================
# Step 4: Clone/Update wise2-core Repository
# ============================================================================
log_step "Cloning WISE² Repository"

REPO_PATH="$HOME/$WISE2_REPO"

if [ ! -d "$REPO_PATH" ]; then
  log_info "Repository not found, cloning from GitHub..."
  log_spinner_start "Cloning wise2-core"
  if retry_command "git clone https://github.com/dwise03-bit/wise2-core.git $REPO_PATH" >/dev/null 2>&1; then
    log_spinner_end 0
    log_success "Repository cloned"
  else
    log_spinner_end 1
    log_error "Failed to clone repository"
    exit 1
  fi
else
  log_info "Repository already exists at $REPO_PATH"
  if prompt_yes_no "Update to latest version?" "y"; then
    cd "$REPO_PATH"
    log_spinner_start "Fetching latest changes"
    if git fetch origin >/dev/null 2>&1; then
      log_spinner_end 0
      log_spinner_start "Pulling latest main branch"
      if git pull origin main >/dev/null 2>&1; then
        log_spinner_end 0
        log_success "Repository updated"
      else
        log_spinner_end 1
        log_warning "Pull had conflicts or issues"
      fi
    else
      log_spinner_end 1
      log_warning "Could not fetch from remote"
    fi
  fi
fi

cd "$REPO_PATH"
REPO_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
log_success "Repository ready at: $REPO_PATH"
log_info "Current commit: $REPO_COMMIT"
echo ""

# ============================================================================
# Step 5: Verify Deployment System
# ============================================================================
log_step "Verifying Deployment System"

DEPLOYMENT_FILES=(
  "DEPLOYMENT_MASTER.md:Deployment guide"
  "CLAUDE.md:Project instructions"
  "package.json:Package manifest"
  "scripts/wise2-vps.sh:VPS deployment script"
)

log_info "Checking critical files..."
FILES_OK=true
for file_spec in "${DEPLOYMENT_FILES[@]}"; do
  file="${file_spec%%:*}"
  desc="${file_spec#*:}"
  if test -f "$file"; then
    log_success "$desc found"
  else
    log_warning "$desc missing: $file"
    FILES_OK=false
  fi
done

if [ "$FILES_OK" = true ]; then
  log_success "All critical deployment files present"
else
  log_warning "Some files are missing (you may need to complete setup manually)"
fi

echo ""

# ============================================================================
# Step 6: Start WISE² Command Center (Optional)
# ============================================================================
log_step "Starting WISE² Command Center (Optional)"

if [ -d "apps/command-center" ]; then
  log_success "Command Center app found"

  if [ -f "apps/command-center/package.json" ]; then
    if prompt_yes_no "Start Command Center?" "y"; then
      cd "apps/command-center"

      # Check for Node.js
      if ! command -v node &>/dev/null; then
        log_info "Node.js not found, installing..."
        if [ "$OS" = "macos" ]; then
          log_spinner_start "Installing Node.js via Homebrew"
          if brew install node >/dev/null 2>&1; then
            log_spinner_end 0
          else
            log_spinner_end 1
            log_error "Failed to install Node.js"
            log_info "Please install Node.js manually: https://nodejs.org"
            exit 1
          fi
        else
          log_spinner_start "Installing Node.js"
          if curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash >/dev/null 2>&1 && \
             sudo apt-get install -y nodejs >/dev/null 2>&1; then
            log_spinner_end 0
          else
            log_spinner_end 1
            log_error "Failed to install Node.js"
            exit 1
          fi
        fi
      fi

      log_spinner_start "Installing dependencies"
      if npm install --silent >/dev/null 2>&1 || pnpm install --silent >/dev/null 2>&1; then
        log_spinner_end 0
        log_success "Dependencies installed"
      else
        log_spinner_end 1
        log_warning "Dependency install had issues"
      fi

      log_info "Starting Command Center..."
      log_info "This will run in the background"
      npm start >/dev/null 2>&1 &
      COMMAND_CENTER_PID=$!
      sleep 2
      log_success "Command Center started (PID: $COMMAND_CENTER_PID)"

      cd "$REPO_PATH"
    fi
  else
    log_warning "package.json not found in Command Center"
  fi
else
  log_warning "Command Center not found (it will be added in future updates)"
  log_info "You can build it manually later"
fi

echo ""

# ============================================================================
# Step 7: Configure Discord Alerts (Optional)
# ============================================================================
log_step "Configure Discord Alerts (Optional)"

if [ -n "$DISCORD_WEBHOOK" ]; then
  log_info "Discord webhook provided"
  if prompt_yes_no "Save Discord webhook to .env.local?" "y"; then
    echo "DISCORD_WEBHOOK=$DISCORD_WEBHOOK" >> "$REPO_PATH/.env.local"
    log_success "Discord webhook saved"
    log_info "Alerts can now be sent to your Discord server"
  fi
elif prompt_yes_no "Configure Discord alerts?" "n"; then
  read -p "$(echo -e ${CYAN}Enter Discord webhook URL:${NC} )" -r discord_url
  if [ -n "$discord_url" ]; then
    echo "DISCORD_WEBHOOK=$discord_url" >> "$REPO_PATH/.env.local"
    log_success "Discord webhook saved"
  else
    log_info "Skipped Discord configuration"
  fi
else
  log_info "Discord alerts skipped (can be configured later)"
fi

echo ""

# ============================================================================
# Step 8: Configure GitHub Access (Optional)
# ============================================================================
log_step "Configure GitHub Access (Optional)"

if [ -n "$GITHUB_TOKEN" ]; then
  log_info "GitHub token provided"
  if prompt_yes_no "Configure GitHub token?" "y"; then
    mkdir -p "$HOME/.config/gh"
    echo "$GITHUB_TOKEN" > "$HOME/.config/gh/token"
    chmod 600 "$HOME/.config/gh/token"
    log_success "GitHub token configured"
  fi
elif prompt_yes_no "Configure GitHub token?" "n"; then
  read -sp "$(echo -e ${CYAN}Enter GitHub personal access token:${NC} )" -r github_token
  if [ -n "$github_token" ]; then
    mkdir -p "$HOME/.config/gh"
    echo "$github_token" > "$HOME/.config/gh/token"
    chmod 600 "$HOME/.config/gh/token"
    log_success "GitHub token configured securely"
  else
    log_info "Skipped GitHub configuration"
  fi
else
  log_info "GitHub access skipped (can be configured later)"
fi

echo ""

# ============================================================================
# Summary & Next Steps
# ============================================================================
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

log_step "Setup Complete!"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✨ WISE² Pixel Slate Setup Successfully Completed!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_success "Setup took $((ELAPSED / 60)) minutes and $((ELAPSED % 60)) seconds"
echo ""

echo -e "${CYAN}📋 NEXT STEPS:${NC}"
echo "  1. ${BLUE}Open WISE² Command Center${NC}"
if [ "$OS" = "chromeos" ]; then
  echo "     • Local: http://localhost:3000"
  TS_IP=$(tailscale ip -4 2>/dev/null || echo "YOUR_TAILSCALE_IP")
  echo "     • Network: http://${TS_IP}:3000"
fi
echo ""
echo "  2. ${BLUE}Connect to VPS${NC}"
echo "     • Run: ssh dwise@wise2.net"
echo "     • Or: ${HOME}/scripts/wise2-health (if available)"
echo ""
echo "  3. ${BLUE}Test deployment${NC}"
echo "     • Run: cd $REPO_PATH"
echo "     • Then: bash scripts/wise2-vps.sh --dry-run"
echo ""
echo "  4. ${BLUE}Deploy to production${NC}"
echo "     • When ready: git push origin main"
echo "     • Monitor: https://wise2.net/pixel-slate"
echo ""

echo -e "${CYAN}📖 DOCUMENTATION:${NC}"
echo "  • Setup Log:     $LOG_FILE"
echo "  • Deployment:    $REPO_PATH/DEPLOYMENT_MASTER.md"
echo "  • Project Info:  $REPO_PATH/CLAUDE.md"
echo "  • WISE2 Design:  $REPO_PATH/docs/"
echo ""

echo -e "${CYAN}🔧 USEFUL COMMANDS:${NC}"
if [ "$OS" = "chromeos" ]; then
  echo "  • Tailscale IP:  tailscale ip -4"
  echo "  • Health Check:  ${HOME}/scripts/wise2-health.sh"
  echo "  • VPS Access:    ssh dwise@wise2-vps"
fi
echo "  • View Logs:     tail -f $LOG_FILE"
echo "  • Git Status:    cd $REPO_PATH && git status"
echo ""

echo -e "${CYAN}💬 SUPPORT:${NC}"
echo "  • Email: dwise03@gmail.com"
echo "  • Issues: https://github.com/dwise03-bit/wise2-core/issues"
echo ""

log "INFO" "=== Setup Complete ==="
log "INFO" "Elapsed time: $((ELAPSED / 60)) minutes $((ELAPSED % 60)) seconds"

exit 0
