# Google Voice Deployment Guide

Complete setup and deployment of Google Voice integration for WISE² AI Phone production.

## Prerequisites

- Google Cloud Project with billing enabled
- Service account with appropriate permissions
- Production server access (173.208.147.165)
- Access to environment configuration

## Step 1: Google Cloud Project Setup

### 1.1 Create Project

```bash
# Create a new Google Cloud project
gcloud projects create wise2-phone-prod --name="WISE² Phone Production"
gcloud config set project wise2-phone-prod

# Enable billing (required for Cloud APIs)
gcloud billing projects link wise2-phone-prod \
  --billing-account=BILLING_ACCOUNT_ID
```

### 1.2 Enable Required APIs

```bash
gcloud services enable \
  communication.googleapis.com \
  speech.googleapis.com \
  storage-component.googleapis.com \
  logging.googleapis.com \
  pubsub.googleapis.com \
  cloudkms.googleapis.com
```

## Step 2: Service Account Setup

### 2.1 Create Service Account

```bash
# Create service account for phone system
gcloud iam service-accounts create wise2-phone-prod \
  --display-name="WISE² Phone Production Service"

# Store the email for later use
export SA_EMAIL="wise2-phone-prod@wise2-phone-prod.iam.gserviceaccount.com"
echo "Service Account: $SA_EMAIL"
```

### 2.2 Create and Download Key

```bash
# Create JSON key file
gcloud iam service-accounts keys create ~/wise2-phone-key.json \
  --iam-account=$SA_EMAIL

# Verify key was created
ls -lh ~/wise2-phone-key.json
```

### 2.3 Grant Roles

```bash
# Grant necessary roles
gcloud projects add-iam-policy-binding wise2-phone-prod \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/communication.admin

gcloud projects add-iam-policy-binding wise2-phone-prod \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/storage.admin

gcloud projects add-iam-policy-binding wise2-phone-prod \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/logging.logWriter

gcloud projects add-iam-policy-binding wise2-phone-prod \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/pubsub.subscriber
```

## Step 3: Configure Storage

### 3.1 Create Cloud Storage Bucket for Recordings

```bash
# Create bucket for call recordings
gsutil mb -l us-central1 -b on gs://wise2-recordings-prod

# Set lifecycle policy (auto-delete after 90 days)
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

gsutil lifecycle set /tmp/lifecycle.json gs://wise2-recordings-prod

# Set permissions
gsutil iam ch serviceAccount:$SA_EMAIL:objectAdmin gs://wise2-recordings-prod
```

### 3.2 Create Pub/Sub Topic for Events

```bash
# Create topic for incoming call events
gcloud pubsub topics create wise2-phone-events

# Create subscription
gcloud pubsub subscriptions create wise2-phone-events-sub \
  --topic=wise2-phone-events \
  --push-endpoint=https://wise2.net/webhooks/google-voice/events \
  --push-auth-service-account=$SA_EMAIL
```

## Step 4: Extract Credentials

### 4.1 Parse Service Account Key

```bash
# Extract credentials from the JSON key file
python3 << 'PYTHON'
import json

with open(os.path.expanduser('~/wise2-phone-key.json'), 'r') as f:
    creds = json.load(f)

print("GOOGLE_PROJECT_ID=" + creds['project_id'])
print("GOOGLE_PRIVATE_KEY_ID=" + creds['private_key_id'])
print("GOOGLE_PRIVATE_KEY=" + creds['private_key'].replace('\n', '\\n'))
print("GOOGLE_CLIENT_EMAIL=" + creds['client_email'])
print("GOOGLE_CLIENT_ID=" + creds['client_id'])
print("GOOGLE_CLIENT_X509_CERT_URL=" + creds['client_x509_cert_url'])
PYTHON
```

## Step 5: Production Environment Configuration

### 5.1 Create Production .env File

```bash
# SSH into production server
ssh dwise@173.208.147.165

# Create environment file with credentials
cat > ~/wise2-core/.env.production << 'EOF'
# ... (copy content from .env.production.example)

# Add Google Voice credentials (from Step 4.1 output):
GOOGLE_PROJECT_ID=wise2-phone-prod
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=wise2-phone-prod@wise2-phone-prod.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/wise2-phone-prod%40wise2-phone-prod.iam.gserviceaccount.com
GOOGLE_PHONE_NUMBER=+1-555-GOOGLE-VOICE
GOOGLE_WEBHOOK_URL=https://wise2.net/webhooks/google-voice/events
GOOGLE_RECORDING_BUCKET=gs://wise2-recordings-prod
EOF

# Secure permissions
chmod 600 ~/wise2-core/.env.production
```

### 5.2 Update Docker Configuration

```bash
# Add Google Voice environment variables to docker-compose.prod.yml
cat >> docker-compose.prod.yml << 'EOF'
  ai-phone:
    image: wise2/ai-phone:latest
    ports:
      - "3001:3001"
    environment:
      - GOOGLE_PROJECT_ID=${GOOGLE_PROJECT_ID}
      - GOOGLE_PRIVATE_KEY_ID=${GOOGLE_PRIVATE_KEY_ID}
      - GOOGLE_PRIVATE_KEY=${GOOGLE_PRIVATE_KEY}
      - GOOGLE_CLIENT_EMAIL=${GOOGLE_CLIENT_EMAIL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_X509_CERT_URL=${GOOGLE_CLIENT_X509_CERT_URL}
      - GOOGLE_PHONE_NUMBER=${GOOGLE_PHONE_NUMBER}
      - GOOGLE_WEBHOOK_URL=${GOOGLE_WEBHOOK_URL}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
    volumes:
      - /data/wise2/recordings:/app/recordings
    networks:
      - wise2-network
EOF
```

