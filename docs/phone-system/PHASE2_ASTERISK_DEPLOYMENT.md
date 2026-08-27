# Phase 2: Asterisk 22 LTS Installation & Configuration
**Target**: Production Linux server (Ubuntu 22.04 LTS or Rocky 9)  
**Timeline**: 1-2 days including testing  
**Blocker**: None technical (requires server access)

---

## 1. Pre-Deployment Checklist

- [ ] Linux server access (SSH as root or sudo)
- [ ] Public IP or domain for inbound SIP
- [ ] SIP carrier account created (Telnyx, Twilio, etc.)
- [ ] Firewall rules prepared for ports 5060, 5061, 10000-20000
- [ ] Existing WISE² services running (PostgreSQL, Redis, Hermes)
- [ ] Disk space available (5 GB minimum)

---

## 2. System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y \
  build-essential \
  libncurses5-dev \
  libssl-dev \
  libxml2-dev \
  libsqlite3-dev \
  uuid-dev \
  libjansson-dev \
  wget \
  curl \
  git

# Create asterisk user
sudo useradd -m -d /var/lib/asterisk -s /bin/bash asterisk
sudo usermod -a -G audio asterisk
```

---

## 3. Install Asterisk 22 LTS

### Option A: Via Package Manager (Recommended for Ubuntu)

```bash
# Add Asterisk repo
sudo add-apt-repository ppa:asterisk/lts

# Update packages
sudo apt update

# Install Asterisk 22 LTS (latest point release)
sudo apt install -y asterisk
```

### Option B: Build from Source

```bash
# Download Asterisk 22 LTS (check for latest point release at asterisk.org)
cd /tmp
wget http://downloads.asterisk.org/pub/asterisk/asterisk-22.1.1.tar.gz
tar xzf asterisk-22.1.1.tar.gz
cd asterisk-22.1.1

# Configure
./configure --with-pjproject-bundled \
  --with-ssl=openssl \
  --with-sqlite3 \
  --with-jansson \
  --disable-asteriskssl

# Build
make -j$(nproc)

# Install
sudo make install
sudo make config

# Setup directories
sudo mkdir -p /var/spool/asterisk/{voicemail,recordings}
sudo chown -R asterisk:asterisk /var/spool/asterisk
```

---

## 4. Configure Asterisk

### 4.1 PJSIP Configuration

Create `/etc/asterisk/pjsip.conf`:

```ini
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060
local_net=127.0.0.1/8
external_media_address=YOUR_PUBLIC_IP
external_signaling_address=YOUR_PUBLIC_IP

