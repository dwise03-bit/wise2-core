# Google Voice Deployment Checklist

Complete step-by-step deployment checklist for production environment.

## Quick Start

```bash
# Phase 1: Install gcloud CLI locally
# Phase 2: Run automated setup (or manual steps)
# Phase 3: Extract credentials
# Phase 4: Deploy to production server
# Phase 5: Test and verify
```

## Phase 1: Prerequisites

- [ ] Google Cloud account with billing enabled
- [ ] gcloud CLI installed
- [ ] Access to production server (173.208.147.165)
- [ ] Docker installed on server

## Phase 2: Google Cloud Setup

```bash
# Set variables
export PROJECT_NAME="wise2-phone-prod"
export SA_NAME="wise2-phone-prod"

# Create project
gcloud projects create $PROJECT_NAME --name="WISE² Phone Production"
gcloud config set project $PROJECT_NAME

# Enable APIs
gcloud services enable communication.googleapis.com speech.googleapis.com \
  storage-component.googleapis.com logging.googleapis.com pubsub.googleapis.com

# Create service account
SA_EMAIL="${SA_NAME}@${PROJECT_NAME}.iam.gserviceaccount.com"
gcloud iam service-accounts create $SA_NAME --display-name="WISE² Phone Production"

# Create key
gcloud iam service-accounts keys create ~/wise2-phone-key.json --iam-account=$SA_EMAIL

# Grant roles
gcloud projects add-iam-policy-binding $PROJECT_NAME \
  --member=serviceAccount:$SA_EMAIL --role=roles/communication.admin
gcloud projects add-iam-policy-binding $PROJECT_NAME \
  --member=serviceAccount:$SA_EMAIL --role=roles/storage.admin
gcloud projects add-iam-policy-binding $PROJECT_NAME \
  --member=serviceAccount:$SA_EMAIL --role=roles/logging.logWriter

# Create storage bucket
gsutil mb -l us-central1 -b on gs://wise2-recordings-prod

# Create Pub/Sub topic
gcloud pubsub topics create wise2-phone-events
gcloud pubsub subscriptions create wise2-phone-events-sub \
  --topic=wise2-phone-events \
  --push-endpoint=https://wise2.net/webhooks/google-voice/events \
  --push-auth-service-account=$SA_EMAIL
```

## Phase 3: Extract Credentials

```bash
python3 << 'PYTHON'
import json, os
with open(os.path.expanduser('~/wise2-phone-key.json')) as f:
    c = json.load(f)
for k in ['project_id', 'private_key_id', 'client_email', 'client_id', 'client_x509_cert_url']:
    print(f"{k.upper().replace('_', '_GOOGLE_')}={c[k]}")
print(f"GOOGLE_PRIVATE_KEY={repr(c['private_key'])}")
PYTHON

# Save to file
cat > ~/.wise2-google-voice-creds.env << 'EOF'
# Paste output from above
EOF
chmod 600 ~/.wise2-google-voice-creds.env
```

## Phase 4: Deploy to Production

```bash
# SSH to server
ssh dwise@173.208.147.165

# Pull latest code
cd ~/wise2-core
git fetch origin main && git checkout main

# Copy credentials
scp ~/.wise2-google-voice-creds.env dwise@173.208.147.165:~/

# Add to .env.production
cat ~/wise2-google-voice-creds.env >> ~/.wise2-core/.env.production
chmod 600 ~/.wise2-core/.env.production

# Build Docker image
docker build -f packages/ai-phone/Dockerfile -t wise2/ai-phone:latest .

# Deploy services
source ~/.wise2-core/.env.production
docker-compose -f docker-compose.prod.yml up -d ai-phone api

# Verify
curl http://localhost:3001/webhooks/google-voice/health
docker-compose logs -f ai-phone
```

## Phase 5: Verify & Test

```bash
# Check deployment
docker ps | grep ai-phone

# Test webhook
curl -X POST http://localhost:3001/webhooks/google-voice/events \
  -H "Content-Type: application/json" \
  -d '{"type":"INCOMING_CALL","callId":"test-001","googleCallId":"gv-123","from":"+1-555-9999","to":"+1-555-0123","timestamp":"2026-08-23T17:00:00Z"}'

# Expected: {"success":true,"callId":"test-001"}

# Check logs
docker-compose logs ai-phone | grep "INCOMING_CALL"

# Monitor recordings
gsutil ls -r gs://wise2-recordings-prod

# View Google Cloud logs
gcloud logging read "logName:projects/wise2-phone-prod/logs/wise2-phone" --limit=20
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| gcloud not found | Install Google Cloud SDK |
| Project creation fails | Check billing account is enabled |
| Service account creation fails | Check IAM permissions |
| Bucket creation fails | Project doesn't have billing enabled |
| Docker build fails | Check Node/npm versions |
| Service won't start | Check .env.production variables |
| Webhook not receiving calls | Verify Pub/Sub subscription URL |

## Files Generated

- `GOOGLE_VOICE_DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - This file
- `scripts/deploy-google-voice.sh` - Automated setup script
- `packages/ai-phone/GOOGLE_VOICE_INTEGRATION.md` - Integration guide
- `.env.production.example` - Environment template

## Next Steps

1. Follow phases above in order
2. Verify all checks pass
3. Test with incoming call
4. Monitor production logs
5. Configure monitoring alerts

All components ready for production deployment! 🚀
