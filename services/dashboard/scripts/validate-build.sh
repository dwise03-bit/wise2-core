#!/bin/bash
set -e

echo "🔍 Running build validation..."
echo ""

echo "✓ Checking TypeScript..."
npm run type-check

echo "✓ Checking code style..."
npm run lint

echo "✓ Checking formatting..."
npm run format:check

echo "✓ Running tests..."
npm test

echo "✓ Building API..."
cd services/dashboard/services/api
npm run build
cd ../../../

echo "✓ Building Dashboard..."
cd services/dashboard/services/dashboard
npm run build
cd ../../../

echo "✓ Verifying Docker builds..."
docker-compose -f docker-compose.dev.yml build --no-cache

echo ""
echo "✅ ALL VALIDATIONS PASSED"
echo ""
echo "Safe to commit and push!"
