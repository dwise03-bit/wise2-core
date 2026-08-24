# WISE² Phone System - Quick Start Deployment
**Complete end-to-end setup guide**  
**Estimated time: 30-60 minutes**

---

## PRE-REQUISITES

✅ **Already Completed**:
- Twilio BYOC Trunk created (`wise2-asterisk`)
- Phone Gateway service built
- All Docker configurations ready
- Asterisk deployment automation scripts

✅ **You Need**:
- Linux server (Ubuntu 22.04 LTS recommended)
- Root or sudo access
- Public IP address (static preferred)
- Twilio Auth Token (from Account Settings)

---

## DEPLOYMENT STEPS

### Step 1: Get Your Server Ready

```bash
# SSH into your Linux server
ssh root@your.server.ip

# Verify OS
lsb_release -a
# Output should show: Ubuntu 22.04 LTS

# Check available disk space
df -h /
# Should have at least 20GB free
```

### Step 2: Clone WISE² Repository

```bash
# Clone the project
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# Make deployment scripts executable
chmod +x scripts/deploy-phone-system.sh
chmod +x scripts/post-deploy-setup.sh
```

### Step 3: Run Automated Deployment

```bash
# Run the main deployment script (takes 5-10 minutes)
sudo bash scripts/deploy-phone-system.sh

# Expected output: Deployment complete!
```

**This script automatically**:
- ✅ Updates system packages
- ✅ Installs Docker & Docker Compose
- ✅ Installs Asterisk 22 LTS
- ✅ Configures PJSIP
- ✅ Configures Dialplan
- ✅ Starts Asterisk service
- ✅ Configures UFW firewall
- ✅ Deploys Docker services (Whisper, Piper, Ollama, Phone Gateway)

### Step 4: Complete Manual Configuration

```bash
# Edit Asterisk PJSIP config
sudo nano /etc/asterisk/pjsip.conf

# Find and replace these lines:
# Line: password=AUTH_TOKEN_HERE
# Replace with your Twilio Auth Token
# (Get from: Twilio Console → Account → API Keys & tokens → Auth token)

# Save: Ctrl+X → Y → Enter
```

### Step 5: Get Your Twilio Auth Token

1. Open Twilio Console: https://console.twilio.com
2. Click your Account name (top right)
3. Select "Account"
4. Under "API Keys & tokens", copy the **Auth token**
5. Paste it into `/etc/asterisk/pjsip.conf`

### Step 6: Reload Asterisk Configuration

```bash
# Connect to Asterisk CLI
asterisk -r

# In the CLI:
CLI> pjsip reload
CLI> dialplan reload
CLI> exit
```

### Step 7: Verify Twilio Registration

```bash
# Check if Asterisk registered with Twilio
asterisk -rx "pjsip show registrations"

# Expected output:
# twilio-outbound             Registered
# (If it says "Failed", check Auth Token)
```

### Step 8: Run Post-Deployment Checks

```bash
# Run verification script
bash scripts/post-deploy-setup.sh

# Expected: All services show ✓ OK
```

### Step 9: Configure Firewall (Security)

```bash
# If behind NAT, allow specific Twilio IPs
sudo ufw allow from 54.172.60.0/22 to any port 5060 proto udp
sudo ufw allow from 54.172.64.0/21 to any port 5060 proto udp
sudo ufw allow from 54.252.254.0/24 to any port 5060 proto udp

# Reload firewall
sudo ufw reload
```

### Step 10: Complete Twilio SIP Configuration

Return to Twilio Console to configure SIP routing:

1. **Get your server's public IP**:
   ```bash
   curl ifconfig.me
   # Copy this IP address
   ```

2. **In Twilio Console**:
   - Go to Voice → BYOC Trunks → wise2-asterisk
   - Click Termination SIP Domains → +
   - Friendly Name: `twilio-sip`
   - Termination SIP URI: `sip.twilio.com`
   - BYOC Trunk: `wise2-asterisk`
   - Click Save

3. **Configure Origination Connection Policy**:
   - Click Origination Connection Policy → +
   - Policy Name: `asterisk-server`
   - Allowed IPs: (Paste your public IP)
   - Click Save

4. **Select the policy**:
   - In trunk settings, set Origination Connection Policy to `asterisk-server`
   - Click Save

---

## TESTING

### Test 1: Verify All Services Are Running

```bash
# Check Docker containers
docker ps

# Expected: All 5 containers running
# - phone-api
# - whisper
# - piper
# - ollama
# - postgres (if using local DB)

# Check Asterisk
systemctl status asterisk

# Expected: active (running)
```

### Test 2: Test Phone Gateway API

```bash
# Call health endpoint
curl -s http://localhost:3001/health | jq .

# Expected:
# {
#   "status": "healthy",
#   "services": {
#     "stt": "online",
#     "llm": "online",
#     "tts": "online",
#     "asterisk": "online"
#   }
# }
```

### Test 3: Test Inbound Call

1. **From Twilio Console**:
   - Go to Phone Numbers → +18668543330
   - Click Make a Test Call
   - Use the browser softphone

2. **Expected behavior**:
   - Asterisk receives call
   - Phone Gateway answers
   - Greeting plays: "Hey, you reached WISE² HVAC Solutions..."
   - Call connects successfully

3. **If no audio**:
   ```bash
   # Check logs
   sudo tail -f /var/log/asterisk/full
   docker-compose logs -f phone-api
   ```

### Test 4: Test STT (Speech-to-Text)

```bash
# Record a test audio file or use a sample
ffmpeg -f lavfi -i "sine=frequency=1000:duration=2" test.wav

# Send to Whisper STT
curl -X POST http://localhost:8000/v1/audio/transcriptions \
  -F "file=@test.wav" \
  -F "language=en"

# Expected: JSON response with transcribed text
```

