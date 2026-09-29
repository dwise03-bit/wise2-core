#!/bin/bash

################################################################################
# WISE² Sound Labs - Nginx Reverse Proxy Setup
#
# This script sets up nginx to proxy wise2.net to the Sound Labs website
# and handles SSL/HTTPS configuration.
#
# Usage: ssh dwise@173.208.147.165 < setup-nginx.sh
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Setting up Nginx reverse proxy for WISE² Sound Labs...${NC}\n"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Create nginx config for Sound Labs
echo -e "${BLUE}Creating nginx configuration...${NC}"

sudo tee /etc/nginx/sites-available/wise2-sound-labs > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;

    server_name wise2.net www.wise2.net;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Reverse proxy to Sound Labs website
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Sound Labs specific routes
    location /sound-labs {
        proxy_pass http://localhost:3001/sound-labs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API routes (if needed)
    location /api {
        proxy_pass http://localhost:3101;
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

# HTTPS version (enable after SSL certificate is obtained)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#
#     server_name wise2.net www.wise2.net;
#
#     # SSL certificates (from Let's Encrypt)
#     ssl_certificate /etc/letsencrypt/live/wise2.net/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/wise2.net/privkey.pem;
#
#     # SSL configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     # Reverse proxy to Sound Labs
#     location / {
#         proxy_pass http://localhost:3001;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
EOF

# Enable the site
echo -e "${BLUE}Enabling nginx site...${NC}"
sudo ln -sf /etc/nginx/sites-available/wise2-sound-labs /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
echo -e "${BLUE}Testing nginx configuration...${NC}"
sudo nginx -t

# Reload nginx
echo -e "${BLUE}Reloading nginx...${NC}"
sudo systemctl reload nginx
sudo systemctl enable nginx

echo -e "\n${GREEN}✓ Nginx reverse proxy configured${NC}"
echo -e "\n${YELLOW}Configuration Summary:${NC}"
echo -e "  Domains:     wise2.net, www.wise2.net"
echo -e "  HTTP Port:   80"
echo -e "  Proxy to:    http://localhost:3001"
echo -e "  Config:      /etc/nginx/sites-available/wise2-sound-labs"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Test: curl -H 'Host: wise2.net' http://localhost"
echo -e "  2. Visit: http://wise2.net"
echo -e "  3. Setup HTTPS: ./setup-ssl.sh"
echo ""
