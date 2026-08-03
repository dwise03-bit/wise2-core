# 🎵 WISE² Sound Labs — Complete Installation Index

## Overview

You have everything needed to deploy Sound Labs to production. Choose your installation method:

| Method | Complexity | Time | Best For |
|--------|-----------|------|----------|
| **Interactive Installer** | Simple | 10 min | New deployments |
| **Quick Deploy Script** | Medium | 5 min | Redeployments |
| **Manual Steps** | Complex | 15 min | Custom setups |

---

## 📦 Installation Files

### 1. **Interactive Installer** (Recommended for First-Time Setup)
```bash
./install-sound-labs.sh
```

**What it does:**
- Guides you through every step with prompts
- Checks prerequisites (SSH, Docker, Git)
- Configures server details and ports
- Verifies SSH connection
- Builds Docker image
- Deploys container
- Verifies everything works
- Saves configuration for future use

**Time:** ~10-15 minutes (mostly Docker building)

**Best for:** First-time deployments, new servers

---

### 2. **Quick Deploy Script** (For Redeployments)
```bash
./DEPLOY_WEBSITE.sh
```

**What it does:**
- Pulls latest code
- Stops existing container
- Builds new Docker image
- Deploys with docker-compose

**Time:** ~5-10 minutes

**Best for:** Updating existing deployments

---

### 3. **Manual Deployment** (For Custom Setups)

See `DEPLOY_COMMANDS.sh` for individual commands you can run manually.

---

## 📚 Documentation Files

### **Installation Guides**
| File | Purpose |
|------|---------|
| `INSTALLER_README.md` | Complete guide for using install-sound-labs.sh |
| `DEPLOYMENT_GUIDE.md` | Manual deployment steps |
| `FIX_WISE2NET.md` | Fix 404 errors with nginx setup |

### **Project Documentation**
| File | Purpose |
|------|---------|
| `SOUND_LABS_GUIDE.md` | Complete Sound Labs feature guide |
| `README.md` | Project overview |
| `DEPLOY_WEBSITE.sh` | Automated deployment script |

### **Configuration**
| File | Purpose |
|------|---------|
| `.sound-labs-config` | Installer configuration (auto-created) |
| `docker-compose.prod.yml` | Docker Compose production config |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Make Installer Executable
```bash
chmod +x install-sound-labs.sh
```

### Step 2: Run Interactive Installer
```bash
./install-sound-labs.sh
```

### Step 3: Access Your Website
```
http://YOUR_SERVER_IP:3001
http://YOUR_SERVER_IP:3001/sound-labs
```

**Done!** The website is deployed and running.

---

## 🌐 Fix wise2.net 404 Error

If you're getting 404 errors when accessing wise2.net:

1. **Read:** `FIX_WISE2NET.md`
2. **Follow:** Step-by-step nginx setup guide
3. **Verify:** `curl http://wise2.net/sound-labs`

This sets up nginx to reverse-proxy wise2.net to port 3001.

---

## 📋 What Each Tool Does

### install-sound-labs.sh
**Interactive multi-step installer**
- ✅ Checks if SSH, Docker, Git are installed
- ✅ Asks for server IP, port, email, domain
- ✅ Tests SSH connection
- ✅ Builds Docker image
- ✅ Deploys container
- ✅ Verifies website is running
- ✅ Saves config for future use

**Run:** `./install-sound-labs.sh`
**Docs:** `INSTALLER_README.md`

### DEPLOY_WEBSITE.sh
**Automated redeployment script**
- ✅ Pulls latest code via git
- ✅ Stops old container
- ✅ Builds new Docker image
- ✅ Starts new container
- ✅ Verifies deployment

**Run:** `./DEPLOY_WEBSITE.sh`
**Docs:** Built-in help text

### setup-nginx.sh
**Nginx reverse proxy setup**
- ✅ Installs nginx if needed
- ✅ Creates wise2.net proxy config
- ✅ Enables site
- ✅ Tests configuration
- ✅ Reloads nginx

**Run:** `ssh dwise@173.208.147.165 < setup-nginx.sh`
**Docs:** `FIX_WISE2NET.md`

---

## 🔧 Prerequisites

**On Your Computer:**
- SSH client (`ssh`, `scp`)
- Optional: Docker (for local testing)
- Optional: Git (for code updates)

**On Remote Server:**
- Linux OS (Ubuntu/Debian recommended)
- Docker & Docker Compose
- Nginx (optional, but needed for domain setup)
- ~2GB free disk space

**Information to Have:**
- Server IP address
- SSH username
- SSH port
- Project path on remote
- Contact email
- Domain name (optional)

---

## 📊 Current Deployment Status

