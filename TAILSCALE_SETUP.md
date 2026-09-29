# Tailscale Setup Guide for WISE² Multi-Device Network

Complete Tailscale configuration for VPS, Raspberry Pi, Android, and local machines.

## Overview

Tailscale creates a **secure mesh VPN** connecting all your devices:
- ✅ Encrypted peer-to-peer connections
- ✅ No port forwarding or firewall configuration needed
- ✅ Works across networks (home, office, mobile)
- ✅ All devices accessible by Tailscale IP

**Architecture:**
```
Your Local Machine (Tailscale IP: 100.x.x.1)
    ↓
   VPS (173.208.147.165 → Tailscale IP: 100.x.x.2)
    ├─ Port 3000: API
    ├─ Port 3001: AI Phone
    └─ Port 5432: Database
    ↓
Raspberry Pi (Tailscale IP: 100.x.x.3)
    ├─ Port 3000: API
    └─ Port 5432: Database (replica)
    ↓
Android/Mobile (Tailscale IP: 100.x.x.4)
    └─ Can SSH to any device
    └─ Can access all services
```

---

## Step 1: Create Tailscale Account

1. Go to: https://login.tailscale.com
2. Sign up with GitHub, Google, or Microsoft
3. Create an account/workspace
4. Note your Tailscale account email

---

## Step 2: Install Tailscale on Each Device

### **2a. VPS (173.208.147.165)**

SSH to the VPS:
```bash
ssh dwise@173.208.147.165

# Download and run Tailscale setup script
cd ~/wise2-core
chmod +x scripts/setup-tailscale-all.sh
./scripts/setup-tailscale-all.sh

# Authenticate when prompted - opens browser window
# Or use: sudo tailscale up --authkey=<your-auth-key>
```

**Expected Output:**
```
Your Tailscale IP: 100.64.x.x
```

Save this IP for later use.

### **2b. Raspberry Pi**

SSH to Raspberry Pi:
```bash
ssh pi@192.168.1.XXX  # or your Pi's local IP

# Install Tailscale
cd ~/wise2-core
chmod +x scripts/setup-tailscale-all.sh
./scripts/setup-tailscale-all.sh

# Follow prompts to authenticate
```

**Expected Output:**
```
Your Tailscale IP: 100.64.x.x
```

### **2c. Android Device (via Termux)**

On Android phone:
1. Install **Termux** from Google Play Store
2. Open Termux and run:

```bash
# Install Tailscale
pkg install curl
curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate
sudo tailscale up

# Get IP
tailscale ip -4
```

**Expected Output:**
```
Your Tailscale IP: 100.64.x.x
```

### **2d. Local Machine (Mac/Linux/Windows)**

**macOS:**
```bash
brew install tailscale
brew services start tailscale
sudo tailscale up
```

**Linux:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

**Windows:**
- Download from: https://tailscale.com/download/windows
- Install and run
- Click "Connect" button

---

## Step 3: Verify All Devices Connected

Run on any device:
```bash
# View all connected devices
tailscale status

# Expected output:
# vps.shared.ts.net                  100.64.1.2   dwise@
# pi.shared.ts.net                   100.64.1.3   dwise@
# android.shared.ts.net              100.64.1.4   dwise@
# your-computer.shared.ts.net        100.64.1.1   dwise@
```

---

## Step 4: Test Connectivity

### Test VPS Access

From any device:
```bash
# SSH to VPS via Tailscale
ssh dwise@100.64.1.2  # Replace with actual Tailscale IP

# Test API health
curl http://100.64.1.2:3001/webhooks/google-voice/health

# Check Docker services
docker-compose -f docker-compose.prod.yml ps
```

### Test Raspberry Pi Access

From any device:
```bash
# SSH to Pi via Tailscale
ssh pi@100.64.1.3  # Replace with actual Tailscale IP

# Test Pi services
curl http://100.64.1.3:3000/health

# Check Docker services
docker-compose -f docker-compose.pi.yml ps
```

### Test Android Access

From Android (Termux):
```bash
# Access VPS
ssh dwise@100.64.1.2

# Access Pi
ssh pi@100.64.1.3

# Get your Android IP
tailscale ip -4
```

---

## Step 5: Deploy Google Voice to Devices

Once Tailscale is configured, deploy Google Voice services:

### **Deploy to VPS**

