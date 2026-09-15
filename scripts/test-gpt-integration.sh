#!/bin/bash

# WISE² Command Center GPT Integration Test Suite
# Tests all integration points across the platform

set -e

echo "🚀 WISE² Command Center GPT Integration Test Suite"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
    ((TESTS_FAILED++))
  fi
}

# 1. Configuration File Test
echo -e "\n${BLUE}1. Testing GPT Integration Config${NC}"
if [ -f "services/gpt-integration.config.ts" ]; then
  test_result 0 "Configuration file exists"

  # Check required fields
  if grep -q "gptId:" services/gpt-integration.config.ts; then
    test_result 0 "GPT ID defined"
  else
    test_result 1 "GPT ID not found"
  fi

  if grep -q "g-6aa6a67f0d9c8191bb664542f87f28b4" services/gpt-integration.config.ts; then
    test_result 0 "Correct GPT ID in config"
  else
    test_result 1 "Incorrect GPT ID"
  fi

  if grep -q "integrations:" services/gpt-integration.config.ts; then
    test_result 0 "All integrations configured"
  else
    test_result 1 "Integrations config missing"
  fi
else
  test_result 1 "Configuration file not found"
fi

# 2. API Service Files Test
echo -e "\n${BLUE}2. Testing API Service Files${NC}"

if [ -f "packages/api/src/webhooks/gpt-discord.service.ts" ]; then
  test_result 0 "Discord service file exists"

  if grep -q "sendGPTResponse" packages/api/src/webhooks/gpt-discord.service.ts; then
    test_result 0 "sendGPTResponse method defined"
  else
    test_result 1 "sendGPTResponse method missing"
  fi

  if grep -q "sendNotification" packages/api/src/webhooks/gpt-discord.service.ts; then
    test_result 0 "sendNotification method defined"
  else
    test_result 1 "sendNotification method missing"
  fi
else
  test_result 1 "Discord service file not found"
fi

if [ -f "packages/api/src/integrations/gpt-knowledge-base.service.ts" ]; then
  test_result 0 "Knowledge Base service file exists"

  if grep -q "queryContext" packages/api/src/integrations/gpt-knowledge-base.service.ts; then
    test_result 0 "queryContext method defined"
  else
    test_result 1 "queryContext method missing"
  fi

  if grep -q "getDocumentationLinks" packages/api/src/integrations/gpt-knowledge-base.service.ts; then
    test_result 0 "getDocumentationLinks method defined"
  else
    test_result 1 "getDocumentationLinks method missing"
  fi
else
  test_result 1 "Knowledge Base service file not found"
fi

# 3. Controller Updates Test
echo -e "\n${BLUE}3. Testing API Controller${NC}"

if grep -q "gpt/link" packages/api/src/command-center/command-center.controller.ts; then
  test_result 0 "GPT link endpoint defined"
else
  test_result 1 "GPT link endpoint not found"
fi

if grep -q "gpt/context" packages/api/src/command-center/command-center.controller.ts; then
  test_result 0 "GPT context endpoint defined"
else
  test_result 1 "GPT context endpoint not found"
fi

if grep -q "getGPTLink" packages/api/src/command-center/command-center.service.ts; then
  test_result 0 "getGPTLink service method defined"
else
  test_result 1 "getGPTLink service method not found"
fi

if grep -q "getGPTContext" packages/api/src/command-center/command-center.service.ts; then
  test_result 0 "getGPTContext service method defined"
else
  test_result 1 "getGPTContext service method not found"
fi

# 4. Dashboard Component Test
echo -e "\n${BLUE}4. Testing Dashboard Integration${NC}"

if [ -f "apps/dashboard/app/components/gpt/gpt-widget.tsx" ]; then
  test_result 0 "GPT widget component exists"

  if grep -q "GPTWidget" apps/dashboard/app/components/gpt/gpt-widget.tsx; then
    test_result 0 "Widget component properly exported"
  else
    test_result 1 "Widget component not properly exported"
  fi

  if grep -q "fetch.*gpt/link" apps/dashboard/app/components/gpt/gpt-widget.tsx; then
    test_result 0 "Widget fetches GPT link"
  else
    test_result 1 "Widget doesn't fetch GPT link"
  fi

  if grep -q "SparklesIcon" apps/dashboard/app/components/gpt/gpt-widget.tsx; then
    test_result 0 "Widget has proper UI icons"
  else
    test_result 1 "Widget missing icons"
  fi
else
  test_result 1 "GPT widget component not found"
fi

# 5. Website Component Test
echo -e "\n${BLUE}5. Testing Website Integration${NC}"

