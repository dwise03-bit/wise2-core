#!/bin/bash

# WISE² Secure Credentials Installer
# Interactive tool for safely configuring .env.production on production server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.production"
BACKUP_DIR=".env.backups"

# Functions
print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  WISE² Secure Credentials Installer${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_section() {
    echo -e "\n${YELLOW}➜ $1${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

read_secret() {
    local prompt=$1
    local value

    echo -n -e "${YELLOW}$prompt${NC}: "
    read -s value
    echo ""  # newline after silent input

    if [ -z "$value" ]; then
        print_error "Value cannot be empty"
        return 1
    fi

    echo "$value"
}

read_normal() {
    local prompt=$1
    local value

    echo -n -e "${YELLOW}$prompt${NC}: "
    read value

    if [ -z "$value" ]; then
        print_error "Value cannot be empty"
        return 1
    fi

    echo "$value"
}

confirm() {
    local prompt=$1
    local response

    echo -n -e "${YELLOW}$prompt (y/n)${NC}: "
    read -r response

    [[ "$response" =~ ^[Yy]$ ]]
}

# Check if running on production server
check_environment() {
    print_section "Environment Check"

    if [ ! -f "docker-compose.prod.yml" ]; then
        print_error "docker-compose.prod.yml not found. Are you in the wise2-core directory?"
        exit 1
    fi

    if [ -f "$ENV_FILE" ]; then
        print_info "Existing $ENV_FILE found"
        if confirm "Would you like to back it up before proceeding?"; then
            mkdir -p "$BACKUP_DIR"
            cp "$ENV_FILE" "$BACKUP_DIR/$ENV_FILE.backup.$(date +%s)"
            print_success "Backed up to $BACKUP_DIR/"
        fi
    fi
}

# Create backup directory
setup_backup() {
    mkdir -p "$BACKUP_DIR"
}

# Collect Stripe credentials
collect_stripe() {
    print_section "1. STRIPE (Payment Processing)"
    print_info "Get these from: https://dashboard.stripe.com/apikeys"

    STRIPE_PUBLIC_KEY=$(read_secret "Stripe Publishable Key (pk_live_...)")
    STRIPE_SECRET_KEY=$(read_secret "Stripe Secret Key (sk_live_...)")
    STRIPE_WEBHOOK_SECRET=$(read_secret "Stripe Webhook Secret (whsec_...)")
    STRIPE_STARTER_PRICE_ID=$(read_normal "Stripe Starter Plan Price ID (price_...)")
    STRIPE_PRO_PRICE_ID=$(read_normal "Stripe Pro Plan Price ID (price_...)")

    print_success "Stripe credentials collected"
}

# Collect SendGrid credentials
collect_sendgrid() {
    print_section "2. SENDGRID (Email Delivery)"
    print_info "Get these from: https://app.sendgrid.com/settings/api_keys"

    SENDGRID_API_KEY=$(read_secret "SendGrid API Key (SG...)")
    SENDGRID_FROM_EMAIL=$(read_normal "SendGrid From Email (noreply@wise2.net)")

    print_success "SendGrid credentials collected"
}

# Collect Google credentials
collect_google() {
    print_section "3. GOOGLE (OAuth + Calendar)"
    print_info "Get OAuth from: https://console.cloud.google.com/apis/credentials"
    print_info "Get Calendar from: Service Account JSON file"

    GOOGLE_CLIENT_ID=$(read_normal "Google OAuth Client ID")
    GOOGLE_CLIENT_SECRET=$(read_secret "Google OAuth Client Secret")

    echo -e "\n${YELLOW}For Google Calendar (from service account JSON):${NC}"
    GOOGLE_CALENDAR_CLIENT_ID=$(read_normal "Google Calendar Client ID (service account email)")
    GOOGLE_CALENDAR_CLIENT_SECRET=$(read_secret "Google Calendar Private Key")

    print_success "Google credentials collected"
}

# Collect AWS credentials (optional)
collect_aws() {
    print_section "4. AWS (Backup Storage - OPTIONAL)"

    if ! confirm "Do you want to configure AWS backups?"; then
        print_info "Skipping AWS configuration"
        return
    fi

    AWS_ACCESS_KEY_ID=$(read_secret "AWS Access Key ID")
    AWS_SECRET_ACCESS_KEY=$(read_secret "AWS Secret Access Key")
    AWS_REGION=$(read_normal "AWS Region (us-east-1)")
    AWS_BUCKET=$(read_normal "AWS S3 Bucket Name (wise2-backups-prod)")

    print_success "AWS credentials collected"
}

# Collect Discord credentials (optional)
collect_discord() {
    print_section "5. DISCORD (Notifications - OPTIONAL)"

    if ! confirm "Do you want to configure Discord notifications?"; then
        print_info "Skipping Discord configuration"
        return
    fi

    DISCORD_BOT_TOKEN=$(read_secret "Discord Bot Token")
    DISCORD_WEBHOOK_URL=$(read_normal "Discord Webhook URL")

    print_success "Discord credentials collected"
}

# Collect core app configuration
collect_core() {
    print_section "0. CORE APP CONFIGURATION"

    APP_URL=$(read_normal "App URL (https://wise2.net)")
    API_BASE_URL=$(read_normal "API Base URL (https://api.wise2.net)")

    print_success "Core configuration collected"
}

# Write to .env.production
write_env_file() {
    print_section "Writing Configuration"

    cat > "$ENV_FILE" << EOF
# ============================================
# WISE² Production Environment Configuration
# Generated: $(date)
# WARNING: This file contains sensitive credentials. Never commit to git.
# ============================================

# CORE APP
APP_URL=${APP_URL}
API_BASE_URL=${API_BASE_URL}
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# DATABASE
DATABASE_URL=postgresql://wise2:\${DATABASE_PASSWORD}@postgres:5432/wise2_prod
DATABASE_PASSWORD=wise2
DB_HOST=postgres
DB_PORT=5432
DB_NAME=wise2_prod
DB_USER=wise2

# REDIS
REDIS_URL=redis://:redis123@redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# STRIPE (Payment Processing)
STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
STRIPE_STARTER_PRICE_ID=${STRIPE_STARTER_PRICE_ID}
STRIPE_PRO_PRICE_ID=${STRIPE_PRO_PRICE_ID}

# SENDGRID (Email)
SENDGRID_API_KEY=${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL}

# GOOGLE (OAuth + Calendar)
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALENDAR_CLIENT_ID=${GOOGLE_CALENDAR_CLIENT_ID}
GOOGLE_CALENDAR_CLIENT_SECRET=${GOOGLE_CALENDAR_CLIENT_SECRET}

EOF

    # Add optional AWS credentials if set
    if [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
        cat >> "$ENV_FILE" << EOF
# AWS (Backups)
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
AWS_BUCKET=${AWS_BUCKET}

EOF
    fi

    # Add optional Discord credentials if set
    if [ -n "${DISCORD_BOT_TOKEN:-}" ]; then
        cat >> "$ENV_FILE" << EOF
# DISCORD (Notifications)
DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL}

EOF
    fi

    chmod 600 "$ENV_FILE"  # Only readable by owner
    print_success ".env.production created with secure permissions (600)"
}

# Display summary
show_summary() {
    print_section "Configuration Summary"

    echo -e "${GREEN}Core Configuration:${NC}"
    echo "  APP_URL: $APP_URL"
    echo "  API_BASE_URL: $API_BASE_URL"

    echo -e "\n${GREEN}Stripe:${NC}"
    echo "  Public Key: ${STRIPE_PUBLIC_KEY:0:20}..."
    echo "  Secret Key: ${STRIPE_SECRET_KEY:0:20}..."
    echo "  Webhook Secret: ${STRIPE_WEBHOOK_SECRET:0:20}..."

    echo -e "\n${GREEN}SendGrid:${NC}"
    echo "  API Key: ${SENDGRID_API_KEY:0:20}..."
    echo "  From Email: $SENDGRID_FROM_EMAIL"

    echo -e "\n${GREEN}Google:${NC}"
    echo "  OAuth Client ID: ${GOOGLE_CLIENT_ID:0:20}..."
    echo "  Calendar ID: ${GOOGLE_CALENDAR_CLIENT_ID:0:20}..."

    if [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
        echo -e "\n${GREEN}AWS:${NC}"
        echo "  Access Key: ${AWS_ACCESS_KEY_ID:0:20}..."
        echo "  Region: $AWS_REGION"
        echo "  Bucket: $AWS_BUCKET"
    fi

    if [ -n "${DISCORD_BOT_TOKEN:-}" ]; then
        echo -e "\n${GREEN}Discord:${NC}"
        echo "  Bot Token: ${DISCORD_BOT_TOKEN:0:20}..."
    fi
}

# Run smoke test
run_test() {
    print_section "Verification"

    if ! confirm "Run smoke tests to verify configuration?"; then
        print_info "Skipping verification"
        return
    fi

    if [ ! -x "revenue-readiness-test.sh" ]; then
        print_error "revenue-readiness-test.sh not found or not executable"
        return
    fi

    print_info "Running smoke tests..."
    if ./revenue-readiness-test.sh; then
        print_success "All smoke tests passed! System is revenue-ready."
    else
        print_error "Some tests failed. Review the output above."
    fi
}

# Main flow
main() {
    print_header

    check_environment
    setup_backup

    print_info "This tool will interactively collect your API credentials."
    print_info "Sensitive values (keys/secrets) will not be echoed to screen."
    print_info "Your .env.production file will be created with secure permissions (600)."
    echo ""

    if ! confirm "Ready to begin?"; then
        print_info "Cancelled."
        exit 0
    fi

    # Collect all credentials
    collect_core
    collect_stripe
    collect_sendgrid
    collect_google
    collect_aws
    collect_discord

    # Show summary
    show_summary

    # Confirm before writing
    if ! confirm "Save credentials to $ENV_FILE?"; then
        print_error "Cancelled. No changes made."
        exit 0
    fi

    # Write configuration
    write_env_file

    # Run tests
    run_test

    # Final message
    echo ""
    print_success "Configuration complete!"
    print_info ".env.production is ready for production deployment"
    print_info "File permissions: 600 (read/write owner only)"
    echo ""
    print_section "Next Steps"
    echo "1. Deploy: docker compose -f docker-compose.prod.yml up -d"
    echo "2. Verify: ./revenue-readiness-test.sh"
    echo "3. Test: Follow docs/CUSTOMER_JOURNEY_TEST_FLOW.md"
    echo ""
}

# Run main
main
