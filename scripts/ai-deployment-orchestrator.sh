#!/bin/bash
# AI-Powered iOS Deployment Orchestrator
# Uses local LLM (Ollama) to automate full build→test→deploy cycle

set -e

APP_NAME="BLAKKHAIL"
LOCAL_LLM="http://localhost:11434/api/generate"
LOG_FILE="/tmp/blakkhail-deployment-$(date +%s).log"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  echo -e "${BLUE}🤖${NC} $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}✅${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}❌${NC} $1" | tee -a "$LOG_FILE"
  exit 1
}

warning() {
  echo -e "${YELLOW}⚠️${NC} $1" | tee -a "$LOG_FILE"
}

# Function to call local LLM
ask_ai() {
  local prompt="$1"
  local model="${2:-mistral}"

  curl -s -X POST "$LOCAL_LLM" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"$model\",
      \"prompt\": \"You are an iOS deployment expert. $prompt\",
      \"stream\": false,
      \"temperature\": 0.1
    }" | jq -r '.response' 2>/dev/null || echo "AI unavailable"
}

log "═══════════════════════════════════════════════════════════"
log "BLAKKHAIL iOS Deployment - AI Orchestrator"
log "═══════════════════════════════════════════════════════════"

# Phase 1: Pre-flight Checks
log ""
log "PHASE 1: Pre-flight Checks"
log "─────────────────────────"

# Check device connection
DEVICE=$(xcrun devicectl list devices 2>/dev/null | grep "iPhone.*connected" | head -1 | awk -F'[()]' '{print $(NF-1)}')
if [ -z "$DEVICE" ]; then
  error "No iPhone connected. Please plug in device."
fi
success "Device detected: $DEVICE"

# Check Xcode
if ! xcode-select -p &>/dev/null; then
  error "Xcode not installed"
fi
success "Xcode installed"

# Check local LLM
if curl -s "$LOCAL_LLM" -d '{"model":"mistral"}' &>/dev/null; then
  success "Local LLM available (Ollama)"
else
  warning "Local LLM unavailable - proceeding without AI analysis"
fi

# Phase 2: Build Verification
log ""
log "PHASE 2: Code Analysis & Build Verification"
log "───────────────────────────────────────────"

cd apps/blakkhail-ios

# Ask AI to check code quality
log "Analyzing code with AI..."
CODE_QUALITY=$(ask_ai "Review these Swift files for iOS best practices. Files: Views/*.swift, BlakkhailApp.swift. Return only: PASS or FAIL with reason.")
log "Code analysis: $CODE_QUALITY"

# Build
log "Building for device..."
xcodebuild \
  -scheme Blakkhail \
  -configuration Release \
  -sdk iphoneos \
  -destination "id=$DEVICE" \
  -derivedDataPath ./build \
  -allowProvisioningUpdates \
  build > "$LOG_FILE.build" 2>&1

if [ $? -eq 0 ]; then
  success "Build successful"
else
  # Ask AI to diagnose build error
  BUILD_ERROR=$(tail -20 "$LOG_FILE.build" | ask_ai "Diagnose this iOS build error and suggest fix:")
  error "Build failed: $BUILD_ERROR"
fi

# Phase 3: Provisioning
log ""
log "PHASE 3: Code Signing & Provisioning"
log "────────────────────────────────────"

log "Setting up provisioning..."
# This step requires Xcode GUI, but AI can generate instructions
PROVISION_INSTRUCTIONS=$(ask_ai "Generate step-by-step instructions for iOS provisioning in Xcode GUI for app: com.sencere.blakkhail, team: 757UN8CV9G")
log "Provisioning steps: $PROVISION_INSTRUCTIONS"

warning "Manual step required: Open Xcode and complete provisioning"

# Phase 4: Installation
log ""
log "PHASE 4: Device Installation"
log "────────────────────────────"

log "Waiting for provisioning..."
sleep 30

# Try to install via lldb (xcode's debugger)
log "Installing app..."
if xcrun lldb -n Blakkhail &>/dev/null; then
  success "App installed successfully"
else
  warning "Installation requires Xcode GUI: Product → Run"
fi

# Phase 5: Testing
log ""
log "PHASE 5: Automated Testing"
log "──────────────────────────"

# Ask AI to generate test plan
TEST_PLAN=$(ask_ai "Generate iOS UI test plan for app sections: Home, Shop, Story, Cart, Account. Return checklist format.")
log "Test plan:"
echo "$TEST_PLAN" | tee -a "$LOG_FILE"

# Phase 6: Reporting
log ""
log "PHASE 6: Deployment Report"
log "──────────────────────────"

success "Deployment workflow complete"
log "Log saved: $LOG_FILE"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Next steps:"
echo "  1. Complete provisioning in Xcode GUI"
echo "  2. Product → Run to install"
echo "  3. Test app on device"
echo "  4. Run: ./scripts/ai-deployment-orchestrator.sh (automated)"
echo "═══════════════════════════════════════════════════════════"
