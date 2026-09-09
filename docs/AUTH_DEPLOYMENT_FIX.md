# Dashboard Authentication - Deployment Issue & Fix

**Status:** ⚠️ BLOCKING — Login page returns 404, auth API not accessible

---

## Problem Identified

The dashboard authentication system is **fully coded** but **not deployed**:

✅ **Code exists:**
- Login page: `/apps/dashboard/app/auth/login/page.tsx`
- Auth API: `/apps/dashboard/app/api/auth/login/route.ts`
- Auth context: `/apps/dashboard/lib/auth-context.tsx`

❌ **Not working:**
- `/auth/login` → 404 Not Found
- `/api/auth/login` → 404 Not Found
- No dashboard container running

---

## Root Cause

The dashboard (next-server on port 3004) is serving but the `/auth/*` and `/api/auth/*` routes are not built into the running instance.

**Why:** The Next.js build may be using an older build cache, or the routes aren't included in the current compiled output.

---

## Solution

### Option 1: Rebuild Dashboard Container (Recommended)

```bash
# SSH to VPS
ssh dwise@173.208.147.165

# Navigate to project
cd ~

# Rebuild with --no-cache
docker build -f Dockerfile.dashboard \
  --no-cache \
  -t wise2-dashboard:latest \
  ./

# Restart the dashboard
docker stop wise2-dashboard 2>/dev/null || true
docker run -d \
  --name wise2-dashboard \
  --restart unless-stopped \
  -p 127.0.0.1:3005:3000 \
  wise2-dashboard:latest
```

### Option 2: Quick Fix - Deploy Simple Auth Middleware

Add auth middleware to expose login routes properly.

---

## Testing After Fix

```bash
# Test login endpoint
curl -X POST https://command.wise2.net/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sencere@wise2.net","password":"5073c0742775301bc5ceb4687bee684a"}'

# Expected response:
# {"token":"eyJh...","user":{"id":"...","email":"sencere@wise2.net","name":"SenCere Partner","role":"ADMIN"}}
```

---

## What Works

✅ Database: sencere@wise2.net account created with correct password hash
✅ BLAKKHAIL.COM: Fully functional (fixed 502 error)
✅ Dashboard: Running and serving content (but no auth routes)

---

## What Needs Deployment

Dashboard Next.js app needs to be rebuilt/redeployed with auth routes compiled.

**Blocked:** sencere cannot log in until this is fixed.

---

## Priority

🔴 **HIGH** — Partner cannot access dashboard without login

---

## Notes for SenCere

Once auth is deployed:
1. Go to https://command.wise2.net/auth/login
2. Email: `sencere@wise2.net`
3. Password: `5073c0742775301bc5ceb4687bee684a`
4. Change password after first login
5. Navigate to Settings → Payments → Stripe to connect your account
