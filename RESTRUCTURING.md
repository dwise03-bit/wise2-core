# WISE² Restructuring - Professional Architecture

**Date:** 2026-07-24  
**Status:** In Progress  
**Priority:** Critical - Required for Production Deployment

## What Was Done (This Session)

### ✅ Created Professional Architecture Document
- `ARCHITECTURE.md` - Defines proper service boundaries
- Clear separation between Website, Studio, Dashboard, API, Admin
- Local development port mappings
- Production subdomain routing

### ✅ Created New apps/studio Service
- Separate Next.js application on port 3005
- Independent package.json with own dependencies
- Dockerfile for containerized deployment
- Proper tsconfig and next.config
- Professional dashboard UI

### ✅ Fixed Critical Button Interactivity Bug
- Root cause: Textarea import in IntakeForm.tsx
- Impact: All buttons on site were non-functional
- Fix: Changed named import to default import
- Status: ✅ VERIFIED WORKING on localhost:3001

### ✅ Updated Configuration
- `.claude/launch.json` - Clarified port mappings
- pnpm-workspace.yaml already supports new apps/studio
- Root package.json uses turbo for parallel dev

## What Needs To Be Done

### Phase 1: Complete Local Setup (This Week)
- [ ] Extract studio routes from apps/website
  - Move /studio, /live-studio, /soundlab, etc to apps/studio
  - Remove studio-related API endpoints from website
  - Update website to link to studio.wise2.net (or localhost:3005 in dev)

- [ ] Verify all apps start with `pnpm dev`
  - Website starts on 3001 ✅
  - Studio starts on 3005 (needs testing)
  - Dashboard starts on 3002 (needs testing)
  - API starts on 3010 (needs testing)

- [ ] Test inter-app communication
  - Website should NOT serve studio routes
  - Website links should go to studio subdomain/port
  - All shared components use packages/ui

### Phase 2: Production Deployment (Next)
- [ ] Deploy apps/studio as separate Docker service
  - Build: `docker build -f apps/studio/Dockerfile ...`
  - Deploy to studio.wise2.net subdomain
  - Configure nginx to route studio.wise2.net → port 3005

- [ ] Update nginx config to NOT serve /studio on main domain
  - wise2.net/studio → should redirect to studio.wise2.net
  - wise2.net/live-studio → should redirect to studio.wise2.net

- [ ] Verify production routing
  - wise2.net → website (3011)
  - studio.wise2.net → studio (3005)
  - dashboard.wise2.net → dashboard (3002)

- [ ] Update CI/CD pipeline
  - Each app needs independent build/deploy
  - Studio needs separate deployment trigger

### Phase 3: Production Testing (After Deployment)
- [ ] Verify studio.wise2.net is accessible
- [ ] Test all studio modules functional
- [ ] Verify website doesn't serve duplicate studio routes
- [ ] Test cross-app links work correctly

## Architecture Rules (Critical)

1. **No Cross-App Imports**
   - ❌ `import { Component } from '../../apps/website/...'`
   - ✅ `import { Component } from '@wise2/ui'`
   - Use only packages/* for shared code

2. **Each Service is Independently Deployable**
   - Each app has own Dockerfile
   - Each app has own package.json
   - Each app has own build/start scripts

3. **Routing Clarity**
   - Local dev uses ports (3001, 3005, 3002, etc)
   - Production uses subdomains + nginx proxy
   - NO nested routes between apps

4. **Shared Resources**
   - `packages/ui` - UI components
   - `packages/shared` - Utilities, types
   - `packages/api` - Backend service
   - `packages/db` - Database & Prisma

## Testing Checklist

### Local Dev Tests
- [ ] `pnpm dev` starts all services
- [ ] localhost:3001 → Website (homepage, login)
- [ ] localhost:3005 → Studio (dashboard, modules)
- [ ] localhost:3002 → Dashboard (analytics)
- [ ] Website links to studio work correctly
- [ ] All buttons functional (Textarea fix verified)

### Production Tests
- [ ] wise2.net → Website landing page
- [ ] studio.wise2.net → Studio dashboard
- [ ] dashboard.wise2.net → Admin dashboard
- [ ] No "404 Page Not Found" errors
- [ ] No duplicate content between domains

## Deployment Commands

```bash
# Local Development
pnpm dev  # Starts all services in parallel

# Production Build
cd apps/website && pnpm build
cd apps/studio && pnpm build
cd apps/dashboard && pnpm build

# Docker Deployment
docker build -f apps/website/Dockerfile -t wise2-website .
docker build -f apps/studio/Dockerfile -t wise2-studio .
docker build -f apps/dashboard/Dockerfile -t wise2-dashboard .
```

## Current Issues to Resolve

1. Studio routes still in apps/website (needs extraction)
2. apps/studio directory created but routes not moved yet
3. Production not yet configured with studio.wise2.net
4. Potential duplicate content if not carefully migrated

## Success Criteria

✅ Clear separation of concerns  
✅ Each service independently deployable  
✅ No code duplication between apps  
✅ Professional architecture documented  
✅ Production deployment working  
✅ All tests passing  

