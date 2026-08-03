#!/bin/bash
set -e

# WISE² Production Deployment Script
# Manual SSH deployment to production server
# Usage: ./scripts/deploy.sh [server-user@server-host]

SERVER_USER=${1:-dwise}
SERVER_HOST=${2:-173.208.147.165}
SERVER="${SERVER_USER}@${SERVER_HOST}"
SSH_KEY="${HOME}/.ssh/id_ed25519"

echo "🚀 WISE² Production Deployment"
echo "================================"
echo "Server: $SERVER"
echo "SSH Key: $SSH_KEY"
echo ""

# Verify SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

# Verify git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is dirty. Commit or stash changes first."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Not on main branch. Switch to main and try again."
    exit 1
fi

echo "✓ Working directory is clean"
echo "✓ On main branch"
echo ""

# Push to remote
echo "📤 Pushing to GitHub..."
git push origin main
echo "✓ Push complete"
echo ""

# Deploy to server
echo "🔧 Deploying to server..."
echo ""

ssh -i "$SSH_KEY" "$SERVER" << 'EOF'
set -e

echo "📥 Updating code..."
cd /home/dwise/wise2-core
git fetch origin
git checkout main
git pull origin main
echo "✓ Code updated"
echo ""

echo "🛑 Stopping website service..."
docker-compose -f docker-compose.prod.yml stop website 2>/dev/null || true
echo "✓ Website stopped"
echo ""

echo "🗑️  Removing old image..."
docker rmi wise2-core_website:latest 2>/dev/null || true
echo "✓ Old image removed"
echo ""

echo "🔨 Building website (no cache)..."
timeout 600 docker-compose -f docker-compose.prod.yml build website --no-cache 2>&1 | tail -20
echo "✓ Build complete"
echo ""

echo "🚀 Starting website..."
docker-compose -f docker-compose.prod.yml up -d website
echo "✓ Website started"
echo ""

echo "🏥 Waiting for website to be healthy..."
for i in {1..30}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Website is healthy"
    break
  fi
  echo "⏳ Attempt $i/30..."
  sleep 2
done
echo ""

echo "✓ Deployment complete!"
docker-compose -f docker-compose.prod.yml logs website --tail 5
EOF

echo ""
echo "✅ Deployment successful!"
echo "Website is live at: https://wise2.net"
echo ""
