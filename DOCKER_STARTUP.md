# WISE² Docker Deployment - Startup Guide

## 🚀 Quick Start (macOS/Linux/Windows)

### Step 1: Start Docker Daemon

**macOS (Docker Desktop):**
```bash
# Open Docker Desktop application
open /Applications/Docker.app

# Or start via CLI
docker run hello-world
```

**Linux:**
```bash
# Start Docker daemon
sudo systemctl start docker

# Or
sudo service docker start

# Verify
docker run hello-world
```

**Windows:**
```bash
# Open Docker Desktop application
# Or use PowerShell as Administrator
docker run hello-world
```

### Step 2: Navigate to Website Directory

```bash
cd /Users/danielwise/Projects/wise2-core/apps/website
```

### Step 3: Deploy with Docker Compose

**Option A - Automated Script:**
```bash
./docker-deploy.sh
```

**Option B - Manual Commands:**
```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f website

# Check status
docker-compose ps
```

### Step 4: Verify Deployment

```bash
# Test endpoint
curl http://localhost:3000

# Should return HTML with WISE² homepage
```

### Step 5: Access Website

Open in your browser:
```
http://localhost:3000
```

---

## 📋 Complete Deployment Checklist

### Pre-Deployment
- [ ] Docker installed (`docker --version`)
- [ ] Docker daemon running
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] In website directory: `/apps/website`
- [ ] Production build successful

### Deployment
- [ ] Run `./docker-deploy.sh` or manual commands
- [ ] Image builds without errors
- [ ] Container starts successfully
- [ ] Health checks pass

### Post-Deployment
- [ ] Access http://localhost:3000
- [ ] Homepage loads
- [ ] Animations smooth
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All sections visible

### Cleanup (if needed)
- [ ] `docker-compose down` - Stop container
- [ ] `docker-compose down -v` - Stop and remove volumes
- [ ] `docker image rm wise2-website:latest` - Remove image

---

## 🔍 Troubleshooting

### Docker Daemon Not Running

**macOS:**
```bash
# Start Docker Desktop
open /Applications/Docker.app

# Or check status
docker ps
```

**Linux:**
```bash
# Start daemon
sudo systemctl start docker

# Check status
sudo systemctl status docker
```

**Windows:**
```bash
# Start Docker Desktop
# Or use Services app: Services → Docker Desktop
```

### Port Already in Use (3000)

```bash
# Find process using port 3000
lsof -i :3000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 wise2-website:latest
```

### Container Won't Start

```bash
# Check logs
docker-compose logs website

# Rebuild image
docker-compose build --no-cache

# Try again
docker-compose up -d
```

### Slow Build

```bash
# First build: 2-3 minutes (normal)
# Subsequent builds: 30-60s (cached)

# Force rebuild without cache
docker-compose build --no-cache
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a

# Then rebuild
docker-compose build
```

---

## 📊 Monitor Deployment

### View Logs
```bash
# Follow logs in real-time
docker-compose logs -f website

# Last 100 lines
docker-compose logs --tail=100 website

# Show timestamps
docker-compose logs -f --timestamps website
```

### Check Container Status
```bash
# List containers
docker-compose ps

# Detailed status
docker container inspect wise2-website

# View resource usage
docker stats wise2-website
```

### Test Health Check
```bash
# Direct test
curl http://localhost:3000

# With verbose output
curl -v http://localhost:3000

# Check headers
curl -I http://localhost:3000
```

---

## 🛑 Stop/Restart Container

### Stop Running Container
```bash
docker-compose stop
```

### Restart Container
```bash
docker-compose restart website
```

### Stop and Remove Container
```bash
docker-compose down
```

### Stop and Remove Everything
```bash
docker-compose down -v
```

---

## 📈 Scaling & Performance

### Multiple Replicas
```bash
docker-compose up -d --scale website=3
```

### Resource Limits
Edit `docker-compose.yml`:
```yaml
services:
  website:
    # ... other config ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Memory Usage
```bash
# Monitor real-time
docker stats wise2-website

# Get peak usage
docker stats --no-stream wise2-website
```

---

## 🔒 Security Checks

```bash
# Verify running as non-root
docker exec wise2-website id

# Should show: uid=1001(nextjs) gid=1001(nodejs) groups=1001(nodejs)

# Check for secrets
docker exec wise2-website env | grep -i secret

# Should be empty (no secrets in container)
```

---

## 📝 Environment Variables

Create `.env` file in website directory:

```bash
cat > .env << EOF
NEXT_PUBLIC_SITE_URL=https://wise2.net
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET
EOF
```

Then use with Docker Compose:
```bash
docker-compose --env-file .env up -d
```

---

## 🔄 Update & Redeploy

### Pull Latest Code
```bash
cd /Users/danielwise/Projects/wise2-core
git pull origin main
```

### Rebuild Image
```bash
cd apps/website
docker-compose build --no-cache
```

### Redeploy
```bash
docker-compose down
docker-compose up -d
```

---

## 📊 Performance Metrics

After deployment, check:

### Browser Performance
- Open DevTools (F12)
- Network tab: Check load times
- Console: No errors
- Performance: Smooth animations

### Docker Stats
```bash
docker stats wise2-website
```

Expected:
- Memory: 100-150MB
- CPU: <5% at idle
- Network I/O: Minimal when idle

### Lighthouse Score
- Open http://localhost:3000
- DevTools → Lighthouse
- Run audit
- Performance: 90+

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Verify site loads
2. ✅ Test animations
3. ✅ Check mobile
4. ✅ Monitor logs
5. ✅ Run Lighthouse audit
6. ✅ Configure production domain
7. ✅ Set up monitoring
8. ✅ Plan Phase 6 enhancements

---

## 📚 Documentation

- **[DOCKER.md](./apps/website/DOCKER.md)** - Complete Docker reference
- **[DEPLOYMENT.md](./apps/website/DEPLOYMENT.md)** - Vercel deployment
- **[README.md](./apps/website/README.md)** - Project overview
- **[TESTING.md](./apps/website/TESTING.md)** - QA checklist

---

## ✅ Success Indicators

When deployment is complete, you should see:

```
✅ DEPLOYMENT SUCCESSFUL!
════════════════════════════════════════
🌐 Access Information:
  Website: http://localhost:3000
  Health Check: curl http://localhost:3000

📋 Useful Commands:
  View logs:      docker-compose logs -f website
  Stop container: docker-compose down
  Restart:        docker-compose restart website

🔍 Verification:
  1. Open http://localhost:3000 in your browser
  2. Check animations are smooth
  3. Test mobile responsiveness
  4. Verify no console errors
════════════════════════════════════════
Next: Open http://localhost:3000
```

---

## 🆘 Support

**Issue:** Docker daemon not starting
**Solution:** Open Docker Desktop app or restart daemon

**Issue:** Port 3000 in use
**Solution:** Stop other services or use different port

**Issue:** Build takes too long
**Solution:** This is normal (2-3 min) on first build, cached on restart

**Issue:** Container exits immediately
**Solution:** Check logs: `docker-compose logs website`

---

**Status:** ✅ Ready for Docker deployment

Run `./docker-deploy.sh` to start!
