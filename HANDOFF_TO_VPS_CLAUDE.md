# WISE² AI Phone System — Handoff to VPS Claude

**Handoff Date**: 2026-08-30  
**From**: Claude Code (Local development)  
**To**: Claude (VPS deployment)  
**Status**: ✅ All code complete, deployment automation ready

---

## 🎯 YOUR VPS TARGET

**Hostname**: `gpu-nmls-1.tail44396d.ts.net`  
**Domain**: `wise2.net`  
**User**: `ubuntu`  
**SSH Command**: `ssh ubuntu@gpu-nmls-1.tail44396d.ts.net`  
**Phone Number**: (336) 485-8421  
**Status**: 🟢 Ready for deployment

---

## CURRENT STATE

### What's Complete
- ✅ Phone Gateway (Node.js) — full call orchestration
- ✅ CRM Integration — customer/lead/appointment/workorder APIs
- ✅ Asterisk PBX — SIP trunk ready
- ✅ Database Schema — PostgreSQL with migrations
- ✅ Docker Compose — 6-service stack
- ✅ Deployment Scripts — 4 automated scripts
- ✅ Documentation — 9 complete guides
- ✅ Test Suite — E2E tests + Telnyx API validation
- ✅ Telnyx API Key — Validated and working

### What's Ready to Deploy
- All code is on main branch (committed)
- All scripts are executable
- All documentation is in root directory
- No additional coding needed

### What You (VPS Claude) Will Do
- Execute deployment scripts
- Verify system health
- Troubleshoot any issues
- Confirm everything working

---

## DEPLOYMENT INSTRUCTIONS FOR VPS

### Prerequisites (Already Done or Provided)
- ✅ Ubuntu 22.04 LTS VPS provisioned (user provides IP)
- ✅ SSH access to ubuntu user with sudo
- ✅ Telnyx test API key validated
- ✅ Telnyx SIP credentials available (user provides)
- ✅ Google Voice number ready: (336) 485-8421

### Your Job: Execute This

```bash
# 1. SSH to VPS
ssh ubuntu@gpu-nmls-1.tail44396d.ts.net

# 2. Clone repository (if not already done)
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# 3. Create .env with credentials (user provides SIP username/password)
cat > .env << ENVEOF
GV_NUMBER=+13364858421
SIP_PROVIDER=telnyx
SIP_SERVER=sip.telnyx.com
SIP_USERNAME=<user_sip_username>
SIP_PASSWORD=<user_sip_password>
SIP_PHONE_NUMBER=+13364858421
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
WHISPER_URL=http://localhost:9000/v1/audio/transcriptions
DATABASE_URL=postgresql://wise2:wise2_secure@localhost:5432/wise2_prod
REDIS_URL=redis://:wise2_secure@localhost:6379/1
LOG_LEVEL=info
NODE_ENV=production
ENVEOF

# 4. Run deployment script (automated)
bash deploy-vps.sh

# 5. Wait for services (5-10 minutes)
watch curl http://localhost:3001/health

# 6. Run tests
bash scripts/test-phone-e2e.sh

# 7. Run Telnyx validation (set your actual API key)
export TELNYX_API_KEY="YOUR_TELNYX_API_KEY_HERE"
bash scripts/test-telnyx.sh

# 8. Verify everything
docker-compose ps
docker-compose logs -f phone-gateway
```

---

## KEY FILES YOU'LL NEED

### Deployment Scripts
- `deploy-vps.sh` — Main deployment (8 steps, fully automated)
- `deploy-final.sh` — Alternative one-command deployment (if user runs from laptop)
- `scripts/test-phone-e2e.sh` — Full system test
- `scripts/test-telnyx.sh` — Validate Telnyx API key

### Documentation
- `DEPLOYMENT_CHECKLIST.md` — Complete 5-phase plan (user follows this)
- `VPS_DEPLOYMENT_GUIDE.md` — Detailed reference with troubleshooting
- `DEPLOY_NOW.md` — Execution checklist
- `START_HERE.md` — Decision tree

### Code
- `docker-compose.phone.yml` — Service definitions
- `apps/phone-gateway/` — Call orchestration logic
- `packages/api/src/ai-phone/` — API webhook handlers
- `packages/db/` — Database schema