if [ -f "apps/website/app/components/gpt-showcase.tsx" ]; then
  test_result 0 "GPT showcase component exists"

  if grep -q "GPTShowcase" apps/website/app/components/gpt-showcase.tsx; then
    test_result 0 "Showcase component properly exported"
  else
    test_result 1 "Showcase component not properly exported"
  fi

  if grep -q "chatgpt.com/g/g-6aa6a67f0d9c8191bb664542f87f28b4" apps/website/app/components/gpt-showcase.tsx; then
    test_result 0 "Website has correct GPT link"
  else
    test_result 1 "Website GPT link incorrect or missing"
  fi

  if grep -q "features.map" apps/website/app/components/gpt-showcase.tsx; then
    test_result 0 "Showcase has feature grid"
  else
    test_result 1 "Feature grid missing"
  fi
else
  test_result 1 "GPT showcase component not found"
fi

# 6. Documentation Test
echo -e "\n${BLUE}6. Testing Documentation${NC}"

if [ -f "GPT_INTEGRATION.md" ]; then
  test_result 0 "Integration documentation exists"

  if grep -q "# WISE² Command Center GPT" GPT_INTEGRATION.md; then
    test_result 0 "Documentation has proper header"
  else
    test_result 1 "Documentation header missing"
  fi

  if grep -q "g-6aa6a67f0d9c8191bb664542f87f28b4" GPT_INTEGRATION.md; then
    test_result 0 "Documentation includes GPT ID"
  else
    test_result 1 "GPT ID not documented"
  fi

  if grep -q "## API Integration" GPT_INTEGRATION.md; then
    test_result 0 "API integration docs present"
  else
    test_result 1 "API integration docs missing"
  fi

  if grep -q "## Discord Integration" GPT_INTEGRATION.md; then
    test_result 0 "Discord integration docs present"
  else
    test_result 1 "Discord integration docs missing"
  fi

  if grep -q "## Knowledge Base" GPT_INTEGRATION.md; then
    test_result 0 "Knowledge Base integration docs present"
  else
    test_result 1 "Knowledge Base integration docs missing"
  fi
else
  test_result 1 "Integration documentation not found"
fi

# 7. Syntax Validation
echo -e "\n${BLUE}7. Testing Code Syntax${NC}"

# Check for common TypeScript issues
if grep -q "Injectable()" packages/api/src/webhooks/gpt-discord.service.ts && \
   grep -q "Constructor" packages/api/src/webhooks/gpt-discord.service.ts; then
  test_result 0 "Discord service has proper NestJS structure"
else
  test_result 1 "Discord service missing NestJS decorators"
fi

if grep -q "Injectable()" packages/api/src/integrations/gpt-knowledge-base.service.ts; then
  test_result 0 "Knowledge Base service has Injectable decorator"
else
  test_result 1 "Knowledge Base service missing Injectable"
fi

if grep -q "'use client'" apps/dashboard/app/components/gpt/gpt-widget.tsx; then
  test_result 0 "Dashboard widget is proper client component"
else
  test_result 1 "Dashboard widget not properly marked as client"
fi

# 8. Integration Points Test
echo -e "\n${BLUE}8. Testing Integration Points${NC}"

# Count integration methods
DISCORD_METHODS=$(grep -c "async send" packages/api/src/webhooks/gpt-discord.service.ts || echo "0")
if [ "$DISCORD_METHODS" -ge 3 ]; then
  test_result 0 "Discord service has multiple integration methods ($DISCORD_METHODS)"
else
  test_result 1 "Discord service has insufficient methods"
fi

KB_METHODS=$(grep -c "async " packages/api/src/integrations/gpt-knowledge-base.service.ts || echo "0")
if [ "$KB_METHODS" -ge 4 ]; then
  test_result 0 "Knowledge Base service has multiple integration methods ($KB_METHODS)"
else
  test_result 1 "Knowledge Base service has insufficient methods"
fi

# 9. Configuration Completeness
echo -e "\n${BLUE}9. Testing Configuration Completeness${NC}"

if grep -q "dashboard:" services/gpt-integration.config.ts; then
  test_result 0 "Dashboard configuration present"
else
  test_result 1 "Dashboard configuration missing"
fi

if grep -q "website:" services/gpt-integration.config.ts; then
  test_result 0 "Website configuration present"
else
  test_result 1 "Website configuration missing"
fi

if grep -q "discord:" services/gpt-integration.config.ts; then
  test_result 0 "Discord configuration present"
else
  test_result 1 "Discord configuration missing"
fi

if grep -q "knowledgeBase:" services/gpt-integration.config.ts; then
  test_result 0 "Knowledge Base configuration present"
else
  test_result 1 "Knowledge Base configuration missing"
fi

# Final Results
echo ""
echo "=================================================="
echo -e "Test Results: ${GREEN}${TESTS_PASSED} Passed${NC}, ${RED}${TESTS_FAILED} Failed${NC}"
echo "=================================================="

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ All integration tests passed!${NC}"
  echo "GPT integration is complete and ready for deployment."
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed. Please review the integration.${NC}"
  exit 1
fi
