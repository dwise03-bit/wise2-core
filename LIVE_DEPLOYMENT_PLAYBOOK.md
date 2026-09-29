# 🚀 LIVE DEPLOYMENT PLAYBOOK

**Goal:** Push to GitHub → Create PR → Go Live on wise2.net  
**Time:** 15 minutes  
**Status:** Ready to execute

---

## ⏱️ QUICK START (Copy & Paste Commands)

### Step 1: Authenticate with GitHub (2 minutes)

```powershell
# Open PowerShell and run:
gh auth login

# When prompted:
# 1. Select: GitHub.com
# 2. Select: SSH (press 's' then Enter)
#    OR paste authentication token if you have one
# 3. Follow the prompts to complete authentication
# 4. Verify with: gh auth status
```

### Step 2: Push to GitHub (1 minute)

```powershell
# Navigate to repo
cd C:\WISE2\Core\wise2

# Push all commits
git push -u origin setup/dave-station

# Expected output:
# Enumerating objects: XX, done.
# Counting objects: 100% (XX/XX), done.
# Delta compression using up to 8 threads.
# Writing objects: 100% (XX/XX), done.
#
# [new branch]      setup/dave-station -> setup/dave-station
# Branch 'setup/dave-station' set up to track remote branch 
# 'setup/dave-station' from 'origin'.
```

### Step 3: Create Pull Request (1 minute)

```powershell
# Create PR
gh pr create \
  --title "WISE² Ultimate AI Dashboard + Darrin Setup" \
  --body "Production deployment of Ultimate AI Edition dashboard with comprehensive Darrin collaborative setup and wise2.net VPS deployment package." \
  --base main \
  --head setup/dave-station

# Output will show PR URL and number
# Open it and request review (optional)
```

### Step 4: Verify on GitHub (1 minute)

Visit: `https://github.com/dwise03-bit/wise2-core`

Check:
- ✓ Branch `setup/dave-station` exists
- ✓ 6 commits are visible
- ✓ PR is created (if you ran Step 3)
- ✓ All files uploaded (docs, deployment scripts, etc.)

---

## 🌐 DEPLOY TO WISE2.NET (Go Live)

### Phase 1: Preparation (5 minutes)

**1. Register Domain**
- Visit: namecheap.com, GoDaddy, or registrar of choice
- Register: `wise2.net`
- Cost: ~$10/year
- Note down your registrar login

**2. Create VPS**
- DigitalOcean: https://www.digitalocean.com/ (recommended)
- Create Droplet:
  - OS: Ubuntu 20.04 LTS
  - Size: $5/month (512MB RAM, 20GB SSD)
  - Region: NYC3 or SFO3
  - Add SSH key during setup
  - Create Droplet
- Wait for Droplet to start (~2 minutes)
- Copy the IP address shown

**3. Configure DNS**
- Go to registrar (where you bought wise2.net)
- Find DNS settings
- Add A Record:
  - Type: A
  - Name: @ (or wise2.net)
  - Value: [Your VPS IP address from step 2]
  - TTL: 3600 (1 hour)
- Save changes
- DNS propagation time: 5-48 hours (usually 1-2 hours)

### Phase 2: Deploy Dashboard (5 minutes)

**1. SSH into Your VPS**

```bash
# From PowerShell or terminal
ssh root@[YOUR_VPS_IP]

# If using SSH key:
ssh -i C:\Users\dwise\.ssh\id_ed25519 root@[YOUR_VPS_IP]

# If prompted for password, use the one from DigitalOcean email
```

**2. Clone Repository**

```bash
cd /var/www
git clone --branch setup/dave-station https://github.com/dwise03-bit/wise2-core.git wise2
cd wise2
```

**3. Run Deployment Script**

```bash
# Make script executable
chmod +x deploy-wise2.sh

# Run deployment (automatic setup)
bash deploy-wise2.sh
```