---

## TROUBLESHOOTING

### Problem: Asterisk won't start

```bash
# Check for errors
sudo systemctl status asterisk
sudo journalctl -u asterisk -n 50

# Verify config syntax
sudo asterisk -vvv

# Check syntax only
asterisk -cx "dialplan show" 2>&1 | head -20
```

### Problem: Twilio registration fails

```bash
# Verify credentials
grep -A2 "twilio-auth" /etc/asterisk/pjsip.conf

# Monitor SIP traffic
sudo tcpdump -i any -A 'udp port 5060' | grep -i register

# Check logs
sudo tail -f /var/log/asterisk/full | grep -i twilio
```

### Problem: No audio on inbound call

```bash
# Check codec negotiation
asterisk -rx "pjsip show endpoint wise2-gateway"

# Verify RTP ports are open
sudo netstat -ulnp | grep -E "1000[0-9]"

# Check for NAT issues
# If behind NAT, may need STUN server
```

### Problem: Phone Gateway won't start

```bash
# Check Docker logs
docker-compose logs phone-api

# Verify environment variables
cat /opt/wise2-phone/.env

# Restart service
docker-compose restart phone-api

# Check database connectivity
docker-compose exec phone-api curl postgresql://wise2:password@postgres:5432/wise2_prod
```

---

## MONITORING & LOGS

### Real-time Monitoring

```bash
# Asterisk console (interactive)
sudo asterisk -rv

# From CLI:
CLI> core show channels
CLI> pjsip show registrations
CLI> pjsip show endpoints

# Exit: CLI> exit
```

### Log Files

```bash
# Asterisk full log
sudo tail -f /var/log/asterisk/full

# Phone Gateway logs
docker-compose logs -f phone-api

# All Docker services
docker-compose logs -f

# Specific service
docker-compose logs -f whisper
```

### Performance Monitoring

```bash
# Docker resource usage
docker stats

# System load
top -b -n 1 | head -12

# Disk usage
df -h

# Memory usage
free -h
```

---

## MAINTENANCE

### Daily Checks

```bash
# Verify all services running
systemctl status asterisk
docker-compose ps

# Check for errors in logs
docker-compose logs --tail 50 | grep -i error
```

### Weekly Tasks

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade

# Check disk space
df -h /

# Verify Twilio SIP registration
asterisk -rx "pjsip show registrations"
```

### Backup Configuration

```bash
# Backup Asterisk config
sudo tar -czf /opt/asterisk-config-backup-$(date +%Y%m%d).tar.gz /etc/asterisk/

# Backup Phone Gateway config
tar -czf /opt/phone-gateway-backup-$(date +%Y%m%d).tar.gz /opt/wise2-phone/

# List backups
ls -lh /opt/*backup*.tar.gz
```

---

## SECURITY HARDENING

### 1. Secure Asterisk Manager

```bash
# Edit manager.conf
sudo nano /etc/asterisk/manager.conf

# Add IP restrictions
[general]
enabled=yes
port=5038
bindaddr=127.0.0.1  ; Only localhost
tlsenable=yes
tlsbindaddr=127.0.0.1:5039
```

### 2. Fail2ban Configuration

```bash
# Check Fail2ban status
sudo systemctl status fail2ban

# View Asterisk jail
sudo fail2ban-client status asterisk

# Ban offending IPs automatically
sudo tail -f /var/log/fail2ban.log
```

### 3. Disable Unnecessary SIP Options

```bash
# In pjsip.conf, disable debug
debug=no
verbose=no

# Disable unnecessary options
allow_anonymous_inbound_calls=no
```

---

## DEPLOYMENT COMPLETE CHECKLIST

- [ ] Server provisioned (Ubuntu 22.04)
- [ ] deploy-phone-system.sh executed successfully
- [ ] Asterisk running (systemctl status asterisk)
- [ ] Docker services running (docker-compose ps)
- [ ] Twilio Auth Token configured in pjsip.conf
- [ ] Twilio SIP routing configured
- [ ] Inbound call test successful
- [ ] All health checks passing (post-deploy-setup.sh)
- [ ] Logs monitored for errors
- [ ] Firewall configured
- [ ] Backup strategy implemented

---

## NEXT STEPS

1. **Train Daniel Voice** (optional)
   - Use reference audio to fine-tune TTS
   - See: `/docs/phone-system/VOICE_TRAINING.md`

2. **Configure CRM Integration**
   - Wire tool calls to your CRM API
   - Enable lead creation during calls

3. **Build Dashboard**
   - Monitor active calls in real-time
   - View call transcripts
   - Track voice training progress

4. **Deploy Field Tech App**
   - Receive work order notifications
   - Real-time technician dispatch
   - Job status updates

---

## SUPPORT & DOCUMENTATION

- **Twilio BYOC Docs**: https://www.twilio.com/docs/sip-trunking/bring-your-own-carrier
- **Asterisk PJSIP**: https://wiki.asterisk.org/wiki/display/AST/Configuring+res_pjsip
- **Phone Gateway**: See `apps/phone-gateway/README.md`
- **Full Docs**: See `/docs/phone-system/`

---

## SUCCESS INDICATORS

✅ **You'll know it's working when**:
1. Asterisk shows "Registered" for Twilio trunk
2. Phone Gateway health check shows all services online
3. Inbound call to +18668543330 is answered
4. Audio plays successfully
5. Transcription appears in logs
6. LLM response generates
7. AI voice speaks back

**Time to first successful call: 30-60 minutes**

---

**Ready to deploy? Run:**
```bash
sudo bash scripts/deploy-phone-system.sh
```

**Questions?** Check `/docs/phone-system/` for detailed guides.
