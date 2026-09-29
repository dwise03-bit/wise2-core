# 🎵 WISE² Sound Labs - Interactive Installer Guide

## Quick Start

```bash
chmod +x install-sound-labs.sh
./install-sound-labs.sh
```

The installer is **fully interactive** and will guide you through:
1. ✅ Prerequisite checks (SSH, Docker, Git)
2. ⚙️ Configuration setup (server, ports, contact info)
3. 🔐 SSH connection verification
4. 📦 Deployment preparation
5. 🐳 Docker image building
6. 🚀 Container deployment
7. ✓ Installation verification
8. ⚙️ Final configuration

---

## What You'll Need

### Prerequisites
- **ssh** — SSH client for remote access
- **scp** — SCP for file transfer
- **docker** — Docker CLI (optional, for local building)
- **git** — Version control (optional)

### Server Requirements
- Linux server (Ubuntu/Debian recommended)
- Docker installed and running
- SSH access to the server
- ~2GB disk space for Docker images
- Port 3001 (or custom) available

### Information to Have Ready
- **Server IP address** (e.g., 173.208.147.165)
- **SSH username** (e.g., dwise)
- **SSH port** (usually 22)
- **Project path** on remote (e.g., /home/dwise/wise2-core)
- **Contact email** for Sound Labs
- **Domain name** (optional, for DNS configuration)

---

## Installation Steps

### Step 1: Run the Installer

```bash
./install-sound-labs.sh
```

### Step 2: Answer Configuration Prompts

The installer will ask for:
- Remote server details (IP, username, port)
- Project configuration (paths, ports)
- Contact information (email, domain)
- Additional options (auto-start, SSL, monitoring)

### Step 3: Verify SSH Connection

The installer will test your SSH connection to ensure it can reach the remote server.

### Step 4: Let It Deploy

The installer will:
- Prepare files on the remote server
- Build the Docker image (~2-5 minutes)
- Deploy and start the container
- Verify everything is working

### Step 5: Access Your Website

Once complete, your website will be live at:
```
http://YOUR_SERVER_IP:3001
http://YOUR_SERVER_IP:3001/sound-labs
```

---

## Configuration File

After installation, a `.sound-labs-config` file is created with your settings:

```bash
cat .sound-labs-config
```

To re-use these settings on reinstall, the script will ask if you want to load the existing configuration.

---

## Troubleshooting

### SSH Connection Failed
```bash
# Test manual SSH
ssh -p 22 dwise@173.208.147.165 "echo OK"

# Check your credentials
# - Server IP correct?
# - Username correct?
# - Can you ping the server?
# - Firewall allows SSH?
```

### Docker Build Failed
```bash
# SSH to server and check Docker
ssh dwise@173.208.147.165 "docker version"
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core/wise-touch && docker build -t test:latest ."

# Check available disk space
ssh dwise@173.208.147.165 "df -h"
```

### Container Won't Start
```bash
# Check container logs
ssh dwise@173.208.147.165 "docker logs wise2-website"

# Check if port is already in use
ssh dwise@173.208.147.165 "netstat -tuln | grep 3001"

# Restart container
ssh dwise@173.208.147.165 "docker restart wise2-website"
```

### Website Returns 404

**1. Check if container is running:**
```bash
ssh dwise@173.208.147.165 "docker ps | grep wise2"
```

**2. Verify port mapping:**
```bash
ssh dwise@173.208.147.165 "docker port wise2-website"
```

**3. Test locally on server:**
```bash
ssh dwise@173.208.147.165 "curl -I http://localhost:3000"
```

**4. Check domain/DNS (if using domain):**
```bash
nslookup wise2.net
dig wise2.net

# Make sure DNS points to your server IP
```

**5. Verify web server is actually running:**
```bash
ssh dwise@173.208.147.165 "docker exec wise2-website curl -I http://localhost:3000"
```

---

## Common Issues & Fixes

### Issue: "No such container: wise2-website"
**Solution:** The container doesn't exist. Run the installer again or manually deploy:
```bash
ssh dwise@173.208.147.165 "docker run -d --name wise2-website -p 3001:3000 wise2-website:latest"
```

### Issue: "Cannot connect to Docker daemon"
**Solution:** Docker isn't running on the remote server:
```bash
ssh dwise@173.208.147.165 "sudo systemctl start docker"
```

### Issue: Port 3001 Already in Use
**Solution:** Use a different port:
```bash
# Edit .sound-labs-config and change WEBSITE_PORT to 3002 (or another free port)
# Re-run installer
```

### Issue: Out of Disk Space
**Solution:** Clean up old Docker images:
```bash
ssh dwise@173.208.147.165 "docker system prune -a"
```

---

## Post-Installation

### 1. Update Contact Email
Edit the form email configuration:
```bash
# In wise-touch/src/components/sound-labs/ProjectIntake.tsx
# Update: sound-labs@wise2.net to your actual email
```

### 2. Configure SSL/HTTPS
If you chose "Enable SSL":
```bash
# Use Let's Encrypt with nginx reverse proxy
# Or use AWS ALB/CloudFront in front of your server
```

### 3. Setup Form Backend
Connect the intake form to your email service:
```bash
# See: SOUND_LABS_GUIDE.md → Integration Tasks
```

### 4. Add Real Audio Demos
Replace placeholder audio files:
```bash
# Place MP3/WAV files in: wise-touch/public/audio/
# Update: src/components/sound-labs/AudioShowcase.tsx
```

### 5. Monitor Your Deployment
```bash
# View live logs
ssh dwise@173.208.147.165 "docker logs -f wise2-website"

# Check resource usage
ssh dwise@173.208.147.165 "docker stats wise2-website"

# Restart if needed
ssh dwise@173.208.147.165 "docker restart wise2-website"
```

---

## Advanced Options

### Disable Auto-Restart
```bash
ssh dwise@173.208.147.165 "docker update --restart=no wise2-website"
```

### Change Port After Installation
```bash
ssh dwise@173.208.147.165 "docker stop wise2-website && docker rm wise2-website"
ssh dwise@173.208.147.165 "docker run -d --name wise2-website -p 3002:3000 --restart always wise2-website:latest"
```

### Enable HTTPS with Reverse Proxy
See `SOUND_LABS_GUIDE.md` for nginx/Apache configuration examples.

### Backup Configuration
```bash
cp .sound-labs-config .sound-labs-config.backup
```

### Uninstall
```bash
ssh dwise@173.208.147.165 "docker stop wise2-website && docker rm wise2-website && docker rmi wise2-website:latest"
```

---

## Support & Documentation

- **Installation Guide:** This file
- **Sound Labs Guide:** `SOUND_LABS_GUIDE.md`
- **Deployment Script:** `DEPLOY_WEBSITE.sh`
- **Configuration:** `.sound-labs-config`

For more details, see:
- `SOUND_LABS_GUIDE.md` — Complete feature documentation
- `wise-touch/README.md` — Website project info

---

## Tips

1. **Test SSH first:** Run the SSH connection test manually before running the full installer
2. **Monitor build:** Watch the Docker build output for any warnings
3. **Keep config file:** The `.sound-labs-config` makes reinstalls faster
4. **Regular backups:** Backup your .sound-labs-config file
5. **Check logs:** Always check `docker logs wise2-website` if something seems wrong

---

**Ready to deploy?** Run:
```bash
./install-sound-labs.sh
```
