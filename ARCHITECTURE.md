# WISE² Architecture - Professional Structure

## Services Overview

```
wise2.net (root)         → apps/website       (Landing, Marketing)
dashboard.wise2.net      → apps/dashboard     (Analytics, Admin)
studio.wise2.net         → apps/studio        (Creative Suite)
api.wise2.net            → packages/api       (Backend API)
admin.wise2.net          → apps/admin         (Admin Panel)
```

## Local Development Ports

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Website | 3001 | http://localhost:3001 | Landing page, marketing |
| Dashboard | 3002 | http://localhost:3002 | Analytics, metrics |
| Studio | 3005 | http://localhost:3005 | Creative suite (SoundLabs, Live Studio, etc.) |
| API | 3010 | http://localhost:3010 | REST API |
| Admin | 3003 | http://localhost:3003 | Admin panel |

## Directory Structure

```
wise2-core/
├── apps/
│   ├── website/          # Landing site & marketing
│   │   ├── app/
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── login/page.tsx        # Authentication
│   │   │   ├── about/
│   │   │   ├── features/
│   │   │   └── [...public routes]
│   │   └── package.json
│   │
│   ├── studio/           # Creative studio & soundlabs (NEW)
│   │   ├── app/
│   │   │   ├── page.tsx              # Studio home/dashboard
│   │   │   ├── live-studio/
│   │   │   ├── sound-lab/
│   │   │   ├── jingle-lab/
│   │   │   └── [...studio routes]
│   │   └── package.json
│   │
│   ├── dashboard/        # Admin dashboard
│   │   ├── app/
│   │   └── package.json
│   │
│   └── admin/            # Admin panel
│       ├── app/
│       └── package.json
│
├── packages/
│   ├── api/              # NestJS backend
│   │   └── src/
│   │
│   ├── db/               # Database & Prisma schemas
│   │   └── prisma/
│   │
│   ├── ui/               # Shared UI components
│   │   └── src/components/
│   │
│   └── shared/           # Shared utilities, types
│       └── src/
│
├── infrastructure/
│   ├── nginx/
│   │   └── wise2.net.conf     # Production routing
│   ├── docker/
│   └── kubernetes/
│
└── docker-compose.yml    # Local development orchestration
```

## Service Responsibilities

### Website (apps/website)
- Landing page
- Marketing content
- Feature showcase
- Authentication (login/signup redirects to studio)
- Links to studio.wise2.net

### Studio (apps/studio)
- Creative dashboard
- SoundLabs
- Live Studio (streaming)
- Jingle Lab
- Voice Lab
- Content Factory
- Client Showcase
- User workspace

### Dashboard (apps/dashboard)
- Analytics
- Metrics
- KPIs
- System monitoring

### API (packages/api)
- REST endpoints
- Authentication
- Data models
- Business logic

## Routing Logic

### Production (wise2.net)
- wise2.net/ → website
- wise2.net/api/* → API (for single-origin requests)
- studio.wise2.net/ → studio app
- dashboard.wise2.net/ → dashboard app

### Development (localhost)
- localhost:3001 → website
- localhost:3005 → studio
- localhost:3002 → dashboard
- localhost:3010 → api

## Key Rules

1. **No cross-app imports** - Only use shared packages
2. **Each app has own deployment** - Can be deployed independently
3. **APIs via packages/api** - Centralized backend logic
4. **Shared components in packages/ui** - DRY principle
5. **Environment-specific routing** - nginx handles subdomain routing in prod

## Deployment

### Local Dev
```bash
pnpm dev  # Starts all services on their ports
```

### Production
```bash
# Each service deployed separately
docker build -f apps/website/Dockerfile -t wise2-website .
docker build -f apps/studio/Dockerfile -t wise2-studio .
docker build -f apps/dashboard/Dockerfile -t wise2-dashboard .
```

nginx reverse proxy routes requests to correct service.
