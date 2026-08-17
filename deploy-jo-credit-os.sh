#!/bin/bash
# JO CREDIT OS™ - VPS Deployment Script
# Configures nginx to proxy /jo-credit-os/ to localhost:3000

set -e

echo "🚀 JO CREDIT OS™ - VPS Deployment"
echo "=================================="
echo ""

# Step 1: Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ This script must be run with sudo"
  exit 1
fi

echo "✅ Running as root"
echo ""

# Step 2: Create nginx configuration
echo "📝 Creating nginx configuration..."
tee /etc/nginx/sites-available/jo-credit-os > /dev/null << 'EOF'
server {
    listen 443 ssl http2;
    server_name wise2.net;

    ssl_certificate /etc/ssl/certs/wise2.net.crt;
    ssl_certificate_key /etc/ssl/private/wise2.net.key;

    location /jo-credit-os/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect / /jo-credit-os/;
    }
}
EOF
echo "✅ Configuration file created"
echo ""

# Step 3: Enable site
echo "🔗 Enabling nginx site..."
ln -sf /etc/nginx/sites-available/jo-credit-os /etc/nginx/sites-enabled/jo-credit-os
echo "✅ Site enabled"
echo ""

# Step 4: Test configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Configuration syntax valid"
else
    echo "❌ Configuration has errors"
    exit 1
fi
echo ""

# Step 5: Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

# Step 6: Verify app is running
echo "🔍 Verifying PM2 application..."
if pm2 status | grep -q "jo-credit-os-demo.*online"; then
    echo "✅ PM2 application is running"
else
    echo "⚠️  PM2 application status: $(pm2 status | grep jo-credit-os-demo || echo 'Not found')"
fi
echo ""

# Step 7: Test connectivity
echo "🌐 Testing application connectivity..."
if curl -s -H "Host: wise2.net" http://localhost/jo-credit-os/ > /dev/null; then
    echo "✅ Application is accessible via localhost proxy"
else
    echo "⚠️  Could not reach application via proxy"
fi
echo ""

echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "📍 Application URLs:"
echo "   - Direct (local): http://localhost:3000/"
echo "   - Production: https://wise2.net/jo-credit-os/"
echo ""
echo "📊 Available Pages:"
echo "   1. Dashboard - Credit journey progress and metrics"
echo "   2. Credit Audit - Bureau reports and tradeline review"
echo "   3. Cases - Dispute workflow and status tracking"
echo "   4. Action Plan - Client improvement tasks"
echo ""
echo "🐛 Troubleshooting:"
echo "   - Check PM2: pm2 status"
echo "   - View logs: pm2 logs jo-credit-os-demo"
echo "   - Nginx logs: tail -f /var/log/nginx/access.log | grep jo-credit-os"
echo ""
