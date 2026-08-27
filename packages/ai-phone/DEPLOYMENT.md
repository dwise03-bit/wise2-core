# WISE² Phone System Deployment Guide

Comprehensive guide for deploying the WISE² AI Phone system with Asterisk PJSIP + Twilio BYOC integration.

**Status:** Production Ready  
**Last Updated:** 2026-08-24  
**Maintained By:** WISE² Engineering

## Quick Start (5 minutes)

If you just want to fix the Asterisk registration issue:

```bash
# 1. Deploy configs
sudo cp packages/ai-phone/config/pjsip.conf /etc/asterisk/
sudo cp packages/ai-phone/config/sorcery.conf /etc/asterisk/

# 2. Configure Twilio credentials
# Edit /etc/asterisk/pjsip.conf and replace:
#   TWILIO_ACCOUNT_SID
#   TWILIO_AUTH_TOKEN

# 3. Restart Asterisk
sudo systemctl restart asterisk

# 4. Verify registration
asterisk -rx "pjsip show registrations"
# Should show: twilio | Registered | twilio-endpoint

# Done! Registration is now working.
```

## Full Deployment (30 minutes)

### Prerequisites

- **Linux Server** (Ubuntu 20.04+, CentOS 8+, or similar)
- **Asterisk 20+** or **Asterisk 18+** with PJSIP
- **Twilio Account** with BYOC configured
- **Node.js 18+** for WISE² Phone API
- **Sudo access** on server

### Step 1: Deploy Asterisk Configuration (5 min)

#### 1a. Backup existing configs

```bash
sudo cp /etc/asterisk/pjsip.conf /etc/asterisk/pjsip.conf.backup.$(date +%s)
sudo cp /etc/asterisk/sorcery.conf /etc/asterisk/sorcery.conf.backup.$(date +%s)
```

#### 1b. Deploy WISE² PJSIP config

```bash
# Copy from repository
sudo cp packages/ai-phone/config/pjsip.conf /etc/asterisk/pjsip.conf

# Or download directly
sudo curl -o /etc/asterisk/pjsip.conf \
  https://raw.githubusercontent.com/wise2-org/wise2-core/main/packages/ai-phone/config/pjsip.conf
```

#### 1c. Deploy sorcery configuration

```bash
sudo cp packages/ai-phone/config/sorcery.conf /etc/asterisk/sorcery.conf

# Or verify it exists (usually comes with Asterisk)
ls -la /etc/asterisk/sorcery.conf
```

#### 1d. Set Twilio credentials

```bash
# Get credentials from https://console.twilio.com/account
export ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export AUTH_TOKEN="your_auth_token_here"

# Update pjsip.conf
sudo sed -i "s|TWILIO_ACCOUNT_SID|$ACCOUNT_SID|g" /etc/asterisk/pjsip.conf
sudo sed -i "s|TWILIO_AUTH_TOKEN|$AUTH_TOKEN|g" /etc/asterisk/pjsip.conf

# Verify (credentials should no longer show as placeholders)
grep "username=AC" /etc/asterisk/pjsip.conf | head -1
```

#### 1e. Validate configuration

```bash
# Check syntax
sudo asterisk -rx "config validate pjsip.conf"

# Expected: "Config file pjsip.conf is valid"

# If errors, fix and re-validate
cat /etc/asterisk/pjsip.conf | grep -n "TWILIO"  # Should find no matches
```

### Step 2: Start/Restart Asterisk (2 min)

```bash
# Restart Asterisk to load new configs
sudo systemctl restart asterisk

# Wait for startup
sleep 3

# Verify running
sudo systemctl status asterisk

# Check if PJSIP loaded
asterisk -rx "module show like pjsip"
# Should show: res_pjsip loaded
```

### Step 3: Verify Registration (5 min)

**THIS IS THE CRITICAL STEP** - Verify the sorcery fix worked:

```bash
# List all PJSIP registrations
asterisk -rx "pjsip show registrations"

# Expected output:
# =====================================
# Registration | Status    | Endpoint
# =====================================
# twilio       | Registered | twilio-endpoint
```

If you see `twilio` with status `Registered`, **you're done with the core fix!**

If not, run the diagnostic script:

```bash
# Run automated diagnostics
./packages/ai-phone/scripts/verify-twilio-byoc.sh

# It will identify and suggest fixes for any issues
```

### Step 4: Deploy WISE² Phone API (10 min)

The phone system needs the WISE² AI Phone API running to handle calls:

```bash
# Install dependencies
cd packages/ai-phone
pnpm install

# Start the API server
pnpm dev

# In another terminal, verify it's running
curl -s http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Step 5: Configure Inbound Routing (5 min)

Setup how inbound calls route to your AI receptionist:

#### 5a. Create AGI script

```bash
# Deploy the AI receptionist AGI script
sudo mkdir -p /var/lib/asterisk/agi-bin
sudo cp packages/ai-phone/agi/ai-receptionist.sh /var/lib/asterisk/agi-bin/ai-receptionist
sudo chmod +x /var/lib/asterisk/agi-bin/ai-receptionist
sudo chown asterisk:asterisk /var/lib/asterisk/agi-bin/ai-receptionist
```

#### 5b. Update dialplan (if needed)

The pjsip.conf already includes a basic dialplan for [from-twilio] context. Customize it:

```bash
# Edit the dialplan in pjsip.conf
sudo nano /etc/asterisk/pjsip.conf

# Find [from-twilio] section
# Modify the AGI line to point to your AI Phone API:
# AGI(agi://127.0.0.1:4573/ai-receptionist)

# Or modify to use Twilio Media Streams:
# Set(CHANNEL(hangup_handler_push)=media-stream,s,1)
```

#### 5c. Reload dialplan

```bash
# Reload to apply changes
asterisk -rx "core reload"

# Verify dialplan loaded
asterisk -rx "dialplan show from-twilio"
```

### Step 6: Test Inbound Call (5 min)

Make a test call to verify everything works:

```bash
# Monitor Asterisk in real-time
asterisk -rvvv

# In another terminal, call your Twilio BYOC number from another phone
# Watch Asterisk console for:
# [PJSIP] Incoming call from +1...
# [CallSession] Call established
# [AGI] Connecting to AI receptionist

# Listen for AI response (should answer call)
```

### Step 7: Production Hardening (10 min)

Before going live:

#### 7a. Secure AMI (Asterisk Management Interface)

```bash
# Edit manager.conf
sudo nano /etc/asterisk/manager.conf

# Ensure these settings:
[general]
enabled = yes
port = 5038
bindaddr = 127.0.0.1      # Only local access

[admin]
secret = your_strong_secret
permit=127.0.0.1/255.255.255.0
read = all
write = all
```

#### 7b. Restrict Firewall

```bash
# Allow SIP only from Twilio and local
sudo ufw allow 5060/udp from 54.172.60.0/22  # Twilio
sudo ufw allow 5060/udp from 10.0.0.0/8      # Local
sudo ufw allow 5038/tcp from 127.0.0.1       # AMI local only

# Deny all other SIP traffic
sudo ufw deny 5060/udp
sudo ufw deny 5038/tcp
```

#### 7c. Enable Rate Limiting

In pjsip.conf [global]:

```ini
[global]
max_retransmit=3
timer_t1=100
timer_t2=100
max_initial_qualify_attempts=3
```

#### 7d. Setup Monitoring

```bash
# Create health check script
cat > /usr/local/bin/check-asterisk-health.sh << 'EOF'
#!/bin/bash
# Check if Asterisk is running and PJSIP registration is active

STATUS=$(asterisk -rx "pjsip show registrations" 2>/dev/null)

if echo "$STATUS" | grep -q "twilio.*Registered"; then
    echo "OK: Twilio registration active"
    exit 0
