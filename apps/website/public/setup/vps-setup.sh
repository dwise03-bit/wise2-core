#!/bin/bash
# WISE² VPS Setup for Pixel Slate Access
# Run this on the VPS: bash vps-setup.sh

set -e

echo "🚀 WISE² VPS Setup for Pixel Slate..."
echo "================================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as dwise user
if [ "$USER" != "dwise" ]; then
  echo -e "${YELLOW}⚠ This script should run as dwise user${NC}"
  echo "Retry with: sudo -u dwise bash vps-setup.sh"
  exit 1
fi

# Step 1: Ensure SSH directory exists
echo -e "${BLUE}[1/5] Configuring SSH...${NC}"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Step 2: Create backup location
echo -e "${BLUE}[2/5] Creating backup directories...${NC}"
mkdir -p ~/wise2-backups/database
mkdir -p ~/wise2-backups/code
mkdir -p ~/wise2-backups/data
chmod 700 ~/wise2-backups

# Step 3: Ensure PostgreSQL tools available
echo -e "${BLUE}[3/5] Checking database access...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${YELLOW}⚠ PostgreSQL client not found, installing...${NC}"
  sudo apt install -y postgresql-client
fi

# Step 4: Get Tailscale IP
echo -e "${BLUE}[4/5] Retrieving Tailscale information...${NC}"
VPS_TAILSCALE_IP=$(tailscale ip -4)
echo -e "${GREEN}✓ VPS Tailscale IP: $VPS_TAILSCALE_IP${NC}"

# Step 5: Create Pixel Slate info file
echo -e "${BLUE}[5/5] Creating setup info file...${NC}"
cat > ~/PIXEL_SLATE_INFO.txt << INFOEOF
WISE² PIXEL SLATE SETUP INFO
Generated: $(date)

VPS TAILSCALE IP: $VPS_TAILSCALE_IP

SSH CONFIGURATION:
  User: dwise
  Host: $VPS_TAILSCALE_IP
  Key: pixel-slate

NEXT STEPS:
1. Add Pixel Slate public key to ~/.ssh/authorized_keys
2. Test: ssh -i ~/.ssh/pixel-slate dwise@$VPS_TAILSCALE_IP

BACKUP LOCATIONS:
  Database: ~/wise2-backups/database
  Code: ~/wise2-backups/code
  Data: ~/wise2-backups/data

SERVICE LOCATIONS:
  API: http://localhost:3000
  Dashboard: http://localhost:3005
  PostgreSQL: localhost:5432

USEFUL COMMANDS:
  systemctl status wise2-api
  docker ps -a
  tailscale status
  df -h

INFOEOF

echo ""
echo "================================================"
echo -e "${GREEN}✅ VPS SETUP COMPLETE!${NC}"
echo "================================================"
echo ""
echo "📋 VPS TAILSCALE IP: $VPS_TAILSCALE_IP"
echo ""
echo "Save this IP and use it in your Pixel Slate SSH config"
echo ""
echo "VPS INFO saved to: ~/PIXEL_SLATE_INFO.txt"
echo ""
cat ~/PIXEL_SLATE_INFO.txt