## Step 6: Deploy to Production

### 6.1 Build Docker Image

```bash
cd ~/wise2-core

# Build Docker image with Google Voice support
docker build \
  -f packages/ai-phone/Dockerfile \
  -t wise2/ai-phone:latest \
  -t wise2/ai-phone:$(date +%Y%m%d) \
  .

# Push to registry
docker push wise2/ai-phone:latest
docker push wise2/ai-phone:$(date +%Y%m%d)
```

### 6.2 Deploy Services

```bash
# Deploy to production server
docker-compose -f docker-compose.prod.yml up -d ai-phone api

# Verify deployment
docker-compose logs -f ai-phone

# Check if service is running
curl http://localhost:3001/health
```

## Step 7: Configure Webhooks

### 7.1 Create Webhook Handler

The AI Phone API needs a webhook endpoint to receive incoming call events from Google Voice:

```bash
# Endpoint: POST /webhooks/google-voice/events

# Example payload:
{
  "type": "INCOMING_CALL",
  "callId": "call_12345",
  "googleCallId": "gv-abc-123",
  "from": "+1-555-9999",
  "to": "+1-555-0123",
  "timestamp": "2026-08-23T17:00:00Z"
}
```

### 7.2 Configure Firewall

```bash
# Allow incoming webhook traffic
sudo ufw allow from 35.192.0.0/10  # Google Cloud IPs
sudo ufw allow 443  # HTTPS traffic

# Verify rules
sudo ufw status
```

## Step 8: Testing

### 8.1 Unit Tests

```bash
# Run Google Voice provider tests
cd ~/wise2-core
pnpm test -- google-voice-provider.test.ts
```

### 8.2 Integration Tests

```bash
# Test incoming call workflow
curl -X POST http://localhost:3001/calls/init \
  -H "Content-Type: application/json" \
  -d '{"fromNumber": "+1-555-9999"}'

# Test conversation
curl -X POST http://localhost:3001/calls/{sessionId}/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi, I need to schedule an appointment"}'
```

### 8.3 Monitoring

```bash
# Check logs
docker logs wise2-ai-phone

# View Google Cloud Logging
gcloud logging read \
  "logName:projects/wise2-phone-prod/logs/wise2-phone" \
  --limit=50 \
  --format=json
```

## Step 9: Production Verification Checklist

- [ ] Google Cloud project created and configured
- [ ] Service account created with proper permissions
- [ ] Cloud Storage bucket created for recordings
- [ ] Pub/Sub topic configured for incoming events
- [ ] Credentials extracted and secured in .env.production
- [ ] Docker image built and pushed to registry
- [ ] Production deployment successful
- [ ] Webhook endpoint verified working
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Monitoring and logging configured
- [ ] Failover to Twilio tested
- [ ] Recording storage verified
- [ ] Transcript generation working

## Step 10: Monitoring & Maintenance

### Monitor Call Volume

```bash
# Query Cloud Logging for call metrics
gcloud logging read \
  "resource.type=cloud_function AND jsonPayload.event='INCOMING_CALL'" \
  --format=json | jq '.[] | .timestamp' | wc -l
```

### Review Recordings

```bash
# List recent recordings
gsutil ls -r gs://wise2-recordings-prod | head -20

# Download a recording for testing
gsutil cp gs://wise2-recordings-prod/rec_12345.wav ~/test-recording.wav
```

### Check Quota Usage

```bash
# View API quota usage
gcloud compute project-info describe --project=wise2-phone-prod \
  --format="table(quotas[].metric, quotas[].limit)"
```

## Troubleshooting

### No Incoming Calls

1. Verify webhook endpoint is accessible:
   ```bash
   curl https://wise2.net/webhooks/google-voice/events
   ```

2. Check Pub/Sub subscription:
   ```bash
   gcloud pubsub subscriptions describe wise2-phone-events-sub
   ```

3. Review logs:
   ```bash
   gcloud logging read "resource.type=cloud_pubsub_subscription" --limit=10
   ```

### Recording Storage Issues

1. Verify bucket permissions:
   ```bash
   gsutil iam get gs://wise2-recordings-prod
   ```

2. Test write access:
   ```bash
   echo "test" | gsutil cp - gs://wise2-recordings-prod/test.txt
   ```

### Transcript Generation Slow

Check Cloud Speech-to-Text quota:
```bash
gcloud compute project-info describe --project=wise2-phone-prod
```

## Rollback Procedure

If issues occur after deployment:

```bash
# Revert to previous image
docker-compose -f docker-compose.prod.yml down
docker pull wise2/ai-phone:$(date -d "1 day ago" +%Y%m%d)
docker tag wise2/ai-phone:$(date -d "1 day ago" +%Y%m%d) wise2/ai-phone:latest
docker-compose -f docker-compose.prod.yml up -d ai-phone

# Verify service
curl http://localhost:3001/health
```

## Support

For detailed setup documentation, see:
- `packages/ai-phone/GOOGLE_VOICE_INTEGRATION.md`
- `packages/ai-phone/README.md`

For Google Cloud documentation:
- https://cloud.google.com/communications
- https://cloud.google.com/speech-to-text
- https://cloud.google.com/storage
