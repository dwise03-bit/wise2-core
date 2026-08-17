# WISE² Phase 2 API Restart Handoff

**Goal**: Restart Prisma-auth API with correct Docker CMD  
**Server**: 173.208.147.165 (dwise)  
**Status**: Ready to execute

---

## Quick Summary

Prisma authentication migration is complete. The Docker image has the compiled code at `/app/packages/api/dist/main.js` but the Dockerfile CMD still points to the old path `/app/dist/main.js`. 

**Fix**: Update Dockerfile line 33 to `CMD ["node", "packages/api/dist/main.js"]`, rebuild, and restart.

---

## Execute These Commands (in order)

### 1. Push Dockerfile fix to git
```bash
cd /Users/danielwise/Projects/wise2-core
git add Dockerfile.api
git commit -m "fix: correct CMD path to packages/api/dist/main.js"
git push
```

### 2. SSH to server, pull, rebuild image
```bash
ssh dwise@173.208.147.165 "cd ~/wise2-core && git pull && docker build --no-cache -f Dockerfile.api -t wise2-core-api:latest . 2>&1 | tail -30"
```
**Wait for**: "naming to docker.io/library/wise2-core-api:latest" (means build succeeded)

### 3. Start API container
```bash
ssh dwise@173.208.147.165 "cd ~/wise2-core && docker-compose -f docker-compose.prod.yml up -d api && sleep 12"
```

### 4. Verify it's running
```bash
ssh dwise@173.208.147.165 "docker logs wise2-api 2>&1 | tail -80"
```
**Look for**: `[NestApplication] Nest application successfully started` (success)  
**Or see**: `listening on port 3000` (success)  
**Bad**: `Cannot find module '/app/dist/main.js'` (CMD still wrong)

### 5. Health check
```bash
ssh dwise@173.208.147.165 "curl -s http://127.0.0.1:3010/api/health | jq ."
```
**Expected**: `{"status":"ok"}` or similar

---

## If It Fails

**Symptom**: Still can't find module  
**Cause**: Dockerfile not updated or git pull didn't work  
**Fix**: 
```bash
ssh dwise@173.208.147.165 "cat ~/wise2-core/Dockerfile.api | grep -A 2 'CMD'"
```
Should show: `CMD ["node", "packages/api/dist/main.js"]`  
If not, manually verify the file was pushed and pulled.

---

## What's in This Phase

- ✅ PrismaAuthService: JWT + bcrypt password hashing
- ✅ Auth controller updated to use Prisma service
- ✅ Auth module: removed TypeORM, added Prisma
- ✅ Docker: compiles TypeScript from source
- 🔧 **TODO**: Verify running, then move to Phase 3 (tenant isolation)

---

## Files Modified

- `packages/api/src/auth/prisma-auth.service.ts` (new)
- `packages/api/src/auth/auth.controller.ts`
- `packages/api/src/auth/auth.module.ts`
- `packages/api/src/auth/auth.service.ts` (wrapper)
- `Dockerfile.api` (compile + CMD fix)
- `docker-compose.prod.yml` (confirmed correct)

---

**Ready to hand off to Claude on VPS? Just run the 5 commands above in order.**
