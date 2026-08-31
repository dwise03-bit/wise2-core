# WISE² AI Phone — Final Deployment Checklist

**Status**: ✅ **READY FOR PRODUCTION DEPLOYMENT**

**Your Phone**: (336) 485-8421  
**Telnyx API Key**: ✅ **VALIDATED**  
**Estimated Timeline**: 2-3 hours to live calls

---

## Phase 1: Pre-Deployment (You Do This)

### VPS Provisioning (30 minutes)

- [ ] Create Ubuntu 22.04 LTS instance on:
  - DigitalOcean ($6–12/mo)
  - Linode ($5–30/mo)
  - Vultr ($6–24/mo)
  - AWS EC2 ($10–50/mo)

- [ ] Specifications:
  - [ ] CPU: 4+ cores
  - [ ] RAM: 8+ GB
  - [ ] Disk: 100+ GB SSD
  - [ ] Network: Static public IP
  - [ ] SSH: Add your public key

- [ ] Note VPS details:
  ```
  VPS IP: ___________________
  SSH User: ubuntu
  SSH Key: ~/.ssh/id_rsa
  ```

### Telnyx Configuration (30 minutes)

- [ ] Account created at **telnyx.com**
- [ ] Telnyx API key obtained: ✅ Already provided
- [ ] SIP credentials created:
  ```
  SIP Server: sip.telnyx.com
  SIP Username: ___________________
  SIP Password: ___________________
  ```

---

## Phase 2: Automated Deployment (5 minutes)

### Execute VPS Deployment

Run this single command from your Mac/laptop:

```bash
bash deploy-final.sh <VPS_IP> <SIP_USERNAME> <SIP_PASSWORD> sip.telnyx.com
```

**Example:**
```bash
bash deploy-final.sh 192.168.1.100 my_telnyx_user my_telnyx_pass sip.telnyx.com
```

Script handles automatically:
- [ ] SSH connection verification
- [ ] System updates
- [ ] Docker + Docker Compose installation
- [ ] Repository clone
- [ ] .env configuration with credentials
- [ ] Firewall setup (SIP/RTP/API ports)
- [ ] Docker Compose startup
- [ ] Health check validation

---

## Phase 3: SIP Provider Configuration (20 minutes)

### Telnyx Portal Setup

1. Log into **telnyx.com**
2. Connections → Credentials
3. Create/verify SIP user with credentials from Phase 1
4. Note your SIP phone number: ___________________

### Telnyx Routing

1. Connections → Outbound Routes
2. Create new route:
   - [ ] Origination Type: **IP**
   - [ ] Origination IP: **Your VPS public IP** (from Phase 2)
   - [ ] Origination Port: **5060**
   - [ ] Protocol: **UDP**
   - [ ] Destination: **Your SIP user**

3. Test inbound routing:
   - [ ] Call your Telnyx number
   - [ ] Should reach Asterisk on VPS
   - [ ] Verify in docker logs: `docker-compose logs asterisk`

---

## Phase 4: Google Voice Setup (5 minutes)

1. Go to **google.com/voice**
2. Settings → Forwarding phones
3. Add phone number:
   - [ ] Enter your **Telnyx SIP phone number**
   - [ ] Confirm verification call
   - [ ] Enable forwarding

---

## Phase 5: Verification (5 minutes)

### Make Test Call

```bash
# Call from ANY phone (mobile, landline, etc.)
Call: (336) 485-8421

# Expected:
# ✓ Rings immediately (< 2 seconds)
# ✓ Greeting plays: "Hello! Welcome to WISE²..."
# ✓ You can speak and hear responses
# ✓ Lead created in CRM
```

### Verify on VPS

```bash
# SSH to VPS
ssh ubuntu@<VPS_IP>

# Check service health
curl http://localhost:3001/health | jq .

# Expected output:
# {
#   "status": "healthy",
#   "services": {
#     "stt": "online",
#     "llm": "online",
#     "tts": "online"
#   }
# }

# View call logs
docker-compose logs -f phone-gateway | grep -i "call initialized"

# Verify SIP registration
docker-compose exec asterisk asterisk -rx "pjsip show registration"
# Should show: Registered
```

