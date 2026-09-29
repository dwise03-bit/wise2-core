# 📁 WISE² Enterprise Repository Structure

**Status**: 🟡 SPECIFICATION  
**Phase**: 4 of 7  
**Version**: 1.0  
**Date**: July 21, 2026

---

## 📊 Directory Tree

```
wise2-core/
│
├── 📱 apps/                              # User-facing applications
│   ├── website/                          # Landing page & public site
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── styles/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── dashboard/                        # Admin/analytics dashboard
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── admin/                            # System administration
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── mobile/                           # React Native mobile app
│   │   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── cli/                              # Command-line interface
│       ├── src/
│       ├── commands/
│       ├── utils/
│       └── package.json
│
├── 📦 packages/                          # Shared libraries & utilities
│   ├── ui/                               # Reusable UI component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── branding/                         # Brand system & tokens
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── shadows.ts
│   │   │   ├── animations.ts
│   │   │   └── themes.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                           # Shared types & utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── constants/
│   │   │   ├── errors/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── database/                         # Database ORM & schemas
│   │   ├── src/
│   │   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   ├── schema.prisma
│   │   │   └── client.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth/                             # Authentication & authorization
│   │   ├── src/
│   │   │   ├── strategies/
│   │   │   ├── middleware/
│   │   │   ├── tokens.ts
│   │   │   ├── rbac.ts
│   │   │   └── guards.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── sdk/                              # Client SDK for WISE² API
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── resources/
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── eslint-config/                    # Shared ESLint configuration
│       ├── src/
│       ├── package.json
│       └── README.md
│
├── 🔧 services/                          # Microservices
│   ├── api/                              # REST API (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── projects/
│   │   │   │   ├── documents/
│   │   │   │   └── webhooks/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── second-brain/                     # Knowledge management
│   │   ├── sync-engine/
│   │   ├── search-service/
│   │   ├── integrations/
│   │   ├── vault/
│   │   └── package.json
│   │
│   ├── ai-orchestrator/                  # Multi-model AI coordination
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── intent-detection/
│   │   │   ├── context-retrieval/
│   │   │   ├── prompt-optimization/
│   │   │   └── orchestrator.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── automation/                       # Workflow automation
│   │   ├── src/
│   │   │   ├── workflows/
│   │   │   ├── triggers/
│   │   │   ├── actions/
│   │   │   └── engine.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── sync/                             # Real-time sync layer
│   │   ├── src/
│   │   │   ├── crdt/
│   │   │   ├── replication/
│   │   │   ├── conflict-resolution/
│   │   │   └── sync.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── notifications/                    # Notification service
│   │   ├── src/
│   │   │   ├── channels/
│   │   │   ├── templates/
│   │   │   ├── queue/
│   │   │   └── service.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── deployment/                       # Deployment orchestration
│   │   ├── src/
│   │   │   ├── pipelines/
│   │   │   ├── strategies/
│   │   │   ├── health-checks/
│   │   │   └── orchestrator.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── knowledge/                        # Knowledge extraction & indexing
│   │   ├── src/
│   │   │   ├── extractors/
│   │   │   ├── indexing/
│   │   │   ├── retrieval/
│   │   │   └── service.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── monitoring/                       # Observability & monitoring
│       ├── src/
│       │   ├── metrics/
│       │   ├── logging/
│       │   ├── tracing/
│       │   └── service.ts
│       ├── package.json
│       └── tsconfig.json
│
├── 📚 docs/                              # Documentation
│   ├── README.md                         # Project overview
│   ├── GETTING_STARTED.md                # Quick start guide
│   ├── ARCHITECTURE.md                   # System architecture
│   ├── API_REFERENCE.md                  # API documentation
│   ├── DEVELOPMENT.md                    # Development guide
│   ├── DEPLOYMENT.md                     # Deployment procedures
│   ├── SECURITY.md                       # Security guidelines
│   ├── CONTRIBUTING.md                   # Contribution guidelines
│   └── guides/                           # How-to guides
│       ├── local-development.md
│       ├── docker-setup.md
│       ├── testing.md
│       └── ci-cd.md
│
├── 🎨 design/                            # Design assets & specifications
│   ├── system/                           # Design system
│   │   ├── colors.md
│   │   ├── typography.md
│   │   ├── spacing.md
│   │   ├── components.md
│   │   └── patterns.md
│   │
│   ├── logos/                            # Logo files
│   │   ├── wise2-primary.svg
│   │   ├── wise2-secondary.svg
│   │   └── wise2-icon.svg
│   │
│   ├── graphics/                         # Illustrations & graphics
│   │   ├── wallpapers/
│   │   ├── backgrounds/
│   │   └── illustrations/
│   │
│   ├── social/                           # Social media assets
│   │   ├── twitter/
│   │   ├── linkedin/
│   │   ├── github/
│   │   └── discord/
│   │
│   └── discord/                          # Discord assets
│       ├── emojis/
│       ├── stickers/
│       ├── icons/
│       └── banners/
│
├── 🏗️ infrastructure/                    # Infrastructure as Code
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.dashboard
│   │   ├── docker-compose.yml
│   │   └── docker-compose.prod.yml
│   │
│   ├── kubernetes/                       # K8s manifests (optional)
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── configmaps/
│   │   └── secrets/
│   │
│   ├── terraform/                        # Infrastructure provisioning
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── vpc.tf
│   │   ├── databases.tf
│   │   └── secrets.tf
│   │
│   ├── ansible/                          # Configuration management
│   │   ├── playbooks/
│   │   ├── roles/
│   │   └── inventory/
│   │
│   └── scripts/                          # Deployment scripts
│       ├── setup.sh
│       ├── deploy.sh
│       ├── rollback.sh
│       └── healthcheck.sh
│
├── 🧪 test/                              # Test infrastructure
│   ├── unit/                             # Unit tests
│   │   ├── api/
│   │   ├── services/
│   │   ├── packages/
│   │   └── jest.config.js
│   │
│   ├── integration/                      # Integration tests
│   │   ├── api/
│   │   ├── database/
│   │   ├── services/
│   │   └── jest.config.js
│   │
│   ├── e2e/                              # End-to-end tests
│   │   ├── web/
│   │   ├── api/
│   │   ├── workflows/
│   │   └── cypress.config.js
│   │
│   ├── performance/                      # Performance tests
│   │   ├── load-tests/
│   │   ├── stress-tests/
│   │   └── k6-config.js
│   │
│   └── fixtures/                         # Test data & fixtures
│       ├── users.json
│       ├── projects.json
│       └── documents.json
│
├── 🔐 .github/                           # GitHub configuration
│   ├── workflows/                        # CI/CD workflows
│   │   ├── test.yml
│   │   ├── build.yml
│   │   ├── deploy.yml
│   │   ├── security.yml
│   │   └── performance.yml
│   │
│   ├── CODEOWNERS
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.md
│   │   ├── feature.md
│   │   └── question.md
│   │
│   └── pull_request_template.md
│
├── 📋 config/                            # Configuration files
│   ├── .env.example                      # Environment variables template
│   ├── .env.test                         # Test environment
│   ├── .env.staging                      # Staging environment
│   ├── .env.production                   # Production environment
│   ├── tsconfig.base.json                # Base TypeScript config
│   ├── jest.config.js                    # Jest configuration
│   ├── eslint.config.js                  # ESLint configuration
│   ├── prettier.config.js                # Prettier configuration
│   └── husky.config.js                   # Git hooks
│
├── 📊 data/                              # Data layer
│   ├── daily-logs/                       # Daily operation logs
│   │   └── 2026-07-21.md
│   │
│   ├── decisions/                        # Architecture Decision Records
│   │   ├── 2026-07-17-second-brain.md
│   │   ├── 2026-07-18-sync-engine.md
│   │   └── 2026-07-19-discord-ecosystem.md
│   │
│   ├── inbox/                            # New tasks & ideas
│   │   └── ideas.md
│   │
│   ├── contacts/                         # Team & stakeholder info
│   │   └── team.md
│   │
│   └── backups/                          # Database backups
│       └── .gitkeep
│
├── 📝 Root Files
│   ├── README.md                         # Project overview
│   ├── CONTRIBUTING.md                   # Contribution guidelines
│   ├── LICENSE                           # MIT license
│   ├── .gitignore                        # Git ignore rules
│   ├── .dockerignore                     # Docker ignore rules
│   ├── .editorconfig                     # Editor configuration
│   ├── package.json                      # Root dependencies (monorepo)
│   ├── pnpm-workspace.yaml               # pnpm workspace config
│   ├── turbo.json                        # Turborepo configuration
│   ├── docker-compose.yml                # Local development
│   ├── CLAUDE.md                         # AI assistant instructions
│   ├── PHASE1_SUMMARY.md
│   ├── PHASE2_SUMMARY.md
│   ├── PHASE3_SUMMARY.md
│   ├── PHASE4_IMPLEMENTATION.md
│   ├── WISE2_ENTERPRISE_ARCHITECTURE.md
│   ├── WISE2_MASTER_ROADMAP.md
│   ├── BRANDING_SYSTEM.md
│   └── REPOSITORY_MASTER_PLAN.md
│
└── 🔄 CI/CD & Automation
    ├── .github/workflows/
    ├── docker/
    ├── scripts/
    └── infrastructure/
```

