# WISE² Hermes + iMessage Integration

**Status**: Architecture & Integration Framework  
**Last Updated**: 2026-08-20  
**Owner**: dwise (dwise03@gmail.com)

---

## Overview

This document describes the complete integration of WISE² with Hermes + Photon + iMessage, turning an iPhone into a remote control for the entire WISE² ecosystem.

### Architecture

```
┌─────────────────────┐
│   iPhone iMessage   │
│  (Authorized User)  │
└──────────┬──────────┘
           │
           ▼
    ┌─ PHOTON ─┐  (Hermes messaging gateway)
    │ Sidecar   │  (localhost-only, secure)
    └─────┬─────┘
          │
          ▼
┌─────────────────────────────────────────┐
│     MAC HERMES GATEWAY                  │
│  (Interactive Primary Node)             │
│  - Claude Code / Codex                  │
│  - Local Ollama                         │
│  - Repository access                    │
│  - iMessage interface                   │
└──────────┬──────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   WISE² IMP (Intent Management Platform) │
│  - Intent classification                │
│  - Policy & risk enforcement            │
│  - Node selection                       │
│  - Job orchestration                    │
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────┬───────────┬─────────────┐
    ▼             ▼           ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│   MAC   │ │   VPS   │ │   GPU   │ │   EDGE   │
│ Hermes  │ │ Hermes  │ │  Server │ │  (Pi)    │
├─────────┤ ├─────────┤ ├─────────┤ ├──────────┤
│• Local  │ │• Always │ │• Heavy  │ │• Local   │
│  AI     │ │  on     │ │  Infr.  │ │  Control │
│• Claude │ │• Prod   │ │  Models │ │• Edge    │
│• Codex  │ │• DB/    │ │• Ollama │ │  Devices │
│• Repos  │ │  Redis  │ │         │ │          │
└─────────┘ └─────────┘ └─────────┘ └──────────┘
```

---

## Phase 1: Mac Setup

### Prerequisites

- Mac with Hermes installed
- Node.js 18.17+
- Local Ollama (optional, for `mac-local` AI)
- SSH key configured for VPS access (Tailscale recommended)

### Installation

#### 1. Install Hermes

```bash
# On Mac, use official Hermes installer
brew install hermes  # or download from Hermes website

# Verify installation
hermes --version
```

#### 2. Install Photon

Photon is the iMessage messaging sidecar. It connects your iPhone to Hermes.

```bash
# Hermes should auto-provision Photon on first iMessage pair
hermes photon setup --phone "+1-555-0123"  # Your E.164 phone number

# After setup, you'll need to:
# 1. Open the authorization link in Safari
# 2. Sign in with Apple ID on the iPhone
# 3. Confirm device registration

# Verify Photon is running
hermes photon status
```

#### 3. Initialize Hermes Gateway

```bash
# Start the Hermes gateway with Mac configuration
hermes gateway start

# Verify gateway is healthy
hermes gateway status
```

#### 4. Configure Hermes as a macOS Service

```bash
# Create LaunchAgent to auto-start Hermes
mkdir -p ~/Library/LaunchAgents

# Create plist file
cat > ~/Library/LaunchAgents/com.wise2.hermes.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wise2.hermes</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/hermes</string>
        <string>gateway</string>
        <string>start</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    
    <key>StandardOutPath</key>
    <string>/var/log/wise2-hermes.log</string>
    
    <key>StandardErrorPath</key>
    <string>/var/log/wise2-hermes.err</string>
</dict>
</plist>
EOF

# Load the service
launchctl load ~/Library/LaunchAgents/com.wise2.hermes.plist

# Verify it's running
launchctl list | grep com.wise2.hermes
```

#### 5. Configure WISE² IMP

Create `~/.hermes/wise2-imp.json`:

```json
{
  "authorized_senders": [
    {
      "e164_number": "+1-555-0123",
      "name": "Primary Owner",
      "role": "owner",
      "id": "owner_primary"
    }
  ],
  "nodes": {
    "mac": {
      "enabled": true,
      "role": "interactive-primary",
      "hermes_path": "/usr/local/bin/hermes"
    },
    "vps": {
      "enabled": true,
      "ssh_host": "wise-vps",
      "ssh_user": "dwise",
      "role": "always-on-remote"
    },
    "gpu": {
      "enabled": false,
      "ssh_host": "wise-gpu",
      "ssh_user": "dwise"
    }
  }
}
```

#### 6. Verify Mac Setup