[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089

; Inbound SIP provider (e.g., Telnyx)
[PSTN_PROVIDER]
type=registration
transport=transport-udp
outbound_auth=PSTN_AUTH
server_uri=sip:YOUR_SIP_PROVIDER_HOST
client_uri=sip:YOUR_DID@YOUR_SIP_PROVIDER_HOST

[PSTN_AUTH]
type=auth
auth_type=userpass
username=YOUR_SIP_USERNAME
password=YOUR_SIP_PASSWORD

[PSTN_ENDPOINT]
type=endpoint
transport=transport-udp
outbound_auth=PSTN_AUTH
aors=PSTN_AOR
context=inbound-calls

[PSTN_AOR]
type=aor
contact=sip:YOUR_SIP_PROVIDER_HOST

; WISE² Gateway Application
[wise2-gateway]
type=endpoint
transport=transport-udp
context=wise2-phone
auth=gateway-auth
aors=gateway-aor
disallow=all
allow=ulaw
allow=alaw
allow=opus

[gateway-auth]
type=auth
auth_type=userpass
username=wise2_gateway
password=SECURE_RANDOM_PASSWORD

[gateway-aor]
type=aor
max_contacts=1
contact=sip:phone-gateway:5061
```

### 4.2 Dialplan Configuration

Create `/etc/asterisk/extensions.conf`:

```ini
[inbound-calls]
; Route inbound calls from SIP provider to WISE² gateway
exten => YOUR_DID,1,Answer()
 same => n,Set(CHANNEL(language)=en)
 same => n,Stasis(wise2-phone-app)
 same => n,Hangup()

; Default context
exten => _.,1,Playback(silence/1)
 same => n,Hangup()

[wise2-phone]
; WISE² Gateway context
exten => 1000,1,NoOp(Test extension)
 same => n,Playback(silence/1)
 same => n,Hangup()
```

### 4.3 ARI Configuration

Create `/etc/asterisk/ari.conf`:

```ini
[general]
pretty=yes

[wise2-gateway]
type=user
password=SECURE_RANDOM_PASSWORD
```

---

## 5. Set Permissions & Start Asterisk

```bash
# Fix permissions
sudo chown -R asterisk:asterisk /etc/asterisk
sudo chown -R asterisk:asterisk /var/lib/asterisk
sudo chown -R asterisk:asterisk /var/spool/asterisk
sudo chown -R asterisk:asterisk /var/log/asterisk

# Enable and start service
sudo systemctl enable asterisk
sudo systemctl start asterisk

# Verify
sudo systemctl status asterisk

# Check Asterisk is running
sudo asterisk -rv
```

Inside Asterisk CLI:
```
CLI> pjsip show endpoints
CLI> pjsip show aors
CLI> core show settings
CLI> exit
```

---

## 6. Firewall Configuration

```bash
# Allow SIP and RTP
sudo ufw allow 5060/udp
sudo ufw allow 5061/tcp
sudo ufw allow 5061/udp
sudo ufw allow 8089/tcp
sudo ufw allow 10000:20000/udp

# Verify
sudo ufw status

# Enable if not already
sudo ufw enable
```

---

## 7. SIP Provider Configuration

### For Telnyx:

1. Get credentials:
   - Username: Your Telnyx SIP username
   - Password: Your SIP password
   - Host: Your assigned SIP server
   - DID: Phone number assigned

2. In `/etc/asterisk/pjsip.conf`, update:
```ini
[PSTN_PROVIDER]
server_uri=sip:TELNYX_SIP_SERVER:5060
client_uri=sip:YOUR_PHONE_NUMBER@TELNYX_SIP_SERVER:5060

[PSTN_AUTH]
username=YOUR_TELNYX_USERNAME
password=YOUR_TELNYX_PASSWORD
```

3. Test registration:
```bash
sudo asterisk -rv
CLI> pjsip show registration PSTN_PROVIDER
```

Should show: **Registered** (not Failed)

---

## 8. Test Asterisk Connectivity

```bash
# Test extension 1000
asterisk -r 'console dial PJSIP/1000'

# Should play silence/1
```

---

## 9. Configure Logging

Update `/etc/asterisk/logger.conf`:

```ini
[general]
dateformat=%F %T

[logfiles]
full=>verbose,debug,notice,warning,error,dtmf,fax
console=>notice,warning,error
```

View logs:
```bash
sudo tail -f /var/log/asterisk/full
```

---

## 10. Monitoring & Supervision

### Systemd Service (recommended)

Asterisk should auto-restart on crash:

```bash
sudo systemctl status asterisk
```

### Health Check Script

Create `/usr/local/bin/asterisk-health.sh`:

```bash
#!/bin/bash
asterisk -rx "pjsip show registration PSTN_PROVIDER" | grep -q "Registered"
if [ $? -eq 0 ]; then
    echo "Asterisk: OK"
    exit 0
else
    echo "Asterisk: FAILED - Not registered"
    systemctl restart asterisk
    exit 1
fi
```

Add to crontab:
```bash
*/5 * * * * /usr/local/bin/asterisk-health.sh >> /var/log/asterisk-health.log 2>&1
```

---

## 11. Security Hardening

### Rate Limiting

```bash
# Install fail2ban
sudo apt install fail2ban

# Create /etc/fail2ban/jail.local:
[asterisk]
enabled=true
port=5060,5061
logpath=/var/log/asterisk/security
backend=systemd
bantime=3600
findtime=600
maxretry=5
```

### Disable Anonymous SIP

In `/etc/asterisk/pjsip.conf`, ensure no `[anonymous]` endpoint exists.

### Secure ARI Password

Replace `SECURE_RANDOM_PASSWORD` with:
```bash
openssl rand -base64 32
```

---

## 12. Disable Unused Modules

Edit `/etc/asterisk/modules.conf`:

```ini
[modules]
autoload=yes

; Disable unnecessary modules
noload=>res_pjsip_logger.so
noload=>res_fax.so
noload=>res_http_websocket.so  ; Keep if using WebSocket for Phone Gateway
```

Reload:
```
asterisk -rx "module reload"
```

---

## 13. Initial Testing (Before Phone Gateway)

```bash
# 1. Verify Asterisk is listening
netstat -ulnp | grep asterisk

# 2. Test SIP registration
asterisk -rx "pjsip show registration"

# 3. Test call handling
# (Requires actual SIP trunk test call or softphone)
```

---

## 14. Troubleshooting

### Registration Failed
```bash
asterisk -rx "pjsip show registration PSTN_PROVIDER"
```
Check username/password and provider hostname.

### No Audio
- Check RTP port range open: `sudo netstat -ulnp | grep 1000[0-9]`
- Verify codecs: `asterisk -rx "pjsip show transports"`

### High CPU
- Check for loops in dialplan
- Verify modules not consuming resources: `asterisk -rx "module show"`

---

## 15. Next Phase

Once Asterisk is verified operational:
1. Deploy Phone Gateway service (Node.js)
2. Configure Asterisk → Phone Gateway ARI connection
3. Test complete call flow: Inbound → AI → Outbound

**Status: PHASE 2 COMPLETE**

---

## Quick Reference

| Task | Command |
|------|---------|
| Status | `sudo systemctl status asterisk` |
| Restart | `sudo systemctl restart asterisk` |
| Logs | `sudo tail -f /var/log/asterisk/full` |
| CLI | `sudo asterisk -rv` |
| Reload Config | `asterisk -rx "dialplan reload"` |
| Show Registrations | `asterisk -rx "pjsip show registrations"` |
| Test Call | `asterisk -r 'console dial PJSIP/1000'` |
