#!/bin/bash
# SENCERE Brand Spelling Validator
# Ensures "BLAKK HAIL" is spelled correctly throughout the website.
# Allows internal code identifiers (BLAKKHAIL_*, blakkhail-legacy) but enforces correct user-facing display.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WEBSITE_DIR="$PROJECT_ROOT/apps/website"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating SENCERE brand spelling..."
echo ""

# Track findings
ISSUES_FOUND=0

# Check 1: User-facing BLAKKHAIL display names (exclude variable names starting with BLAKKHAIL_)
echo "Checking display names..."
DISPLAY_ISSUES=$(grep -r "'BLAKKHAIL'" "$WEBSITE_DIR" \
  --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
  --exclude-dir=.next --exclude-dir=node_modules \
  2>/dev/null || echo "")

if [ -n "$DISPLAY_ISSUES" ]; then
  echo -e "${RED}❌ FAIL: Found user-facing 'BLAKKHAIL' string literal (should be 'BLAKK HAIL'):${NC}"
  echo "$DISPLAY_ISSUES"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}✅ PASS: Display names correct${NC}"
fi

# Check 2: Verify correct spelling exists
echo "Checking correct spelling used..."
CORRECT=$(grep -r "BLAKK HAIL" "$WEBSITE_DIR" \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=.next --exclude-dir=node_modules \
  2>/dev/null || echo "")

if [ -z "$CORRECT" ]; then
  echo -e "${YELLOW}⚠️  WARNING: No 'BLAKK HAIL' found (check if branding is present)${NC}"
else
  echo -e "${GREEN}✅ PASS: Correct spelling 'BLAKK HAIL' is used${NC}"
fi

# Check 3: Verify legacy identifiers are properly sourced
echo "Checking legacy identifiers properly sourced..."
# Ensure BLAKKHAIL_LEGACY is imported from blakkhail-legacy.ts
MISSING_IMPORT=$(find "$WEBSITE_DIR/components/sencere/blakkhail" -name "*.tsx" -o -name "*.ts" \
  | xargs grep -l "BLAKKHAIL_LEGACY" 2>/dev/null \
  | xargs grep -L "from.*blakkhail-legacy" \
  | xargs grep -L "import.*BLAKKHAIL_LEGACY" 2>/dev/null || echo "")

if [ -n "$MISSING_IMPORT" ]; then
  echo -e "${YELLOW}⚠️  WARNING: Some files use BLAKKHAIL_LEGACY without importing it${NC}"
  echo "$MISSING_IMPORT"
else
  echo -e "${GREEN}✅ PASS: Legacy identifiers properly imported${NC}"
fi

echo ""
echo "---"
echo ""

# Summary
if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ BRAND SPELLING VALIDATION PASSED${NC}"
  echo "The website correctly uses 'BLAKK HAIL' for user-facing display."
  exit 0
else
  echo -e "${RED}❌ BRAND SPELLING VALIDATION FAILED${NC}"
  echo "Fix the issues above before proceeding to production."
  exit 1
fi
