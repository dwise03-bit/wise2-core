# WISE² Deployment Checklist — Complete Path to Production

**Status**: Code pushed to main ✅ | SSH guide ready ✅ | Ready for local execution  
**Date**: 2026-08-16  
**Target Server**: 173.208.147.165 (dwise)  
**Deployment Method**: GitHub Actions (automatic on push to main)

---

## Phase 1: Local SSH Setup (Execute on Your Machine)

These steps run ON YOUR LOCAL MACHINE, not in this cloud session.

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -f ~/.ssh/wise2-deploy -N ""
```
- Creates `~/.ssh/wise2-deploy` (private key)
- Creates `~/.ssh/wise2-deploy.pub` (public key)

### Step 2: Copy Public Key to Server
```bash
# Read your public key
cat ~/.ssh/wise2-deploy.pub

# SSH to server and add it (you'll be prompted for password)
ssh dwise@173.208.147.165

# On the server, add your public key to authorized_keys
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Exit server
exit
```

### Step 3: Test SSH Connection
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165

# You should see the server prompt without a password
# If successful, exit
exit
```

---

## Phase 2: Configure GitHub Secrets (GitHub UI)

Go to https://github.com/dwise03-bit/wise2-core/settings/secrets/actions

### Add These 16 Secrets:

#### **Deployment Infrastructure**
| Secret | Value | Source |
|--------|-------|--------|
| `DEPLOY_HOST` | `173.208.147.165` | Server IP |
| `DEPLOY_USER` | `dwise` | Server username |
| `DEPLOY_KEY` | `~/.ssh/wise2-deploy` contents | Private key file (copy entire file) |

#### **Docker Hub** (for container registry)
| Secret | Value | Where to Find |
|--------|-------|---|
| `DOCKER_USERNAME` | Your Docker Hub username | https://hub.docker.com |
| `DOCKER_PASSWORD` | Your Docker Hub Personal Access Token | Account settings → Security |

#### **Database** (PostgreSQL)
| Secret | Value | Example |
|--------|-------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host/wise2` | Set with your server DB credentials |

#### **Email Service** (SendGrid)
| Secret | Value | Where to Find |
|--------|-------|---|
| `SENDGRID_API_KEY` | Your SendGrid API key | SendGrid dashboard → API keys |
| `SENDGRID_FROM_EMAIL` | `noreply@wise2.net` | Your configured sender email |

#### **Payment Processing** (Stripe)
| Secret | Value | Where to Find |
|--------|-------|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe dashboard → API keys |
| `STRIPE_PUBLIC_KEY` | `pk_live_...` | Stripe dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe dashboard → Webhooks |

#### **AI Services** (Optional but recommended)
| Secret | Value | Where to Find |
|--------|-------|---|
| `OPENAI_API_KEY` | Your OpenAI API key | OpenAI dashboard |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Anthropic console |

#### **Application Secrets**
| Secret | Value | Example |
|--------|-------|---------|
| `JWT_SECRET` | Random 32+ char string | `openssl rand -base64 32` |
| `SESSION_SECRET` | Random 32+ char string | `openssl rand -base64 32` |

---

## Phase 3: Verify Everything is Ready

### ✅ Code
- [x] WiseImp animations committed
- [x] Code pushed to main
- [x] Latest from origin/main merged

### ✅ SSH
- [ ] SSH key generated locally
- [ ] Public key added to server
- [ ] SSH connection tested successfully

### ✅ GitHub Secrets  
- [ ] All 16 secrets configured
- [ ] Double-checked secret values

### ✅ Deployment Ready
- [ ] GitHub Actions workflow configured (.github/workflows/)
- [ ] Docker images building
- [ ] nginx config ready
- [ ] Database migrations prepared

---

## Phase 4: Trigger Deployment (Automatic)

Once GitHub Secrets are configured, deployment starts automatically:

```bash
# Simply push to main (or it's already pushed)
git push origin main
```

GitHub Actions will:
1. ✅ Build Docker images
2. ✅ Push to Docker Hub
3. ✅ SSH to production server
4. ✅ Pull latest images
5. ✅ Run docker-compose
6. ✅ Execute health checks
7. ✅ Verify all services online

**Estimated time**: 8-12 minutes

---

## Phase 5: Monitor Deployment

### Watch GitHub Actions
- Go to https://github.com/dwise03-bit/wise2-core/actions
- Click on the latest workflow run
- Monitor logs in real-time

### Once Complete, Verify on Server

```bash
# SSH to server
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165

# Check docker services
docker ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3000  # Website
curl http://localhost:3001  # API
curl http://localhost:3005  # Dashboard
```

### Access Live Services
- **Website**: https://wise2.net
- **Dashboard**: https://wise2.net/dashboard
- **API**: https://api.wise2.net
- **Creative Studio**: https://wise2.net/studio

---

## Phase 6: Post-Deployment Tasks

Once deployment succeeds:

### 1. Run Database Migrations
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
cd ~/wise2-core
docker exec wise2-api npm run migrate
```

### 2. Seed Sample Data (if needed)
```bash
docker exec wise2-api npm run seed
```

### 3. Monitor Health
```bash
# Check all services
docker-compose ps

# View recent logs
docker-compose logs --tail=50
```

### 4. Set Up Backups
```bash
# Database backups run daily via cron
# Check: crontab -l | grep backup

# Manual backup:
./scripts/backup-database.sh
```

---

## Troubleshooting

### SSH Connection Fails
```bash
# Check key exists
ls -la ~/.ssh/wise2-deploy

# Verify permissions
chmod 600 ~/.ssh/wise2-deploy

# Test verbose mode
ssh -vvv -i ~/.ssh/wise2-deploy dwise@173.208.147.165
```

### GitHub Actions Fails
1. Check logs at https://github.com/dwise03-bit/wise2-core/actions
2. Verify all 16 GitHub Secrets are set
3. Check Docker Hub credentials
4. Verify DEPLOY_KEY contains full private key (including BEGIN/END lines)

### Docker Build Fails
```bash
# SSH to server and check Docker
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Services Not Starting
```bash
# Check service logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Full restart
docker-compose down
docker-compose up -d
```

---

## Quick Reference

**Local setup command** (one-liner for Mac/Linux):
```bash
ssh-keygen -t ed25519 -f ~/.ssh/wise2-deploy -N "" && \
echo "Key generated. Next: SSH to 173.208.147.165 and add your public key." && \
cat ~/.ssh/wise2-deploy.pub
```

**Test deployment** (after SSH setup):
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165 "docker ps"
```

**Manual deploy** (if needed):
```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165 \
  "cd ~/wise2-core && git pull && docker-compose build && docker-compose up -d"
```

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| SSH key generation | 1 min | ⏳ You |
| SSH to server & add key | 2 min | ⏳ You |
| Test SSH connection | 1 min | ⏳ You |
| Add 16 GitHub Secrets | 5 min | ⏳ You |
| GitHub Actions build/deploy | 8-12 min | 🤖 Automatic |
| Health check verification | 2 min | ✅ You |
| **Total end-to-end** | **~20-30 min** | |

---

## Status Summary

```
Code Ready          ✅ (WiseImp animations + latest merged)
SSH Guide           ✅ (SSH_SETUP_GUIDE.md)
Deployment Script   ✅ (GitHub Actions workflow)
Docker Config       ✅ (docker-compose.prod.yml)
Nginx Config        ✅ (Production ready)

NEXT STEP: Execute SSH setup on your local machine, then configure GitHub Secrets.
Once both are done, deployment happens automatically on next push to main.
```

---

**Need help?** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions on each phase.