**What it does automatically:**
- ✓ Updates system
- ✓ Installs Node.js, Nginx, Certbot
- ✓ Configures Nginx for wise2.net
- ✓ Generates SSL certificate
- ✓ Sets up firewall
- ✓ Configures auto-renewal
- ✓ Starts web server
- Takes ~10 minutes

**4. Verify Deployment**

```bash
# Test HTTP
curl -I http://wise2.net
# May show: 301 Redirect (that's OK)

# Test HTTPS
curl -I https://wise2.net
# Should show: HTTP/2 200 OK

# Check Nginx
systemctl status nginx

# View logs
tail -f /var/log/nginx/access.log
```

### Phase 3: Access Your Live Dashboard (2 minutes)

**1. Wait for DNS Propagation**

DNS can take up to 48 hours to fully propagate, but usually 1-2 hours. To check:

```bash
# From your local machine
nslookup wise2.net
# Should show your VPS IP address

# Or test directly
curl -I https://wise2.net
```

**2. Open in Browser**

Once DNS is ready:
- Visit: `https://wise2.net`
- You should see the WISE² Ultimate AI Dashboard
- All features working live!

**3. Share URL with Darrin**

Send Darrin:
```
Dashboard is live! 🎉
Access: https://wise2.net

Setup docs (if needed):
- DARRIN_SETUP_HANDOFF.md
- DARRIN_QUICK_REFERENCE.txt
```

---

## 📋 COMPLETE CHECKLIST

### Pre-Push Checklist
- [ ] Git branch: setup/dave-station
- [ ] 6 commits ready to push
- [ ] All files created:
  - [ ] Dashboard files (index.html)
  - [ ] Documentation files
  - [ ] Deployment scripts
  - [ ] Nginx config
  - [ ] Dockerfile

### GitHub Checklist
- [ ] GitHub account ready
- [ ] `gh auth login` completed
- [ ] `git push -u origin setup/dave-station` succeeded
- [ ] Branch visible on GitHub
- [ ] PR created (optional)
- [ ] All commits visible

### Domain & VPS Checklist
- [ ] Domain registered (wise2.net)
- [ ] VPS created (Ubuntu 20.04)
- [ ] SSH key added to VPS
- [ ] Can SSH into VPS
- [ ] DNS A record configured
- [ ] Firewall allows ports 80 & 443

### Deployment Checklist
- [ ] Repository cloned on VPS
- [ ] deploy-wise2.sh executable
- [ ] Deployment script completed successfully
- [ ] HTTP test passing
- [ ] HTTPS test passing
- [ ] Nginx status: active
- [ ] SSL certificate installed
- [ ] Auto-renewal configured

### Live Service Checklist
- [ ] DNS propagated (can resolve wise2.net)
- [ ] https://wise2.net accessible
- [ ] Dashboard displays correctly
- [ ] All features working
- [ ] Mobile view responsive
- [ ] Performance acceptable

---

## 🎯 EXACT COMMANDS (Copy-Paste Ready)

### For Your Local Machine:

```powershell
# Step 1: Authenticate
gh auth login

# Step 2: Navigate and push
cd C:\WISE2\Core\wise2
git push -u origin setup/dave-station

# Step 3: Create PR
gh pr create --title "WISE² Ultimate AI Dashboard + Darrin Setup" --body "Production deployment with comprehensive setup." --base main --head setup/dave-station

# Step 4: View PR
gh pr view

# Step 5: View branch on GitHub
start https://github.com/dwise03-bit/wise2-core/tree/setup/dave-station
```

### For Your VPS (After SSH):

```bash
# Clone repository
cd /var/www
git clone --branch setup/dave-station https://github.com/dwise03-bit/wise2-core.git wise2
cd wise2

# Make script executable
chmod +x deploy-wise2.sh

# Run deployment
bash deploy-wise2.sh

# Follow on-screen prompts (usually all automatic)

# Verify
curl -I https://wise2.net
systemctl status nginx
```

---

## 🛠️ TROUBLESHOOTING

### Push Fails with "Permission denied"

**Problem:** SSH key not authorized on GitHub

