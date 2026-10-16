#!/bin/bash
set -euo pipefail

# WISE² Ultimate Hub Deployment Script
# Usage: ./deploy.sh
# Deploys to gpu-nmls-1 via Tailscale SSH

REMOTE_HOST="gpu-nmls-1"
REMOTE_USER="wise2ops"
DEPLOY_DIR="/opt/wise2-ultimate-hub"
LOCAL_REPO=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

echo "🚀 WISE² Ultimate Hub Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Source: $LOCAL_REPO"
echo "🎯 Target: https://${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_DIR}"
echo ""

# Step 1: Verify Tailscale connection
echo "1⃣ Verifying Tailscale connection..."
if ! tailscale status --self 2>/dev/null | grep -q "connected"; then
  echo "❌ Tailscale not connected"
  exit 1
fi
echo "✅ Tailscale connected"

# Step 2: Test SSH connection
echo ""
echo "2⃣ Testing SSH connection..."
if ! timeout 5 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new \
    "${REMOTE_USER}@${REMOTE_HOST}" echo "✅ SSH working" 2>&1 | grep -q "✅"; then
  echo "❌ SSH connection failed"
  exit 1
fi
echo "✅ SSH connection working"

# Step 3: Deploy via SSH
echo ""
echo "3⃣ Deploying Ultimate Hub..."
ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${REMOTE_HOST}" bash -s <<'REMOTE_SCRIPT'
set -euo pipefail

DEPLOY_DIR="/opt/wise2-ultimate-hub"

echo "   📦 Setting up deployment directory..."
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

echo "   📥 Pulling latest code from GitHub..."
if [ -d .git ]; then
  git pull origin main 2>&1 | tail -3
else
  git clone https://github.com/dwise03-bit/wise2-core.git . 2>&1 | tail -1
fi

echo "   📚 Installing dependencies..."
cd apps/ultimate-hub
npm install --production 2>&1 | tail -3

echo "   ✅ Deployment complete"
REMOTE_SCRIPT

# Step 4: Start/restart the service
echo ""
echo "4⃣ Starting Ultimate Hub service..."
ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${REMOTE_HOST}" bash -s <<'REMOTE_SERVICE'
set -euo pipefail

DEPLOY_DIR="/opt/wise2-ultimate-hub/apps/ultimate-hub"
PORT=8765

# Check if npm process is running and kill it
if pgrep -f "node.*server.js" > /dev/null; then
  echo "   🛑 Stopping old process..."
  pkill -f "node.*server.js" || true
  sleep 2
fi

echo "   🚀 Starting npm service..."
cd "$DEPLOY_DIR"
nohup npm start > /tmp/ultimate-hub.log 2>&1 &

# Wait for service to start
sleep 3

if pgrep -f "node.*server.js" > /dev/null; then
  echo "   ✅ Service started (PID: $(pgrep -f 'node.*server.js'))"
else
  echo "   ❌ Service failed to start"
  tail /tmp/ultimate-hub.log
  exit 1
fi
REMOTE_SERVICE

# Step 5: Configure Nginx
echo ""
echo "5⃣ Configuring Nginx routing..."
ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${REMOTE_HOST}" bash -s <<'REMOTE_NGINX'
set -euo pipefail

CONFIG="/etc/nginx/sites-enabled/wise2.net.conf"
MARKER="WISE2 ULTIMATE HUB"
PORT=8765

if [ ! -f "$CONFIG" ]; then
  echo "   ⚠️  Nginx config not found at $CONFIG"
  exit 0
fi

BACKUP="/etc/nginx/backups/wise2.net.conf.$(date -u +%Y%m%dT%H%M%SZ)"
sudo cp "$CONFIG" "$BACKUP"

if ! sudo grep -q "$MARKER" "$CONFIG"; then
  echo "   📝 Adding Ultimate Hub route to Nginx..."

  ROUTE_TEMP=$(mktemp)
  cat > "$ROUTE_TEMP" <<'EOF'
# WISE2 ULTIMATE HUB
location = /hive {
    return 301 /hive/;
}

location ^~ /hive/ {
    proxy_pass http://localhost:8765/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ^~ /hive/api/ {
    proxy_pass http://localhost:8765/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
EOF

  # Merge with existing config
  TEMP_CONF=$(mktemp)
  awk -v route_file="$ROUTE_TEMP" '
    /server_name wise2\.net www\.wise2\.net;/ {
      seen += 1
      print
      if (seen == 1) {
        while ((getline line < route_file) > 0) print line
        close(route_file)
      }
      next
    }
    { print }
  ' "$CONFIG" > "$TEMP_CONF"

  sudo cp "$TEMP_CONF" "$CONFIG"
  rm -f "$ROUTE_TEMP" "$TEMP_CONF"
  echo "   ✅ Route added"
else
  echo "   ℹ️  Route already configured"
fi

# Test and reload Nginx
if ! sudo nginx -t 2>&1 | grep -q "successful"; then
  echo "   ❌ Nginx config error"
  sudo cp "$BACKUP" "$CONFIG"
  exit 1
fi

echo "   🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "   ✅ Nginx configured"
REMOTE_NGINX

# Step 6: Verify deployment
echo ""
echo "6⃣ Verifying deployment..."
echo "   🌐 Checking application health..."

# Wait a moment for DNS propagation
sleep 2

# Test via localhost first (via SSH)
if ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${REMOTE_HOST}" \
    "curl -s http://localhost:8765/api/health | grep -q health_score" 2>/dev/null; then
  echo "   ✅ Application is responding"
else
  echo "   ⚠️  Application not responding yet (may need more time)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access the Ultimate Hub at:"
echo "   https://wise2.net/hive"
echo ""
echo "📊 API Endpoints:"
echo "   https://wise2.net/hive/api/health      - Health check"
echo "   https://wise2.net/hive/api/metrics     - System metrics"
echo "   https://wise2.net/hive/api/alerts      - Active alerts"
echo ""
echo "Enjoy your WISE² Ultimate Hub! 🚀"
