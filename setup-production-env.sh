#!/bin/bash

# WISE² Production Environment Setup Wizard
# Interactive configuration for missing environment variables

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$SCRIPT_DIR/.env.production"

echo "🔧 WISE² Production Environment Setup Wizard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This wizard will help you configure missing environment variables."
echo ""

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.production not found at $ENV_FILE"
  exit 1
fi

echo "📋 Checking current configuration..."
echo ""

# Check what's missing
missing_stripe_starter=false
missing_stripe_pro=false
missing_database=false

if ! grep -q "STRIPE_STARTER_PRICE_ID=" "$ENV_FILE" || grep "STRIPE_STARTER_PRICE_ID=" "$ENV_FILE" | grep -q "price_..."; then
  missing_stripe_starter=true
fi

if ! grep -q "STRIPE_PRO_PRICE_ID=" "$ENV_FILE" || grep "STRIPE_PRO_PRICE_ID=" "$ENV_FILE" | grep -q "price_..."; then
  missing_stripe_pro=true
fi

if ! grep -q "DATABASE_URL=" "$ENV_FILE" || grep "DATABASE_URL=" "$ENV_FILE" | grep -q "postgresql://"; then
  missing_database=true
fi

echo "Step 1: Stripe Price IDs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get your Stripe Price IDs:"
echo "  1. Go to https://dashboard.stripe.com/products"
echo "  2. Click on your 'Starter' product"
echo "  3. Find the Price section and copy the Price ID (starts with 'price_')"
echo "  4. Repeat for 'Pro' product"
echo ""

if [ "$missing_stripe_starter" = true ]; then
  read -p "Enter STRIPE_STARTER_PRICE_ID (price_XXXXXX): " starter_price_id
  if [ -n "$starter_price_id" ]; then
    # Update or add the variable
    if grep -q "STRIPE_STARTER_PRICE_ID=" "$ENV_FILE"; then
      # macOS compatible sed
      sed -i '' "s/^STRIPE_STARTER_PRICE_ID=.*/STRIPE_STARTER_PRICE_ID=$starter_price_id/" "$ENV_FILE"
    else
      echo "STRIPE_STARTER_PRICE_ID=$starter_price_id" >> "$ENV_FILE"
    fi
    echo "✅ Updated STRIPE_STARTER_PRICE_ID"
  fi
fi

if [ "$missing_stripe_pro" = true ]; then
  read -p "Enter STRIPE_PRO_PRICE_ID (price_XXXXXX): " pro_price_id
  if [ -n "$pro_price_id" ]; then
    if grep -q "STRIPE_PRO_PRICE_ID=" "$ENV_FILE"; then
      sed -i '' "s/^STRIPE_PRO_PRICE_ID=.*/STRIPE_PRO_PRICE_ID=$pro_price_id/" "$ENV_FILE"
    else
      echo "STRIPE_PRO_PRICE_ID=$pro_price_id" >> "$ENV_FILE"
    fi
    echo "✅ Updated STRIPE_PRO_PRICE_ID"
  fi
fi

echo ""
echo "Step 2: Database URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Database URL format:"
echo "  postgresql://user:password@host:port/database?sslmode=require"
echo ""
echo "Example:"
echo "  postgresql://wise2:secretpass@173.208.147.165:5432/wise2?sslmode=require"
echo ""

if [ "$missing_database" = true ]; then
  read -p "Enter DATABASE_URL: " database_url
  if [ -n "$database_url" ]; then
    if grep -q "DATABASE_URL=" "$ENV_FILE"; then
      # Escape special characters for sed
      database_url_escaped=$(printf '%s\n' "$database_url" | sed -e 's/[\/&]/\\&/g')
      sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=$database_url_escaped|" "$ENV_FILE"
    else
      echo "DATABASE_URL=$database_url" >> "$ENV_FILE"
    fi
    echo "✅ Updated DATABASE_URL"
  fi
fi

echo ""
echo "Step 3: Optional - SendGrid Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "SendGrid is optional. Email features will be disabled if not configured."
echo ""

read -p "Do you want to configure SendGrid? (y/n): " configure_sendgrid
if [ "$configure_sendgrid" = "y" ] || [ "$configure_sendgrid" = "Y" ]; then
  read -p "Enter SENDGRID_API_KEY (SG...): " sendgrid_api_key
  if [ -n "$sendgrid_api_key" ]; then
    if grep -q "SENDGRID_API_KEY=" "$ENV_FILE"; then
      sed -i '' "s/^SENDGRID_API_KEY=.*/SENDGRID_API_KEY=$sendgrid_api_key/" "$ENV_FILE"
    else
      echo "SENDGRID_API_KEY=$sendgrid_api_key" >> "$ENV_FILE"
    fi
    echo "✅ Updated SENDGRID_API_KEY"
  fi

  read -p "Enter SENDGRID_FROM_EMAIL: " sendgrid_from_email
  if [ -n "$sendgrid_from_email" ]; then
    if grep -q "SENDGRID_FROM_EMAIL=" "$ENV_FILE"; then
      sed -i '' "s/^SENDGRID_FROM_EMAIL=.*/SENDGRID_FROM_EMAIL=$sendgrid_from_email/" "$ENV_FILE"
    else
      echo "SENDGRID_FROM_EMAIL=$sendgrid_from_email" >> "$ENV_FILE"
    fi
    echo "✅ Updated SENDGRID_FROM_EMAIL"
  fi
fi

echo ""
echo "✅ Configuration saved to $ENV_FILE"
echo ""
echo "Next steps:"
echo "  1. Verify the configuration: cat $ENV_FILE"
echo "  2. Run deployment: bash fix-all.sh"
echo ""
