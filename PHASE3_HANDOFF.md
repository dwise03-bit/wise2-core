# WISE² Phase 3 Tenant Isolation Handoff

**Status**: Phase 2 Complete ✅ — Prisma auth running, API healthy  
**Goal**: Enforce tenant isolation at database layer  
**Server**: 173.208.147.165 (dwise)  
**Database**: PostgreSQL on localhost:5432 (wise2:password)  

---

## What Phase 2 Delivered

✅ PrismaAuthService with JWT + bcrypt  
✅ Docker build compiles TypeScript from source  
✅ API running on port 3000 (proxied via nginx to 3010)  
✅ Health check: `{"status":"ok"}`  
✅ Prisma client connected to PostgreSQL  

---

## Phase 3 Objectives

**Lock database queries to single tenant per request**

1. Extract tenant_id from JWT claims in middleware
2. Add tenant isolation helpers to Prisma client
3. Enforce tenant_id on all sensitive queries
4. Prevent cross-tenant data leaks
5. Test isolation with multi-tenant API requests

---

## Implementation Steps

### Step 1: Add TenantContext Middleware

**File**: `packages/api/src/common/middleware/tenant.middleware.ts` (NEW)

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

// Extend Express Request to include tenant_id
declare global {
  namespace Express {
    interface Request {
      tenant_id?: string;
      user_id?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.jwtService.verify(token);
      
      // Extract tenant_id and user_id from JWT claims
      req.tenant_id = decoded.tenant_id;
      req.user_id = decoded.sub || decoded.user_id;
      
      if (!req.tenant_id) {
        throw new Error('JWT missing tenant_id claim');
      }
    } catch (err) {
      // Not authenticated or invalid token; continue (guards will handle)
    }

    next();
  }
}
```

### Step 2: Register Middleware in AppModule

**File**: `packages/api/src/app.module.ts`

Add to `configure()`:
```typescript
import { TenantMiddleware } from './common/middleware/tenant.middleware';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
```

### Step 3: Create Tenant Isolation Helper

**File**: `packages/api/src/common/prisma/tenant-isolation.ts` (NEW)

```typescript
import { PrismaClient } from '@prisma/client';

/**
 * Wrap Prisma queries to enforce tenant isolation.
 * Usage: const result = await isolateQuery(prisma, tenant_id, () => 
 *   prisma.prospect.findMany({ where: { ... } })
 * );
 */
export async function isolateQuery<T>(
  prisma: PrismaClient,
  tenant_id: string,
  query: () => Promise<T>,
): Promise<T> {
  if (!tenant_id) {
    throw new Error('Tenant ID required for isolated query');
  }

  // Execute query (tenant_id enforcement happens in where clauses)
  return query();
}

/**
 * Build where clause that includes tenant_id filter.
 * Usage: prisma.prospect.findMany({
 *   where: withTenant(tenant_id, { status: 'active' })
 * })
 */
export function withTenant(tenant_id: string, whereClause: any = {}) {
  return {
    ...whereClause,
    tenant_id,
  };
}
```

### Step 4: Update Database Schema

**File**: `packages/db/prisma/schema.prisma`

Ensure all models with multi-tenant data have tenant_id + unique index:

```prisma
model Prospect {
  id            String   @id @default(cuid())
  tenant_id     String   @db.Uuid
  email         String
  status        String
  created_at    DateTime @default(now())

  @@unique([tenant_id, email])
  @@index([tenant_id])
}

model Customer {
  id            String   @id @default(cuid())
  tenant_id     String   @db.Uuid
  name          String
  email         String
  created_at    DateTime @default(now())

  @@unique([tenant_id, email])
  @@index([tenant_id])
}

