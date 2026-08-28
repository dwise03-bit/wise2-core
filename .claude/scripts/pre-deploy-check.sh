#!/bin/bash

# WISE² Pre-Deployment Checklist
# Run before any deployment to catch issues early

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🚀 WISE² Pre-Deployment Checklist"
echo "════════════════════════════════════════════════════════════════"
echo ""

FAILED=0
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Git status
echo "1️⃣  Verifying git repository..."
if [ -z "$(git status --porcelain | grep -v '??' | head -5)" ]; then
    echo -e "${GREEN}✓ Working tree clean${NC}"
else
    echo -e "${RED}✗ Uncommitted changes detected${NC}"
    git status --short
    FAILED=1
fi
echo ""

# 2. On correct branch
echo "2️⃣  Checking git branch..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" == "claude/wise2-claude-code-install-"* ]]; then
    echo -e "${GREEN}✓ On development branch: $CURRENT_BRANCH${NC}"
elif [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo -e "${YELLOW}⚠ On main branch (careful!)${NC}"
else
    echo -e "${YELLOW}⚠ On unexpected branch: $CURRENT_BRANCH${NC}"
fi
echo ""

# 3. Remote tracking
echo "3️⃣  Checking git remote..."
if git ls-remote --exit-code origin > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Remote 'origin' reachable${NC}"
else
    echo -e "${RED}✗ Cannot reach remote${NC}"
    FAILED=1
fi
echo ""

# 4. Build verification
echo "4️⃣  Running build verification..."
if bash .claude/scripts/verify-build.sh 2>&1 | tail -5; then
    echo -e "${GREEN}✓ Build verification passed${NC}"
else
    echo -e "${RED}✗ Build verification failed${NC}"
    FAILED=1
fi
echo ""

# 5. Check for secrets
echo "5️⃣  Scanning for hardcoded secrets..."
if git diff --cached | grep -E "(password|secret|token|key)\s*[=:]" 2>/dev/null; then
    echo -e "${RED}✗ Possible secrets found in diff${NC}"
    FAILED=1
else
    echo -e "${GREEN}✓ No obvious secrets in diff${NC}"
fi
echo ""

# 6. Docker installation
echo "6️⃣  Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker installed: $DOCKER_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Docker not found (needed for deployment)${NC}"
fi
echo ""

# 7. Docker-compose
echo "7️⃣  Checking docker-compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓ docker-compose: $COMPOSE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ docker-compose not found${NC}"
fi
echo ""

# 8. Validate docker-compose.production.yml
echo "8️⃣  Validating docker-compose.production.yml..."
if command -v docker-compose &> /dev/null; then
    if docker-compose -f docker-compose.production.yml config > /dev/null 2>&1; then
        echo -e "${GREEN}✓ docker-compose.production.yml is valid${NC}"
    else
        echo -e "${RED}✗ docker-compose.production.yml has errors${NC}"
        docker-compose -f docker-compose.production.yml config 2>&1 | head -10
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠ Skipping docker-compose validation${NC}"
fi
echo ""

# 9. Environment files
echo "9️⃣  Checking environment files..."
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✓ .env.production exists${NC}"
    # Check for required variables
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "API_URL")
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" .env.production 2>/dev/null; then
            echo -e "${GREEN}  ✓ ${VAR} configured${NC}"
        else
            echo -e "${YELLOW}  ⚠ ${VAR} not found (may be optional)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠ .env.production not found (needed for deployment)${NC}"
fi
echo ""

# 10. Disk space (if Docker available)
echo "🔟 Checking available disk space..."
if command -v df &> /dev/null; then
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
    DISK_AVAILABLE=$(df -h / | awk 'NR==2 {print $4}')
    echo -e "Disk usage: $DISK_USAGE, Available: $DISK_AVAILABLE"

    # Check if less than 5GB available
    AVAIL_GB=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
    if [ $AVAIL_GB -lt 5 ]; then
        echo -e "${RED}✗ Less than 5GB disk available${NC}"
        FAILED=1
    else
        echo -e "${GREEN}✓ Sufficient disk space${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Cannot check disk space${NC}"
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Pre-deployment checks PASSED${NC}"
    echo -e "${BLUE}Ready to deploy to production${NC}"
    echo "════════════════════════════════════════════════════════════════"
    exit 0
else
    echo -e "${RED}❌ Pre-deployment checks FAILED${NC}"
    echo -e "${YELLOW}Please fix the issues above before deploying${NC}"
    echo "════════════════════════════════════════════════════════════════"
    exit 1
fi
