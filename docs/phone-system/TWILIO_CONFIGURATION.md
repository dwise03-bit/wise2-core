# Twilio BYOC Trunk Configuration for WISE² Asterisk
**Date**: August 23, 2026  
**Trunk Name**: wise2-asterisk  
**Status**: Created, awaiting deployment details

---

## Account Information

| Item | Value |
|------|-------|
| **Account SID** | (See Twilio Console) |
| **Auth Token** | (See Twilio Console → Account Settings) |
| **Phone Number** | (See Twilio Console) |
| **BYOC Trunk SID** | (See Twilio Console) |
| **Trunk Name** | `wise2-asterisk` |
| **Trial Balance** | $13.35 remaining |

---

## Current Status

### ✅ COMPLETED
- [x] BYOC Trunk created (`wise2-asterisk`)
- [x] Account provisioned
- [x] Phone number assigned (`+18668543330`)
- [x] Application webhooks configured

### ⏳ PENDING (After Asterisk Deployment)
- [ ] Termination SIP Domains configured
- [ ] Origination Connection Policy configured
- [ ] From Domain configured
- [ ] IP Access Control List created
- [ ] Test inbound call
- [ ] Test outbound call

---

## Configuration Steps (Post-Deployment)

### Step 1: Get Your Asterisk Server's IP

Once you deploy Asterisk:
```bash
# On your Asterisk server
curl -s ifconfig.me
# Returns: your.public.ip.address
```

### Step 2: Configure Termination SIP Domains

**Purpose**: Tell Asterisk where to send calls TO Twilio

In **Twilio Console → Voice → Manage → BYOC Trunks → wise2-asterisk**:

1. Click **Termination SIP Domains** dropdown
2. Click **+** to add new domain
3. Enter:
   - **Friendly Name**: `twilio-sip`
   - **Termination SIP URI**: `sip.twilio.com`
   - **BYOC Trunk**: `wise2-asterisk`
4. Under **Authentication**:
   - Create **IP Access Control List** with your Asterisk IP
5. Click **Save**

### Step 3: Configure Origination Connection Policy

**Purpose**: Tell Twilio which IPs can send calls TO us

1. In the same trunk config, click **Origination Connection Policy**
2. Click **+** to create new policy
3. Enter:
   - **Policy Name**: `asterisk-server`
   - **Allowed IPs**: Your Asterisk server's public IP
4. Click **Save**

### Step 4: Select the Policy

Back in trunk settings:
1. **Origination Connection Policy**: Select `asterisk-server`
2. Click **Save**

### Step 5: Configure From Domain

1. In **From Domain** field, enter: `sip.twilio.com`
2. Click **Save**

---

## Asterisk Configuration (PJSIP)

Once Termination SIP Domains are configured in Twilio, configure Asterisk to route calls to Twilio.

### /etc/asterisk/pjsip.conf

```ini
; Twilio BYOC Trunk
[transport-twilio]
type=transport
protocol=udp
bind=0.0.0.0:5060

[twilio-outbound]
type=registration
transport=transport-twilio
outbound_auth=twilio-auth
server_uri=sip:sip.twilio.com
client_uri=sip:+18668543330@sip.twilio.com

[twilio-auth]
type=auth
auth_type=userpass
username=AC9e082045SC2344d68baa54203dbd7  ; Account SID
password=your_auth_token_here

[twilio-endpoint]
type=endpoint
transport=transport-twilio
outbound_auth=twilio-auth
aors=twilio-aor
context=outbound-to-twilio
disallow=all
allow=ulaw
allow=alaw

[twilio-aor]
type=aor
max_contacts=1
contact=sip:sip.twilio.com
```

### Dialplan (/etc/asterisk/extensions.conf)

```ini
[outbound-to-twilio]
; Route calls through Twilio BYOC trunk
exten => _.,1,Dial(PJSIP/${EXTEN}@twilio-endpoint)
 same => n,Hangup()

[inbound-from-twilio]
; Incoming calls from Twilio BYOC trunk
exten => YOUR_DID,1,Answer()
 same => n,Stasis(wise2-phone-app)
 same => n,Hangup()
```

---

## Testing Inbound Call

Once everything is configured:

### Test from Twilio Console
```
Console → Phone Numbers → +18668543330
→ Call using a browser softphone
```

Expected flow:
1. Twilio receives call to +18668543330
2. Routes via BYOC trunk to your Asterisk server
3. Asterisk answers and routes to Phone Gateway
4. Phone Gateway plays greeting
5. Call progresses normally

### Check Logs
```bash
# On Asterisk server
sudo tail -f /var/log/asterisk/full | grep twilio

# Verify registration
asterisk -rx "pjsip show registrations"
# Should show: twilio-outbound  Registered
```

---

## Testing Outbound Call

Once inbound is working, test outbound:

### From Asterisk
```bash
asterisk -r
CLI> channel originate PJSIP/+12025551234@twilio-endpoint application echo
```

Expected:
- Call dials +1-202-555-1234
- Twilio processes the call
- Echo application returns audio

---

## SIP Domain Information

| Item | Value |
|------|-------|
| **Twilio SIP Domain** | `sip.twilio.com` |
| **Port (inbound)** | 5060 (UDP) |
| **Port (secure)** | 5061 (TLS) |
| **RTP Range** | 10000-20000 (UDP) |
| **Authentication** | Account SID + Auth Token |

---

## Firewall Rules (Production Server)

```bash
# Allow Twilio to reach your Asterisk
sudo ufw allow from 54.172.60.0/22 to any port 5060 proto udp comment "Twilio US-East SIP"
sudo ufw allow from 54.172.64.0/21 to any port 5060 proto udp comment "Twilio US-East SIP"
sudo ufw allow from 54.252.254.0/24 to any port 5060 proto udp comment "Twilio Australia SIP"

# Allow Twilio RTP
sudo ufw allow from 54.172.60.0/22 to any port 10000:20000 proto udp comment "Twilio RTP"
```

---

## Troubleshooting

### Inbound Calls Not Connecting
```bash
# Check SIP registration
asterisk -rx "pjsip show registrations"

# Check firewall
sudo ufw status
netstat -ulnp | grep 5060

# Check dialplan
asterisk -rx "dialplan show inbound-from-twilio"

# Monitor logs
asterisk -rv
CLI> core set verbose 3
```

### Audio Issues
- Check codec negotiation: `asterisk -rx "pjsip show endpoint asterisk"`
- Verify RTP ports: `netstat -ulnp | grep -E "1000[0-9]"`
- Check NAT settings: May need STUN/TURN for symmetric NAT

### Registration Failures
```bash
# Verify credentials
grep -A5 "twilio-auth" /etc/asterisk/pjsip.conf

# Check Twilio logs in Console
Console → Debugger → SIP Messages
```

---

## Cost Tracking

### Monthly Estimate (10 inbound + 10 outbound calls/day)

```
Inbound calls:   10/day × 30 = 300 calls/month
Outbound calls:  10/day × 30 = 300 calls/month
Avg duration:    5 minutes = 50 hours/month

Cost = 50 hours × $0.02/min = $60/month

PLUS:
DID rental:      ~$1.50/month
Minimum:         ~$61.50/month

(Note: Trial account includes $13.35 credit)
```

---

## Next Steps

1. **Deploy Asterisk** on Linux server (follow PHASE2_ASTERISK_DEPLOYMENT.md)
2. **Get server public IP**
3. **Return to Twilio Console**
4. **Configure Termination SIP Domains** (Twilio side)
5. **Configure Origination Connection Policy** (Twilio side)
6. **Update Asterisk PJSIP** with credentials
7. **Test inbound call** to +18668543330
8. **Test outbound call** via BYOC trunk

---

## Support

**Twilio Documentation**:
- BYOC Trunks: https://www.twilio.com/docs/sip-trunking/bring-your-own-carrier
- PJSIP Configuration: https://wiki.asterisk.org/wiki/display/AST/Configuring+res_pjsip

**Common Issues**:
- "Registration failed": Check username/password (Account SID + Auth Token)
- "No audio": Check firewall RTP range + codec settings
- "Calls not routing": Check dialplan context for inbound calls

---

**Setup Status**: ✅ Twilio BYOC Trunk Ready  
**Next Action**: Deploy Asterisk, return here to complete SIP configuration  
**Timeline**: 2-4 hours to full bidirectional calling