else
    echo "CRITICAL: Twilio registration not active"
    asterisk -rx "pjsip show registrations"
    exit 1
fi
EOF

chmod +x /usr/local/bin/check-asterisk-health.sh

# Test it
/usr/local/bin/check-asterisk-health.sh
```

#### 7e. Setup Log Rotation

```bash
# Create logrotate config
sudo tee /etc/logrotate.d/asterisk << 'EOF'
/var/log/asterisk/messages.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 asterisk asterisk
    postrotate
        /usr/sbin/asterisk -rx "logger rotate" > /dev/null 2>&1 || true
    endscript
}
EOF
```

### Step 8: Deploy to Production

```bash
# Copy entire WISE² Phone package
rsync -av --delete packages/ai-phone/ /opt/wise2-phone/

# Start phone API service
sudo systemctl restart wise2-phone

# Verify all components running
systemctl status asterisk
systemctl status wise2-phone

# Run diagnostics
./packages/ai-phone/scripts/verify-twilio-byoc.sh
```

## Architecture Overview

```
+---------------------+
| Twilio              |
| (SIP-US1)           |
+------+------+-------+
       |      | Inbound Calls (Port 5060/UDP)
       |      | Outbound Registration
       |      |
       v      v
+-----+------+-------+
| Asterisk PJSIP     |
| ├─ twilio-reg      |
| ├─ twilio-endpoint |
| └─ from-twilio     | Dialplan
+------+------+------+
       | Port 5060 (SIP)
       | Port 10000-20000 (RTP)
       |
+------v------+
| WISE² Phone |
| API Server  | Express.js
| :3001       |
+-----+------+
      |
      v
+-----+----------+
| AI Receptionist|
| (Claude API)   |
+----------------+
```

## Configuration Files Reference

### pjsip.conf

**Location:** `/etc/asterisk/pjsip.conf`  
**Purpose:** PJSIP and Twilio BYOC configuration  
**Key sections:**
- `[transport-twilio]` — SIP transport to Twilio
- `[twilio-auth]` — Twilio credentials
- `[twilio-registration]` — Outbound registration config
- `[twilio-endpoint]` — Inbound call handler
- `[from-twilio]` — Dialplan for inbound calls

### sorcery.conf

**Location:** `/etc/asterisk/sorcery.conf`  
**Purpose:** Maps PJSIP objects to configuration sources  
**Critical line:** `registration=config,pjsip.conf,criteria=type=registration`

### device.yaml

**Location:** `apps/wise-defense-edge/config/device.yaml`  
**Purpose:** WISE Defense edge device configuration  
**Use:** Copy `device.yaml.twilio-byoc` and fill in credentials

## Troubleshooting

### Problem: Registration Not Appearing

```bash
# 1. Verify sorcery mapping
grep "registration=" /etc/asterisk/sorcery.conf

# 2. Check pjsip.conf has [twilio-registration]
grep -A 5 "\[twilio-registration\]" /etc/asterisk/pjsip.conf

# 3. Reload configs
asterisk -rx "core reload"

# 4. Check logs
tail -50 /var/log/asterisk/messages.log | grep registration
```

### Problem: Bad Credentials Error

```bash
# 1. Verify credentials in pjsip.conf
grep "username=AC" /etc/asterisk/pjsip.conf
grep "password=" /etc/asterisk/pjsip.conf

# 2. Get correct credentials from Twilio console
#    https://console.twilio.com/account

# 3. Update pjsip.conf and reload
asterisk -rx "core reload"
```

### Problem: Calls Not Routing to AI

```bash
# 1. Verify dialplan loaded
asterisk -rx "dialplan show from-twilio"

# 2. Check AGI script exists
ls -la /var/lib/asterisk/agi-bin/ai-receptionist

# 3. Test dialplan manually
asterisk -rx "dialplan exec from-twilio s"

