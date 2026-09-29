#!/bin/bash

# Verification script for Suno + OBS API build

echo "========================================="
echo "API Build Verification"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

errors=0

# Check API route files
echo "Checking API route handlers..."
routes=(
  "app/api/suno/generate/route.ts"
  "app/api/suno/status/[id]/route.ts"
  "app/api/suno/history/route.ts"
  "app/api/suno/export/[id]/route.ts"
  "app/api/obs/scenes/route.ts"
  "app/api/obs/scenes/[id]/route.ts"
  "app/api/obs/scenes/[id]/sources/route.ts"
  "app/api/obs/stream/start/route.ts"
  "app/api/obs/stream/stop/route.ts"
  "app/api/obs/stats/route.ts"
)

for route in "${routes[@]}"; do
  if [ -f "$route" ]; then
    echo -e "${GREEN}✓${NC} $route"
  else
    echo -e "${RED}✗${NC} $route"
    ((errors++))
  fi
done

echo ""
echo "Checking library files..."
libs=(
  "lib/api-middleware.ts"
  "lib/suno-client.ts"
  "lib/obs-client.ts"
)

for lib in "${libs[@]}"; do
  if [ -f "$lib" ]; then
    echo -e "${GREEN}✓${NC} $lib"
  else
    echo -e "${RED}✗${NC} $lib"
    ((errors++))
  fi
done

echo ""
echo "Checking type definitions..."
if [ -f "types/api.ts" ]; then
  echo -e "${GREEN}✓${NC} types/api.ts"
else
  echo -e "${RED}✗${NC} types/api.ts"
  ((errors++))
fi

echo ""
echo "Checking documentation..."
docs=(
  "API_DOCUMENTATION.md"
  "API_IMPLEMENTATION.md"
  "API_QUICK_REFERENCE.md"
  "API_FRONTEND_INTEGRATION.md"
  "API_SUMMARY.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    lines=$(wc -l < "$doc")
    echo -e "${GREEN}✓${NC} $doc ($lines lines)"
  else
    echo -e "${RED}✗${NC} $doc"
    ((errors++))
  fi
done

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo "API Routes: ${#routes[@]}"
echo "Libraries: ${#libs[@]}"
echo "Documentation: ${#docs[@]}"
echo ""

if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✓ All files present and accounted for!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Read API_DOCUMENTATION.md for endpoint reference"
  echo "2. Read API_IMPLEMENTATION.md for integration guide"
  echo "3. Create .env.local with SUNO_API_KEY and OBS_* settings"
  echo "4. Test endpoints with: npm run dev"
  echo ""
  echo "Quick test:"
  echo "  curl http://localhost:3005/api/obs/scenes -H 'Authorization: Bearer YOUR_TOKEN'"
else
  echo -e "${RED}✗ $errors file(s) missing${NC}"
  exit 1
fi
