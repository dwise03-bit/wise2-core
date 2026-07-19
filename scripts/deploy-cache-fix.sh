#!/bin/bash
# Deploy nginx cache-busting fix to production
# Fixes browser caching issue causing hydration mismatch on wise2.net

set -e  # Exit on error

echo "=== WISE² Nginx Cache-Busting Deployment ==="
echo "Target: 173.208.147.165 (gpu-nmls)"
echo ""

# Configuration
SERVER="173.208.147.165"
USER="dwise"
CONFIG_LOCAL="./config/nginx.conf"
CONFIG_REMOTE="/etc/nginx/conf.d/default.conf"
BACKUP_DIR="/etc/nginx/backups"

# Verify local config exists
if [ ! -f "$CONFIG_LOCAL" ]; then
    echo "ERROR: Local nginx config not found at $CONFIG_LOCAL"
    exit 1
fi

echo "Step 1: Backup current nginx config on production server..."
ssh "${USER}@${SERVER}" "
    echo 'Creating backup directory...'
    sudo mkdir -p $BACKUP_DIR

    echo 'Backing up current config...'
    sudo cp $CONFIG_REMOTE $BACKUP_DIR/default.conf.\$(date +%Y%m%d_%H%M%S).bak

    echo 'Backup complete.'
    ls -lah $BACKUP_DIR | tail -3
"

echo ""
echo "Step 2: Copy updated nginx config to production..."
scp "$CONFIG_LOCAL" "${USER}@${SERVER}:/tmp/nginx.conf.new"

echo ""
echo "Step 3: Test nginx config syntax..."
ssh "${USER}@${SERVER}" "
    echo 'Testing new nginx config...'
    sudo nginx -t -c /tmp/nginx.conf.new

    if [ \$? -ne 0 ]; then
        echo 'ERROR: Nginx config test failed. Aborting deployment.'
        exit 1
    fi

    echo 'Config syntax: OK'
"

echo ""
echo "Step 4: Deploy new config and reload nginx..."
ssh "${USER}@${SERVER}" "
    echo 'Deploying new config...'
    sudo cp /tmp/nginx.conf.new $CONFIG_REMOTE

    echo 'Reloading nginx (zero-downtime)...'
    sudo systemctl reload nginx

    if [ \$? -ne 0 ]; then
        echo 'ERROR: Nginx reload failed. Rolling back...'
        sudo cp $BACKUP_DIR/default.conf.*.bak $CONFIG_REMOTE
        sudo systemctl reload nginx
        exit 1
    fi

    echo 'Nginx reload: SUCCESS'
"

echo ""
echo "Step 5: Verify deployment..."
ssh "${USER}@${SERVER}" "
    echo 'Checking nginx status...'
    sudo systemctl status nginx --no-pager | head -10

    echo ''
    echo 'Testing wise2.net endpoint...'
    curl -I -s https://wise2.net | head -5
"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Summary:"
echo "  - Updated cache headers for _next/static/chunks/ (1 year cache)"
echo "  - Updated cache headers for _next/static/ (1 year cache)"
echo "  - HTML pages now use must-revalidate (no browser cache on redeploy)"
echo "  - Old backup saved to $BACKUP_DIR on production server"
echo ""
echo "Verification:"
echo "  1. Check browser DevTools: Network tab → Response Headers → Cache-Control"
echo "  2. For JS chunks: Should see 'immutable' + max-age=31536000"
echo "  3. For HTML: Should see 'must-revalidate' + max-age=0"
echo ""
echo "To rollback (if needed):"
echo "  ssh dwise@173.208.147.165 'sudo cp /etc/nginx/backups/default.conf.YYYYMMDD_HHMMSS.bak /etc/nginx/conf.d/default.conf && sudo systemctl reload nginx'"
echo ""