| Component | Status | Location |
|-----------|--------|----------|
| Docker Image | ✅ Built | `wise2-website:latest` |
| Container | ✅ Running | Port 3001 |
| Sound Labs Page | ✅ Live | `/sound-labs` |
| Dashboard | ✅ Running | Port 3000 |
| API | ✅ Running | Port 3101 |
| Nginx | ⚠️ Manual setup needed | See `FIX_WISE2NET.md` |

---

## 🎯 Installation Workflow

### First Time Setup
```
1. Read INSTALLER_README.md
2. Run ./install-sound-labs.sh
3. Answer configuration prompts
4. Wait for Docker build (~3-5 min)
5. Verify website loads
6. (Optional) Setup nginx for domain
```

### Redeployment (Code Updates)
```
1. git pull origin main
2. Run ./DEPLOY_WEBSITE.sh
3. Docker rebuilds (~2-3 min)
4. Container restarts
5. Done
```

### Domain Setup
```
1. Read FIX_WISE2NET.md
2. Follow nginx configuration steps
3. Test: curl http://wise2.net/sound-labs
```

---

## 🐛 Troubleshooting Quick Reference

| Problem | Solution | Details |
|---------|----------|---------|
| SSH connection fails | Check server IP, credentials, firewall | See INSTALLER_README.md → Troubleshooting |
| Docker build fails | Check disk space, Docker running | `docker version` on server |
| Container won't start | Check port available, logs | `docker logs wise2-website` |
| 404 on wise2.net | Setup nginx reverse proxy | `FIX_WISE2NET.md` |
| Port already in use | Change port in config | Edit `.sound-labs-config` |

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Installation Guide | `INSTALLER_README.md` |
| Sound Labs Features | `SOUND_LABS_GUIDE.md` |
| Nginx/Domain Setup | `FIX_WISE2NET.md` |
| Deployment Scripts | `DEPLOY_WEBSITE.sh`, `setup-nginx.sh` |
| Project Info | `README.md` |

---

## ✅ Post-Installation Checklist

After deployment, verify:

- [ ] Website loads at `http://SERVER_IP:3001`
- [ ] Sound Labs page works at `/sound-labs`
- [ ] All 10 components render correctly
- [ ] Form is functional (check console for errors)
- [ ] Responsive design works on mobile
- [ ] No console errors (F12 → Console)
- [ ] (Optional) Domain wise2.net resolves
- [ ] (Optional) Nginx reverse proxy working
- [ ] Container auto-restarts on server reboot
- [ ] Logs accessible: `docker logs wise2-website`

---

## 🚀 Next Steps

### Immediate (Required)
1. Run installer: `./install-sound-labs.sh`
2. Verify website loads
3. Test Sound Labs page

### Short-term (Recommended)
1. Setup nginx for domain (FIX_WISE2NET.md)
2. Configure SSL/HTTPS (certbot)
3. Connect form backend to email
4. Add real audio demos

### Long-term (Optional)
1. Add testimonials
2. Real portfolio images
3. Analytics/tracking
4. CDN/caching optimization
5. Load balancing if scaling

---

## 📂 File Structure

```
wise2-core/
├── install-sound-labs.sh          ← Start here
├── DEPLOY_WEBSITE.sh              ← For updates
├── setup-nginx.sh                 ← For domain setup
├── INSTALLER_README.md            ← Installation guide
├── FIX_WISE2NET.md                ← Domain/nginx guide
├── INSTALLATION_INDEX.md           ← This file
├── SOUND_LABS_GUIDE.md            ← Feature documentation
├── .sound-labs-config             ← Auto-created config
└── wise-touch/
    ├── Dockerfile
    ├── package.json
    ├── src/
    │   └── components/sound-labs/
    │       ├── SoundLabsHero.tsx
    │       ├── AudioShowcase.tsx
    │       ├── OutcomeGrid.tsx
    │       ├── PackageSelector.tsx
    │       └── ... (10 components total)
    └── ...
```

---

## 💡 Pro Tips

1. **Save config:** `.sound-labs-config` auto-saves your settings for reuse
2. **Watch build:** Monitor Docker build: `docker build ... 2>&1 | tail -f`
3. **Check logs:** Always start with `docker logs wise2-website` for errors
4. **Test locally:** Before production: `curl http://localhost:3001/sound-labs`
5. **Backup config:** Keep a copy of `.sound-labs-config` safe
6. **Monitor deployment:** Watch container stats: `docker stats`

---

## 🎉 You're Ready!

Everything is prepared for deployment. Choose your method above and get started:

**Recommended:** Run `./install-sound-labs.sh` for guided setup.

Questions? See documentation files listed above.
