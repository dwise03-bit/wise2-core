# WISE² Desktop Commander Deployment Guide

## Overview
Standard remote management system for all WISE² devices (Mac, Linux, Raspberry Pi). Enables centralized monitoring, logging, command execution, and auto-updates across the fleet.

## Quick Start (All Devices)

```bash
# Download and run universal installer
curl -fsSL https://wise2.net/install-desktop-commander.sh | bash

# Or manually:
chmod +x install-desktop-commander.sh
./install-desktop-commander.sh
```

## Device-Specific Setup

### macOS (user: danielwise)
```bash
# Install Node.js if needed
brew install node

# Run installer
chmod +x install-desktop-commander.sh
./install-desktop-commander.sh

# Enable launchd service
launchctl load ~/Library/LaunchAgents/net.wise2.desktop-commander.plist

# Verify
launchctl list | grep desktop-commander
```

### Ubuntu VPS (gpu-nmls, 173.208.147.165, user: dwise)
```bash
# SSH into VPS
ssh dwise@173.208.147.165

# Install Node.js
sudo apt-get update
sudo apt-get install -y nodejs npm

# Run installer
curl -fsSL https://wise2.net/install-desktop-commander.sh | bash

# Enable systemd service
sudo cp /tmp/wise2-desktop-commander.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable wise2-desktop-commander
sudo systemctl start wise2-desktop-commander

# Verify
sudo systemctl status wise2-desktop-commander
journalctl -u wise2-desktop-commander -f
```

### Raspberry Pi 3B+ (wise-pi3, 192.168.8.136, user: dwise)
```bash
# SSH into Pi
ssh dwise@192.168.8.136

# Node.js may already be installed; verify
node -v

# If not, install for ARM
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Run installer
curl -fsSL https://wise2.net/install-desktop-commander.sh | bash

# Enable systemd service
sudo cp /tmp/wise2-desktop-commander.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable wise2-desktop-commander
sudo systemctl start wise2-desktop-commander

# Verify
sudo systemctl status wise2-desktop-commander
```

## Configuration

### 1. API Token Setup
Each device needs a unique auth token for the central WISE² API:

```bash
# Set environment variable (add to ~/.bashrc, ~/.zshrc, or systemd service)
export X_DEVICE_TOKEN="wise2_$(hostname)_$(date +%s)_$(openssl rand -hex 16)"

# Or hardcode in config
nano ~/.wise2/desktop-commander/config.json
# Edit "auth_header" section with your token
```

### 2. API Endpoint Configuration
All devices post to: `https://wise2.net/api/devices`

Default config supports this. If using internal endpoint:
```json
{
  "remote": {
    "api_endpoint": "https://internal.wise2.net/api/devices"
  }
}
```

### 3. Per-Device Overrides
Edit `~/.wise2/desktop-commander/config.json` for device-specific settings:

**macOS:**
```json
{
  "device": {
    "name": "macbook-danielwise",
    "region": "mac-local",
    "platform": "darwin"
  }
}
```

**VPS:**
```json
{
  "device": {
    "name": "gpu-nmls-server",
    "region": "nmls",
    "platform": "linux"
  }
}
```

**Raspberry Pi:**
```json
{
  "device": {
    "name": "wise-pi3-edge",
    "region": "nmls",
    "platform": "linux-arm"
  }
}
```

## Verification

### 1. Service Status
```bash
# macOS
launchctl list | grep desktop-commander

# Linux
sudo systemctl status wise2-desktop-commander
```

### 2. Logs
```bash
# macOS
tail -f /var/log/wise2-dc.log

# Linux
sudo journalctl -u wise2-desktop-commander -f
```

### 3. Test Connection
```bash
# Test if service is running
npx desktop-commander remote status

# Check config validity
npx desktop-commander config validate ~/.wise2/desktop-commander/config.json
```

## Central Management (API)

### List All Devices
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://wise2.net/api/devices
```

### Send Command to Device
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command":"logs","lines":100}' \
  https://wise2.net/api/devices/{deviceId}/command
```

### Get Device Metrics
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://wise2.net/api/devices/{deviceId}/metrics
```

## Troubleshooting

### Service Won't Start
```bash
# Check for Node.js
which node
node -v

# Check npm installation of desktop-commander
npm list -g @wonderwhy-er/desktop-commander

# Reinstall if needed
npm install -g @wonderwhy-er/desktop-commander
```

### Connection Failed
```bash
# Verify API endpoint is reachable
curl -v https://wise2.net/api/devices/health

# Check auth token
echo $X_DEVICE_TOKEN

# View detailed logs
sudo journalctl -u wise2-desktop-commander -n 50
```

### Port Already in Use
Default port: 9876
```bash
# Find what's using it
lsof -i :9876

# Kill if needed
kill -9 <PID>
```

## Integration with wise2-core

### 1. Add to Docker Compose (if containerized)
```yaml
services:
  desktop-commander:
    image: node:20-alpine
    volumes:
      - /home/dwise/.wise2:/root/.wise2
    environment:
      - X_DEVICE_TOKEN=${DC_TOKEN}
    command: npx @wonderwhy-er/desktop-commander remote
    restart: always
```

### 2. Add to wise2-core CI/CD
```bash
# In deployment scripts
./scripts/deploy-desktop-commander.sh

# Content:
#!/bin/bash
curl -fsSL https://wise2.net/install-desktop-commander.sh | bash
systemctl restart wise2-desktop-commander
```

### 3. Monitor via WISE² Dashboard
Once deployed, devices appear in `/admin/devices`:
- Real-time status
- CPU/memory/disk metrics
- Log streaming
- Remote command execution
- Update status

## Security Considerations

1. **TLS Enforcement**: All traffic encrypted. Certificates validated.
2. **Auth Tokens**: Store in environment variables or systemd secrets, never in git.
3. **Command Allowlist**: Only safe commands permitted (status, logs, restart, etc.)
4. **Tenant Isolation**: Devices grouped by org; no cross-tenant access.
5. **Rate Limiting**: API enforces 100 req/min per device.

## Auto-Update Strategy

Desktop Commander checks for updates hourly. To control updates:

```json
{
  "auto_update": {
    "enabled": true,
    "check_interval": 3600000,
    "auto_restart": true,
    "restart_delay": 300000
  }
}
```

Disable auto-updates:
```json
{
  "auto_update": {
    "enabled": false
  }
}
```

## Rollback

If an update causes issues:
```bash
# Downgrade to previous version
npm install -g @wonderwhy-er/desktop-commander@<previous-version>

# Restart service
sudo systemctl restart wise2-desktop-commander
```

## Next Steps

1. **Run installer on all three machines** (Mac, VPS, Pi)
2. **Set X_DEVICE_TOKEN environment variable** on each device
3. **Verify services are running** with status checks
4. **Test from WISE² API**: Send a test command to each device
5. **Add to wise2-core documentation** for future onboarding

---

**Devices Deployed:**
- [ ] macbook-danielwise (Mac)
- [ ] gpu-nmls (Ubuntu VPS)
- [ ] wise-pi3 (Raspberry Pi)

**Status Link:** https://wise2.net/admin/devices
