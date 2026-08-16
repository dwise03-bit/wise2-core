# Outstanding Issues & Fixes

## ✅ DEPLOYMENT COMPLETE

All MVP launch blockers are fixed. Services running:
- API: Port 3010
- Dashboard: Port 3002 (healthy)
- PostgreSQL: Port 5432 (healthy)

---

## ISSUES FIXED THIS SESSION (Latest Commit: c3badcf)

✅ **Dashboard Dockerfile** - Fixed (df74aed)
✅ **Admin Globals CSS** - Fixed (bdde2e9)  
✅ **Hardcoded API URLs** - Fixed (a9858ee)
✅ **Missing Admin Module** - Fixed (a9858ee)
✅ **Admin next.config.js** - Fixed (a9858ee)

---

## POST-MVP (Low Priority)

### 1. Admin Service Build (CSS/Webpack)
**Status**: Disabled for MVP (3057074)  
**Issue**: Admin container fails to build due to CSS webpack errors  
**Impact**: Admin dashboard not available  
**Fix Timeline**: After launch  
**Solution**:
- Remove broken CSS imports
- Simplify admin globals.css
- Re-enable in docker-compose when fixed

### 2. Package Manager Inconsistency
**Status**: npm used in Docker, pnpm configured in package.json  
**Impact**: Potential lock file mismatches  
**Fix**: Standardize to one package manager
```bash
# Option A: Switch to pnpm in Docker
# - Add: RUN npm install -g pnpm@8.15.9
# - Change: npm ci → pnpm install --frozen-lockfile

# Option B: Remove pnpm config
# - Delete packageManager field from package.json
# - Use npm everywhere
```

### 3. Environment Variables
**Status**: Some hardcoded defaults remain  
**Locations**:
- API port defaults to 3000 (should be 3001)
- Database host defaults to localhost
- CORS defaults to localhost origin

**Fix**: Ensure docker-compose.prod.yml sets all env vars:
```yaml
api:
  environment:
    API_PORT: 3001
    DB_HOST: postgres
    CORS_ORIGIN: https://wise2.net
```

### 4. TypeORM Database Connection
**Status**: Uses mock storage for MVP  
**Next**: Implement real Prisma ORM
**Files**: `packages/api/src/auth/auth.service.ts`  
**Timeline**: Phase 2

### 5. Authentication
**Status**: Mock JWT tokens  
**Next**: Connect to PostgreSQL  
**Files**: `packages/api/src/auth/`  
**Timeline**: Phase 2

### 6. Admin App CSS
**File**: `apps/admin/app/globals.css`  
**Issue**: Tried to import from non-existent @wise2/ui-components  
**Status**: Removed import, using minimal styles  
**Fix Later**: Rebuild admin UI with proper component library

---

## KNOWN WORKING

✅ Landing page (website)  
✅ Dashboard layout  
✅ API structure  
✅ Docker setup  
✅ Git deployment workflow  
✅ GitHub Actions auto-deploy configured

---

## FUTURE ENHANCEMENTS

1. **Real Database**
   - Switch from mock storage to Prisma ORM
   - Create migrations
   - Add indexes

2. **Payment Processing**
   - Implement Stripe webhook handling
   - Subscription management
   - Invoice generation

3. **Module Pages**
   - SoundLab audio interface
   - Live Studio streaming
   - CRM dashboard
   - Analytics visualizations

4. **Admin Dashboard**
   - Fix CSS issues
   - Implement project review workflow
   - Add stats and analytics

5. **Notifications**
   - Discord webhooks
   - Email notifications
   - In-app notifications

---

## FILES MODIFIED SINCE LAST WORKING STATE

```
apps/website/app/page.tsx - Rebuilt landing page
apps/dashboard/app/dashboard/page.tsx - Rebuilt dashboard
apps/dashboard/app/billing/checkout/page.tsx - Fixed API URL
apps/dashboard/Dockerfile - Fixed build output paths
apps/admin/app/page.tsx - Fixed API URL
apps/admin/app/globals.css - Fixed CSS imports
apps/admin/next.config.js - Created (NEW)
apps/admin/tsconfig.json - Added path aliases
packages/api/src/admin/admin.module.ts - Created (NEW)
packages/api/src/app.module.ts - Added AdminModule import
docker-compose.prod.yml - Disabled admin service
.github/workflows/deploy-production.yml - Updated for dwise user
```

---

## HOW TO RE-ENABLE ADMIN (When Fixed)

1. Fix the CSS/webpack issues in `apps/admin/app/globals.css`
2. Uncomment admin service in `docker-compose.prod.yml`
3. Push to main
4. GitHub Actions will auto-deploy

```bash
# Uncomment in docker-compose.prod.yml:
# admin:
#   build: ...
#   ports:
#     - "3003:3000"
```

---

## DEPLOYMENT COMMANDS (Quick Reference)

```bash
# SSH to server
ssh dwise@173.208.147.165

# Kill port conflicts
sudo lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs sudo kill -9

# Deploy
cd /home/dwise/wise2-core
git pull origin main
sudo docker-compose -f docker-compose.prod.yml down -v --remove-orphans
sudo docker system prune -af
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Verify
sleep 60
sudo docker-compose -f docker-compose.prod.yml ps

# View logs
sudo docker-compose logs -f api
sudo docker-compose logs -f website
sudo docker-compose logs -f dashboard
```
