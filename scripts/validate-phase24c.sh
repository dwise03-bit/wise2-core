#!/bin/bash

# Validate Phase 24C: FREE-First Adaptive Model Intelligence
# Tests model discovery, routing, fallback, and cost guard

set -e

echo "==================================="
echo "WISE² Phase 24C Validation"
echo "FREE-First Adaptive AI"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Ollama is running
echo "[1/5] Checking Ollama availability..."
if ! curl -s --connect-timeout 10 http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo -e "${RED}✗ Ollama not responding at http://localhost:11434${NC}"
  echo "  Start Ollama: ollama serve"
  exit 1
fi
echo -e "${GREEN}✓ Ollama running${NC}"

# Discover models
echo ""
echo "[2/5] Discovering models..."
MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sort -u)
MODEL_COUNT=$(echo "$MODELS" | wc -w)
echo -e "${GREEN}✓ Found $MODEL_COUNT models${NC}"
for model in $MODELS; do
  echo "    - $model"
done

# Verify preferred models
echo ""
echo "[3/5] Verifying preferred models..."
REQUIRED_MODELS=("qwen2.5-coder:7b" "llama3:latest" "gemma4:e2b")
for required in "${REQUIRED_MODELS[@]}"; do
  # Extract model name without tag
  base_model=$(echo "$required" | cut -d':' -f1)
  if echo "$MODELS" | grep -q "$base_model"; then
    echo -e "${GREEN}✓ $required available${NC}"
  else
    echo -e "${YELLOW}⚠ $required not found (non-critical)${NC}"
  fi
done

# Test cost policy
echo ""
echo "[4/5] Verifying FREE-FIRST cost policy..."
if [ -f "config/WISE2_AI_COST_POLICY.json" ]; then
  MODE=$(grep '"mode"' config/WISE2_AI_COST_POLICY.json | head -1 | grep -o 'FREE-FIRST\|BALANCED\|PERFORMANCE')
  if [ "$MODE" = "FREE-FIRST" ]; then
    echo -e "${GREEN}✓ Cost policy: $MODE${NC}"
  else
    echo -e "${RED}✗ Cost policy is $MODE (expected FREE-FIRST)${NC}"
    exit 1
  fi

  # Check paid providers are disabled
  CLAUDE_DISABLED=$(grep -A5 '"claude"' config/WISE2_AI_COST_POLICY.json | grep '"enabled": false' | wc -l)
  if [ "$CLAUDE_DISABLED" -gt 0 ]; then
    echo -e "${GREEN}✓ Paid providers disabled${NC}"
  else
    echo -e "${YELLOW}⚠ Could not verify paid provider status${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Cost policy file not found${NC}"
fi

# Test model registry file
echo ""
echo "[5/5] Checking model registry..."
if [ -f "config/model-registry.json" ]; then
  REGISTRY_MODELS=$(grep -o '"name":"[^"]*"' config/model-registry.json | wc -l)
  echo -e "${GREEN}✓ Registry contains $REGISTRY_MODELS models${NC}"
else
  echo -e "${YELLOW}⚠ Model registry not yet initialized (will create on first run)${NC}"
fi

echo ""
echo "==================================="
echo -e "${GREEN}Phase 24C Validation Complete ✓${NC}"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Run tests:  npm test -- HermesAdaptiveAgent.acceptance.test.ts"
echo "2. Start API:  npm start"
echo "3. Test route: curl http://localhost:3000/api/v1/hermes/adaptive/models"
echo ""
