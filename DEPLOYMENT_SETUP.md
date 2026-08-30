# WISE² Deployment Setup Guide

**Project**: WISE² Genesis  
**Version**: 1.0  
**Date**: 2026-08-17  
**Status**: Production Ready

---

## Overview

This guide walks you through setting up the complete deployment pipeline for WISE² Core. The setup includes:

1. **SSH Key Generation** - Authentication for production server
2. **GitHub Secrets Configuration** - Environment variables and credentials
3. **Production Server Setup** - Initial server configuration
4. **Deployment Verification** - Health checks and validation

**Time Required**: 20-30 minutes  
**Difficulty**: Intermediate

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub repository access (`dwise03-bit/wise2-core`)
- [ ] Production server access (173.208.147.165)
- [ ] SSH client installed (OpenSSH on macOS/Linux, PuTTY/WSL on Windows)
- [ ] `gh` CLI installed (`brew install gh` on macOS)
- [ ] GitHub CLI authentication (`gh auth login`)
- [ ] Docker and docker-compose on production server

---

## Step 1: Generate SSH Deployment Key

The deployment pipeline uses SSH key authentication to access the production server.

### Generate ED25519 Key (Recommended)

```bash
# On your local machine
ssh-keygen -t ed25519 -C "wise2-deploy-$(date +%Y%m%d)" -f ~/.ssh/wise2-deploy -N ""
```

**Output**:
```
Your identification has been saved in /home/user/.ssh/wise2-deploy
Your public key has been saved in /home/user/.ssh/wise2-deploy.pub
```

### Copy Public Key to Production Server

```bash
# SSH into production server
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165

# On production server:
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
# Paste contents of ~/.ssh/wise2-deploy.pub here
EOF
chmod 600 ~/.ssh/authorized_keys
```

### Verify SSH Access

```bash
# Back on your local machine
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165 'echo "SSH access verified!"'
```

Expected output: `SSH access verified!`

---

## Step 2: Create GitHub Deployment Secret

The SSH private key must be stored as a GitHub Secret.

### Export Private Key for GitHub

```bash
# Display the private key (copy to clipboard)
cat ~/.ssh/wise2-deploy
```

### Add to GitHub Secrets

1. Go to: https://github.com/dwise03-bit/wise2-core/settings/secrets/actions
2. Click **New repository secret**
3. **Name**: `DEPLOY_KEY`
4. **Value**: Paste the entire private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
5. Click **Add secret**

---

## Step 3: Add Deployment Infrastructure Secrets

### Using GitHub CLI (Automated)

```bash
# Clone the automated setup script
curl -o add-github-secrets.sh https://raw.githubusercontent.com/dwise03-bit/wise2-core/claude/tail-session-k00u36/scripts/add-github-secrets.sh

# Review the script
cat add-github-secrets.sh

# Run the script (requires GitHub CLI authentication)
bash add-github-secrets.sh
```

### Manual Setup (Copy-Paste)

Go to: https://github.com/dwise03-bit/wise2-core/settings/secrets/actions

Add these 13 secrets (click **New repository secret** for each):

#### Deployment Secrets
| Name | Value |
|------|-------|
| `DEPLOY_HOST` | `173.208.147.165` |
| `DEPLOY_USER` | `dwise` |
| `DEPLOY_KEY` | *(your SSH private key from Step 1)* |

#### Database Secrets
| Name | Value |
|------|-------|
| `POSTGRES_ADMIN_PASSWORD` | `lOk8jv7si/gh5JG8QdweC29ujgBe3tywupKPr9V81bo=` |
| `POSTGRES_APP_PASSWORD` | `9XAMMWLkk9iz3Ri0obLoVrj7bXnbYTeIrvqWWE3KnU0=` |
| `MONGODB_PASSWORD` | `kLwy8Ap6VA/KGtBGF1ZuIcnfijGXj86yPtAUO9e+xH4=` |
| `REDIS_PASSWORD` | `fx9yaArb2dwwkpRFoYWyVuY67gtRYVzxNNE7TiShn8c=` |

#### API & Security Secrets
| Name | Value |
|------|-------|
| `JWT_SECRET` | `tiBT249wJnxzWVFaIICxXXEbxs8dwE1CBdwJhIRzts4=` |
| `OPEN_WEBUI_SECRET_KEY` | `uf8ADxoAE4X9NUCedN0HBiR8s16vZduzf4lvhyhKED8=` |
| `GRAFANA_PASSWORD` | `jJy+D5XhmeBihckj4wqmp2VxQgMxyyGcR9dhoQQOp7Q=` |

#### Frontend URLs
| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.wise2.net` |
| `NEXT_PUBLIC_WS_URL` | `wss://api.wise2.net` |
| `NEXT_PUBLIC_LOGIN_URL` | `https://wise2.net/command-center/login` |

---

## Step 4: Production Server Setup

### Connect to Production Server

```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
```

### Create Required Directories

