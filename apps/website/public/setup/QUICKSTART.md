# 🚀 WISE² Pixel Slate Dev Station - Quick Start

Set up your Pixel Slate as a full development backup station for WISE² in **5 minutes**.

## Prerequisites

- ✅ Pixel Slate with Tailscale connected
- ✅ Crostini (Linux on ChromeOS) enabled
- ✅ Access to VPS (dwise@173.208.147.165)

## Quick Setup

### Step 1: Download & Run Pixel Slate Setup (Tablet Terminal)

```bash
cd ~
curl -fsSL https://wise2.net/setup/pixel-slate-setup.sh -o setup.sh
chmod +x setup.sh
bash setup.sh
```

**This will:**
- Install git, Docker, Node.js, PostgreSQL client, rsync, ssh
- Generate SSH keypair (pixel-slate)
- Create backup scripts
- Set up command aliases

**Save your public key** (printed at end):
```
📋 YOUR PUBLIC KEY (add to VPS ~/.ssh/authorized_keys):
================================================
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOxxxxx pixel-slate-YYYYMMDD
================================================
```

---

### Step 2: Run VPS Setup (VPS Terminal)

```bash
ssh dwise@173.208.147.165
curl -fsSL https://wise2.net/setup/vps-setup.sh -o setup.sh
bash setup.sh
```

**This will:**
- Create backup directories
- Print your VPS Tailscale IP
- Set up for SSH access

**Save your VPS Tailscale IP** (printed at end):
```
VPS TAILSCALE IP: 100.x.x.y
```

---

### Step 3: Add Pixel Slate Public Key to VPS

On **VPS terminal**:
```bash
nano ~/.ssh/authorized_keys
# Paste your public key from Step 1
# Ctrl+O, Enter, Ctrl+X to save
```

---

### Step 4: Update SSH Config on Pixel Slate

On **Pixel Slate terminal**:
```bash
nano ~/.ssh/config
# Find the line: HostName <VPS_TAILSCALE_IP>
# Replace with your IP from Step 2, e.g.: HostName 100.x.x.y
# Ctrl+O, Enter, Ctrl+X to save
```

---

### Step 5: Test Connection

```bash
# From Pixel Slate terminal:
vps
# Should SSH into VPS without password
```

---

## Available Commands (After Setup)

```bash
vps              # SSH to VPS
wise2-health     # Check system health
wise2-backup     # Backup database & code
wise2-logs       # Stream API logs
wise2-status     # Check API status
wise2-deploy     # Deploy latest code
wise2-tunnel-api # Tunnel to API (localhost:3000)
wise2-tunnel-dashboard # Tunnel to dashboard (localhost:3005)
ts-info          # Show Tailscale connection
```

---

## Usage Examples

### Access Dashboard from Tablet Browser

```bash
# Terminal 1: Create tunnel
wise2-tunnel-dashboard

# Tablet browser: Visit http://localhost:3005
```

### Backup Database

```bash
wise2-backup
# Creates: ~/wise2-backups/db_YYYYMMDD_HHMMSS.sql.gz
```

### Stream Live Logs

```bash
wise2-logs
# Ctrl+C to exit
```

### Check System Health

```bash
wise2-health
```

---

## Troubleshooting

### SSH Connection Fails

1. Verify VPS Tailscale IP:
   ```bash
   ssh dwise@173.208.147.165 'tailscale ip -4'
   ```

2. Verify public key was added:
   ```bash
   ssh dwise@173.208.147.165 'cat ~/.ssh/authorized_keys'
   ```

3. Test with explicit key:
   ```bash
   ssh -i ~/.ssh/pixel-slate dwise@<VPS_TAILSCALE_IP>
   ```

### Tailscale Disconnected

```bash
# On Pixel Slate:
sudo tailscale up

# On VPS:
sudo tailscale up
```

### Backup Fails

```bash
# Check database is running:
ssh wise2-vps 'docker ps -a | grep postgres'

# Check disk space:
ssh wise2-vps 'df -h'
```

---

## File Locations

| Location | Purpose |
|----------|---------|
| `~/.ssh/pixel-slate` | Private SSH key |
| `~/.ssh/pixel-slate.pub` | Public SSH key |
| `~/.ssh/config` | SSH config |
| `~/scripts/wise2-backup.sh` | Backup script |
| `~/scripts/wise2-health.sh` | Health check script |
| `~/wise2-backups/` | Backup files |

---

## Next Steps

1. **Automate Backups** — Add to cron:
   ```bash
   crontab -e
   # Add: 0 2 * * * ~/scripts/wise2-backup.sh
   ```

2. **Set Up Remote IDE** — Use SSH to edit files:
   ```bash
   # VS Code Remote SSH extension
   ssh wise2-vps
   # code /home/dwise/wise2-core
   ```

3. **Monitor Logs** — Keep logs streaming:
   ```bash
   wise2-logs &
   ```

---

**Questions?** Check logs with `wise2-logs` or verify with `wise2-health`.

**Success!** Your Pixel Slate is now a full dev backup station. 🚀
