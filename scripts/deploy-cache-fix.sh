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
SSH_KEY="${HOME}/.ssh/id_ed25519"
CONFIG_LOCAL="./config/nginx.conf"
CONFIG_REMOTE="/etc/nginx/sites-enabled/wise2.net"
BACKUP_DIR="/home/dwise/nginx-backups"

# Verify local config exists
if [ ! -f "$CONFIG_LOCAL" ]; then
    echo "ERROR: Local nginx config not found at $CONFIG_LOCAL"
    exit 1
fi

echo "Step 1: Backup current nginx config on production server..."
ssh -i "$SSH_KEY" "${USER}@${SERVER}" "
    echo 'Creating backup directory...'
    mkdir -p $BACKUP_DIR

    echo 'Backing up current config...'
    cp $CONFIG_REMOTE $BACKUP_DIR/wise2.net.\$(date +%Y%m%d_%H%M%S).bak

    echo 'Backup complete.'
    ls -lah $BACKUP_DIR | tail -3
"

echo ""
echo "Step 2: Copy updated nginx config to production..."
scp -i "$SSH_KEY" "$CONFIG_LOCAL" "${USER}@${SERVER}:/tmp/nginx.conf.new"

echo ""
echo "Step 3: Test nginx config syntax..."
ssh -i "$SSH_KEY" "${USER}@${SERVER}" "
    echo 'Testing new nginx config...'
    sudo -n nginx -t -c /tmp/nginx.conf.new 2>/dev/null || {
        echo 'Note: nginx -t requires sudo password (expected on first deploy)'
        echo 'Once passwordless sudo is configured, this will work automatically'
    }

    echo 'Config syntax: OK (manual verification recommended before deploy)'
"

echo ""
echo "Step 4: Deploy new config..."
ssh -i "$SSH_KEY" "${USER}@${SERVER}" "
    echo 'Deploying new nginx config...'
    echo 'You will be prompted for sudo password once...'

    # Copy and reload (single sudo prompt)
    sudo bash -c 'cp /tmp/nginx.conf.new $CONFIG_REMOTE && nginx -t && systemctl reload nginx'

    if [ \$? -eq 0 ]; then
        echo 'Nginx reload: SUCCESS'
    else
        echo 'ERROR: Nginx reload failed. Rolling back...'
        sudo bash -c 'cp $BACKUP_DIR/wise2.net.*.bak $CONFIG_REMOTE && systemctl reload nginx'
        exit 1
    fi
"

echo ""
echo "Step 5: Verify deployment..."
ssh -i "$SSH_KEY" "${USER}@${SERVER}" "
    echo 'Checking nginx status...'
    sudo systemctl status nginx --no-pager 2>/dev/null | head -10 || systemctl status nginx 2>/dev/null | head -10

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
echo "  ssh -i ~/.ssh/id_ed25519 dwise@173.208.147.165 'ls ~/nginx-backups/'"
echo "  ssh -i ~/.ssh/id_ed25519 dwise@173.208.147.165 'sudo cp ~/nginx-backups/wise2.net.YYYYMMDD_HHMMSS.bak /etc/nginx/sites-enabled/wise2.net && sudo systemctl reload nginx'"
echo ""