---

## EXPECTED FLOW

### User Actions (Outside VPS)
1. ✅ Provision Ubuntu 22.04 VPS on DigitalOcean/Linode/etc
2. ✅ Get Telnyx SIP credentials (username + password)
3. ✅ SSH key setup for ubuntu user
4. → Hands off to Claude on VPS

### VPS Claude Actions (You)
1. Clone repository
2. Create .env with user's SIP credentials
3. Run `bash deploy-vps.sh` (fully automated)
4. Verify all services healthy
5. Run test suite
6. Confirm Telnyx connectivity
7. Report back: "System ready for call testing"

### User Actions (After VPS Deployment)
1. Configure Telnyx routing (point to VPS IP)
2. Enable Google Voice forwarding
3. Make test call to (336) 485-8421
4. Verify lead creation in CRM

---

## HEALTH CHECK COMMANDS

Use these to verify system is working:

```bash
# Basic health
curl http://localhost:3001/health | jq .

# All services running?
docker-compose ps

# Check each service
docker-compose logs phone-gateway | tail -20
docker-compose logs asterisk | tail -20
docker-compose logs ollama | tail -20

# SIP registration?
docker-compose exec asterisk asterisk -rx "pjsip show registration"

# Database alive?
docker-compose exec postgres psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public'"

# Redis alive?
docker-compose exec redis redis-cli ping
```

---

## COMMON ISSUES & FIXES

### Services Won't Start
```bash
# Check Docker
docker --version
docker-compose --version

# Check disk space
df -h

# Check logs
docker-compose logs --tail=50

# Restart
docker-compose down
docker-compose up -d
```

### SIP Not Registering
```bash
# Check Asterisk logs
docker-compose logs asterisk | grep -i "pjsip\|registration"

# Verify credentials in .env
grep "SIP_" .env

# Check firewall
sudo ufw status
sudo ufw allow 5060/udp
sudo ufw allow 5060/tcp
sudo ufw allow 10000:20000/udp
```

### API Not Responding
```bash
# Check API logs
docker-compose logs phone-gateway | grep -i error

# Check database
docker-compose exec postgres pg_isready

# Restart API
docker-compose restart phone-gateway
```

---

## SUCCESS CRITERIA

When you're done, verify:
- [ ] All 6 Docker services running (`docker-compose ps`)
- [ ] Health endpoint returns `{"status":"healthy"}` 
- [ ] E2E tests pass (`bash scripts/test-phone-e2e.sh`)
- [ ] Telnyx API validated (`bash scripts/test-telnyx.sh`)
- [ ] SIP shows "Registered" (`asterisk -rx "pjsip show registration"`)
- [ ] No critical errors in logs

If all ✓, report: **"System ready for call testing"**

---

## WHAT TO REPORT BACK

After deployment, provide user with:
1. VPS IP address
2. Status of all services (running/failed)
3. Health check result (healthy/error)
4. Any configuration needed in Telnyx console
5. Timeline to first call

Example:
```
✅ Deployment complete
- VPS IP: 192.168.1.100
- Services: 6/6 healthy
- Health: {"status":"healthy"}
- Telnyx: Ready for SIP routing config
- Next: User configures Telnyx → enables GV → test call
- ETA to first call: 30 minutes
```

---

## RESOURCES

- GitHub: https://github.com/dwise03-bit/wise2-core
- Main branch: All code ready
- Telnyx docs: https://developers.telnyx.com
- Docker docs: https://docs.docker.com

---

## CONTACT HANDOFF

This handoff is complete when:
1. ✅ VPS deployment script runs successfully
2. ✅ All services healthy
3. ✅ Health check passes
4. ✅ Telnyx connectivity verified
5. ✅ Status report sent to user

User then:
1. Configures Telnyx SIP routing
2. Enables Google Voice forwarding
3. Makes test call

---

**Handoff Status**: 🟢 **READY**  
**Next Action**: VPS Claude executes deployment  
**Timeline**: 30 min for deployment + verification  
**Success Criteria**: All services healthy + tests passing

Good luck! 🚀