```bash
# Check all components
wise2 health

# Expected output:
# ✅ Mac Hermes
# ✅ Photon
# ✅ Local Ollama (if configured)
# ✅ WISE² IMP
```

---

## Phase 2: VPS Setup (Always-On Node)

### Prerequisites

- Linux VPS (production server)
- SSH access from Mac
- Node.js 18.17+ installed
- (Optional) Docker for containerization

### Installation

#### 1. Install Hermes on VPS

```bash
# SSH to VPS
ssh wise-vps

# Install Hermes (Linux version)
# Follow official Hermes Linux installation
curl -fsSL https://hermes.io/install.sh | bash

# Verify
hermes --version
```

#### 2. Configure Hermes User

```bash
# Create non-root service user
sudo useradd -m -s /bin/bash hermes

# Set home directory permissions
sudo mkdir -p /home/hermes/.hermes
sudo chown -R hermes:hermes /home/hermes/.hermes
```

#### 3. Create Systemd Service

```bash
# Create service file
sudo tee /etc/systemd/user/hermes.service << 'EOF'
[Unit]
Description=Hermes Gateway - WISE² Always-On Node
After=network.target

[Service]
Type=simple
User=hermes
ExecStart=/usr/local/bin/hermes gateway start
Restart=on-failure
RestartSec=5

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
EOF

# Enable and start
sudo systemctl --user daemon-reload
sudo systemctl --user enable hermes
sudo systemctl --user start hermes

# Verify
sudo systemctl --user status hermes
```

#### 4. Configure VPS Hermes

Create `/home/hermes/.hermes/wise2-vps.json`:

```json
{
  "node_id": "vps",
  "role": "always-on-remote",
  "capabilities": ["postgres", "redis", "workers", "automation", "api"],
  "mac_hermes_address": "mac.internal:9000",
  "mac_hermes_token": "$HERMES_PEER_TOKEN"
}
```

#### 5. Setup Peer-to-Peer Connection

On **Mac**:
```bash
hermes peer generate-token --peer vps --duration 365d
# Save the token to secure location
```

On **VPS**:
```bash
export HERMES_PEER_TOKEN="<token-from-mac>"
hermes peer register --name mac --address mac.internal --token $HERMES_PEER_TOKEN
```

---

## Phase 3: Network & Security

### Tailscale (Recommended)

Use Tailscale for secure private networking between Mac and VPS.

#### On Mac

```bash
# Install Tailscale
brew install tailscale

# Start and authenticate
tailscale up --auth-key tskey_xxxxx

# Verify
tailscale ip
```

#### On VPS

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Start and authenticate
sudo tailscale up --auth-key tskey_xxxxx

# Verify
sudo tailscale ip
```

### SSH Configuration

Update `~/.ssh/config`:

```
Host wise-vps
    HostName <tailscale-ip>
    User dwise
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking accept-new
    
Host wise-gpu
    HostName <tailscale-ip>
    User dwise
    IdentityFile ~/.ssh/id_ed25519
```

### Sender Authorization

Only authorized phone numbers can control WISE² via iMessage.

```bash
# Add authorized sender (one-time setup)
wise2 auth add-sender +1-555-0123 "owner" "Primary Owner"

# List authorized senders (redacted)
wise2 auth list-senders

# Remove sender (requires confirmation)
wise2 auth remove-sender +1-555-0123
```

---

## Phase 4: Testing

### Test 1: Status Check

Send iMessage to WISE²:
```
Wise, status
```

Expected response:
```
✅ WISE² Status
Mac Hermes: online
VPS Hermes: online
Photon: connected
Overall: healthy
```

### Test 2: Read-Only Operation

Send:
```
Wise, what's running on my Mac?
```

Expected response:
```
✅ Mac Status
Hermes: ✅
Photon: ✅
Local Ollama: ✅
Claude Code: ✅
```

### Test 3: Reversible Operation

Send:
```
Wise, run the WISE² health check
```

Expected response:
```
✅ Health Check Queued
Scanning services...
(results in next message)
```

### Test 4: Confirmation Required

Send:
```
Wise, deploy production
```

Expected response:
```
⚠️ Production Deployment
Target: wise2.io
Services affected: API, Dashboard, Worker
Risk: HIGH

Confirm: CONFIRM <code>
```

Reply with:
```
CONFIRM abc123
```

---

## Usage Guide

### Natural Language Commands

WISE² understands natural language. No slash commands required:

**System Monitoring**
- `Wise, status` - System health
- `Wise, what's broken?` - Problems report
- `Wise, check the VPS` - Remote server status

