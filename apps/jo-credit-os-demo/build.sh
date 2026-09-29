#!/bin/bash
set -e

echo "🔨 Building WISE² JO Credit OS Demo..."

# Navigate to workspace root
cd ../..

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile || pnpm install

# Build the demo app
echo "🏗️ Building demo app..."
pnpm --filter @wise2/jo-credit-os-demo build

# Copy output to expected location
echo "📍 Copying build output..."
cp -r apps/jo-credit-os-demo/.next apps/jo-credit-os-demo/.next.bak 2>/dev/null || true

echo "✅ Build complete!"