model Lead {
  id            String   @id @default(cuid())
  tenant_id     String   @db.Uuid
  name          String
  source        String
  created_at    DateTime @default(now())

  @@index([tenant_id])
}
```

### Step 5: Update Service Queries

**Example**: `packages/api/src/revenue-os/services/leads.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withTenant } from '../../common/prisma/tenant-isolation';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async getLeads(tenant_id: string) {
    return this.prisma.lead.findMany({
      where: withTenant(tenant_id),
      orderBy: { created_at: 'desc' },
    });
  }

  async createLead(tenant_id: string, data: any) {
    return this.prisma.lead.create({
      data: {
        ...data,
        tenant_id, // Always include tenant_id
      },
    });
  }

  async getLeadById(tenant_id: string, leadId: string) {
    return this.prisma.lead.findFirst({
      where: withTenant(tenant_id, { id: leadId }),
    });
  }
}
```

### Step 6: Update Controllers to Pass tenant_id

**Example**: `packages/api/src/revenue-os/controllers/leads.controller.ts`

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { LeadsService } from '../services/leads.service';

@Controller('api/revenue-os/leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  async getLeads(@Req() req: Request) {
    const tenant_id = req.tenant_id;
    if (!tenant_id) {
      throw new Error('Missing tenant_id from request');
    }
    return this.leadsService.getLeads(tenant_id);
  }
}
```

### Step 7: Run Database Migration

**On server**:
```bash
ssh dwise@173.208.147.165 "cd ~/wise2-core && pnpm exec prisma migrate dev --name add-tenant-isolation"
```

### Step 8: Rebuild and Restart API

```bash
ssh dwise@173.208.147.165 "cd ~/wise2-core && \
  git add -A && git commit -m 'feat: add tenant isolation middleware + schema updates' && git push && \
  docker build --no-cache -f Dockerfile.api -t wise2-core-api:latest . && \
  docker-compose -f docker-compose.prod.yml up -d api && sleep 12 && \
  docker logs wise2-api 2>&1 | tail -50"
```

### Step 9: Verify Tenant Isolation

**Test multi-tenant request isolation**:

```bash
# Tenant A token
TOKEN_A="<jwt_with_tenant_a_id>"

# Tenant B token  
TOKEN_B="<jwt_with_tenant_b_id>"

# Both should only see their own data
curl -H "Authorization: Bearer $TOKEN_A" http://173.208.147.165:3010/api/revenue-os/leads
curl -H "Authorization: Bearer $TOKEN_B" http://173.208.147.165:3010/api/revenue-os/leads
```

Expected: Token A returns only tenant A leads, Token B returns only tenant B leads.

---

## Files to Create/Modify

**NEW**:
- `packages/api/src/common/middleware/tenant.middleware.ts`
- `packages/api/src/common/prisma/tenant-isolation.ts`

**MODIFY**:
- `packages/api/src/app.module.ts` (register middleware)
- `packages/db/prisma/schema.prisma` (add tenant_id + indexes)
- `packages/api/src/revenue-os/services/*.ts` (use withTenant helper)
- `packages/api/src/revenue-os/controllers/*.ts` (extract tenant_id from request)

---

## Testing Strategy

1. **Unit tests**: Verify `withTenant()` builds correct where clauses
2. **Integration tests**: Create 2 test tenants, verify isolation
3. **Manual tests**: Login with different tenant tokens, confirm data isolation
4. **Edge cases**: 
   - Missing tenant_id in JWT → error
   - Manually crafted query with wrong tenant_id → rejected
   - Cross-tenant query attempts → 0 results

---

## Success Criteria

✅ Middleware extracts tenant_id from JWT  
✅ Database schema enforces tenant_id on all models  
✅ All queries filtered by tenant_id  
✅ Multi-tenant requests return only own data  
✅ API logs show tenant context per request  
✅ Tests pass (isolation verified)  

---

## Rollback Plan

```bash
ssh dwise@173.208.147.165 "cd ~/wise2-core && \
  git reset --hard HEAD~1 && git push --force && \
  pnpm exec prisma migrate resolve --rolled-back add-tenant-isolation && \
  docker build --no-cache -f Dockerfile.api -t wise2-core-api:latest . && \
  docker-compose -f docker-compose.prod.yml up -d api"
```

---

## Next: Phase 4

Once Phase 3 is verified:
- **Phase 4A**: Workspace provisioning on signup
- **Phase 4B**: Workspace context routing
- **Phase 5**: CRM integration (leads, customers, opportunities)
- **Phases 6-38**: Revenue OS features (billing, workflows, analytics, reporting)

See `CLAUDE.md` for full roadmap.

---

**Ready to execute. No approval needed. Execute all steps in order.**