---

## 📦 Package Dependencies

### Monorepo Root (`package.json`)
```json
{
  "name": "wise2-core",
  "private": true,
  "version": "1.0.0",
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.2.0",
    "jest": "^29.0.0",
    "husky": "^8.0.0"
  }
}
```

### Apps Dependencies

**website** (Next.js):
- next, react, react-dom
- @wise2/ui, @wise2/branding, @wise2/shared
- axios, swr
- zustand (state management)

**dashboard** (Next.js):
- next, react, react-dom
- recharts, date-fns
- @wise2/ui, @wise2/shared
- react-query

**admin** (Vite + React):
- vite, react, react-dom
- zustand, react-router
- formik, yup
- @wise2/ui

**mobile** (React Native):
- react-native, expo
- react-navigation
- zustand
- @react-native-community/hooks

**cli** (Node.js):
- commander, chalk
- axios
- fs-extra
- @wise2/sdk

### Services Dependencies

**api** (NestJS):
- @nestjs/core, @nestjs/common
- @nestjs/typeorm, typeorm
- @nestjs/jwt, passport
- postgresql, redis
- pino (logging)

**second-brain**:
- yjs, lib0
- @elastic/elasticsearch
- discord.js
- axios

**ai-orchestrator**:
- openai, @anthropic-ai/sdk
- pinecone-client
- axios

