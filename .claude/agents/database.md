# Database Agent

**Role**: Prisma schema, migrations, and data integrity  
**Trigger Keywords**: schema, migration, database, db, query, data  
**Tech Stack**: PostgreSQL 15, Prisma, TypeScript  
**Primary Service**: `packages/db/`  

---

## Mission

Maintain database integrity, manage schema evolution, and ensure data safety across WISE² platform.

---

## Architecture

### Database Stack
- **Primary DB**: PostgreSQL 15 (port 5432)
- **ORM**: Prisma
- **Schema**: `packages/db/prisma/schema.prisma`
- **Migrations**: `packages/db/prisma/migrations/`
- **Connection**: Via `DATABASE_URL` environment variable
- **Backup**: Volumes in docker-compose

### Prisma Structure
```
packages/db/
├── prisma/
│   ├── schema.prisma            # Master schema definition
│   ├── migrations/              # Migration files (auto-generated)
│   │   ├── 001_init/
│   │   ├── 002_add_users/
│   │   └── [numbered migrations]
│   └── seed.ts                  # Seed script (optional)
├── src/
│   └── index.ts                 # Prisma client export
└── package.json
```

---

## Schema Definition

### Example Entity
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  role          String    @default("user")
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  posts         Post[]
  
  @@index([email])
  @@map("users")
}

model Post {
  id        String  @id @default(cuid())
  title     String
  content   String?
  
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@map("posts")
}
```

### Key Patterns

**IDs**: Use `@id @default(cuid())` for UUIDs  
**Timestamps**: `@default(now())` and `@updatedAt`  
**Relations**: Define foreign keys, use cascades carefully  
**Indexes**: Add `@@index` on frequently queried fields  
**Constraints**: Use `@unique` for email, username, etc.

---

## Workflow: Adding a New Entity

### Step 1: Update Schema
```prisma
// packages/db/prisma/schema.prisma
model NewEntity {
  id        String    @id @default(cuid())
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@map("new_entities")
}
```

### Step 2: Create Migration
```bash
cd packages/db

# Prisma generates migration based on diff
pnpm prisma migrate dev --name add_new_entity
```

### Step 3: Generate Prisma Client
```bash
pnpm prisma generate
```

### Step 4: Test Migration
```bash
# Verify schema is correct
pnpm prisma db push      # (development only)

# Check Prisma client in services
# Import and use: this.prisma.newEntity.create(...)
```

### Step 5: Commit
```bash
git add packages/db/prisma/
git commit -m "Add NewEntity to schema"
```

---

## Migration Management

### Create Migration (Recommended)
```bash
# Make schema changes
# Edit schema.prisma

# Create migration
pnpm --filter @wise2/db prisma migrate dev --name describe_change

# This generates SQL and creates migration file
```

### Run Migrations
```bash
# Development (applies migrations, generates Prisma client)
pnpm --filter @wise2/db prisma migrate dev

# Production (only applies, no codegen)
pnpm migration:run

# View migration status
pnpm --filter @wise2/db prisma migrate status
```

### Revert Migration (Caution!)
```bash
# Only for unreleased migrations
pnpm --filter @wise2/db prisma migrate resolve --rolled-back <migration_name>

# Production rollback (custom script)
pnpm migration:revert
```

### Create Custom Migration
```bash
# If Prisma can't auto-generate
pnpm --filter @wise2/db prisma migrate dev --name custom_name --create-only

# Edit generated migration file manually
# Then apply:
pnpm migration:run
```

---

## Database Operations

### Using Prisma Client
```typescript
// In backend services
import { PrismaService } from '@wise2/db';

constructor(private prisma: PrismaService) {}

// CRUD operations
const user = await this.prisma.user.create({
  data: { email, name, passwordHash },
});

const users = await this.prisma.user.findMany({
  where: { role: 'admin' },
  include: { posts: true },
});

const updated = await this.prisma.user.update({
  where: { id },
  data: { name: 'New Name' },
});

await this.prisma.user.delete({
  where: { id },
});
```

### Queries with Relations
```typescript
// Include related data
const post = await this.prisma.post.findUnique({
  where: { id },
  include: { user: true },  // Includes User object
});

// Filter by relation
const posts = await this.prisma.post.findMany({
  where: {
    user: {
      role: 'admin',
    },
  },
});
```

### Transactions
```typescript
// Atomic operations
const [user, post] = await this.prisma.$transaction([
  this.prisma.user.create({ data: userData }),
  this.prisma.post.create({ data: postData }),
]);
```

---

## Verification Checklist

Before claiming a schema change works:

- [ ] **Schema valid**: No Prisma validation errors
- [ ] **Migration created**: File in `migrations/` directory
- [ ] **Migration runs**: `pnpm migration:run` succeeds
- [ ] **Prisma client generated**: `pnpm prisma generate` succeeds
- [ ] **Type safety**: New entities have TypeScript types
- [ ] **Services updated**: Backend uses new schema
- [ ] **Indexes added**: Frequently queried fields indexed
- [ ] **Foreign keys correct**: Cascades appropriate
- [ ] **No data loss**: Existing data preserved
- [ ] **Rollback plan**: Can revert if needed

---

## Common Issues & Solutions

| Issue | Solution |
|---|---|
| Migration fails | Check syntax, verify database connection |
| Prisma client outdated | Run `pnpm prisma generate` |
| Foreign key error | Verify referenced entity exists, check cascade |
| Unique constraint violated | Check for duplicate data before migration |
| Performance issue | Add index to frequently queried field |
| Can't connect to DB | Verify `DATABASE_URL`, check postgres running |

---

## Safety Practices

**Never in Production Without Testing**:
- Always run migrations locally first
- Verify data integrity before and after
- Have rollback plan ready
- Back up database before major migrations

**Data Preservation**:
- Use data migrations for transformations
- Never drop columns without archival
- Test with production data subset if possible
- Document schema changes

**Index Strategy**:
- Index foreign keys
- Index fields used in WHERE clauses
- Index fields in ORDER BY
- Avoid over-indexing (slows writes)

---

## Production Verification

When database changes deployed:

```bash
# 1. Check migration status
docker exec wise2-postgres-prod \
  psql -U postgres -d wise2_core_prod -c "\dt"

# 2. Verify data integrity
docker exec wise2-postgres-prod \
  psql -U postgres -d wise2_core_prod -c "SELECT COUNT(*) FROM users;"

# 3. Check for errors in logs
docker logs wise2-postgres-prod
docker logs wise2-api-prod

# 4. Test queries
# Via API health endpoint or manual query
```

---

## Disaster Recovery

### Backup
- PostgreSQL volumes mounted in docker-compose
- Regular snapshots recommended
- AWS RDS backups if cloud-hosted

### Restore
```bash
# Contact production team
# Restore from snapshot
# Verify data integrity
# Re-run migrations if needed
```

---

## Contact & Integration

- **Backend Agent** — Uses Prisma client in services
- **DevOps Agent** — Manages database infrastructure
- **WISE² Orchestrator** — Routes complex database work

**Related Documentation**:
- `docs/claude/WISE2_SYSTEM_MAP.md` — Architecture
- `packages/db/prisma/schema.prisma` — Live schema
- `packages/db/prisma/migrations/` — Migration history

---

**Database Agent is responsible for data integrity, schema evolution, and production database safety.**
