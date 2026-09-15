#!/bin/bash
# WISE² Pixel Slate Dev Backup Station - Complete Setup
# Run this on Pixel Slate Crostini terminal

set -e

echo "🚀 WISE² Pixel Slate Setup Starting..."
echo "================================================"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update system
echo -e "${BLUE}[1/10] Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Step 2: Install dev tools
echo -e "${BLUE}[2/10] Installing development tools...${NC}"
sudo apt install -y \
  git \
  curl \
  wget \
  nano \
  vim \
  htop \
  rsync \
  openssh-client \
  docker.io \
  nodejs \
  npm \
  postgresql-client \
  jq \
  unzip

# Step 3: Configure user for docker
echo -e "${BLUE}[3/10] Configuring Docker access...${NC}"
sudo usermod -aG docker $USER
newgrp docker

# Step 4: Create SSH directory
echo -e "${BLUE}[4/10] Setting up SSH...${NC}"
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Step 5: Generate SSH keys
echo -e "${BLUE}[5/10] Generating SSH keypair...${NC}"
if [ ! -f ~/.ssh/pixel-slate ]; then
  ssh-keygen -t ed25519 -f ~/.ssh/pixel-slate -C "pixel-slate-$(date +%Y%m%d)" -N ""
  echo -e "${GREEN}✓ SSH key generated${NC}"
  echo ""
  echo "📋 YOUR PUBLIC KEY (add to VPS ~/.ssh/authorized_keys):"
  echo "================================================"
  cat ~/.ssh/pixel-slate.pub
  echo "================================================"
else
  echo -e "${YELLOW}⚠ SSH key already exists${NC}"
fi

# Step 6: Create SSH config
echo -e "${BLUE}[6/10] Creating SSH config...${NC}"
cat > ~/.ssh/config << 'SSHEOF'
Host wise2-vps
    User dwise
    StrictHostKeyChecking no
    UserKnownHostsFile=/dev/null
    IdentityFile ~/.ssh/pixel-slate
    IdentitiesOnly yes

Host wise2-api
    ProxyCommand ssh -q wise2-vps nc -q0 localhost 3000
SSHEOF
chmod 600 ~/.ssh/config

# Step 7: Create scripts directory
echo -e "${BLUE}[7/10] Creating scripts directory...${NC}"
mkdir -p ~/scripts

# Step 8: Create backup script
echo -e "${BLUE}[8/10] Setting up backup automation...${NC}"
cat > ~/scripts/wise2-backup.sh << 'BACKUPEOF'
#!/bin/bash
set -e

BACKUP_DIR="$HOME/wise2-backups"
VPS_HOST="wise2-vps"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "📦 Starting backup at $TIMESTAMP..."

# Database backup
echo "  • Backing up database..."
ssh $VPS_HOST "pg_dump -U dwise wise2 | gzip" > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Code backup
echo "  • Backing up codebase..."
rsync -avz --delete $VPS_HOST:/home/dwise/wise2-core/packages $BACKUP_DIR/packages_$TIMESTAMP/

# Data backup
echo "  • Backing up data..."
rsync -avz --delete $VPS_HOST:/home/dwise/wise2-core/data $BACKUP_DIR/data_$TIMESTAMP/

# Cleanup old backups (keep last 10)
echo "  • Cleaning up old backups..."
cd $BACKUP_DIR
ls -t | tail -n +11 | xargs -r rm -rf

echo "✅ Backup complete: $BACKUP_DIR"
ls -lh $BACKUP_DIR | head -5
BACKUPEOF
chmod +x ~/scripts/wise2-backup.sh

# Step 9: Create health check script
echo -e "${BLUE}[9/10] Setting up health check...${NC}"
cat > ~/scripts/wise2-health.sh << 'HEALTHEOF'
#!/bin/bash
VPS_HOST="wise2-vps"

echo "🔍 WISE² System Health Check"
echo "================================"

echo ""
echo "SSH Connection:"
if ssh -q $VPS_HOST "echo ✓ Connected"; then
  echo "✅ VPS reachable"
else
  echo "❌ VPS unreachable"
  exit 1
fi

echo ""
echo "Services:"
ssh $VPS_HOST "systemctl status wise2-api --no-pager | head -3"
ssh $VPS_HOST "docker ps --filter 'label=wise2' --format 'table {{.Names}}\t{{.Status}}'"

echo ""
echo "Tailscale:"
ssh $VPS_HOST "tailscale ip -4"
echo "Local: $(tailscale ip -4)"

echo ""
echo "Disk Usage:"
ssh $VPS_HOST "df -h /home/dwise | tail -1"

echo ""
echo "✅ Health check complete"
HEALTHEOF
chmod +x ~/scripts/wise2-health.sh

# Step 10: Setup aliases
echo -e "${BLUE}[10/10] Installing command aliases...${NC}"
cat >> ~/.bashrc << 'ALIASEOF'

# WISE² Dev Station Aliases
alias vps="ssh wise2-vps"
alias wise2-health="~/scripts/wise2-health.sh"
alias wise2-backup="~/scripts/wise2-backup.sh"
alias wise2-logs="ssh wise2-vps 'docker logs -f wise2-api 2>/dev/null || journalctl -u wise2-api -f'"
alias wise2-status="ssh wise2-vps 'systemctl status wise2-api --no-pager'"
alias wise2-deploy="ssh wise2-vps 'cd /home/dwise/wise2-core && bash scripts/wise2-vps.sh'"
alias wise2-tunnel-api="ssh -L 3000:localhost:3000 wise2-vps"
alias wise2-tunnel-dashboard="ssh -L 3005:localhost:3005 wise2-vps"
alias wise2-tunnel-db="ssh -L 5432:localhost:5432 wise2-vps"

# Tailscale info
alias ts-info="tailscale status --json | jq '.Self'"
alias ts-peers="tailscale status --json | jq '.Peer | keys[]'"

ALIASEOF

source ~/.bashrc

echo ""
echo "================================================"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo "================================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Copy your SSH public key (shown above) to VPS:"
echo "   $ ssh dwise@173.208.147.165"
echo "   $ echo '<YOUR_PUBLIC_KEY>' >> ~/.ssh/authorized_keys"
echo ""
echo "2. Find VPS Tailscale IP:"
echo "   $ ssh dwise@173.208.147.165 'tailscale ip -4'"
echo ""
echo "3. Update SSH config with VPS Tailscale IP:"
echo "   $ nano ~/.ssh/config"
echo "   Replace: HostName <VPS_TAILSCALE_IP>"
echo ""
echo "4. Test connection:"
echo "   $ vps"
echo ""
echo "5. Run health check:"
echo "   $ wise2-health"
echo ""
echo "6. Start backups:"
echo "   $ wise2-backup"
echo ""
echo "Available commands:"
echo "  vps              - SSH to VPS"
echo "  wise2-health     - System health check"
echo "  wise2-backup     - Backup database & code"
echo "  wise2-logs       - Stream API logs"
echo "  wise2-status     - Check API status"
echo "  wise2-deploy     - Deploy latest code"
echo "  wise2-tunnel-api - Tunnel to API (port 3000)"
echo "  wise2-tunnel-dashboard - Tunnel to dashboard (port 3005)"
echo "  ts-info          - Tailscale connection info"
echo ""
echo "================================================"
