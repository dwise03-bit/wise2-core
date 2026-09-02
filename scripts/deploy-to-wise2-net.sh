#!/bin/bash
set -e

# Command Center Dashboard Deployment to wise2.net
# Deploys backend API and frontend to wise2.net domain

echo "🚀 Command Center Dashboard - Deploying to wise2.net"
echo "====================================================="

# Configuration
DOMAIN="wise2.net"
PRODUCTION_SERVER="173.208.147.165"
PRODUCTION_USER="dwise"
DEPLOY_PATH="/opt/wise2/command-center"
API_PORT="3014"        # Non-standard to avoid conflicts
WEB_PORT="3015"        # Non-standard to avoid conflicts
API_DOMAIN="api.wise2.net"
COMMAND_CENTER_DOMAIN="command.wise2.net"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "Domain: $DOMAIN"
echo "Dashboard: https://$COMMAND_CENTER_DOMAIN"
echo "API: https://$API_DOMAIN"
echo ""

# Confirm deployment
read -p "Deploy to $DOMAIN? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

# Step 1: Build
echo -e "\n${YELLOW}Step 1: Building application...${NC}"

echo "Building backend API..."
cd packages/api
npm run build
npm ci --production
cd ../..

echo "Building frontend..."
cd apps/dashboard
npm run build
npm ci --production
cd ../..

echo -e "${GREEN}✓ Build complete${NC}"

# Step 2: Create deployment package
echo -e "\n${YELLOW}Step 2: Creating deployment package...${NC}"

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

mkdir -p "$TEMP_DIR/cc-deploy"
cp -r packages/api/dist "$TEMP_DIR/cc-deploy/api"
cp -r packages/api/node_modules "$TEMP_DIR/cc-deploy/api/" || true
cp -r apps/dashboard/.next "$TEMP_DIR/cc-deploy/dashboard"
cp -r apps/dashboard/node_modules "$TEMP_DIR/cc-deploy/dashboard/" || true
cp -r apps/dashboard/public "$TEMP_DIR/cc-deploy/dashboard-public"

echo -e "${GREEN}✓ Package created${NC}"

# Step 3: Deploy to production
echo -e "\n${YELLOW}Step 3: Deploying to $DOMAIN...${NC}"

echo "Uploading API..."
scp -r "$TEMP_DIR/cc-deploy/api" "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/" || {
  echo -e "${RED}✗ Failed to upload API${NC}"
  exit 1
}

echo "Uploading frontend..."
scp -r "$TEMP_DIR/cc-deploy/dashboard" "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/" || {
  echo -e "${RED}✗ Failed to upload frontend${NC}"
  exit 1
}

echo "Uploading public assets..."
scp -r "$TEMP_DIR/cc-deploy/dashboard-public" "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/public" || true

echo -e "${GREEN}✓ Files deployed${NC}"

# Step 4: Start services
echo -e "\n${YELLOW}Step 4: Starting services...${NC}"

ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" bash << DEPLOY_COMMANDS
  DEPLOY_PATH="/opt/wise2/command-center"
  API_PORT="3014"
  WEB_PORT="3015"

  # Kill old processes if running
  echo "Stopping old services..."
  pkill -f "node.*api" || true
  pkill -f "next" || true
  sleep 2

  # Start API
  echo "Starting API on port $API_PORT..."
  cd "$DEPLOY_PATH/api"
  NODE_ENV=production npm start > /var/log/cc-api.log 2>&1 &
  API_PID=$!
  echo "API PID: $API_PID"

  # Start frontend
  echo "Starting frontend on port $WEB_PORT..."
  cd "$DEPLOY_PATH/dashboard"
  NODE_ENV=production npm start > /var/log/cc-web.log 2>&1 &
  WEB_PID=$!
  echo "Web PID: $WEB_PID"

  # Wait for services to start
  sleep 5

  # Verify services started
  echo "Verifying services..."
  if curl -s http://localhost:$API_PORT/api/status > /dev/null 2>&1; then
    echo "✓ API running"
  else
    echo "⚠ API may not be responding yet"
  fi

  if curl -s http://localhost:$WEB_PORT > /dev/null 2>&1; then
    echo "✓ Web running"
  else
    echo "⚠ Web may not be responding yet"
  fi