```bash
# SSH via Tailscale
ssh dwise@<vps-tailscale-ip>

cd ~/wise2-core

# Copy credentials (from earlier Google Cloud setup)
cat ~/.wise2-google-voice-creds.env >> .env.production
chmod 600 .env.production

# Deploy
docker-compose -f docker-compose.prod.yml up -d ai-phone api

# Verify
curl http://localhost:3001/webhooks/google-voice/health
```

### **Deploy to Raspberry Pi**

```bash
# SSH via Tailscale
ssh pi@<pi-tailscale-ip>

cd ~/wise2-core

# Copy credentials
scp dwise@<vps-tailscale-ip>:~/.wise2-google-voice-creds.env ~/

cat ~/.wise2-google-voice-creds.env >> .env.pi
chmod 600 .env.pi

# Deploy
docker-compose -f docker-compose.pi.yml up -d ai-phone api

# Verify
curl http://localhost:3000/health
```

### **Deploy to Android**

Android typically runs as a client (calls to VPS/Pi), but you can run lightweight services:

```bash
# In Termux on Android
cd ~/wise2-core

# Run API in lightweight mode
docker-compose -f docker-compose.minimal.yml up api

# Or just SSH to access services on other devices
ssh dwise@<vps-tailscale-ip>
```

---

## Step 6: Configure Firewall Rules (Optional)

To restrict access between devices:

1. Go to: https://login.tailscale.com
2. Go to **Settings** → **Access Controls**
3. Define rules like:

```yaml
# Allow VPS to accept calls from anywhere
{
  "acls": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["tag:vps:3001"]  # AI Phone port
    },
    {
      "action": "accept",
      "src": ["100.64.1.3"],    # Pi can replicate from VPS
      "dst": ["100.64.1.2:5432"]  # Database port
    }
  ]
}
```

---

## Step 7: Monitoring and Maintenance

### Monitor Tailscale Health

```bash
# Check status on any device
tailscale status

# Show detailed info
tailscale debug metrics

# Check for issues
tailscale bugreport
```

### View Connected Devices

Visit: https://login.tailscale.com/admin/machines

### Set Device Names

```bash
# Name your device
sudo tailscale set --hostname=my-vps

# For RPi
sudo tailscale set --hostname=wise2-pi

# For Android
tailscale set --hostname=android-phone
```

---

## Step 8: Advanced Configuration

### Subnet Router (Share local network over Tailscale)

If your VPS has other services on local network:

```bash
# On VPS
sudo tailscale up --advertise-routes=173.208.0.0/16

# On another device
sudo tailscale up --accept-routes
```

### Exit Node (Route all traffic through VPS)

```bash
# On VPS (must be root)
sudo sysctl -w net.ipv4.ip_forward=1
sudo tailscale up --advertise-exit-node

# On other devices
sudo tailscale up --exit-node=100.64.1.2
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Device not appearing in `tailscale status` | Run `sudo tailscale up` again, check browser auth |
| Can't ping between devices | Check firewall rules at https://login.tailscale.com/admin/acls |
| Connection drops | Restart: `sudo systemctl restart tailscaled` |
| Slow connections | Check: `tailscale debug metrics` for latency |
| Android can't connect | Make sure Termux has network permission |
| VPS firewall blocking | Tailscale works through firewalls, but check OS firewall: `sudo ufw status` |

---

## Quick Reference

**All Device Tailscale IPs** (update as you discover them):

| Device | IP | Port |
|--------|----|----|
| VPS | 100.64.1.2 | 3001 (AI Phone) |
| Raspberry Pi | 100.64.1.3 | 3000 (API) |
| Android | 100.64.1.4 | 22 (SSH) |
| Local | 100.64.1.1 | Any |

**Common Commands:**

```bash
# SSH to any device
ssh user@100.64.1.x

# Copy files between devices
scp file.txt user@100.64.1.x:~/

# Access services
curl http://100.64.1.x:3000/health

# View all devices
tailscale status

# Disconnect
tailscale logout
```

---

## Files Created

- `scripts/setup-tailscale-all.sh` — Automated setup script
- `TAILSCALE_SETUP.md` — This guide
- `.env.production.example` — Updated with Tailscale IPs

---

**Next Steps:**
1. ✅ Install Tailscale on all devices
2. ✅ Verify connectivity with `tailscale status`
3. ✅ Deploy Google Voice services via Tailscale IPs
4. ✅ Test webhook delivery
5. ✅ Monitor production logs

All systems ready for deployment! 🚀
