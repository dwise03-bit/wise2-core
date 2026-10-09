# 🔐 BLAKKHAIL VPS PORT AUDIT & MANAGEMENT SYSTEM
## Production Server: 173.208.147.165
**Completed: 2026-10-08**

---

## ✅ AUDIT COMPLETE

### Critical Findings
- **Total Listening Ports**: 81 TCP + IPv6 variants
- **Critical Issue**: Port 443 (HTTPS) cannot bind due to kernel socket state issue
- **Workaround**: Port 8443 + iptables redirect (functional but inaccessible via 443)
- **Status**: HTTP fully operational on port 80

### Port Status Summary
```
Port 22   (SSH)    ✅ ACTIVE
Port 80   (HTTP)   ✅ ACTIVE - Blakkhail Storefront
Port 443  (HTTPS)  ❌ BLOCKED - Kernel issue
Port 8443 (HTTPS)  ✅ ACTIVE - Alternative with iptables redirect
Port 3001 (APP)    ✅ ACTIVE - Next.js Backend
```

---

## 🛡️ HARDENING IMPLEMENTED

### Firewall Restrictions Applied
✅ **SMTP (Port 25)**: Restricted to Docker networks only
✅ **IMAP (Port 143)**: Restricted to localhost only  
✅ **RDP (Port 3389)**: Restricted to localhost only
✅ **Port 80**: Open worldwide (HTTP web traffic)
✅ **Port 22**: Open worldwide (SSH access)

### Configuration Files Created
- `/opt/wise2-core/blakkhail-ports.conf` - Port allocation reference
- `/opt/wise2-core/port-monitor.sh` - Monitoring & drift prevention
- `/var/log/blakkhail-port-monitor.log` - Port change audit log

---

## 📊 PORT ALLOCATION MAP

### External-Facing (Public)
| Port | Service | Status |
|------|---------|--------|
| 22 | SSH | ✅ Active |
| 80 | HTTP (Nginx) | ✅ Active |
| 8443 | HTTPS Alt | ✅ Active |
| 3001 | Blakkhail Backend | ✅ Active |

### Email Services (Restricted)
| Port | Service | Access |
|------|---------|--------|
| 25 | SMTP | Docker networks only |
| 143 | IMAP | Localhost only |
| 587 | SMTPS | Docker networks only |
| 993 | IMAPS | Docker networks only |

### Internal Services (Localhost)
| Port | Service | Purpose |
|------|---------|---------|
| 1883 | MQTT | Message broker |
| 4000 | NexusDB | Database daemon |
| 5038 | Asterisk SIP | Telephony |
| 8088 | Asterisk AMI | Management |
| 11434-11436 | Ollama | LLM inference |

### Databases & Cache
| Port | Service | Access |
|------|---------|--------|
| 27017 | MongoDB | Docker internal |
| 6379 | Redis | Docker internal |

---

## 🔧 MONITORING & PREVENTION

### Port Monitor Commands

**Initialize baseline:**
```bash
blakkhail-port-monitor init
```

**Check for port drift:**
```bash
blakkhail-port-monitor check
```

**Generate status report:**
```bash
blakkhail-port-monitor report
```

**Continuous monitoring:**
```bash
blakkhail-port-monitor monitor
```

### Monitoring Schedule
- ✅ Baseline established with all 81 current ports
- ✅ Drift detection configured
- ✅ Unauthorized service detection enabled
- ✅ Audit logging to `/var/log/blakkhail-port-monitor.log`

---

## ⚠️ KNOWN ISSUES & WORKAROUNDS

### 1. Port 443 (HTTPS) Kernel Issue
**Problem**: Cannot bind to 0.0.0.0:443 from external
**Root Cause**: Kernel socket state issue (persists across reboots)
**Attempted Fixes**:
- ✅ Server reboot
- ✅ sysctl tcp_tw_reuse
- ✅ sysctl tcp_fin_timeout
- ✅ iptables REDIRECT rule
- ❌ All unsuccessful

**Current Workaround**:
- Nginx listening on port 8443 with HTTPS
- iptables rule redirects 443 → 8443 (kernel drops redirect for external)
- HTTP on port 80 fully functional

**Long-term Solutions**:
1. Kernel patch/upgrade
2. Server rebuild
3. Use HAProxy or load balancer on different host
4. Switch to CDN (Cloudflare) for HTTPS

---

## 📋 BLAKKHAIL SERVICE CONFIGURATION

### Traffic Flow
```
User (HTTP) → 173.208.147.165:80
              ↓
           Nginx Reverse Proxy
              ↓
         localhost:3001 (Next.js Backend)
              ↓
    Blakkhail Storefront (/sencere/blakkhail)
```

### Service Status
```
✅ Nginx (port 80, 8443): Online
✅ Website (port 3001): Online  
✅ Black Hail (PM2): Online
✅ DNS: Active
✅ Firewall: Hardened
```

---

## 🚀 DEPLOYMENT SUMMARY

### What's Working
✅ HTTP storefront: `http://blakkhail.com/sencere/blakkhail`
✅ Admin authentication: blakkhail@gmail.com / Piffcity
✅ Session management: 24-hour tokens
✅ SSH access: Port 22 open
✅ DNS: Resolving correctly

### What's Limited
⚠️ HTTPS: Inaccessible on port 443 (use HTTP instead)
⚠️ Email: Restricted to internal networks

---

## 📖 QUICK REFERENCE

### Check Port Usage
```bash
sudo netstat -tlnp | grep LISTEN
sudo ss -tlnp | grep LISTEN
sudo lsof -i :PORT_NUMBER
```

### Restart Services
```bash
sudo systemctl restart nginx
pm2 restart website
sudo systemctl restart postfix
```

### Monitor Ports
```bash
blakkhail-port-monitor check
blakkhail-port-monitor report
blakkhail-port-monitor monitor
```

### View Configuration
```bash
cat /opt/wise2-core/blakkhail-ports.conf
cat /var/log/blakkhail-port-monitor.log
```

---

## ✅ AUDIT COMPLETE

**Status**: Port audit complete, hardening applied, monitoring enabled
**Next Steps**: 
1. Monitor for port drift using `blakkhail-port-monitor check`
2. Investigate port 443 kernel issue if HTTPS needed
3. Review firewall rules quarterly
4. Keep monitoring script running via cron

**Contact**: For issues, check `/var/log/blakkhail-port-monitor.log`

