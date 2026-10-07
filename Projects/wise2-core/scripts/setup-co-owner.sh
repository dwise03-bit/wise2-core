#!/bin/bash
# WISE² Co-Owner Integration Setup
# Connects Darren's system to the full WISE² infrastructure

set -e

echo "🔗 WISE² Co-Owner Integration Setup"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
TAILSCALE_IP="100.100.26.47"
VPS_IP="100.68.145.5"
TV_HUB_IP="100.97.230.73"
GITHUB_REPO="dwise03-bit/wise2-core"

echo -e "${BLUE}Step 1: Verifying Tailscale connection${NC}"
if tailscale status | grep -q "Online"; then
    echo -e "${GREEN}✓ Tailscale is connected${NC}"
else
    echo -e "${YELLOW}⚠ Tailscale not connected. Please start Tailscale.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 2: Setting up GitHub access${NC}"
gh repo clone $GITHUB_REPO wise2-core-co-owner 2>/dev/null || cd wise2-core-co-owner && git pull origin main
echo -e "${GREEN}✓ GitHub repository synced${NC}"

echo -e "${BLUE}Step 3: Configuring VPS SSH access${NC}"
ssh-keyscan -H 100.68.145.5 >> ~/.ssh/known_hosts 2>/dev/null || true
echo -e "${GREEN}✓ VPS host added to known_hosts${NC}"

echo -e "${BLUE}Step 4: Setting up TV Hub (wise2-surface) connection${NC}"
ssh-keyscan -H 100.97.230.73 >> ~/.ssh/known_hosts 2>/dev/null || true
ssh-copy-id -i ~/.ssh/id_rsa.pub dwise@100.97.230.73 2>/dev/null || echo "SSH key already configured"
echo -e "${GREEN}✓ TV Hub SSH access configured${NC}"

echo -e "${BLUE}Step 5: Syncing deployment configuration${NC}"
mkdir -p ~/.wise2/deployments
cat > ~/.wise2/deployments/config.json << 'EOF'
{
  "vps": {
    "host": "100.68.145.5",
    "user": "dwise",
    "deploymentDir": "/home/dwise/wise2-core"
  },
  "tvHub": {
    "host": "100.97.230.73",
    "user": "dwise",
    "displayType": "surface-tv",
    "resolution": "1920x1080"
  },
  "cloudflare": {
    "zone": "wise2.net",
    "recordTypes": ["A", "CNAME", "TXT"]
  },
  "github": {
    "repository": "dwise03-bit/wise2-core",
    "branch": "main",
    "autoSync": true
  }
}
EOF
echo -e "${GREEN}✓ Deployment configuration created${NC}"

echo -e "${BLUE}Step 6: Setting up local git hooks${NC}"
mkdir -p .git/hooks
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
# Auto-sync to TV Hub on commit
echo "Syncing to TV Hub..."
ssh dwise@100.97.230.73 "cd /home/wise2/wise2-core && git pull origin main" &
EOF
chmod +x .git/hooks/post-commit
echo -e "${GREEN}✓ Git hooks configured${NC}"

echo -e "${BLUE}Step 7: Testing connections${NC}"
echo -n "  VPS: "
ping -c 1 100.68.145.5 > /dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${YELLOW}✗${NC}"

echo -n "  TV Hub: "
ping -c 1 100.97.230.73 > /dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${YELLOW}✗${NC}"

echo ""
echo -e "${GREEN}✅ Co-Owner Integration Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Add your GitHub SSH key to your account (if not already done)"
echo "2. Verify access: ssh dwise@100.68.145.5 'docker ps'"
echo "3. Pull latest from GitHub: git pull origin main"
echo "4. Deploy to TV Hub: ./scripts/deploy-display.sh"
echo ""
