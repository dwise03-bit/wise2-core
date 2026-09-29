#!/bin/bash
set -e

# Command Center Dashboard - Simple Deployment to wise2.net
# Uploads source code to server, lets server handle the build

echo "🚀 Command Center Dashboard - Deploying to wise2.net"
echo "====================================================="

DOMAIN="wise2.net"
PRODUCTION_SERVER="173.208.147.165"
PRODUCTION_USER="dwise"
DEPLOY_PATH="/opt/wise2/command-center"
API_PORT="3014"
WEB_PORT="3015"
API_DOMAIN="api.wise2.net"
COMMAND_CENTER_DOMAIN="command.wise2.net"

echo "Domain: $DOMAIN"
echo "Dashboard: https://$COMMAND_CENTER_DOMAIN"
echo "API: https://$API_DOMAIN"
echo ""

read -p "Deploy to $DOMAIN? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

echo "📤 Uploading source code to $PRODUCTION_SERVER..."

# Create remote directory
ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" "mkdir -p $DEPLOY_PATH"

# Upload entire project (git will be available on server)
scp -r . "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/" || {
  echo "✗ Upload failed"
  exit 1
}

echo "✓ Source code uploaded"

echo ""
echo "🔨 Building and starting on server..."

# Build and start services on server
ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" bash << 'SERVER_BUILD'
cd /opt/wise2/command-center

echo "Installing dependencies..."
npm install

echo "Building API..."
cd packages/api
npm run build
cd ../..

echo "Building frontend..."
cd apps/dashboard
npm run build
cd ../..

echo "Stopping old services..."
pkill -f "node.*api" || true
pkill -f "next" || true
sleep 2

echo "Starting API on port 3014..."
cd /opt/wise2/command-center/packages/api
NODE_ENV=production npm start > /var/log/cc-api.log 2>&1 &

echo "Starting frontend on port 3015..."
cd /opt/wise2/command-center/apps/dashboard
NODE_ENV=production npm start > /var/log/cc-web.log 2>&1 &

sleep 5

echo "✓ Services started"

# Configure nginx
echo "Configuring nginx..."
sudo bash << 'NGINX_CONFIG'
cat > /etc/nginx/sites-available/command-center << 'EOF'
# Command Center Dashboard - wise2.net

server {
    listen 80;
    server_name command.wise2.net api.wise2.net;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.wise2.net;
    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;

    location / {
        proxy_pass http://localhost:3014;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name command.wise2.net;
    ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;

    location / {
        proxy_pass http://localhost:3015;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/command-center /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "✓ Nginx configured"
NGINX_CONFIG

SERVER_BUILD

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Dashboard: https://$COMMAND_CENTER_DOMAIN"
echo "API: https://$API_DOMAIN"
echo ""
echo "View logs:"
echo "  ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'tail -f /var/log/cc-api.log'"
echo "  ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'tail -f /var/log/cc-web.log'"
echo ""
