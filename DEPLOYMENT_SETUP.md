# WISE² Core - Complete Deployment Setup Guide

## Prerequisites

- GitHub repository with Actions enabled
- Production server: `173.208.147.165` (user: `dwise`)
- Docker and Docker Compose installed on server
- SSH access to production server
- Domain: `wise2.net` configured in DNS

---

## Step 1: Generate & Configure SSH Deployment Key

### ✅ Already Generated (In This Session)

Your ED25519 SSH key has been generated:

```
Private key:  ~/.ssh/wise2-deploy
Public key:   ~/.ssh/wise2-deploy.pub
Key type:     ssh-ed25519
```

**Public Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAq3XliC7CdEdefSbqFyj6LcBRkrXedhp6Nww0PpZajm wise2-deploy
```

---

## Step 2: Add SSH Key to GitHub Secrets

### 2.1 Add Private Key to GitHub

1. Go to: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `DEPLOY_KEY`
4. Value: Copy the contents of `~/.ssh/wise2-deploy` (the private key)
5. Click **Add secret**

### 2.2 Add Other Required Secrets

| Secret Name | Value | Description |
|-----------|-------|-------------|
| `DEPLOY_HOST` | `173.208.147.165` | Production server IP |
| `DEPLOY_USER` | `dwise` | SSH user |
| `DOCKER_USERNAME` | Your Docker Hub username | For pushing images |
| `DOCKER_PASSWORD` | Your Docker Hub token | For pushing images |
| `SLACK_WEBHOOK` | Your Slack webhook URL | For deployment notifications |
| `NEXT_PUBLIC_API_URL` | `https://api.wise2.net` | API URL for frontend |
| `NEXT_PUBLIC_WS_URL` | `wss://api.wise2.net` | WebSocket URL |
| `NEXT_PUBLIC_LOGIN_URL` | `https://wise2.net/command-center/login` | Login redirect |

**Database & API Secrets** (create strong random values):
```bash
# Generate random secrets
openssl rand -base64 32  # For each password

# Add to GitHub Secrets:
POSTGRES_ADMIN_PASSWORD=<random_32>
POSTGRES_APP_PASSWORD=<random_32>
MONGODB_PASSWORD=<random_32>
REDIS_PASSWORD=<random_32>
JWT_SECRET=<random_32>
OPEN_WEBUI_SECRET_KEY=<random_32>
GRAFANA_PASSWORD=<random_32>
```

---

## Step 3: Setup Production Server

### 3.1 Install Prerequisites

SSH into your server:
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
```

Run the server setup:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker dwise

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3.2 Add SSH Public Key to Server

From your local machine:
```bash
# Copy the public key to the server's authorized_keys
ssh-copy-id -i ~/.ssh/wise2-deploy dwise@173.208.147.165

# Verify access (should not prompt for password)
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165 echo "✅ SSH key auth works!"
```

### 3.3 Setup Directory Structure

On the server:
```bash
# Create application directory
mkdir -p /home/dwise/wise2-core
mkdir -p /home/dwise/backups
mkdir -p /var/log/wise2

# Set permissions
sudo chown -R dwise:dwise /home/dwise/wise2-core
sudo chown -R dwise:dwise /home/dwise/backups
sudo chown -R dwise:dwise /var/log/wise2
```

### 3.4 Configure Environment

Create `/home/dwise/wise2-core/.env.production`:
```bash
# Database
POSTGRES_ADMIN_USER=postgres
POSTGRES_ADMIN_PASSWORD=<from-github-secret>
POSTGRES_APP_USER=wise2_prod_user
POSTGRES_APP_PASSWORD=<from-github-secret>
MONGODB_PASSWORD=<from-github-secret>

# Cache
REDIS_PASSWORD=<from-github-secret>

# API
JWT_SECRET=<from-github-secret>
JWT_EXPIRATION=86400
LOG_LEVEL=info

# Third-party services (optional)
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_PUBLIC_KEY=<your-stripe-key>
GOOGLE_CLIENT_ID=<your-google-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>
GITHUB_CLIENT_ID=<your-github-id>
GITHUB_CLIENT_SECRET=<your-github-secret>

