# 🚀 DEPLOY NOW — Your AI Phone in 2-3 Hours

**Your Number**: (336) 485-8421  
**Status**: All code ready, deployment automated  
**Next**: Execute these steps

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before you start, have these ready:

- [ ] **VPS Access**
  - [ ] Ubuntu 22.04 server provisioned
  - [ ] SSH access configured
  - [ ] Public IP address noted
  - [ ] 4+ CPU, 8 GB RAM, 100 GB disk

- [ ] **SIP Provider Account** (Choose one)
  - [ ] **Telnyx**: telnyx.com (recommended)
    - [ ] Account created
    - [ ] Phone number purchased
    - [ ] SIP credentials generated (server, username, password)
  - [ ] **Twilio**: twilio.com
    - [ ] Account created
    - [ ] SIP trunk configured
    - [ ] Auth token copied

- [ ] **Google Voice**
  - [ ] Number ready: (336) 485-8421
  - [ ] Access to settings

---

## 🎬 DEPLOYMENT STEPS (Copy & Execute)

### **STEP 1: Provision VPS (30 min)**

If you don't have a VPS yet, choose one:

```bash
# Option A: DigitalOcean (easiest)
# → digitalocean.com
# → Create droplet: Ubuntu 22.04 LTS
# → Size: 4 GB / 2 CPU ($12/month)
# → Wait for creation
# → Note the IP address

# Option B: Linode
# → linode.com → Create Linode
# → Ubuntu 22.04 LTS, 8GB RAM
# → Note the IP address

# Option C: Vultr
# → vultr.com → Deploy New Instance
# → Ubuntu 22.04 LTS, 4GB RAM
# → Note the IP address
```

**Save your VPS IP address**: `YOUR_VPS_IP = _____________`

---

### **STEP 2: Get SIP Provider (30 min)**

**Choice A: Telnyx (Recommended)**
```bash
# 1. Go to telnyx.com
# 2. Sign up (free account)
# 3. Messaging → Phone Numbers
# 4. Buy a number (e.g., US number)
# 5. Connections → Credentials
# 6. Create SIP user or get existing credentials
# 7. Save these:
#    SIP_SERVER = sip.telnyx.com
#    SIP_USERNAME = your_username
#    SIP_PASSWORD = your_password
#    SIP_PHONE_NUMBER = +1XXXXXXXXXX
```

**Choice B: Twilio**
```bash
# 1. Go to twilio.com
# 2. Sign up (free $15 credit)
# 3. Phone Numbers → Get a Number
# 4. SIP Trunks → Create trunk
# 5. Save these:
#    TWILIO_ACCOUNT_SID = AC...
#    TWILIO_AUTH_TOKEN = ...
#    TWILIO_PHONE_NUMBER = +1...
```

---

### **STEP 3: SSH to VPS (1 min)**

From your terminal:

```bash
ssh ubuntu@YOUR_VPS_IP
# Replace YOUR_VPS_IP with actual IP
# Answer 'yes' to "Are you sure?"
```

You should now be connected to your VPS.

---

### **STEP 4: Run Deployment Script (10 min)**

On your VPS, run this single command:

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/deploy-vps.sh)"
```

This automatically:
✓ Updates system
✓ Installs Docker + Docker Compose
✓ Clones WISE² Core
✓ Creates configuration
✓ Configures firewall
✓ Starts all services

**Wait for completion.** You should see:
```
✓ System updated
✓ Docker installed
✓ Docker Compose installed
✓ Repository ready
✓ Configuration ready
✓ Firewall configured
✓ Services healthy
```

**Note the IP address shown at end.**

---

### **STEP 5: Configure SIP Credentials (10 min)**

On your VPS, edit the configuration file:

```bash
nano /opt/wise2-core/.env
```

Find and update these lines with your SIP credentials:

```bash
# For Telnyx:
SIP_SERVER=sip.telnyx.com
SIP_USERNAME=your_username
SIP_PASSWORD=your_password
SIP_PHONE_NUMBER=+1XXXXXXXXXX

# For Twilio:
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

Save and exit:
- Press `Ctrl+X`
- Press `Y` to confirm
- Press `Enter`

Restart services:

```bash
cd /opt/wise2-core
docker-compose -f docker-compose.phone.yml restart
```

Wait 30 seconds for restart.

---

### **STEP 6: Configure SIP Provider Routing (20 min)**

Log into your SIP provider (Telnyx or Twilio) and configure inbound routing.

**For Telnyx:**
1. Go to telnyx.com → Connections
2. Create/Edit SIP Connection
3. Set Origination IP: `YOUR_VPS_IP`
4. Set Origination Port: `5060`
5. Protocol: UDP
6. Save

**For Twilio:**
1. Go to twilio.com → Phone Numbers → SIP Trunks
2. Click your trunk
3. Set Origination URLs: `sip://YOUR_VPS_IP:5060`
4. Save