```bash
# Create application directory
mkdir -p ~/wise2-core
cd ~/wise2-core

# Create log directory
mkdir -p /var/log/wise2
sudo chown dwise:dwise /var/log/wise2

# Create backups directory
mkdir -p ~/backups
```

### Initialize Environment Files

```bash
# Create production .env file — generate secrets on the server, never commit them
cat > ~/.env.production << EOF
# Database (generate each with: openssl rand -base64 32)
POSTGRES_ADMIN_PASSWORD=$(openssl rand -base64 32)
POSTGRES_APP_PASSWORD=$(openssl rand -base64 32)
MONGODB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Security
JWT_SECRET=$(openssl rand -base64 48)
OPEN_WEBUI_SECRET_KEY=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 24)

# URLs
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_WS_URL=wss://api.wise2.net
NEXT_PUBLIC_LOGIN_URL=https://wise2.net/command-center/login
EOF

chmod 600 ~/.env.production
```

---

## Step 5: Test Deployment

### Trigger Manual Deployment

```bash
# Go to GitHub repository
# Actions tab → "Deploy to Production" workflow
# Click "Run workflow" → "Run workflow"
```

### Monitor Deployment

```bash
# On production server, watch logs
tail -f /var/log/wise2/deploy.log

# Check service status
docker-compose -f docker-compose.production.yml ps

# Health check
./scripts/health-check-comprehensive.sh
```

### Deployment Status

The workflow will:

1. ✅ Run all tests
2. ✅ Build Docker images
3. ✅ SSH into production server
4. ✅ Deploy services via docker-compose
5. ✅ Run database migrations
6. ✅ Verify health checks
7. ✅ Post Slack notification (optional)

**Success Indicators**:
- All GitHub Actions workflow steps pass (green checkmarks)
- Services show "Up" status in docker-compose ps
- Health check script reports "All systems operational"
- API endpoint responds at `https://api.wise2.net/health`

---

## Step 6: Verification Checklist

After deployment, verify:

- [ ] GitHub Secrets are added (13 secrets listed)
- [ ] SSH key authentication works
- [ ] Production server directories created
- [ ] `.env.production` file exists and is readable
- [ ] First deployment completed successfully
- [ ] All services running via docker-compose
- [ ] Health check passes
- [ ] API responds to requests
- [ ] Website loads at https://wise2.net

---

## Troubleshooting

### SSH Authentication Failed

```bash
# Verify key permissions
chmod 600 ~/.ssh/wise2-deploy
chmod 700 ~/.ssh

# Test connection
ssh -i ~/.ssh/wise2-deploy -vvv dwise@173.208.147.165

# Common issues:
# - Wrong key path
# - Key permissions too open
# - Public key not on server
# - Wrong username/IP address
```

### GitHub Actions Workflow Fails

**Check logs**:
1. Go to repository → Actions tab
2. Click the failed workflow run
3. Click "Deploy to Production"
4. Review error messages in red

**Common failures**:
- `Permission denied` - SSH key issue (see above)
- `docker-compose not found` - Installation required on server
- `Database migration failed` - Check database connection secrets
- `Health check timeout` - Services not starting (check Docker logs)

### Deployment Secrets Not Found

```bash
# Verify secrets are set
gh secret list -R dwise03-bit/wise2-core

# If missing, re-add via GitHub UI or CLI script
bash add-github-secrets.sh
```

### Production Server Issues

```bash
# SSH into server and check
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165

# Check Docker status
docker ps -a
docker-compose -f docker-compose.production.yml logs

# Check system resources
df -h  # Disk usage
free -h  # Memory usage
top  # Running processes
```

---

## Automatic Deployments

Once setup is complete, deployments happen automatically:

1. **On push to main branch**: Workflow triggers automatically
2. **Status**: Check GitHub Actions tab for live status
3. **Notifications**: Slack notification sent (if configured)
4. **Logs**: Available in GitHub Actions workflow logs

---

## Security Notes

⚠️ **Important**:

- Never commit `.env` files to git
- SSH private keys should only exist on secure machines
- Rotate secrets every 90 days
- Monitor server access logs regularly
- Discord and Stripe webhooks should be regenerated after exposure
- See SECURITY_INCIDENT_REPORT.md for incident details

---

## Quick Reference Commands

```bash
# Deploy manually
cd ~/wise2-core
git pull origin main
./scripts/deploy.sh

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs api -f

# Health check
./scripts/health-check-comprehensive.sh

# Backup database
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres wise2_db > ~/backups/wise2_$(date +%Y%m%d_%H%M%S).sql

# Restart services
docker-compose -f docker-compose.production.yml restart
```

---

## Next Steps

1. ✅ Setup SSH keys and GitHub Secrets (this guide)
2. ✅ Run first deployment test
3. ⏳ Setup monitoring and alerting (see MONITORING_SETUP.md)
4. ⏳ Setup database backups (see BACKUP_SETUP.md)
5. ⏳ Configure production domain and SSL certificates
6. ⏳ Setup Discord notifications for deployments

---

**Questions?** Check troubleshooting section or review deployment logs in GitHub Actions.
