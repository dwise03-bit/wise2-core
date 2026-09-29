# WISE² Pixel Slate - Easy Install Guide

**Get WISE² running on your Pixel Slate (Chromebook with Linux) in 3 simple steps.**

---

## 🚀 Quick Start (30 seconds)

Open your Pixel Slate Crostini terminal and paste:

```bash
curl https://wise2.net/pixel-slate/install.sh | bash
```

That's it! The installer will guide you through everything.

---

## 📋 What Happens During Setup

The installer runs **8 interactive steps**. Here's what to expect:

### Step 1: OS Detection ✓
- Detects your operating system (ChromeOS, Linux, or macOS)
- Shows system information

### Step 2: Install Dependencies 📦
- Checks which tools you already have
- Installs missing tools (curl, git, jq, etc.)
- Shows progress and asks if you want to continue

### Step 3: Tailscale Connection 🌐
- Installs secure network access (Tailscale)
- Asks if you want to connect now
- Shows your Tailscale IP (used for remote access)

### Step 4: Clone Repository 📂
- Downloads WISE² source code
- Shows current version
- Asks if you want to update if already cloned

### Step 5: Verify Files ✅
- Checks critical files are present
- Shows what's ready for deployment

### Step 6: Start Command Center 🎯 (Optional)
- Asks if you want to start the command center
- Installs Node.js if needed
- Runs the control interface

### Step 7: Discord Alerts 🔔 (Optional)
- Asks if you want to set up Discord notifications
- Securely saves your webhook URL

### Step 8: GitHub Access 🔑 (Optional)
- Asks if you want to set up GitHub access
- Securely saves your personal access token

---

## 🎮 Interactive Prompts

The installer will ask you questions. Answer with:

- **`y` or `YES`** - Yes, do this
- **`n` or `NO`** - No, skip this
- **Just press ENTER** - Use the default (shown in brackets)

**Example:**
```
Start Command Center? [Y/n]: 
```
Pressing ENTER says "yes". Type `n` to skip.

---

## 📊 Reading the Output

### Colors Explained

| Color | Meaning |
|-------|---------|
| 🟢 Green checkmark `✓` | Success - everything worked |
| 🔵 Blue section headers | Starting a new step |
| 🟡 Yellow warning `⚠️` | Warning - something might need attention |
| 🔴 Red error `✗` | Error - something failed |
| 🔵 Cyan info `ℹ️` | Information or tips |

### Progress Indicators

```
⏳ Installing dependencies...    (spinner shows it's working)
✓ Done                          (completed successfully)
✗ Failed                        (something went wrong)
```

---

## 📝 Log File

**Everything is logged to:** `~/.wise2-setup.log`

If something goes wrong, you can:
- Check the log: `cat ~/.wise2-setup.log`
- Share the log for help
- Run the installer again (it's safe to retry)

---

## ❓ Troubleshooting

### "Command not found: curl"
The installer needs curl. Run in your terminal:
```bash
sudo apt update && sudo apt install curl
```

### "Permission denied"
The installer needs sudo access for some steps. Enter your password when prompted.

### "Tailscale connection failed"
- You can skip Tailscale and set it up later
- Or run: `tailscale up` manually after setup

### "Node.js installation failed"
- Skip the Command Center for now
- You can set it up manually later

### Something else went wrong?
1. **Check the log:** `cat ~/.wise2-setup.log`
2. **Try again:** Run the installer again - it's idempotent (safe to retry)
3. **Manual steps:** Each step can be done manually if needed

---

## 🔐 Security Notes

### Safe by Design
- ✅ All credentials stored locally on your device
- ✅ No credentials sent to external servers
- ✅ GitHub tokens use `.config/gh/token` (standard location)
- ✅ Discord webhooks stored in `.env.local`

### File Permissions
```bash
# GitHub token file (secure)
~/.config/gh/token          # Read/write by you only
# Repository folder
~/wise2-core/               # Your working directory
# Log file
~/.wise2-setup.log          # Contains setup activity
```

---

## 📚 Next Steps After Setup

Once the installer completes:

### 1. Verify Everything Works
```bash
# Check system health
~/scripts/wise2-health.sh

# Or SSH to VPS
ssh dwise@wise2-vps
```

### 2. Explore the Dashboard
- Open Command Center: `http://localhost:3000`
- Or on Tailscale network: `http://<your-tailscale-ip>:3000`

### 3. Deploy Updates
```bash
cd ~/wise2-core
git pull origin main
bash scripts/wise2-vps.sh
```

### 4. View Logs
```bash
# Setup log
tail -f ~/.wise2-setup.log

# Running services
wise2-logs
```

---

## 🆘 Getting Help

### Documentation
- **Project guide:** `~/wise2-core/CLAUDE.md`
- **Deployment info:** `~/wise2-core/DEPLOYMENT_MASTER.md`
- **Setup log:** `~/.wise2-setup.log`

### Contact
📧 **Email:** dwise03@gmail.com

### Useful Commands After Setup
```bash
# SSH to VPS
vps                         # or: ssh dwise@wise2-vps

# Check system status
wise2-health               # System health check
wise2-status               # API service status
wise2-logs                 # Stream API logs

# Network info
ts-info                    # Tailscale info
ts-peers                   # Connected peers

# Deployment
wise2-deploy               # Deploy latest code
```

---

## ⚡ Advanced Options

### Run with Environment Variables (Auto-answer)
```bash
# Auto-connect to Tailscale
TAILSCALE_AUTH_KEY=tskey-abc123 bash install.sh

# Add Discord webhook
DISCORD_WEBHOOK=https://discord.com/api/webhooks/... bash install.sh

# Add GitHub token
GITHUB_TOKEN=ghp_abc123 bash install.sh

# All together
TAILSCALE_AUTH_KEY=... DISCORD_WEBHOOK=... GITHUB_TOKEN=... bash install.sh
```

### Skip Interactive Mode
```bash
# Non-interactive installation
curl https://wise2.net/pixel-slate/install.sh | bash -s -- --no-interactive
```

---

## 🎯 Summary

| What | Where |
|------|-------|
| **Run installer** | `curl https://wise2.net/pixel-slate/install.sh \| bash` |
| **View logs** | `~/.wise2-setup.log` |
| **Repository** | `~/wise2-core` |
| **Command Center** | `http://localhost:3000` |
| **SSH to VPS** | `ssh dwise@wise2-vps` or `vps` |
| **Health check** | `~/scripts/wise2-health.sh` or `wise2-health` |
| **Support** | dwise03@gmail.com |

---

**Happy setting up! 🚀**

_Last updated: 2026-09-16_  
_Installer version: 2.0 (Enhanced with logging & interactivity)_