**Customer & Business**
- `Wise, today's leads` - Lead list
- `Wise, show active customers` - Customer status
- `Wise, create a demo for Paige` - Demo factory
- `Wise, check Craig's deployment` - Customer status

**Development**
- `Wise, have the local coder audit the API` - Code review
- `Wise, fix the build error` - Debug
- `Wise, run the test suite` - Testing

**Operations**
- `Wise, check production` - Production status
- `Wise, inspect API logs` - Logging
- `Wise, restart the worker` - Service control
- `Wise, deploy staging` - Deployment

**AI & Research**
- `Wise, use local AI for this` - Off-line inference
- `Wise, use Claude for analysis` - Cloud reasoning

### Risk Levels

WISE² automatically enforces risk levels:

| Level | Examples | Action |
|-------|----------|--------|
| **0** | Status, logs, reports | ✅ Execute immediately |
| **1** | Build, test, demo create | ✅ Auto-execute (safe) |
| **2** | Deploy staging, edit config | ⚠️ Require confirmation |
| **3** | Delete DB, production rollback | 🔐 Explicit + token required |

---

## Architecture Details

### WISE² IMP (Intent Management Platform)

The intelligent router that powers WISE²:

```
Request
  ↓
Intent Classifier → What does the user want?
  ↓
Risk Assessment → How dangerous is this?
  ↓
Authorization Check → Can this sender do this?
  ↓
Confirmation Step → Does this need approval?
  ↓
Node Selection → Mac, VPS, GPU, or Pi?
  ↓
Job Creation → Create persistent record
  ↓
Execution → Hand off to executor
```

### Executors

- **Hermes**: General-purpose automation and status
- **Claude Code**: Development and code review
- **Codex**: Specialized debugging and analysis
- **Ollama**: Local AI (Mac, GPU, or VPS)
- **Local Control**: Edge devices and kiosks

### Persistence

Job state is persisted to:
- **Redis** (short-lived: active jobs, confirmations)
- **Postgres** (long-term: audit logs, decision history)
- **File System** (durable: daily logs, memory, runbooks)

---

## Troubleshooting

### Photon Connection Issues

```bash
# Check Photon status
hermes photon status

# Restart Photon
hermes photon restart

# Check logs
tail -f /var/log/wise2-hermes.log

# Verify iMessage pairing
hermes photon list-paired
```

### VPS Unreachable

```bash
# Test SSH connectivity
ssh wise-vps hostname

# Check Tailscale
tailscale status

# Test Hermes peer connection
hermes peer status
```

### Request Rejected

Check authorization:

```bash
# Is sender authorized?
wise2 auth list-senders

# Check sender's role
wise2 auth show-sender +1-555-0123

# Add sender if missing
wise2 auth add-sender +1-555-0123 "owner" "Name"
```

### Confirmation Expired

Confirmations expire after 5 minutes. If you miss the window:
- Resend the original request
- A new confirmation code will be generated

---

## Security Considerations

### Do Not

- ❌ Share Photon project secrets
- ❌ Commit `.env` files to git
- ❌ Expose Hermes ports publicly
- ❌ Use weak SSH keys
- ❌ Send passwords over iMessage

### Do

- ✅ Rotate credentials regularly
- ✅ Use SSH keys with Tailscale
- ✅ Keep Hermes updated
- ✅ Monitor audit logs
- ✅ Enable 2FA on Apple ID
- ✅ Review authorized senders monthly

---

## Maintenance

### Daily

```bash
# Check system health
Wise, status

# Review logs if needed
Wise, what happened last night?
```

### Weekly

```bash
# Audit security
wise2 security audit

# Review deployments
Wise, show recent deployments
```

### Monthly

- Update Hermes
- Rotate long-lived tokens
- Review authorized senders
- Archive old logs

---

## Next Steps

1. ✅ **Phase 1**: Mac setup (Hermes + Photon)
2. ✅ **Phase 2**: VPS setup (Always-on node)
3. ✅ **Phase 3**: Network (Tailscale + security)
4. ✅ **Phase 4**: Testing (End-to-end verification)
5. ⏳ **Phase 5**: Customization (Add your workflows)

---

## Support

For issues or questions:

- Check `data/daily-logs/<date>.md` for session history
- Review `docs/TROUBLESHOOTING.md` for common issues
- Inspect audit logs: `wise2 logs --filter owner`
- Contact: dwise03@gmail.com

---

**WISE² Hermes + iMessage Integration**  
_Turning your iPhone into the command center for your entire business operating system._
