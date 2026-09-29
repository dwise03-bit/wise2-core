# Website Deployment Fix

**Status**: CRITICAL PRODUCTION ISSUE RESOLVED  
**Date**: 2026-07-24  
**Issue**: Website deployment was broken; new code not reaching production  
**Root Cause**: npm turbo start command incompatibility with Next.js port flag  

---

## The Problem

The root `package.json` uses turbo for orchestration:
```json
{
  "scripts": {
    "start": "turbo run start"
  }
}
```

When turbo tries to run `start` from the website subdirectory with a `--port` flag, Next.js doesn't accept it in that form. Additionally, the `.next` build directory wasn't being refreshed during deployment.

---

## The Solution

### Direct Command (Tested & Working)

```bash
cd /home/dwise/wise2-core/apps/website && PORT=3000 npx next start
```

This command:
- Runs Next.js directly (bypasses turbo)
- Uses PORT environment variable (no --port flag)
- Serves production-optimized build from .next/
- Requires no npm install (reuses existing dependencies)

### One-Step Deployment

```bash
./scripts/deploy-website.sh
```

This script:
1. **Kills old process** - Stops any existing process on port 3000
2. **Deploys .next** - Rsync the pre-compiled build directory (fastest)
3. **Deploys source** - Copies app/*, package.json, and config files
4. **Starts service** - Runs the corrected direct command
5. **Verifies** - Tests the endpoint to confirm it's responding

---

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Stop Old Process

```bash
ssh dwise@173.208.147.165 "
  kill -9 \$(lsof -t -i :3000) 2>/dev/null || true
  sleep 1
"
```

### 2. Deploy Latest Build

**Option A: Quick Deploy (recommended)**
```bash
rsync -avz --delete apps/website/.next/ \
  dwise@173.208.147.165:/home/dwise/wise2-core/apps/website/.next/
```

**Option B: Full Deploy (if you changed package.json)**
```bash
rsync -avz --delete apps/website/ \
  dwise@173.208.147.165:/home/dwise/wise2-core/apps/website/ \
  --exclude=node_modules \
  --exclude=.next/cache
```

### 3. Start New Process

```bash
ssh dwise@173.208.147.165 "
  cd /home/dwise/wise2-core/apps/website && \
  PORT=3000 npx next start > /tmp/website.log 2>&1 &
  sleep 2
  lsof -i :3000
"
```

### 4. Verify

```bash
ssh dwise@173.208.147.165 "curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:3000/"
```

Should return: `HTTP 200`

---

## Local Development

For local testing before deployment:

```bash
cd apps/website

# Production build
npm run build

# Test production server (will listen on port 3000)
PORT=3000 npx next start

# Or specify different port
PORT=3001 npx next start
```

---

## Troubleshooting

### Port 3000 Already in Use

Check what's running:
```bash
lsof -i :3000
```

Kill it:
```bash
kill -9 <PID>
```

### Website Not Responding

Check logs on server:
```bash
ssh dwise@173.208.147.165 tail -50 /tmp/website.log
```

### Changes Not Reflecting

Make sure you:
1. Edited the source file (e.g., `apps/website/app/page.tsx`)
2. Ran `npm run build` to compile to `.next/`
3. Deployed the `.next/` directory
4. Killed and restarted the server

---

## What Works Now

- Direct Next.js server startup: ✓
- PORT environment variable: ✓
- Pre-built .next deployment: ✓
- One-command deployment script: ✓
- Production server verification: ✓

---

## Future Improvements

1. **PM2 Integration** - Use PM2 for process management and auto-restart
2. **Health Checks** - Add /health endpoint for monitoring
3. **Zero-Downtime** - Implement graceful shutdown before restart
4. **Nginx Reverse Proxy** - Route traffic through nginx for multiple apps
5. **Docker** - Containerize for consistency across environments

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy everything | `./scripts/deploy-website.sh` |
| Check if running | `ssh dwise@173.208.147.165 lsof -i :3000` |
| View logs | `ssh dwise@173.208.147.165 tail -f /tmp/website.log` |
| Manual start | `ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core/apps/website && PORT=3000 npx next start &"` |
| Stop service | `ssh dwise@173.208.147.165 "kill -9 $(lsof -t -i :3000)"` |
| Test endpoint | `ssh dwise@173.208.147.165 "curl -I http://localhost:3000"` |

---

**Last Updated**: 2026-07-24  
**Author**: Claude Code  
**Status**: Production Ready
