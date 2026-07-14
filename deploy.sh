#!/bin/bash

# WISE² Platform Deployment Script
# Deploys to Vercel with proper configuration

set -e

echo "🚀 WISE² Platform Deployment"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify build
echo -e "\n${BLUE}Step 1: Verifying production build...${NC}"
npm run build
echo -e "${GREEN}✓ Build successful${NC}"

# Step 2: Check Vercel CLI
echo -e "\n${BLUE}Step 2: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI ready${NC}"

# Step 3: Environment configuration
echo -e "\n${BLUE}Step 3: Checking environment configuration...${NC}"
if [ ! -f "apps/website/.env.production" ]; then
    echo -e "${YELLOW}⚠ Creating .env.production${NC}"
    cat > apps/website/.env.production << ENVEOF
NEXT_PUBLIC_SITE_URL=https://wise2.net
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET
NODE_ENV=production
ENVEOF
fi
echo -e "${GREEN}✓ Environment configured${NC}"

# Step 4: Git status check
echo -e "\n${BLUE}Step 4: Checking git status...${NC}"
if ! git diff --quiet; then
    echo -e "${YELLOW}⚠ Uncommitted changes detected${NC}"
    git status
    read -p "Continue with uncommitted changes? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Git status verified${NC}"

# Step 5: Deploy to Vercel
echo -e "\n${BLUE}Step 5: Deploying to Vercel...${NC}"
echo -e "${YELLOW}Note: You'll be prompted to authenticate with Vercel if needed${NC}"

cd apps/website

# Deploy with production settings
vercel --prod --yes \
  --name "wise2" \
  --env NEXT_PUBLIC_SITE_URL=https://wise2.net \
  --env NEXT_PUBLIC_API_URL=https://api.wise2.net \
  --env NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET

echo -e "\n${GREEN}✓ Deployment complete${NC}"

# Step 6: Post-deployment verification
echo -e "\n${BLUE}Step 6: Verifying deployment...${NC}"
echo "Waiting 30 seconds for deployment to be live..."
sleep 30

# Test the deployment
if curl -s -o /dev/null -w "%{http_code}" https://wise2.vercel.app | grep -q "200"; then
    echo -e "${GREEN}✓ Deployment verified - Site is live!${NC}"
    echo -e "\n${GREEN}🎉 Deployment successful!${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Configure domain: wise2.net → wise2.vercel.app in Vercel dashboard"
    echo "2. Update DNS records (see Vercel guide)"
    echo "3. Monitor: https://vercel.com/dashboard"
    echo "4. Analytics: https://vercel.com/analytics"
else
    echo -e "${YELLOW}⚠ Site may still be deploying${NC}"
    echo "Check progress at: https://vercel.com/dashboard"
fi

cd ../..

echo -e "\n${BLUE}===================================="
echo "Deployment Guide:"
echo "===================================${NC}"
echo "Preview: https://wise2.vercel.app"
echo "Dashboard: https://vercel.com/dashboard"
echo "Documentation: See DEPLOYMENT.md"
