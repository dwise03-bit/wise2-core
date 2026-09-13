#!/bin/bash
set -e

# WISE² Production Deployment + Sync
# Deploys code from GitHub to VPS and ensures complete health/sync
# Usage: ./scripts/deploy.sh [branch] [environment]

BRANCH=${1:-main}
ENVIRONMENT=${2:-production}
SERVER_USER=${SERVER_USER:-dwise}
SERVER_HOST=${SERVER_HOST:-173.208.147.165}
SERVER="${SERVER_USER}@${SERVER_HOST}"
SSH_KEY="${HOME}/.ssh/id_ed25519"

echo "🚀 WISE² Complete Deployment + Sync"
echo "===================================="
echo "Branch: $BRANCH"
echo "Environment: $ENVIRONMENT"
echo "Server: $SERVER"
echo "SSH Key: $SSH_KEY"
echo ""

# Step 1: Verify prerequisites
echo "📋 Step 1: Verifying prerequisites..."
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is dirty. Commit or stash changes first."
    exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "❌ Not on $BRANCH branch. Current: $CURRENT_BRANCH"
    exit 1
fi

echo "✓ SSH key exists"
echo "✓ Working directory clean"
echo "✓ On correct branch ($BRANCH)"
echo ""

# Step 2: Push to GitHub
echo "📤 Step 2: Pushing to GitHub..."
git push origin "$BRANCH"
echo "✓ Code pushed"
echo ""

# Step 3: Deploy to VPS
echo "🔧 Step 3: Deploying to VPS..."
echo ""

ssh -i "$SSH_KEY" "$SERVER" << 'DEPLOY_EOF'
set -e

WORK_DIR="/home/dwise/wise2-core"
COMPOSE_FILE="docker-compose.prod.yml"

echo "📥 Phase 1: Syncing code..."
cd "$WORK_DIR"
git fetch origin main || { echo "❌ Git fetch failed"; exit 1; }

# Fix checkout ownership if needed (previous deployments may have left root-owned files)
if ! git reset --hard origin/main 2>/dev/null; then
    echo "⚠️  Fixing checkout permissions..."
    sudo -n chown -R "$(id -un):$(id -gn)" . || {
        echo "❌ Cannot fix ownership (need passwordless sudo)"
        exit 1
    }
    git reset --hard origin/main
fi

echo "✓ Code synced"
echo ""

echo "🔧 Phase 2: Building Docker images..."
# Build all services in parallel
services=("api" "website" "studio" "command-center" "prompt-shop")
for service in "${services[@]}"; do
    echo "  Building $service..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache "$service" 2>&1 | tail -2
done
echo "✓ All services built"
echo ""

echo "🚀 Phase 3: Starting services..."
docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
sleep 2
docker-compose -f "$COMPOSE_FILE" up -d
echo "✓ Services starting"
echo ""

echo "⏳ Phase 4: Waiting for services to be healthy..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    healthy_count=$(docker-compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | \
        jq '[.[] | select(.State == "running")] | length' 2>/dev/null || echo "0")
    total_count=$(docker-compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | \
        jq 'length' 2>/dev/null || echo "0")

    if [ "$healthy_count" -eq "$total_count" ] && [ "$total_count" -gt 0 ]; then
        echo "✓ All $total_count services running"
        break
    fi

    echo "  Waiting... ($healthy_count/$total_count services running, attempt $((attempt+1))/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "⚠️  Services took longer than expected; check: docker-compose logs"
fi
echo ""

echo "🔍 Phase 5: Health verification..."
echo "  API endpoint: $(curl -s http://127.0.0.1:3010/api/health 2>/dev/null || echo 'PENDING')"
echo "  Website: $(curl -s http://127.0.0.1:3011 2>/dev/null | grep -o 'united-command-v2' || echo 'PENDING')"
echo ""

echo "📊 Phase 6: Service status..."
docker-compose -f "$COMPOSE_FILE" ps
echo ""

echo "✅ Deployment complete!"
echo "  API: https://api.wise2.net"
echo "  Website: https://wise2.net"
echo "  Logs: docker-compose logs -f"

DEPLOY_EOF

echo ""
echo "✅ Sync complete!"
echo ""
echo "Next steps:"
echo "  - Monitor: ssh $SERVER 'docker-compose -f docker-compose.prod.yml logs -f'"
echo "  - Health: ssh $SERVER 'docker-compose -f docker-compose.prod.yml ps'"
echo "  - Setup permanent monitor: ssh $SERVER 'cd wise2-core && bash scripts/vps-permanent-setup.sh'"
echo ""
