# WISE DEFENSE — DEPLOYMENT TO RASPBERRY PI

One-command deployment guide for Raspberry Pi 3B+.

---

## PREREQUISITES (Check These First)

On your Raspberry Pi:

```bash
# Check OS
cat /etc/os-release | grep ID

# Check disk space (need 2GB free)
df -h /

# Check memory (should have swap)
free -h

# Check internet
ping 8.8.8.8 -c 1

# Check Python (should have 3.11+)
python3 --version

# Check sudo access
sudo whoami
```

All should pass before proceeding.

---

## OPTION A: Deploy from This Mac (SSH)

### 1. Prepare Pi (One-Time Setup)

On your **Raspberry Pi** (via SSH or console):

```bash
# Enable SSH if not already
sudo raspi-config nonint do_ssh 0

# Set static IP (recommended)
# Or note the current IP
hostname -I
```

### 2. Transfer Files to Pi (From This Mac)

```bash
# Get your Pi's IP address
PI_IP="192.168.1.XXX"  # Replace with your Pi's IP

# Create directory on Pi
ssh pi@$PI_IP "mkdir -p ~/wise-defense"

# Copy installer and files
scp /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge/scripts/install-wise2-defense.sh \
    pi@$PI_IP:~/wise-defense/

scp -r /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge/app \
    pi@$PI_IP:~/wise-defense/

scp -r /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge/config \
    pi@$PI_IP:~/wise-defense/

scp /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge/README.md \
    pi@$PI_IP:~/wise-defense/
```

### 3. Run Installer on Pi

```bash
# SSH into Pi
ssh pi@$PI_IP

# Navigate to directory
cd ~/wise-defense

# Make installer executable
chmod +x install-wise2-defense.sh

# Run installer (this takes 3-5 minutes)
sudo bash install-wise2-defense.sh
```

### 4. Verify Installation

```bash
# Check API
curl http://localhost:3014/health

# Check service
systemctl status wise2-defense

# View logs
journalctl -u wise2-defense -n 20
```

---

## OPTION B: Deploy via USB Drive (No SSH)

### 1. Copy Files to USB Drive

On this Mac:

```bash
# Connect USB drive
# It will appear as /Volumes/WISE2 (or similar)

# Copy entire directory to USB
cp -r /Users/danielwise/Projects/wise2-core/apps/wise-defense-edge \
  /Volumes/WISE2/

# Safely eject
diskutil eject /Volumes/WISE2
```

### 2. Transfer to Pi and Install

On your Raspberry Pi:

```bash
# Mount USB drive
sudo mount /dev/sda1 /mnt/usb

# Copy to home directory
cp -r /mnt/usb/wise-defense-edge ~/wise-defense

# Navigate to directory
cd ~/wise-defense

# Make installer executable
chmod +x scripts/install-wise2-defense.sh

# Run installer
sudo bash scripts/install-wise2-defense.sh

# Unmount USB
sudo umount /mnt/usb
```

---

## OPTION C: Deploy via Git Clone

On your Raspberry Pi:

```bash
# Clone the repository
git clone https://github.com/wise2-ai/wise2-core.git
cd wise2-core/apps/wise-defense-edge

# Run installer
sudo bash scripts/install-wise2-defense.sh
```

---

## INSTALLATION OUTPUT (What You'll See)

Successful installation shows:

```
╔═══════════════════════════════════════════════════════════╗
║  WISE DEFENSE L.L.C.                                      ║
║  Edge Intelligence Node Installer                         ║
║  TRAIN. TEACH. PROTECT.                                   ║
╚═══════════════════════════════════════════════════════════╝

[INFO] Detecting OS...
[INFO] Raspberry Pi OS detected: bookworm
[INFO] Checking disk space...
[INFO] Disk space OK: 8572MB available
[INFO] Updating package lists...
[INFO] Installing system dependencies...
...
[INFO] Installation complete!

=== VERIFICATION REPORT ===
Device ID: EDGE-001
Installation Path: /opt/wise2-defense
Version: 1.0.0

CORE SYSTEMS:
  API ........................ active (running)
  Database ................... OK
  
READY FOR DEPLOYMENT: YES
```

---

## POST-INSTALLATION VERIFICATION

After installer completes, verify everything:

### 1. API Health
```bash
curl http://localhost:3014/health
```

**Expected response:**
```json
{
  "status": "OPERATIONAL",
  "device_id": "EDGE-001",
  "timestamp": "2026-08-23T21:42:00Z",
  "version": "1.0.0"
}
```

### 2. Service Status
```bash
systemctl status wise2-defense
```

**Expected:**
```
● wise2-defense.service - WISE Defense Edge Intelligence Node
   Loaded: loaded (/etc/systemd/system/wise2-defense.service; enabled; preset: enabled)
   Active: active (running) since Fri 2026-08-23 21:40:00 UTC; 2min 15s ago
```

### 3. Database
```bash
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "SELECT COUNT(*) FROM incidents;"
```

**Expected:** `0` (empty database)

