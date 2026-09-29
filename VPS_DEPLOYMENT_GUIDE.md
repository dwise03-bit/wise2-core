# WISE² AI Phone — VPS Deployment Guide

**Your Number**: (336) 485-8421  
**Timeline**: 2-3 hours to live calls  
**Cost**: ~$30-50/month  
**Scalability**: 50+ concurrent calls

---

## Prerequisites Checklist

Before starting, you need:

- [ ] **Linux Server** (Ubuntu 22.04 LTS recommended)
  - 4+ CPU cores
  - 8+ GB RAM
  - 100+ GB disk space
  - Static public IP address
  - SSH access with sudo

- [ ] **SIP Provider** (choose one)
  - [ ] **Telnyx**: $1.50/month DID + $0.01-0.05/min usage
  - [ ] **Twilio SIP Trunk**: $1/month + pay-as-you-go

- [ ] **Domain Name** (optional, for production)
  - Points to your VPS public IP
  - HTTPS certificate (Let's Encrypt free)

---

## Step 1: Provision VPS (30 minutes)

### Option A: Recommended Providers
- **DigitalOcean**: $6-24/month
- **Linode**: $5-30/month  
- **AWS EC2**: $10-50/month
- **Vultr**: $6-24/month

### Create VPS Instance

1. Create Ubuntu 22.04 LTS droplet/instance
2. Select:
   - CPU: 4 cores minimum
   - RAM: 8 GB minimum
   - Disk: 100+ GB SSD
3. Add SSH key
4. Create instance
5. Note the **Public IP address**

### SSH Into Server

```bash
ssh ubuntu@YOUR_VPS_IP

# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## Step 2: Get SIP Provider (30 minutes)

### Choose One Provider

#### **Option A: Telnyx (Recommended)**

1. Go to **telnyx.com**
2. Sign up (free account)
3. Buy a phone number:
   - Messaging → Phone Numbers → Search
   - Select US number
   - Purchase
4. Set up SIP trunk:
   - Connections → Credentials
   - Create SIP user
   - Copy credentials:
     - **SIP Server**: sip.telnyx.com
     - **Username**: your_username
     - **Password**: your_password
     - **Phone Number**: +1XXXXXXXXXX

#### **Option B: Twilio SIP Trunk**

1. Go to **twilio.com**
2. Sign up
3. Create SIP trunk:
   - Phone Numbers → SIP Trunks
   - Create new trunk
   - Configure origination URL: `sip:your-vps-ip:5060`
4. Copy credentials:
   - **Account SID**
   - **Auth Token**
   - **SIP Server**: telnyx/twilio endpoint

---

## Step 3: Clone WISE² Core (10 minutes)

On your VPS:

```bash
cd ~

# Clone repository
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# Checkout latest
git pull origin main

# Create .env file
cat > .env << 'ENVEOF'
# Your Google Voice Number
GV_NUMBER=+13364858421

# SIP Provider (Telnyx)
SIP_PROVIDER=telnyx
SIP_SERVER=sip.telnyx.com
SIP_USERNAME=your_username
SIP_PASSWORD=your_password
SIP_PHONE_NUMBER=+1XXXXXXXXXX

# Twilio (if using)
TWILIO_ACCOUNT_SID=AC_YOUR_SID
TWILIO_AUTH_TOKEN=your_token

# API Configuration
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace

# AI Services (local)
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
WHISPER_URL=http://localhost:9000/v1/audio/transcriptions

# Database
DATABASE_URL=postgresql://wise2:secure_password@localhost:5432/wise2_prod
REDIS_URL=redis://:secure_password@localhost:6379/1

# Logging
LOG_LEVEL=info
NODE_ENV=production
ENVEOF

# Edit .env with your real credentials
nano .env
```

---

## Step 4: Deploy Services (1 hour)

### Start Docker Services

```bash
cd ~/wise2-core

# Pull images (if needed)
docker-compose -f docker-compose.phone.yml pull

# Start services
docker-compose -f docker-compose.phone.yml up -d

# Monitor startup (takes 5-10 minutes on first run)
docker-compose -f docker-compose.phone.yml logs -f phone-gateway

# Check status
docker-compose ps
```

Expected services running:
- phone-gateway (port 3001)
- postgres (port 5432)
- redis (port 6379)
- whisper (port 9000)
- ollama (port 11435)
- piper (port 8080)

### Wait for Health Check

```bash
# Check until healthy
watch curl http://localhost:3001/health

# Expected output:
# {
#   "status": "healthy",
#   "services": {
#     "stt": "online",
#     "llm": "online",
#     "tts": "online"
#   }
# }
```

---

## Step 5: Configure Firewall (10 minutes)

### Open Required Ports

```bash
# UFW firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (important!)
sudo ufw allow 22/tcp

# Allow SIP
sudo ufw allow 5060/udp
sudo ufw allow 5060/tcp

# Allow RTP (media)
sudo ufw allow 10000:20000/udp

# Allow Phone Gateway API
sudo ufw allow 3001/tcp

# Allow HTTPS (for webhooks)
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Check status
sudo ufw status

# Verify listening ports
sudo netstat -an | grep LISTEN | grep -E "5060|3001|10000"
```

---

## Step 6: Configure SIP Provider (20 minutes)

### For Telnyx

1. Go to **telnyx.com** → Connections
2. Create SIP connection:
   - Name: `wise2-phone`
   - Origination Type: IP
   - Origination Address: Your VPS public IP
   - Port: 5060
   - Protocol: UDP

3. Configure inbound:
   - Route inbound calls to your SIP user
   - Test call: Call your number, should reach Asterisk

### For Twilio

1. Go to **twilio.com** → Phone Numbers → SIP Trunks
2. Click your trunk
3. Origination:
   - Origination URLs: `sip:YOUR_VPS_IP:5060`
   - Friendly Name: wise2-phone
4. Termination:
   - Configure callback URL for incoming calls
   - Use: `https://YOUR_VPS_IP/v1/ai-phone/webhooks/twilio/voice`

---

## Step 7: Enable Google Voice Forwarding (5 minutes)

1. Go to **google.com/voice**
2. Settings → Forwarding phones
3. Add phone:
   - Enter your SIP provider's phone number
   - Example: +1XXXXXXXXXX (from Telnyx/Twilio)
4. Confirm the verification call
5. Done! All GV calls now route to your SIP provider → Asterisk → Phone Gateway

---

## Step 8: Enable HTTPS (10 minutes - optional but recommended)

For production webhook security:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (requires domain name)
sudo certbot certonly --standalone -d your-domain.com

# Configure Nginx reverse proxy
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/wise2-phone

# Add:
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/wise2-phone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: Verify Deployment (20 minutes)

### Run E2E Tests

```bash
bash scripts/test-phone-e2e.sh
```

Expected: All tests pass ✓

### Make Test Call

```bash
# From any phone, call your GV number:
Call: (336) 485-8421

# You should hear:
"Hello! Welcome to WISE²..."

# Say something:
"I need HVAC service"

# AI responds and creates lead in CRM
```

### Check Logs

```bash
# Real-time logs
docker-compose logs -f phone-gateway

# Look for:
# - "Call initialized"
# - "STT: Transcribed..."
# - "LLM: Generated response"
# - "Tool: Creating lead"
```

### Verify CRM

```bash
# Check if lead was created
curl -s http://localhost:3000/v1/ai-phone/leads \
  -H "X-Tenant-ID: default-workspace" | jq .
```

---

## Monitoring & Maintenance

### Health Check

```bash
# Check service health
curl http://localhost:3001/health | jq .

# Auto-monitoring with cron
echo "*/5 * * * * curl -f http://localhost:3001/health || systemctl restart wise2-phone" | crontab -
```

### Logs

```bash
# View recent logs
docker-compose logs --tail=100 phone-gateway

# Search for errors
docker-compose logs phone-gateway | grep -i error

# Follow in real-time
docker-compose logs -f
```

### Backup Database

```bash
# Daily backup
docker-compose exec postgres pg_dump -U wise2 wise2_prod > /backup/wise2-$(date +%Y-%m-%d).sql

# Add to cron
echo "0 2 * * * docker-compose -f /root/wise2-core/docker-compose.phone.yml exec postgres pg_dump -U wise2 wise2_prod > /backup/wise2-\$(date +\%Y-\%m-\%d).sql" | sudo crontab -
```

---

## Cost Breakdown

```
VPS Server:             $6-30/month
SIP Provider DID:       $1.50-2/month
SIP Usage (100 calls):  $1-5/month
AI Models (local):      $0/month
Database (local):       $0/month
──────────────────────────────
Total:                  ~$10-40/month

For 200 calls/day (100 min):
$25 (VPS) + $2 (SIP) + $3 (usage) = ~$30/month

vs Vapi/Retell: 90-95% cheaper ✓
```

---

## Troubleshooting

### "SIP calls not routing to Phone Gateway"

```bash
# Check Asterisk logs
docker-compose logs asterisk | grep -i error

# Check SIP registration
docker-compose exec asterisk asterisk -rx "pjsip show registration"
# Should show: "Registered"

# Verify firewall
sudo ufw status | grep 5060
sudo netstat -an | grep 5060
```

### "No audio or poor quality"

```bash
# Check RTP ports
sudo netstat -an | grep 1[0-9]000

# Increase media buffer
export RTP_BUFFER=4096
docker-compose restart

# Check network jitter
ping YOUR_VPS_IP
```

### "CRM leads not created"

```bash
# Verify API is running
curl http://localhost:3000/health

# Check phone-gateway logs for errors
docker-compose logs phone-gateway | grep -i crm

# Test CRM endpoint directly
curl -X POST http://localhost:3000/v1/ai-phone/lead \
  -H "X-Tenant-ID: default-workspace" \
  -H "Content-Type: application/json" \
  -d '{"intent":"test"}'
```

---

## Next Steps

### Day 1 (Deployment)
- [ ] Provision VPS
- [ ] Get SIP provider
- [ ] Deploy services
- [ ] Make test call
- [ ] Verify CRM integration

### Day 2 (Optimization)
- [ ] Set up monitoring
- [ ] Enable HTTPS
- [ ] Configure backups
- [ ] Load test

### Week 2 (Scale)
- [ ] Train Daniel voice
- [ ] Build call dashboard
- [ ] Enable outbound calling
- [ ] Integrate Field Tech

---

## Support

**If deployment fails:**

1. Check logs: `docker-compose logs --tail=100 phone-gateway`
2. Run tests: `bash scripts/test-phone-e2e.sh`
3. Check firewall: `sudo ufw status`
4. Verify SIP: `asterisk -rx "pjsip show registration"`

**Documentation:**
- Asterisk: `/docs/phone-system/PHASE2_ASTERISK_DEPLOYMENT.md`
- Full reference: `/DEPLOYMENT_READY.md`
- Twilio config: `/TWILIO_SETUP.md`

---

## Quick Command Reference

```bash
# Start everything
docker-compose -f docker-compose.phone.yml up -d

# View logs
docker-compose logs -f phone-gateway

# Run tests
bash scripts/test-phone-e2e.sh

# Check health
curl http://localhost:3001/health | jq .

# Stop services
docker-compose down

# Restart specific service
docker-compose restart phone-gateway

# View running containers
docker ps

# Check firewall
sudo ufw status
```

---

## Timeline

- **Provision VPS**: 30 min
- **Get SIP Provider**: 30 min
- **Clone & Deploy**: 10 min
- **Configure SIP**: 20 min
- **Enable Forwarding**: 5 min
- **Verify & Test**: 20 min

**Total: 2-3 hours to first live call**

---

**Status**: ✅ **READY FOR VPS DEPLOYMENT**

Your phone: (336) 485-8421  
Monthly cost: ~$30-40  
Concurrent calls: 50+  
Savings: 90-95% vs Vapi/Retell

Let's go! 🚀
