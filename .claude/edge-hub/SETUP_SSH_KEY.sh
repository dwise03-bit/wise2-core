#!/bin/bash
# Setup SSH key for deployment to skorpias (192.168.8.227)
# Run this ON THE PI to authorize the deployment key

set -e

# Create .ssh dir if needed
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the new deployment public key
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKhHG7wnBGHzP+1RKKRPnSvF5399h/9k8WwYCZZF0tcg skorpias-deploy-1789944651
EOF

# Secure authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo "✅ SSH key added to authorized_keys"
echo "You can now deploy from your machine with:"
echo "  cd /Users/danielwise/Projects/wise2-core/.claude/edge-hub"
echo "  ./DEPLOY.sh dwise@192.168.8.227"