# AI Services
ANTHROPIC_API_KEY=<your-anthropic-key>
OPENAI_API_KEY=<your-openai-key>

# WebUI
OPEN_WEBUI_SECRET_KEY=<from-github-secret>

# Monitoring
GRAFANA_PASSWORD=<from-github-secret>

# Frontend
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_WS_URL=wss://api.wise2.net
NEXT_PUBLIC_LOGIN_URL=https://wise2.net/command-center/login
```

---

## Step 4: Verify Deployment Pipeline

### 4.1 Test SSH Key

From your local machine:
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165 whoami
# Expected output: dwise
```

### 4.2 Test Deployment Manually

```bash
cd /path/to/wise2-core
./scripts/deploy.sh production main
```

### 4.3 GitHub Actions Workflow

The deployment workflow runs automatically on:
- Push to `main` branch
- Push to `production` branch
- Manual trigger via GitHub Actions UI

**To monitor deployment:**
1. Go to your GitHub repository
2. Click **Actions** tab
3. Click the **Deploy to Production** workflow
4. View real-time logs

---

## Step 5: Post-Deployment Verification

After deployment, verify services are running:

```bash
# SSH into server
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165

# Check Docker containers
cd wise2-core
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f api

# Test endpoints
curl -I https://wise2.net
curl -I https://api.wise2.net/api/health
```

### Expected Status

```
NAME                    STATUS
wise2-postgres-prod     Up (healthy)
wise2-redis-prod        Up (healthy)
wise2-api-prod          Up (healthy)
wise2-website-prod      Up (healthy)
wise2-dashboard-prod    Up (healthy)
wise2-command-center    Up (healthy)
wise2-worker-prod       Up (healthy)
```

---

## Step 6: Monitoring & Alerts

### View Deployment Logs

```bash
# On server
tail -f /var/log/wise2/deploy.log

# In GitHub Actions
Actions tab → Deploy workflow → Latest run
```

### Health Checks

```bash
# Website
curl -I https://wise2.net

# API
curl -I https://api.wise2.net/api/health

# Dashboard
curl -I https://wise2.net/dashboard
```

### Database Backups

Backups are automatically created before each deployment:
```bash
# On server
ls -lh /home/dwise/backups/
```

---

## Troubleshooting

### SSH Key Not Working

```bash
# Verify key permissions on local machine
chmod 600 ~/.ssh/wise2-deploy

# Verify GitHub secret is set correctly
# Check first 50 chars match the private key start
cat ~/.ssh/wise2-deploy | head -c 50
```

### Deployment Fails

1. Check GitHub Actions logs: **Actions** tab → **Deploy workflow** → **Latest run**
2. Check server logs:
   ```bash
   ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
   docker-compose -f wise2-core/docker-compose.production.yml logs --tail=100
   ```
3. Check disk space:
   ```bash
   df -h
   docker system df
   ```

### Services Won't Start

```bash
# Stop and clean up
docker-compose -f docker-compose.production.yml down -v --remove-orphans

# Check for port conflicts
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Rebuild everything
docker-compose -f docker-compose.production.yml up -d --build
```

---

## Quick Reference

**Deploy a fix:**
```bash
git commit -m "Fix: xyz"
git push origin main
# Automatically deploys! Check Actions tab
```

**Manual deployment:**
```bash
./scripts/deploy.sh production main
```

**Emergency rollback:**
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
cd wise2-core
git checkout HEAD~1  # Go back one commit
docker-compose -f docker-compose.production.yml up -d --build
```

**Database restore:**
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
# Find latest backup
ls -lt /home/dwise/backups/
# Restore
docker-compose -f wise2-core/docker-compose.production.yml exec -T postgres psql -U postgres wise2_core_prod < /home/dwise/backups/postgres_BACKUP_FILE.sql
```

---

## Next Steps

1. ✅ Generate SSH key (done)
2. ⏳ Add secrets to GitHub
3. ⏳ Setup production server
4. ⏳ Test deployment pipeline
5. ⏳ Configure domain & SSL
6. ⏳ Enable monitoring & alerts

---

**Questions?** Check `/docs/` or contact support.
