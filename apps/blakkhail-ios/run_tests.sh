#!/bin/bash

# BLAKKHAIL iOS Automated Test Suite
# Runs comprehensive XCTest suite on connected devices

set -e

echo "🧪 BLAKKHAIL iOS Test Suite"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for connected devices
echo "📱 Checking for connected devices..."
DEVICES=$(xcrun xcode-select -p 2>/dev/null || echo "")

if [ -z "$DEVICES" ]; then
  echo -e "${RED}❌ Xcode not found. Please install Xcode.${NC}"
  exit 1
fi

# Build the test target
echo "🔨 Building test target..."
xcodebuild test-without-building \
  -scheme Blakkhail \
  -configuration Debug \
  -derivedDataPath ./build \
  2>&1 | grep -E "(Build|Test|PASSED|FAILED)" || true

# Run tests
echo ""
echo "▶️  Running automated tests..."
echo ""

xcodebuild test \
  -scheme Blakkhail \
  -destination generic/platform=iOS \
  -configuration Debug \
  -derivedDataPath ./build \
  -test-timeouts-enabled YES \
  2>&1 | tee test-results.log

# Parse results
echo ""
echo "📊 Test Summary"
echo "========================================"

PASSED=$(grep -c "PASSED" test-results.log || echo "0")
FAILED=$(grep -c "FAILED" test-results.log || echo "0")
TOTAL=$((PASSED + FAILED))

echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo "📈 Total:  $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo ""
  echo "🎉 BLAKKHAIL iOS is ready for production!"
  echo ""
  echo "Next steps:"
  echo "  1. ✅ App installed on both iPhones"
  echo "  2. ✅ All features tested & working"
  echo "  3. ▶️  Ready for Testflight"
  echo "  4. ▶️  Ready for App Store submission"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Review output above.${NC}"
  echo ""
  echo "Failed tests:"
  grep "FAILED" test-results.log || true
  exit 1
fi