# 4. Enable debug and watch logs
asterisk -rvvv
core set verbose 3
core set debug 3
# Make test call and watch output
```

## Verification Checklist

- [ ] Asterisk running: `sudo systemctl status asterisk`
- [ ] Configs deployed: `/etc/asterisk/pjsip.conf` and `/sorcery.conf`
- [ ] Twilio credentials configured (no PLACEHOLDER values)
- [ ] Syntax valid: `asterisk -rx "config validate pjsip.conf"`
- [ ] Registration appearing: `asterisk -rx "pjsip show registrations"` shows `twilio | Registered`
- [ ] WISE² Phone API running: `curl http://localhost:3001/health`
- [ ] Dialplan loaded: `asterisk -rx "dialplan show from-twilio"`
- [ ] Test call placed to Twilio BYOC number
- [ ] Asterisk answers call
- [ ] AI receptionist responds
- [ ] Firewall allows 5060/UDP from Twilio IPs

## Health Monitoring

### Manual Check

```bash
# Quick health check
./packages/ai-phone/scripts/verify-twilio-byoc.sh
```

### Automated Monitoring

```bash
# Add cron job to check health every 5 minutes
crontab -e

# Add line:
*/5 * * * * /usr/local/bin/check-asterisk-health.sh || mail -s "Asterisk Down" ops@wise2.net
```

### Prometheus Metrics

Export Asterisk metrics for monitoring:

```bash
# Enable Asterisk metrics exporter
docker run -d \
  --name asterisk-exporter \
  -p 9100:9100 \
  -v /var/run/asterisk/asterisk.ctl:/var/run/asterisk/asterisk.ctl \
  prom/prometheus-asterisk-exporter
```

## Support

For issues or questions:

1. **Run diagnostics:** `./packages/ai-phone/scripts/verify-twilio-byoc.sh`
2. **Check logs:** `tail -f /var/log/asterisk/messages.log`
3. **Enable debug:** See "Troubleshooting" section above
4. **Reference docs:**
   - [TWILIO_BYOC_SETUP.md](TWILIO_BYOC_SETUP.md) — Detailed BYOC guide
   - [README.md](README.md) — AI Phone API overview
   - [Asterisk PJSIP Docs](https://wiki.asterisk.org/wiki/display/AST/PJSIP)

## Key Files

- `packages/ai-phone/config/pjsip.conf` — Main PJSIP config
- `packages/ai-phone/config/sorcery.conf` — Sorcery mappings
- `packages/ai-phone/TWILIO_BYOC_SETUP.md` — Detailed setup guide
- `packages/ai-phone/scripts/verify-twilio-byoc.sh` — Diagnostic tool
- `apps/wise-defense-edge/config/device.yaml.twilio-byoc` — Device integration

## Production Checklist

Before going live:

- [ ] Asterisk hardened (restricted AMI, rate limits)
- [ ] Firewall configured (SIP, RTP, AMI ports)
- [ ] Monitoring setup (health checks, alerts)
- [ ] Log rotation configured
- [ ] Backup procedure documented
- [ ] Disaster recovery plan ready
- [ ] Load testing completed (concurrent calls)
- [ ] Security review completed
- [ ] GDPR/compliance review completed
- [ ] Documentation updated

## What Changed vs. Previous Setup

**The Problem:** PJSIP outbound registrations weren't loading because the sorcery mapping was missing.

**The Solution:** 
1. Created `sorcery.conf` with proper registration mapping
2. Created `pjsip.conf` with wizard-based Twilio configuration
3. Both files follow Asterisk 20+ best practices

**Result:** Registrations now load automatically on startup and stay active.

---

**Questions?** See TWILIO_BYOC_SETUP.md or run `verify-twilio-byoc.sh` for diagnostics.

**Status:** ✅ Production Ready  
**Last Tested:** 2026-08-24  
**Maintained By:** WISE² Engineering
