# 🎬 BLAKKHAIL Storefront - Mac Setup Guide

## Quick Start (One Command)

```bash
./scripts/setup-blakkhail-mac.sh
```

This will:
1. ✅ Check for Docker & Git
2. 🏗️  Build the Docker image
3. 🚀 Start the BLAKKHAIL server
4. 📍 Open http://localhost:3001/sencere/blakkhail

## Prerequisites

- **Docker Desktop for Mac** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - Usually comes with Xcode or [install CLI tools](https://developer.apple.com/download/all/)

## Manual Setup (Step by Step)

### 1. Navigate to project
```bash
cd /Users/danielwise/Projects/wise2-core
```

### 2. Build Docker image
```bash
docker-compose -f docker-compose.prod.yml build website
```

### 3. Start the server
```bash
docker-compose -f docker-compose.prod.yml up -d website
```

### 4. Access BLAKKHAIL
Open your browser to: **http://localhost:3001/sencere/blakkhail**

## Common Commands

### Stop the server
```bash
docker-compose -f docker-compose.prod.yml down
```

### View logs
```bash
docker-compose -f docker-compose.prod.yml logs website
```

### Rebuild after code changes
```bash
docker-compose -f docker-compose.prod.yml build --no-cache website
docker-compose -f docker-compose.prod.yml up -d --no-deps website
```

### Access container shell
```bash
docker exec -it wise2-website sh
```

## What You'll See

### Hero Section
- **Lightning effects** - Animated electrical bolts with cinematic glow
- **Models** - SenCere Creative apparel with lighting effects
- **Text** - "TAKE CONTROL" (gold) + "NO APOLOGIES" (cyan)
- **No CTA button** - Clean, minimal aesthetic

### Navigation
- Scroll down to see brand values: CONTROL, AUTHENTICITY, DEFIANCE
- Full responsive storefront experience

## Brand Details

- **URL Path**: `/sencere/blakkhail`
- **Port**: 3001 (internal: 3000)
- **Brand Colors**:
  - Navy: #050607
  - Cyan: #00D9FF
  - Neon Green: #00FF7F
  - Gold: #C4A369

## Troubleshooting

### "Docker not found"
- Install Docker Desktop for Mac: https://www.docker.com/products/docker-desktop

### "Port 3001 already in use"
- Stop other Docker containers: `docker ps` then `docker stop <container-id>`
- Or change the port in `docker-compose.prod.yml` line ~40

### "502 Bad Gateway"
- Server is still starting. Wait 10 seconds and refresh.
- Check logs: `docker-compose -f docker-compose.prod.yml logs website`

### "Cannot connect to localhost:3001"
- Ensure Docker is running
- Check if container is up: `docker ps | grep wise2-website`
- Restart: `docker-compose -f docker-compose.prod.yml restart website`

## Production vs Local

- **Local**: `http://localhost:3001/sencere/blakkhail`
- **Production**: `https://blakkhail.com/sencere/blakkhail`
- **Admin Login**: `email: dwise03@gmail.com` / `password: BlakkhailAdmin2026`

## Next Steps

- [ ] Run setup script
- [ ] Access hero at localhost:3001/sencere/blakkhail
- [ ] Explore the storefront
- [ ] Test responsive design (resize browser)
- [ ] Check console for any errors

---

**Questions?** Check the logs or ask in the codebase issues.