Verify SIP registration:

```bash
docker-compose -f /opt/wise2-core/docker-compose.phone.yml exec asterisk asterisk -rx "pjsip show registration"
```

Should show: `Registered` ✓

---

### **STEP 7: Enable Google Voice Forwarding (5 min)**

1. Go to **google.com/voice**
2. Settings (gear icon)
3. Forwarding phones
4. Click "Add phone"
5. Enter your SIP provider's phone number
6. Click "Call" to verify
7. Enter the confirmation code
8. Done!

Now all calls to (336) 485-8421 route to your VPS.

---

### **STEP 8: Test Call (5 min)**

From any phone, call your Google Voice number:

```
Call: (336) 485-8421
```

You should hear:
```
"Hello! Welcome to WISE². How can I help you today?"
```

Try saying:
```
"I need HVAC service"
```

AI should respond and create a lead in your CRM.

---

## ✅ VERIFICATION

After calling, verify everything worked:

```bash
# SSH to VPS
ssh ubuntu@YOUR_VPS_IP

# Check service health
curl http://localhost:3001/health | jq .

# View call logs
docker-compose -f /opt/wise2-core/docker-compose.phone.yml logs phone-gateway | tail -50

# Check if lead was created
curl http://localhost:3000/v1/ai-phone/leads \
  -H "X-Tenant-ID: default-workspace" | jq .
```

Expected:
- ✓ Health check shows all services "online"
- ✓ Logs show "Call initialized" + "Tool: Creating lead"
- ✓ Lead appears in CRM

---

## 🎯 TIMELINE

| Step | Time | Status |
|------|------|--------|
| 1. Provision VPS | 30 min | ⏳ Do this |
| 2. Get SIP | 30 min | ⏳ Do this |
| 3. SSH | 1 min | ⏳ Do this |
| 4. Deploy | 10 min | ✅ Automated |
| 5. Configure SIP | 10 min | ⏳ Do this |
| 6. Setup routing | 20 min | ⏳ Do this |
| 7. GV Forward | 5 min | ⏳ Do this |
| 8. Test | 5 min | ⏳ Do this |
| **TOTAL** | **2-3 hrs** | **🚀 LIVE** |

---

## 💰 COSTS

```
VPS (DigitalOcean):      $12/month
SIP DID (Telnyx):        $1.50/month
Usage (100 calls):       $0.50/month
────────────────────────────────
TOTAL:                   $14/month

vs Competitors:
- Vapi: $210-600/month   → 95% savings ✓
- Retell: $24-72/month   → 80% savings ✓
- Bland: $90/month       → 84% savings ✓
```

---

## 🆘 QUICK TROUBLESHOOTING

### "Deployment script failed"
```bash
# Check logs
docker-compose logs --tail=50 phone-gateway

# Try restarting
docker-compose restart
```

### "SIP not registering"
```bash
# Verify firewall
sudo ufw status | grep 5060

# Check registration
docker-compose exec asterisk asterisk -rx "pjsip show registration"
```

### "Call doesn't ring"
```bash
# Verify SIP provider routing is correct
# Verify firewall allows UDP 5060
# Verify GV forwarding is enabled
```

### "Poor audio quality"
```bash
# Increase RTP buffer
export RTP_BUFFER=4096
docker-compose restart
```

---

## 📚 DOCUMENTATION

For detailed help:
- `VPS_QUICK_START.md` — Overview
- `VPS_DEPLOYMENT_GUIDE.md` — Full reference
- `TWILIO_SETUP.md` — Twilio-specific

---

## 🎉 WHEN IT'S LIVE

Your AI phone is ready to:
✅ Answer incoming calls 24/7
✅ Transcribe speech in real-time
✅ Generate intelligent responses
✅ Create leads automatically
✅ Schedule appointments
✅ Handle 50+ concurrent calls

**Your Phone**: (336) 485-8421

---

## 📞 START NOW

Ready? Follow these steps:

1. **Provision VPS** (30 min)
   - DigitalOcean: digitalocean.com
   - Note IP address

2. **Get SIP Provider** (30 min)
   - Telnyx: telnyx.com
   - Copy credentials

3. **SSH to VPS** (1 min)
   - `ssh ubuntu@YOUR_VPS_IP`

4. **Run Script** (10 min)
   - `sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/deploy-vps.sh)"`

5. **Configure SIP** (10 min)
   - `nano /opt/wise2-core/.env`
   - Add credentials

6. **Setup Routing** (20 min)
   - Configure SIP provider

7. **Forward GV** (5 min)
   - google.com/voice → Settings

8. **Test** (5 min)
   - Call (336) 485-8421

**Total Time: 2-3 hours**
**Total Cost: $14-40/month**
**Savings: 95% vs Vapi/Retell**

---

**You've got this! 🚀**

Go deploy!