### Check CRM Integration

```bash
# Verify lead was created
curl http://localhost:3001/crm/leads \
  -H "X-Tenant-ID: default-workspace" | jq .

# Expected: Lead with caller info, timestamp, transcript
```

---

## Deployment Command Summary

```bash
# 1. Provision VPS (manual) — 30 min
# 2. Get Telnyx credentials (manual) — 30 min

# 3. Deploy to VPS (automated) — 5 min
bash deploy-final.sh 192.168.1.100 my_user my_pass sip.telnyx.com

# 4. Configure Telnyx routing (manual) — 20 min
# 5. Enable GV forwarding (manual) — 5 min
# 6. Test call (manual) — 5 min

# Total: ~2–3 hours
```

---

## Post-Deployment Tasks

### Day 1 (Verification)
- [ ] Make 5+ test calls
- [ ] Verify audio quality
- [ ] Check CRM lead creation
- [ ] Review call transcripts

### Day 2 (Optimization)
- [ ] Set up monitoring: `watch curl http://localhost:3001/health`
- [ ] Enable call logging/analytics
- [ ] Configure backup: `docker-compose exec postgres pg_dump -U wise2 wise2_prod > backup.sql`
- [ ] Load test: `bash scripts/test-phone-e2e.sh`

### Week 1 (Scale)
- [ ] Train custom voice model (optional)
- [ ] Build call dashboard
- [ ] Enable outbound calling
- [ ] Integrate with Field Tech app

---

## Cost & Savings

| Component | Cost/Month | Total |
|-----------|-----------|-------|
| VPS (DigitalOcean) | $6–12 | |
| Telnyx DID | $1.50 | |
| Telnyx usage (200 calls) | $3–10 | |
| **Total** | **$10–22** | **per month** |

**vs. Competitors**:
- Vapi: $200–600/month
- Retell: $150–500/month
- Twilio Studio: $100–300/month

**Your savings: 90–95%** ✓

---

## Quick Reference Commands

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f phone-gateway

# Check service status
docker ps

# Health check
curl http://localhost:3001/health | jq .

# Restart services
docker-compose restart

# Stop all
docker-compose down

# View database
docker-compose exec postgres psql -U wise2 -d wise2_prod

# Test CRM
curl -X POST http://localhost:3001/crm/lead \
  -H "X-Tenant-ID: default-workspace" \
  -d '{"intent":"test"}'
```

---

## Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Call goes to voicemail | GV forwarding enabled? | Enable in google.com/voice |
| No audio | Firewall open? | `sudo ufw status` |
| Asterisk can't register | SIP credentials correct? | Verify in .env + Telnyx portal |
| Slow response | CPU/RAM? | Scale VPS instance |
| No CRM leads | API running? | `curl http://localhost:3000/health` |

---

## Files & Docs Reference

**Deployment Scripts**
- `deploy-final.sh` — One-command VPS deployment
- `deploy-phone.sh` — Local Docker setup
- `scripts/test-phone-e2e.sh` — Full test suite
- `scripts/test-telnyx.sh` — Verify Telnyx API key ✅ Done

**Documentation**
- `START_HERE.md` — Decision tree
- `DEPLOY_NOW.md` — Execution checklist
- `VPS_DEPLOYMENT_GUIDE.md` — Full reference
- `ACTIVATION_PHONE.md` — Local testing guide

**Code**
- `apps/phone-gateway/` — Call orchestration
- `packages/api/src/ai-phone/` — Webhook handlers
- `docker-compose.phone.yml` — Service definitions

---

## Final Status

| Component | Status |
|-----------|--------|
| Code | ✅ Complete & Tested |
| Deployment Scripts | ✅ Ready |
| Documentation | ✅ Complete |
| Telnyx API Key | ✅ Validated |
| System Architecture | ✅ Production-Ready |

**You are ready to deploy.** Proceed with VPS provisioning.

---

**Your AI Phone System**  
**Number**: (336) 485-8421  
**Cost**: ~$15/month  
**Timeline**: 2-3 hours  
**Status**: 🟢 Ready to Launch

🚀
