#!/bin/bash
set -e

echo "🚀 Command Center Dashboard - Fast Deployment to wise2.net"
echo "=========================================================="

PRODUCTION_SERVER="173.208.147.165"
PRODUCTION_USER="dwise"
DEPLOY_PATH="/opt/wise2/command-center"

echo "Domain: wise2.net"
echo "Dashboard: https://command.wise2.net"
echo "API: https://api.wise2.net"
echo ""

read -p "Deploy to wise2.net? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

echo "Creating deploy directory on server..."
ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" "sudo mkdir -p $DEPLOY_PATH && sudo chown $PRODUCTION_USER:$PRODUCTION_USER $DEPLOY_PATH"

echo "📤 Uploading source code (excluding node_modules, .next, dist)..."
# Use rsync with exclusions for faster upload
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='.turbo' \
  . "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/" \
  2>&1 | tail -20

echo "✓ Source code uploaded"
echo ""
echo "🔨 Building and starting services on server..."

ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" << 'SERVER_BUILD'
cd /opt/wise2/command-center

echo "Installing dependencies (this may take a few minutes)..."
npm install 2>&1 | tail -5

echo "Building API..."
cd packages/api
npm run build 2>&1 | tail -5
cd ../..

echo "Building frontend..."
cd apps/dashboard
npm run build 2>&1 | tail -5
cd ../..

echo "Stopping old services..."
pkill -f "node.*api" || true
pkill -f "next" || true
sleep 2

echo "Starting API on port 3014..."
cd /opt/wise2/command-center/packages/api
NODE_ENV=production npm start > /var/log/cc-api.log 2>&1 &
sleep 3
echo "✓ API started (PID: $!)"

echo "Starting frontend on port 3015..."
cd /opt/wise2/command-center/apps/dashboard
NODE_ENV=production npm start > /var/log/cc-web.log 2>&1 &
sleep 3
echo "✓ Frontend started (PID: $!)"

sleep 5
echo "✓ Services started and initializing"
SERVER_BUILD

echo ""
echo "⚙️  Configuring nginx with SSL/TLS..."
ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" << 'NGINX_CONFIG'
sudo bash << 'NGINX'
cat > /etc/nginx/sites-available/command-center << 'EOF'
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
    ssl_protocols TLSv1.2 TLSv1.3;

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
    ssl_protocols TLSv1.2 TLSv1.3;

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
echo "✓ Nginx configured and reloaded"
NGINX
NGINX_CONFIG

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "Dashboard: https://command.wise2.net"
echo "API: https://api.wise2.net"
echo ""
echo "View logs:"
echo "  ssh dwise@173.208.147.165 'tail -f /var/log/cc-api.log'"
echo "  ssh dwise@173.208.147.165 'tail -f /var/log/cc-web.log'"
echo ""
echo "Status:"
echo "  ssh dwise@173.208.147.165 'ps aux | grep node'"
echo ""