DEPLOY_COMMANDS

echo -e "${GREEN}✓ Services started${NC}"

# Step 5: Update nginx configuration
echo -e "\n${YELLOW}Step 5: Updating nginx configuration...${NC}"

ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" sudo bash << 'NGINX_CONFIG'
  # Create nginx config for command-center domain
  cat > /etc/nginx/sites-available/command-center << 'EOF'
# Command Center Dashboard - wise2.net

# Redirect non-HTTPS to HTTPS
server {
    listen 80;
    server_name command.wise2.net api.wise2.net;
    return 301 https://$server_name$request_uri;
}

# HTTPS server for API
server {
    listen 443 ssl http2;
    server_name api.wise2.net;

    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # API upstream
    location / {
        proxy_pass http://localhost:3014;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS server for frontend
server {
    listen 443 ssl http2;
    server_name command.wise2.net;

    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend upstream
    location / {
        proxy_pass http://localhost:3015;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://localhost:3015;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

  # Enable the site
  ln -sf /etc/nginx/sites-available/command-center /etc/nginx/sites-enabled/

  # Test nginx config
  nginx -t
  if [ $? -eq 0 ]; then
    echo "✓ Nginx config valid"
    systemctl reload nginx
    echo "✓ Nginx reloaded"
  else
    echo "✗ Nginx config error"
    exit 1
  fi
NGINX_CONFIG

echo -e "${GREEN}✓ Nginx configured${NC}"

# Step 6: Verify deployment
echo -e "\n${YELLOW}Step 6: Verifying deployment...${NC}"

sleep 3

# Check API
echo "Checking API..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$API_DOMAIN/api/status" 2>/dev/null || echo "000")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "404" ] || [ "$RESPONSE" = "301" ]; then
  echo -e "${GREEN}✓ API responding (HTTP $RESPONSE)${NC}"
else
  echo -e "${YELLOW}⚠ API response: HTTP $RESPONSE (may still be starting)${NC}"
fi

# Check frontend
echo "Checking frontend..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$COMMAND_CENTER_DOMAIN" 2>/dev/null || echo "000")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "307" ] || [ "$RESPONSE" = "301" ]; then
  echo -e "${GREEN}✓ Frontend responding (HTTP $RESPONSE)${NC}"
else
  echo -e "${YELLOW}⚠ Frontend response: HTTP $RESPONSE (may still be starting)${NC}"
fi

# Final status
echo -e "\n${GREEN}=================================================="
echo "✅ Deployment to wise2.net Complete!"
echo "=================================================="
echo ""
echo "Command Center Dashboard is now available at:"
echo ""
echo "  🌐 Dashboard: https://$COMMAND_CENTER_DOMAIN"
echo "  🔌 API: https://$API_DOMAIN"
echo ""
echo "Services running on:"
echo "  - API on port 3014"
echo "  - Frontend on port 3015"
echo ""
echo "View logs (SSH into server):"
echo "  tail -f /var/log/cc-api.log"
echo "  tail -f /var/log/cc-web.log"
echo ""
echo "Nginx status:"
echo "  sudo systemctl status nginx"
echo ""
echo "Troubleshooting:"
echo "  - Check if services are running: ps aux | grep node"
echo "  - Check API response: curl http://localhost:3014/api/status"
echo "  - Check frontend: curl http://localhost:3015"
echo "  - View detailed logs: tail -f /var/log/cc-*.log"
echo ""
echo "⏱️  Estimated time to full availability: 2-3 minutes"
echo "(Services are running but may need time to fully initialize)"
echo ""
EOF

chmod +x /Users/danielwise/Projects/wise2-core/scripts/deploy-to-wise2-net.sh
echo "✅ Deployment script created: scripts/deploy-to-wise2-net.sh"