**Solution:**
```powershell
# Try using HTTPS instead temporarily
git config --global credential.helper wincred
git push -u origin setup/dave-station

# Or use GitHub CLI (easiest)
gh auth login
# (will handle authentication for you)
```

### DNS Not Resolving

**Problem:** https://wise2.net shows "cannot reach"

**Solution:**
```bash
# Wait for DNS propagation (can take 24-48 hours)
# Check status:
nslookup wise2.net

# Once resolved, clear browser cache:
# Ctrl+Shift+Delete (Chrome)
# Then reload page
```

### HTTPS Certificate Error

**Problem:** Browser shows "SSL certificate error"

**Solution:**
```bash
# SSH into VPS and check certificate
ssh root@[YOUR_VPS_IP]

# Verify cert is installed
certbot certificates

# If missing, run:
certbot --nginx -d wise2.net -d www.wise2.net

# Restart Nginx
systemctl restart nginx
```

### Dashboard Doesn't Load

**Problem:** White page or 404 error

**Solution:**
```bash
# SSH into VPS
# Check if files are in correct location
ls -la /var/www/wise2/CommandCenter/Dashboard/

# Check Nginx error log
tail -f /var/log/nginx/error.log

# Verify Nginx is running
systemctl status nginx
systemctl restart nginx
```

---

## 📊 AFTER GOING LIVE

### Monitor Your Dashboard

```bash
# SSH into VPS
ssh root@[YOUR_VPS_IP]

# Check Nginx logs
tail -f /var/log/nginx/access.log

# Check system resources
free -h  # Memory
df -h    # Disk space

# Check certificate renewal
certbot certificates
```

### Update Dashboard

**Pull latest changes:**
```bash
cd /var/www/wise2
git pull origin setup/dave-station
# Page auto-refreshes in browser
```

**Or upload manually:**
```bash
# From your local machine
sftp root@[YOUR_VPS_IP]
cd /var/www/wise2/CommandCenter/Dashboard
put index.html
exit
```

### Add to Uptime Monitoring (Optional)

Visit: https://uptimerobot.com
- Sign up (free)
- Add monitor: https://wise2.net
- Get alerts if site goes down

### Add CDN (Optional)

Visit: https://cloudflare.com
- Add site: wise2.net
- Update nameservers at registrar
- Enable caching + DDoS protection

---

## 💰 FINAL COSTS

| Item | Cost | Notes |
|------|------|-------|
| Domain (wise2.net) | $10/year | One-time setup |
| VPS (DigitalOcean) | $60/year | $5/month |
| SSL Certificate | FREE | Let's Encrypt |
| **TOTAL** | **$70/year** | ~$6/month |

---

## 🎉 SUCCESS CRITERIA

You're done when:

✅ GitHub push successful  
✅ PR created and visible  
✅ Domain registered  
✅ VPS running  
✅ Deployment script completed  
✅ https://wise2.net accessible  
✅ Dashboard displays and loads  
✅ Can share live URL with Darrin  

---

## 📞 QUICK REFERENCE

**Repository:** `https://github.com/dwise03-bit/wise2-core`  
**Branch:** `setup/dave-station`  
**Dashboard:** `https://wise2.net` (after deployment)  
**SSH Key:** `C:\Users\dwise\.ssh\id_ed25519`  
**Deployment Guide:** `VPS_DEPLOYMENT_GUIDE.md`  
**Deploy Script:** `deploy-wise2.sh`  

---

## 🚀 YOU'RE READY!

This playbook has everything you need. Follow the steps in order and you'll be live in under an hour (excluding DNS propagation time).

**Next Actions:**
1. Run: `gh auth login`
2. Run: `git push -u origin setup/dave-station`
3. Register domain + create VPS
4. SSH into VPS
5. Run: `bash deploy-wise2.sh`
6. Wait for DNS (~1-2 hours)
7. Visit: `https://wise2.net` ✅

**That's it! You're live! 🎉**

---

*Generated: 2026-09-29*  
*WISE² Live Deployment Playbook*