**automation**:
- bull (job queue)
- node-cron
- lodash

**sync**:
- yjs
- ws
- pino

**notifications**:
- nodemailer
- discord.js
- twilio

**deployment**:
- kubernetes-client
- docker-api
- axios

**monitoring**:
- pino, pino-pretty
- @opentelemetry/api
- prometheus-client

### Packages Dependencies

**ui**:
- react, typescript
- @lucide-react/icons

**branding**:
- typescript (types only)

**shared**:
- typescript
- uuid

**database**:
- @prisma/client
- dotenv

**auth**:
- jsonwebtoken
- bcryptjs
- passport

**sdk**:
- axios
- typescript

---

## 🔗 Import Paths (TypeScript)

### `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@wise2/ui": ["packages/ui/src"],
      "@wise2/branding": ["packages/branding/src"],
      "@wise2/shared": ["packages/shared/src"],
      "@wise2/database": ["packages/database/src"],
      "@wise2/auth": ["packages/auth/src"],
      "@wise2/sdk": ["packages/sdk/src"],
      "@wise2/api": ["services/api/src"],
      "@wise2/second-brain": ["services/second-brain/src"],
      "@wise2/ai": ["services/ai-orchestrator/src"],
      "@wise2/automation": ["services/automation/src"],
      "@wise2/sync": ["services/sync/src"],
      "@wise2/notifications": ["services/notifications/src"],
      "@wise2/deployment": ["services/deployment/src"],
      "@wise2/knowledge": ["services/knowledge/src"],
      "@wise2/monitoring": ["services/monitoring/src"],
      "@/*": ["apps/*/src/*"]
    }
  }
}
```

---

## 📋 Quality Gates

### Pre-Commit Hooks (Husky)
```bash
# Format check
prettier --check .

# Lint check
eslint . --ext .ts,.tsx

# Type check
tsc --noEmit

