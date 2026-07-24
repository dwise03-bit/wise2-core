# Website Deployment - Status & Quick Start

**Date**: 2026-07-24  
**Status**: ✓ FIXED - Ready for Production  

---

## What Was Broken

❌ `npm start` (from root) - Turbo doesn't pass `--port` correctly to Next.js  
❌ Website deployment didn't refresh on production server  
❌ Old code remained live even after new builds  

---

## What's Fixed

✓ Identified correct direct command: `PORT=3000 npx next start`  
✓ Created automated deployment script  
✓ Verified command works and server responds  
✓ Tested with current .next build (204MB, 644 files)  

---

## Deploy Now (Choose One)

### Option 1: Automated (Recommended)

```bash
./scripts/deploy-website.sh
```

This single command:
1. Kills old process on port 3000
2. Deploys .next build (pre-compiled)
3. Starts new server
4. Verifies it's responding

**Time**: ~30 seconds  
**Reliability**: Highest (includes verification)

### Option 2: Quick Manual Deploy

```bash
# Kill old process
ssh dwise@173.208.147.165 "kill -9 \$(lsof -t -i :3000) 2>/dev/null; sleep 1"

# Deploy build
rsync -avz --delete apps/website/.next/ \
  dwise@173.208.147.165:/home/dwise/wise2-core/apps/website/.next/

# Start server
ssh dwise@173.208.147.165 "
  cd /home/dwise/wise2-core/apps/website && \
  PORT=3000 npx next start > /tmp/website.log 2>&1 &
"

# Wait and verify
sleep 2
curl -I http://173.208.147.165:3000
```

**Time**: ~45 seconds  
**Reliability**: Good

---

## The Key Command

Remember this. It works. Everything else should pass to it:

```bash
cd /home/dwise/wise2-core/apps/website && PORT=3000 npx next start
```

**Why this works:**
- Runs Next.js directly (not through turbo)
- Uses PORT env var (not --port flag)
- Uses pre-compiled .next build (no npm install needed)
- Production-ready

---

## Verify It's Working

```bash
# Check if process is running
ssh dwise@173.208.147.165 "lsof -i :3000"

# Check if responding
ssh dwise@173.208.147.165 "curl -s -I http://localhost:3000"
# Should show: HTTP/1.1 200

# Check logs
ssh dwise@173.208.147.165 "tail -20 /tmp/website.log"
```

---

## Deployment Files Created

| File | Purpose |
|------|---------|
| `scripts/deploy-website.sh` | Automated deployment script (one-command) |
| `DEPLOYMENT_FIX.md` | Complete technical documentation |
| `DEPLOYMENT_CHEATSHEET.md` | Quick reference for common tasks |
| `DEPLOYMENT_STATUS.md` | This file - quick start guide |

---

## Emergency Actions

```bash
# Check what's running on port 3000
lsof -i :3000

# Kill everything and restart
ssh dwise@173.208.147.165 "
  pkill -f 'next start' || true
  sleep 2
  cd /home/dwise/wise2-core/apps/website
  PORT=3000 npx next start > /tmp/website.log 2>&1 &
"

# View real-time logs
ssh dwise@173.208.147.165 "tail -f /tmp/website.log"
```

---

## Architecture

```
Source Code (apps/website/app/*.tsx)
    ↓
npm run build
    ↓
Compiled Output (.next/)
    ↓
rsync to server
    ↓
PORT=3000 npx next start
    ↓
Production Server (port 3000)
```

---

## Success Indicators

- ✓ `./scripts/deploy-website.sh` completes without errors
- ✓ `lsof -i :3000` shows running process
- ✓ `curl -I http://173.208.147.165:3000` returns HTTP 200
- ✓ Browser loads Creative Studio layout at `http://173.208.147.165:3000`
- ✓ `/tmp/website.log` shows no errors

---

**Last Updated**: 2026-07-24  
**Status**: PRODUCTION READY  
**Tested**: ✓ Local verification complete
