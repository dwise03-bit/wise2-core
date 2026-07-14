# SoundLabs Docker Quick Start

## 🚀 Deploy in 5 Minutes

### Step 1: Clone & Setup (1 min)
```bash
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core
cp .env.production.example .env.production
```

### Step 2: Configure (1 min)
Edit `.env.production` - change these values:
```bash
nano .env.production
```
- `DB_PASSWORD=` → Generate: `openssl rand -base64 32`
- `REDIS_PASSWORD=` → Generate: `openssl rand -base64 32`
- `JWT_SECRET=` → Generate: `openssl rand -base64 48`
- `NEXT_PUBLIC_API_URL=` → Your domain

### Step 3: Deploy (3 min)
```bash
./docker-deploy.sh deploy
```

That's it! 🎉

## 📱 Access Your Studio

```
🎵 Studio (Audio Production):  http://localhost:3003
📊 Dashboard:                   http://localhost:3002
⚙️  Admin:                      http://localhost:3004
🌐 Website:                     http://localhost:3001
```

## ⚡ Common Commands

```bash
# Check status
./docker-deploy.sh status

# View logs
./docker-deploy.sh logs studio

# Backup database
./docker-deploy.sh backup

# Stop all services
./docker-deploy.sh stop

# Restart everything
./docker-deploy.sh deploy
```

## 🔒 Security Checklist

- [ ] Changed all passwords in `.env.production`
- [ ] Generated secure JWT_SECRET
- [ ] Set NEXT_PUBLIC_API_URL to your domain
- [ ] Reviewed DEPLOYMENT.md for SSL setup
- [ ] Set up database backups

## 📖 Full Documentation

See `DEPLOYMENT.md` for:
- ✅ VPS deployment
- ✅ Kubernetes setup
- ✅ SSL/TLS configuration
- ✅ Scaling for production
- ✅ Troubleshooting

## 🆘 Troubleshooting

**Services won't start?**
```bash
./docker-deploy.sh logs
```

**Database connection error?**
```bash
docker-compose ps  # Check if postgres is running
```

**Forgot to configure .env?**
```bash
cp .env.production.example .env.production
nano .env.production
./docker-deploy.sh deploy
```

---

**Questions?** See DEPLOYMENT.md for detailed documentation.
