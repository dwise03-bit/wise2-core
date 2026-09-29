# DEPLOY NOW — WISE DEFENSE TO RASPBERRY PI

**Everything is ready. Here's exactly what to do.**

---

## ⚡ FASTEST WAY (Automated, 10 minutes total)

### On Your Mac (Terminal)

**Step 1: Find your Pi's IP address**

```bash
# On your Raspberry Pi (terminal or via SSH):
hostname -I

# You'll see something like: 192.168.1.100
# Note this IP — you'll need it
```

**Step 2: Run automated deployment**

```bash
cd /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge

# Replace IP and username as needed
bash QUICK_DEPLOY.sh 192.168.1.100 pi
```

The script will:
- ✅ Transfer all files to Pi
- ✅ Run installer automatically (3-5 min)
- ✅ Verify installation
- ✅ Show you the API status

**That's it!** API will be running at: `http://192.168.1.100:3014`

---

## 📋 MANUAL DEPLOYMENT (If You Prefer)

### On Your Mac

**Step 1: Copy installer to Pi via SCP**

```bash
PI_IP="192.168.1.100"  # Replace with your Pi's IP
PI_USER="pi"            # Or your Pi username

scp -r /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge \
  ${PI_USER}@${PI_IP}:~/wise-defense
```

### On Your Raspberry Pi (SSH or Console)

**Step 2: Run installer**

```bash
cd ~/wise-defense

chmod +x scripts/install-wise2-defense.sh

sudo bash scripts/install-wise2-defense.sh
```

Wait 3-5 minutes for installation to complete.

**Step 3: Verify**

```bash
curl http://localhost:3014/health
```

Should return:
```json
{"status": "OPERATIONAL", "device_id": "...", "timestamp": "..."}
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

Once installer completes (on Pi):

### 1. Check Service Status
```bash
systemctl status wise2-defense
```
Should show: `active (running)`

### 2. View Logs
```bash
journalctl -u wise2-defense -n 20
```
Should show: `WISE Defense Edge Intelligence Node starting`

### 3. Test API
```bash
curl http://localhost:3014/health
```
Should return `200 OK` with status "OPERATIONAL"

### 4. Create Test Incident
```bash
API_KEY=$(grep WISE_DEFENSE_API_KEY /opt/wise2-defense/.env | cut -d= -f2)

curl -X POST http://localhost:3014/api/incidents \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "test",
    "headline": "Test Incident",
    "category": "police",
    "incident_type": "test",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```
Should return: `{"id": "...", "threat_level": "LOW", "status": "created"}`

### 5. Reboot Test (Verify Auto-Start)
```bash
sudo reboot

# After ~30 seconds:
curl http://localhost:3014/health
```
Should still respond with `200 OK`

---

## 🔗 ACCESS THE API

**From Raspberry Pi:**
```bash
curl http://localhost:3014/health
curl http://localhost:3014/api/dashboard
```

**From Another Computer (Same Network):**
```bash
curl http://<pi-ip>:3014/health
curl http://<pi-ip>:3014/api/dashboard
```

**Dashboard Integration (Coming Phase 2):**
```
https://wisedefensellc.com/wise-defense/dashboard
```

---

## 🚨 TROUBLESHOOTING DURING DEPLOYMENT

**If installer fails:**
```bash
# Check what went wrong
sudo tail -f /var/log/wise2-defense/api.log

# Check disk space (needs 2GB free)
df -h /

# Check Python version
python3 --version

# Re-run installer
sudo bash ~/wise-defense/scripts/install-wise2-defense.sh
```

**If API doesn't respond:**
```bash
# Check service
systemctl status wise2-defense

# Restart it
sudo systemctl restart wise2-defense

# Wait 5 seconds
sleep 5

# Try again
curl http://localhost:3014/health
```

**If SSH connection fails:**
```bash
# Make sure SSH is enabled on Pi
# On Pi: sudo raspi-config → Interface Options → SSH → Enable

# Test connection
ssh -v pi@192.168.1.100

# Or copy files via USB drive instead (see DEPLOYMENT_GUIDE.md)
```

---

## 📦 WHAT GETS INSTALLED

**Location**: `/opt/wise2-defense/`

**Components**:
- ✅ Python 3.11 environment
- ✅ FastAPI edge API (port 3014)
- ✅ SQLite database
- ✅ Health monitoring daemon
- ✅ Systemd auto-start service
- ✅ Configuration templates
- ✅ Documentation

**Size**: ~500MB disk, 80-120MB RAM

**Services**:
- `wise2-defense` — Main API service
- `wise2-health` — Health monitoring (Phase 2)

---

## 🎯 WHAT'S WORKING NOW (Phase 1)

✅ **API Endpoints**
- Health check
- Incident ingestion & listing
- Watch zone creation & management
- Mesh telemetry ingestion
- System health reporting
- Dashboard aggregation

✅ **Database**
- Incident history
- Watch zones
- Alerts
- Mesh network data
- SDR signals
- System events

✅ **Features**
- Multi-tenant isolation
- Offline operation (no cloud needed)
- Automatic service restart
- Health monitoring
- IMP conversational interface (local)

---

## 🔮 COMING IN PHASE 2

- IMP chat web UI
- Incident provider integration (CrimeRadar, weather)
- Meshtastic device layer
- RTL-SDR device support
- GPS integration
- Mobile dashboard
- Kiosk auto-boot mode
- Cloud synchronization

---

## 📊 DEPLOYMENT CHECKLIST

Before you deploy:

- [ ] Raspberry Pi 3B+ or newer
- [ ] Raspberry Pi OS installed
- [ ] Internet connectivity
- [ ] SSH access (or console access)
- [ ] Pi IP address noted
- [ ] 2GB disk space free
- [ ] Swap configured (recommended)

After deployment:

- [ ] Installer completed without errors
- [ ] API responds to health check
- [ ] Service is active (running)
- [ ] Logs show no errors
- [ ] Can create test incident
- [ ] Service survives reboot

---

## 🎬 READY TO DEPLOY?

### Quick Deploy (Recommended)
```bash
cd /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge
bash QUICK_DEPLOY.sh <pi-ip> pi
```

### Manual Deploy
1. Transfer files: `scp -r ... pi@<ip>:~/wise-defense`
2. SSH to Pi: `ssh pi@<ip>`
3. Run installer: `sudo bash ~/wise-defense/scripts/install-wise2-defense.sh`
4. Verify: `curl http://localhost:3014/health`

### Full Details
See: `DEPLOYMENT_GUIDE.md`

---

## 📞 SUPPORT

**Logs**: `/var/log/wise2-defense/api.log`  
**Config**: `/opt/wise2-defense/.env`  
**Database**: `/opt/wise2-defense/data/wise2-defense.db`

**Check logs:**
```bash
journalctl -u wise2-defense -f
```

**Reset (if needed):**
```bash
sudo systemctl stop wise2-defense
sudo rm -rf /opt/wise2-defense
sudo bash install-wise2-defense.sh  # Re-run installer
```

---

**WISE DEFENSE L.L.C.**  
**TRAIN. TEACH. PROTECT.**

**Status**: READY FOR DEPLOYMENT ✅  
**Next Action**: Run `bash QUICK_DEPLOY.sh <pi-ip> pi`
