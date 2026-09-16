#!/bin/bash
set -e

# WISE² Production Deployment + Sync
# Deploys code from GitHub to VPS and ensures complete health/sync
# Usage: ./scripts/deploy.sh [deployment-mode]
# deployment-mode: "website-only" (default) or "production"

DEPLOY_MODE=${1:-website-only}
SERVER_USER=${SERVER_USER:-dwise}
SERVER_HOST=${SERVER_HOST:-173.208.147.165}
SERVER="${SERVER_USER}@${SERVER_HOST}"
SSH_KEY="${HOME}/.ssh/id_ed25519"

echo "🚀 WISE² Production Deployment"
echo "=============================="
echo "Deployment mode: $DEPLOY_MODE"
echo "Server: $SERVER"
echo "SSH Key: $SSH_KEY"
echo ""

# Step 1: Validate deployment mode
if [ "$DEPLOY_MODE" != "website-only" ] && [ "$DEPLOY_MODE" != "production" ]; then
    echo "❌ Invalid deployment mode: $DEPLOY_MODE"
    echo "   Valid modes: website-only (default) or production"
    exit 1
fi
echo "✓ Deployment mode valid: $DEPLOY_MODE"
echo ""

# Step 2: Deploy to VPS (no SSH key check here; assuming SSH is available via GitHub Actions)
echo "🔧 Deploying to VPS..."
echo ""

ssh -i "$SSH_KEY" "$SERVER" << DEPLOY_EOF
set -e

WORK_DIR="/home/dwise/wise2-core"
COMPOSE_FILE="docker-compose.prod.yml"
DEPLOY_MODE="$DEPLOY_MODE"

echo "📥 Phase 1: Syncing code..."
cd "\$WORK_DIR"
git fetch origin main || { echo "❌ Git fetch failed"; exit 1; }
git reset --hard origin/main || { echo "❌ Git reset failed"; exit 1; }
echo "✓ Code synced"
echo ""

if [ "\$DEPLOY_MODE" = "website-only" ]; then
  echo "🔧 Phase 2: Website-only deployment (rebuilding website service only)..."
  docker-compose -f "\$COMPOSE_FILE" build --no-cache website 2>&1 | tail -5
  docker-compose -f "\$COMPOSE_FILE" up -d website
  echo "✓ Website service rebuilt and restarted"
  echo ""

  echo "⏳ Phase 3: Waiting for website service to be healthy..."
  max_attempts=30
  attempt=0
  while [ \$attempt -lt \$max_attempts ]; do
    if docker-compose -f "\$COMPOSE_FILE" ps website | grep -q "running"; then
      echo "✓ Website service running"
      break
    fi
    echo "  Waiting... (attempt \$((attempt+1))/\$max_attempts)"
    sleep 2
    attempt=\$((attempt + 1))
  done

else
  echo "🔧 Phase 2: Full production deployment (rebuilding all services)..."
  services=("api" "website" "studio" "command-center" "prompt-shop")
  for service in "\${services[@]}"; do
    echo "  Building \$service..."
    docker-compose -f "\$COMPOSE_FILE" build --no-cache "\$service" 2>&1 | tail -2
  done
  echo "✓ All services built"
  echo ""

  echo "🚀 Phase 3: Starting all services..."
  docker-compose -f "\$COMPOSE_FILE" down 2>/dev/null || true
  sleep 2
  docker-compose -f "\$COMPOSE_FILE" up -d
  echo "✓ Services starting"
  echo ""

  echo "⏳ Phase 4: Waiting for services to be healthy..."
  max_attempts=60
  attempt=0
  while [ \$attempt -lt \$max_attempts ]; do
    healthy_count=\$(docker-compose -f "\$COMPOSE_FILE" ps --format json 2>/dev/null | \
        jq '[.[] | select(.State == "running")] | length' 2>/dev/null || echo "0")
    total_count=\$(docker-compose -f "\$COMPOSE_FILE" ps --format json 2>/dev/null | \
        jq 'length' 2>/dev/null || echo "0")

    if [ "\$healthy_count" -eq "\$total_count" ] && [ "\$total_count" -gt 0 ]; then
      echo "✓ All \$total_count services running"
      break
    fi

    echo "  Waiting... (\$healthy_count/\$total_count services running, attempt \$((attempt+1))/\$max_attempts)"
    sleep 2
    attempt=\$((attempt + 1))
  done
fi

echo ""
echo "📊 Phase 5: Service status..."
docker-compose -f "\$COMPOSE_FILE" ps
echo ""

echo "✅ Deployment complete!"
echo "  Website: https://wise2.net"
echo "  Logs: docker-compose logs -f"

DEPLOY_EOF

echo ""
echo "✅ Deployment successful!"
echo ""
