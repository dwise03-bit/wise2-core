#!/bin/bash
# Add GitHub Secrets to wise2-core repository
# Requires: gh CLI (https://cli.github.com)
# Usage: bash scripts/add-github-secrets.sh

set -e

OWNER="dwise03-bit"
REPO="wise2-core"

echo "🔐 Adding GitHub Secrets to $OWNER/$REPO"
echo "========================================"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install from: https://cli.github.com"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Function to add secret
add_secret() {
    local name=$1
    local value=$2
    echo -n "Adding $name... "
    echo "$value" | gh secret set "$name" -R "$OWNER/$REPO" --body-from - 2>/dev/null
    echo "✅"
}

# DEPLOYMENT SECRETS
echo "📍 DEPLOYMENT SECRETS"
add_secret "DEPLOY_HOST" "173.208.147.165"
add_secret "DEPLOY_USER" "dwise"

# SSH Key - read from file or environment
if [ -z "$DEPLOY_KEY" ]; then
    if [ -f "$HOME/.ssh/wise2-deploy" ]; then
        DEPLOY_KEY=$(cat "$HOME/.ssh/wise2-deploy")
    else
        echo "❌ DEPLOY_KEY not found!"
        echo "Set DEPLOY_KEY environment variable or place key at ~/.ssh/wise2-deploy"
        exit 1
    fi
fi
add_secret "DEPLOY_KEY" "$DEPLOY_KEY"

# DATABASE SECRETS
echo ""
echo "🗄️  DATABASE SECRETS"
add_secret "POSTGRES_ADMIN_PASSWORD" "lOk8jv7si/gh5JG8QdweC29ujgBe3tywupKPr9V81bo="
add_secret "POSTGRES_APP_PASSWORD" "9XAMMWLkk9iz3Ri0obLoVrj7bXnbYTeIrvqWWE3KnU0="
add_secret "MONGODB_PASSWORD" "kLwy8Ap6VA/KGtBGF1ZuIcnfijGXj86yPtAUO9e+xH4="
add_secret "REDIS_PASSWORD" "fx9yaArb2dwwkpRFoYWyVuY67gtRYVzxNNE7TiShn8c="

# API & SECURITY SECRETS
echo ""
echo "🔑 API & SECURITY SECRETS"
add_secret "JWT_SECRET" "tiBT249wJnxzWVFaIICxXXEbxs8dwE1CBdwJhIRzts4="
add_secret "OPEN_WEBUI_SECRET_KEY" "uf8ADxoAE4X9NUCedN0HBiR8s16vZduzf4lvhyhKED8="
add_secret "GRAFANA_PASSWORD" "jJy+D5XhmeBihckj4wqmp2VxQgMxyyGcR9dhoQQOp7Q="

# FRONTEND URLS
echo ""
echo "🌐 FRONTEND URLS"
add_secret "NEXT_PUBLIC_API_URL" "https://api.wise2.net"
add_secret "NEXT_PUBLIC_WS_URL" "wss://api.wise2.net"
add_secret "NEXT_PUBLIC_LOGIN_URL" "https://wise2.net/command-center/login"

# List all secrets
echo ""
echo "========================================"
echo "✅ All secrets added!"
echo ""
echo "📋 Verifying secrets in GitHub:"
gh secret list -R "$OWNER/$REPO"

echo ""
echo "🎉 Done! Secrets are ready for deployment"
