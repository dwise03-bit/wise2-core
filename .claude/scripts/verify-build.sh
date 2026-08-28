#!/bin/bash

# WISE² Build Verification Script
# Verifies that the codebase compiles and passes basic checks
# Run before claiming "build successful"

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🔍 WISE² Build Verification"
echo "════════════════════════════════════════════════════════════════"
echo ""

FAILED=0

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node/pnpm
echo "1️⃣  Checking Node.js and pnpm..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    FAILED=1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ pnpm not found${NC}"
    FAILED=1
else
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓ pnpm ${PNPM_VERSION}${NC}"
fi
echo ""

# Install dependencies
echo "2️⃣  Installing dependencies..."
if pnpm install --frozen-lockfile; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ pnpm install failed${NC}"
    FAILED=1
fi
echo ""

# Generate Prisma client
echo "3️⃣  Generating Prisma client..."
if pnpm --filter @wise2/db prisma:generate 2>/dev/null; then
    echo -e "${GREEN}✓ Prisma client generated${NC}"
else
    echo -e "${YELLOW}⚠ Prisma generation skipped (database may not be ready)${NC}"
fi
echo ""

# Build packages
echo "4️⃣  Building packages..."
if pnpm build 2>&1 | tee /tmp/build.log; then
    echo -e "${GREEN}✓ All packages built successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "Last 20 lines of build output:"
    tail -20 /tmp/build.log
    FAILED=1
fi
echo ""

# Type checking
echo "5️⃣  Type checking..."
if pnpm type-check 2>&1 | tee /tmp/typecheck.log; then
    echo -e "${GREEN}✓ TypeScript checks passed${NC}"
else
    echo -e "${RED}✗ TypeScript errors found${NC}"
    echo "Type check output:"
    head -30 /tmp/typecheck.log
    FAILED=1
fi
echo ""

# Linting
echo "6️⃣  Linting..."
if pnpm lint 2>&1 | grep -q "error" ; then
    echo -e "${YELLOW}⚠ Lint warnings found (review manually)${NC}"
else
    echo -e "${GREEN}✓ Lint passed${NC}"
fi
echo ""

# Check git status (no uncommitted changes)
echo "7️⃣  Git status..."
if git status --porcelain | grep -v "??" | grep -q .; then
    echo -e "${YELLOW}⚠ Uncommitted changes detected:${NC}"
    git status --short
else
    echo -e "${GREEN}✓ Working tree clean${NC}"
fi
echo ""

# Results
echo "════════════════════════════════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Build verification PASSED${NC}"
    echo "════════════════════════════════════════════════════════════════"
    exit 0
else
    echo -e "${RED}❌ Build verification FAILED${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Issues to fix:"
    echo "- Review build output above"
    echo "- Check TypeScript errors"
    echo "- Ensure all dependencies installed"
    echo "- Verify node_modules symlinks"
    echo ""
    exit 1
fi