### 4. Logs
```bash
journalctl -u wise2-defense -n 10
```

**Expected:** Last 10 log lines, no errors

### 5. Create Test Incident
```bash
# Get API key from environment
API_KEY=$(grep WISE_DEFENSE_API_KEY /opt/wise2-defense/.env | cut -d= -f2)

# Create test incident
curl -X POST http://localhost:3014/api/incidents \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "test",
    "headline": "Test Incident",
    "category": "police",
    "incident_type": "test",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "approximate_location": "Test Location"
  }'
```

**Expected response:**
```json
{
  "id": "test:...",
  "threat_level": "LOW",
  "status": "created"
}
```

### 6. Reboot Test
```bash
sudo reboot

# After ~30 seconds, API should respond
curl http://localhost:3014/health
```

**Expected:** 200 OK (service auto-starts)

---

## ACCESSING THE DASHBOARD

Once deployed on Pi:

### Local Network Access
From any computer on the same network:
```
http://<pi-ip>:3014/health
http://<pi-ip>:3014/api/dashboard
```

### Dashboard Integration (Coming Phase 2)
The Pi edge node will integrate with:
```
https://wisedefensellc.com/wise-defense/dashboard
```

Currently showing:
- Incidents from edge node
- Watch zones
- System health
- Mesh status
- SDR signals

---

## TROUBLESHOOTING

### API Not Responding
```bash
# Check service
systemctl status wise2-defense

# View full logs
journalctl -u wise2-defense --all

# Restart service
sudo systemctl restart wise2-defense

# Check if port is in use
sudo netstat -tuln | grep 3014
```

### Installer Failed
```bash
# Check what went wrong
sudo tail -f /var/log/wise2-defense/api.log

# Check disk space
df -h /

# Check Python
python3.11 --version

# Re-run installer
sudo bash /path/to/install-wise2-defense.sh
```

### Low Memory
```bash
# Check memory usage
free -h

# Increase swap (if needed)
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Database Issues
```bash
# Verify database integrity
sqlite3 /opt/wise2-defense/data/wise2-defense.db "PRAGMA integrity_check;"

# Expected output: "ok"

# If corrupted, reinit database
sudo -u wise2 python3 -c 'from app.api.main import Database; Database("/opt/wise2-defense/data/wise2-defense.db")'
```

---

## CONFIGURATION AFTER DEPLOYMENT

### Add Provider API Keys
```bash
# Edit environment
sudo nano /opt/wise2-defense/.env

# Add:
# CRIMERADAR_API_KEY=your-key
# NOAA_API_KEY=your-key
# etc.

# Restart
sudo systemctl restart wise2-defense
```

### Create Watch Zones
```bash
API_KEY=$(grep WISE_DEFENSE_API_KEY /opt/wise2-defense/.env | cut -d= -f2)

curl -X POST http://localhost:3014/api/watch-zones \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius_miles": 1.0,
    "kind": "HOME"
  }'
```

### Connect Hardware (Optional)
- **SDR**: Connect RTL-SDR USB device
- **Meshtastic**: Connect via USB serial
- **GPS**: Connect USB GPS module

Devices auto-detected on startup.

---

## SECURITY SETUP

### Enable Tailscale (Recommended for Remote Access)
```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Start
sudo systemctl start tailscale

# Authenticate
sudo tailscale up

# Get IP
tailscale ip -4
```

Then access from anywhere:
```
curl http://<tailscale-ip>:3014/health
```

### Firewall (Optional)
```bash
# Allow only local access
sudo ufw allow from 192.168.0.0/16 to any port 3014
sudo ufw allow from 10.0.0.0/8 to any port 3014
```

---

## MONITORING

### View Logs in Real-Time
```bash
sudo journalctl -u wise2-defense -f
```

### Check Health Periodically
```bash
# Create a cron job to check health
(crontab -l 2>/dev/null; echo "*/5 * * * * curl -s http://localhost:3014/health | jq .") | crontab -
```

### Monitor System Resources
```bash
# Install htop (optional)
sudo apt-get install htop

# Run
htop -p $(pgrep -f 'python.*wise2-defense')
```

---

## NEXT STEPS

After deployment:

1. ✅ Verify API is responding
2. ✅ Test incident creation
3. ✅ Create watch zones
4. ✅ Connect optional hardware (SDR, Meshtastic, GPS)
5. ✅ Configure incident providers
6. ✅ Set up Tailscale for remote access
7. ✅ Monitor logs for any issues

Then:
- Phase 2: IMP chat interface
- Phase 2: SITREP generation
- Phase 2: Provider adapters
- Phase 2: Mobile dashboard

---

## SUPPORT

**Logs**: `/var/log/wise2-defense/`  
**Config**: `/opt/wise2-defense/.env`  
**Database**: `/opt/wise2-defense/data/wise2-defense.db`  
**Service**: `systemctl status wise2-defense`

---

**WISE DEFENSE L.L.C.**  
**TRAIN. TEACH. PROTECT.**

Ready to deploy. Follow Option A, B, or C above based on your setup.