# Commit message validation
commitlint
```

### CI/CD Gates

**On Push to PR**:
- ✅ Unit tests (all packages & apps)
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Security scan (SAST)
- ✅ Build verification

**On Merge to Main**:
- ✅ Integration tests
- ✅ E2E tests
- ✅ Performance tests
- ✅ Docker build
- ✅ Security audit

**Pre-Deployment**:
- ✅ All tests passing
- ✅ Code coverage >80%
- ✅ No security vulnerabilities
- ✅ Staging deployment successful

---

## 🚀 Build & Development Scripts

### Development
```bash
# Start all services in parallel
pnpm dev

# Start specific app
cd apps/website && pnpm dev

# Start specific service
cd services/api && pnpm dev
```

### Building
```bash
# Build all packages & apps
pnpm build

# Build with Turborepo caching
turbo build --filter=@wise2/ui

# Docker build
docker-compose -f infrastructure/docker/docker-compose.yml build
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test --filter=@wise2/api

# Run with coverage
pnpm test:coverage

# E2E tests
cd test/e2e && pnpm test:e2e
```

### Quality
```bash
# Lint all
pnpm lint

# Format all
pnpm format

# Type check
pnpm type-check

# Security audit
pnpm audit
```

---

## 📊 Module Dependencies

### Dependency Graph
```
apps/website
├── @wise2/ui
├── @wise2/branding
├── @wise2/shared
└── @wise2/sdk

apps/dashboard
├── @wise2/ui
├── @wise2/shared
├── @wise2/sdk
└── services/api (REST)

apps/admin
├── @wise2/ui
├── @wise2/auth
├── @wise2/shared
└── @wise2/sdk

services/api
├── @wise2/database
├── @wise2/auth
├── @wise2/shared
├── services/notifications
└── services/knowledge

services/second-brain
├── @wise2/shared
└── (direct integrations)

services/ai-orchestrator
├── @wise2/shared
├── services/knowledge
└── (LLM APIs)

services/sync
├── @wise2/shared
└── services/second-brain

services/automation
├── @wise2/shared
├── services/api
└── (job queue)

services/deployment
├── @wise2/shared
├── services/notifications
└── services/monitoring
```

---

## 🔐 Secrets Management

### Environment Variables Structure
```
.env.local
├── DATABASE_URL
├── REDIS_URL
├── JWT_SECRET
├── GITHUB_TOKEN
├── DISCORD_BOT_TOKEN
├── CLAUDE_API_KEY
├── OPENAI_API_KEY
├── PINECONE_API_KEY
├── SMTP_USER / SMTP_PASS
└── AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY

.env.test
├── TEST_DATABASE_URL
├── TEST_REDIS_URL
└── MOCK_* (test doubles)

.env.staging
└── (staging secrets from vault)

.env.production
└── (production secrets from vault)
```

---

## 📋 Implementation Checklist

### Phase 4 Tasks

- [ ] Create directory structure
- [ ] Set up monorepo (pnpm workspaces)
- [ ] Configure Turborepo
- [ ] Create shared tsconfig.base.json
- [ ] Implement TypeScript path aliases
- [ ] Set up ESLint & Prettier
- [ ] Configure Husky pre-commit hooks
- [ ] Create GitHub Actions workflows
- [ ] Set up Docker infrastructure
- [ ] Create .env templates
- [ ] Document API routes
- [ ] Write development guide
- [ ] Create deployment procedures
- [ ] Set up monitoring
- [ ] Implement QA gates
- [ ] Create contribution guidelines

---

## 🎯 Success Criteria

**Repository Structure**:
- ✅ All code properly organized
- ✅ Clear separation of concerns
- ✅ Modular architecture
- ✅ Easy onboarding

**Build & Development**:
- ✅ <3 second hot reload
- ✅ <30 second full build
- ✅ <5 second test suite
- ✅ Zero circular dependencies

**Quality**:
- ✅ 100% TypeScript strict
- ✅ 100% linting pass
- ✅ >80% test coverage
- ✅ Zero security issues

**Documentation**:
- ✅ Complete architecture docs
- ✅ API reference ready
- ✅ Development guide done
- ✅ Deployment procedures documented

---

**Phase 4 Ready for Implementation** 🚀
