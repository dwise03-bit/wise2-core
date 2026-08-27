#!/bin/bash

# Google Voice Deployment Script
# Automates setup and deployment of Google Voice integration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Configuration
PROJECT_NAME="wise2-phone-prod"
SA_NAME="wise2-phone-prod"
REGION="us-central1"
BUCKET_NAME="wise2-recordings-prod"
TOPIC_NAME="wise2-phone-events"

echo -e "${BLUE}=== Google Voice Production Deployment ===${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud CLI not installed"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ docker not installed"; exit 1; }
echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Step 1: Create Google Cloud Project
echo -e "${YELLOW}Step 1: Creating Google Cloud Project...${NC}"
if gcloud projects describe $PROJECT_NAME &>/dev/null; then
    echo -e "${GREEN}✓ Project ${PROJECT_NAME} already exists${NC}"
else
    gcloud projects create $PROJECT_NAME --name="WISE² Phone Production"
    echo -e "${GREEN}✓ Project created${NC}"
fi
gcloud config set project $PROJECT_NAME
echo ""

# Step 2: Enable APIs
echo -e "${YELLOW}Step 2: Enabling Google Cloud APIs...${NC}"
gcloud services enable \
    communication.googleapis.com \
    speech.googleapis.com \
    storage-component.googleapis.com \
    logging.googleapis.com \
    pubsub.googleapis.com \
    cloudkms.googleapis.com
echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Step 3: Create Service Account
echo -e "${YELLOW}Step 3: Creating Service Account...${NC}"
SA_EMAIL="${SA_NAME}@${PROJECT_NAME}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe $SA_EMAIL &>/dev/null; then
    echo -e "${GREEN}✓ Service account already exists${NC}"
else
    gcloud iam service-accounts create $SA_NAME \
        --display-name="WISE² Phone Production Service"
    echo -e "${GREEN}✓ Service account created${NC}"
fi
echo ""

# Step 4: Create and Download Key
echo -e "${YELLOW}Step 4: Creating service account key...${NC}"
KEY_FILE=~/wise2-phone-key.json
if [ -f "$KEY_FILE" ]; then
    echo -e "${YELLOW}⚠ Key file already exists at ${KEY_FILE}${NC}"
    read -p "Overwrite existing key? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud iam service-accounts keys create $KEY_FILE \
            --iam-account=$SA_EMAIL
        echo -e "${GREEN}✓ Key created${NC}"
    fi
else
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL
    echo -e "${GREEN}✓ Key created at ${KEY_FILE}${NC}"
fi
chmod 600 $KEY_FILE
echo ""

# Step 5: Grant Roles
echo -e "${YELLOW}Step 5: Granting service account roles...${NC}"
roles=(
    "roles/communication.admin"
    "roles/storage.admin"
    "roles/logging.logWriter"
    "roles/pubsub.subscriber"
)
for role in "${roles[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_NAME \
        --member=serviceAccount:$SA_EMAIL \
        --role=$role \
        --quiet
done
echo -e "${GREEN}✓ Roles granted${NC}"
echo ""

# Step 6: Create Storage Bucket
echo -e "${YELLOW}Step 6: Creating Cloud Storage bucket...${NC}"
if gsutil ls -b gs://$BUCKET_NAME &>/dev/null; then
    echo -e "${GREEN}✓ Bucket already exists${NC}"
else
    gsutil mb -l $REGION -b on gs://$BUCKET_NAME
    echo -e "${GREEN}✓ Bucket created${NC}"

    # Set lifecycle policy
    cat > /tmp/lifecycle.json << 'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF
    gsutil lifecycle set /tmp/lifecycle.json gs://$BUCKET_NAME
    echo -e "${GREEN}✓ Lifecycle policy set (auto-delete after 90 days)${NC}"
fi

# Set bucket permissions
gsutil iam ch serviceAccount:$SA_EMAIL:objectAdmin gs://$BUCKET_NAME
echo -e "${GREEN}✓ Bucket permissions configured${NC}"
echo ""

# Step 7: Create Pub/Sub Topic
echo -e "${YELLOW}Step 7: Creating Pub/Sub topic for events...${NC}"
if gcloud pubsub topics describe $TOPIC_NAME &>/dev/null; then
    echo -e "${GREEN}✓ Topic already exists${NC}"
else
    gcloud pubsub topics create $TOPIC_NAME
    echo -e "${GREEN}✓ Topic created${NC}"
fi

# Create subscription
SUB_NAME="${TOPIC_NAME}-sub"
if gcloud pubsub subscriptions describe $SUB_NAME &>/dev/null; then
    echo -e "${GREEN}✓ Subscription already exists${NC}"
else
    gcloud pubsub subscriptions create $SUB_NAME \
        --topic=$TOPIC_NAME \
        --push-endpoint=https://wise2.net/webhooks/google-voice/events \
        --push-auth-service-account=$SA_EMAIL
    echo -e "${GREEN}✓ Subscription created${NC}"
fi
echo ""

# Step 8: Extract Credentials
echo -e "${YELLOW}Step 8: Extracting credentials...${NC}"
CREDS_FILE=~/.wise2-google-voice-creds.env
python3 << PYTHON
import json
import sys

try:
    with open('$KEY_FILE', 'r') as f:
        creds = json.load(f)

    with open('$CREDS_FILE', 'w') as f:
        f.write(f"GOOGLE_PROJECT_ID={creds['project_id']}\n")
        f.write(f"GOOGLE_PRIVATE_KEY_ID={creds['private_key_id']}\n")
        f.write(f"GOOGLE_PRIVATE_KEY={creds['private_key']}\n")
        f.write(f"GOOGLE_CLIENT_EMAIL={creds['client_email']}\n")
        f.write(f"GOOGLE_CLIENT_ID={creds['client_id']}\n")
        f.write(f"GOOGLE_CLIENT_X509_CERT_URL={creds['client_x509_cert_url']}\n")

    print("✓ Credentials extracted to $CREDS_FILE")
except Exception as e:
    print(f"❌ Error extracting credentials: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON
chmod 600 $CREDS_FILE
echo -e "${GREEN}✓ Credentials extracted${NC}"
echo ""

# Step 9: Display Setup Instructions
echo -e "${BLUE}=== Setup Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Add credentials to production environment:"
echo "   cat $CREDS_FILE >> ~/wise2-core/.env.production"
echo ""
echo "2. Verify credentials:"
echo "   grep GOOGLE_ ~/wise2-core/.env.production"
echo ""
echo "3. Build Docker image:"
echo "   cd ~/wise2-core"
echo "   docker build -f packages/ai-phone/Dockerfile -t wise2/ai-phone:latest ."
echo ""
echo "4. Deploy to production:"
echo "   docker-compose -f docker-compose.prod.yml up -d ai-phone api"
echo ""
echo "5. Verify deployment:"
echo "   curl http://localhost:3001/health"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo ""
echo "View service account:"
echo "  gcloud iam service-accounts describe $SA_EMAIL"
echo ""
echo "View bucket contents:"
echo "  gsutil ls -r gs://$BUCKET_NAME"
echo ""
echo "Check logs:"
echo "  gcloud logging read \"logName:projects/$PROJECT_NAME/logs/wise2-phone\" --limit=20"
echo ""
echo "Monitor calls:"
echo "  gcloud pubsub subscriptions pull $SUB_NAME --auto-ack --max-messages=10"
echo ""
echo -e "${GREEN}✓ Google Voice deployment setup complete!${NC}"
