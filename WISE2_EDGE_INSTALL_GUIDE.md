# WISE² Edge - Complete Installation Guide

## 📥 Download Status

**Raspberry Pi OS Lite (64-bit)** is downloading...
- File: `raspios-bookworm-arm64-lite.img.xz` (~500MB)
- Location: `/private/tmp/wise2-pi/`
- Status: In progress

---

## 🚀 Installation Steps

### Step 1: Extract Image
Once downloaded, extract the image:
```bash
cd /private/tmp/wise2-pi/
xz -d rpi-os.img.xz
# Result: rpi-os.img (~2.5GB)
```

### Step 2: Write to SD Card
Your SD card is at `/dev/disk9`

```bash
# Unmount if needed
diskutil unmountDisk /dev/disk9

# Write image to disk (use rdisk for faster writes)
sudo dd if=/private/tmp/wise2-pi/rpi-os.img of=/dev/rdisk9 bs=4m
# This takes ~5-10 minutes

# Eject when done
diskutil ejectDisk /dev/disk9
```

### Step 3: Boot Raspberry Pi
1. Insert SD card into Raspberry Pi
2. Connect power, Ethernet, and monitor
3. Wait for first boot (~1-2 minutes)
4. Log in with default credentials:
   - Username: `pi`
   - Password: `raspberry`

### Step 4: Initial Configuration
```bash
# SSH from your Mac (once Pi is online)
ssh pi@raspberrypi.local

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi

# Install Docker Compose
sudo pip3 install docker-compose

# Reboot
sudo reboot
```

### Step 5: Install WISE² Edge
```bash
# Clone repository
git clone https://github.com/wise2/wise2-core.git
cd wise2-core/services/edge-appliance

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start with Docker Compose
docker-compose up -d

# Verify
docker-compose ps
```

### Step 6: Access WISE² Edge
Once running:
- **API**: `http://raspberrypi.local:3000`
- **Health**: `http://raspberrypi.local:3000/health`
- **Logs**: `docker-compose logs -f`

---

## ✅ Verification

Check installation:
```bash
# API Health
curl http://raspberrypi.local:3000/health

# Docker status
docker-compose ps

# System info
npm run info
```

Expected output:
```json
{
  "status": "healthy",
  "runtime": "ready",
  "components": {
    "localDb": "ready",
    "agent": "ready",
    "voice": "ready",
    "gpio": "ready"
  }
}
```

---

## 🛠️ Troubleshooting

### SSH Connection Failed
```bash
# Try with IP address instead
ping raspberrypi.local
ssh pi@<ip-address>
```

### Docker Not Available
```bash
# Restart docker
sudo systemctl restart docker
docker ps
```

### WISE² Edge Won't Start
```bash
# Check logs
docker-compose logs wise2-edge

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build
```

### No Internet
- Check Ethernet connection
- Verify WiFi credentials (if using)
- Check router settings

---

## 📊 System Requirements

**Hardware:**
- Raspberry Pi 4 (4GB+ RAM) or Pi 5 (recommended)
- 32GB+ microSD card
- Power supply (3A+ for Pi 4, 5A+ for Pi 5)
- Ethernet or WiFi

**Software:**
- Raspberry Pi OS (Bookworm or newer)
- Docker & Docker Compose
- Node.js 20+

---

## 🔌 Hardware Setup

### GPIO Control
Once running, you can control GPIO pins:
```bash
# Example: Control LED on GPIO 17
curl -X POST http://raspberrypi.local:3000/gpio/17 -d '{"state":"high"}'
```

### Camera Access
Pi camera automatically detected and available:
```bash
# Capture image
curl http://raspberrypi.local:3000/camera/capture -o photo.jpg
```

### Voice Control
With microphone connected:
- Wake word detection
- Speech-to-text
- Text-to-speech responses

---

## ☁️ Cloud Sync

Enable bidirectional sync with cloud:

```bash
# Configure WireGuard
nano edge-appliance.env
# Set: CLOUD_SYNC_ENABLED=true
# Set: WIREGUARD_CONFIG=<path-to-wg.conf>

# Restart
docker-compose restart
```

---

## 📝 Next Steps

After installation:
1. ✅ Verify health endpoint works
2. ✅ Test GPIO control
3. ✅ Enable voice control (optional)
4. ✅ Configure cloud sync (optional)
5. ✅ Set up automation rules

---

## 🚀 Production Deployment

For 24/7 operation:

```bash
# Enable auto-start on boot
docker-compose up -d

# Verify it starts on reboot
sudo reboot

# Check it's running
docker-compose ps
```

---

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. See troubleshooting above
3. Verify Docker is running: `docker ps`
4. Check network connectivity: `ping 8.8.8.8`

---

**Status:** Installation Guide Ready  
**Next:** Image download → Extract → Write to Card → Boot Pi
