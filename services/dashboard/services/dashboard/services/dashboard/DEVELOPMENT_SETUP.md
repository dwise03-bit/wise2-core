# Wise² Development Setup Guide

**Version**: 1.0  
**Status**: ACTIVE  
**Owner**: DevOps Lead  
**Last Updated**: 2026-07-07

---

## Quick Start (5 Minutes)

```bash
# 1. Clone repository
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Start development environment
docker-compose -f docker-compose.dev.yml up -d

# 5. Initialize database
npm run db:migrate

# 6. Start services
npm run dev

# Access:
# - Dashboard: http://localhost:3001
# - API: http://localhost:3000
# - Prometheus: http://localhost:9090
```

---

## Prerequisites

### System Requirements

```
Node.js: 18.0.0 or higher
npm: 9.0.0 or higher
Docker: 24.0.0 or higher
Docker Compose: 2.0.0 or higher
Git: 2.40.0 or higher
RAM: 4GB minimum (8GB recommended)
Disk: 20GB free space
```

### Install Prerequisites

**macOS**:
```bash
# Using Homebrew
brew install node docker docker-compose git

# Verify installation
node --version    # v18+
npm --version     # 9+
docker --version  # 24+
docker-compose --version  # 2+
```

**Linux (Ubuntu)**:
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Windows**:
- Install Docker Desktop (includes Docker & Docker Compose)
- Install Node.js from nodejs.org
- Use Windows Terminal (PowerShell or Git Bash)

---

## Step 1: Clone Repository

```bash
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# Verify clone
ls -la
# Should show: services/, docs/, infrastructure/, etc.

# Verify git setup
git status
git log --oneline | head -5
```

---

## Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install service dependencies
cd services/api && npm install && cd ../..
cd services/dashboard && npm install && cd ../..
cd services/admin-dashboard && npm install && cd ../..
cd services/bot && npm install && cd ../..
cd services/worker && npm install && cd ../..

# Verify installations
npm ls --depth=0  # List top-level dependencies
```

---

## Step 3: Environment Configuration

### 3.1 Create .env File

```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env
```

### 3.2 Essential Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wise2_core
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wise2_core

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis-dev

# Application
NODE_ENV=development
NODE_OPTIONS=--max-old-space-size=512

# API
API_PORT=3000
API_HOST=0.0.0.0
API_LOG_LEVEL=debug

# Dashboard
DASHBOARD_PORT=3001

# Admin Dashboard
ADMIN_PORT=3002

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=86400

# Discord Bot (if testing)
DISCORD_BOT_TOKEN=your-token-here
DISCORD_GUILD_ID=your-guild-id

# Optional: Claude API
CLAUDE_API_KEY=sk-...

# Optional: Other APIs
GITHUB_TOKEN=ghp_...
NEWS_API_KEY=...
```

---

## Step 4: Docker Setup

### 4.1 Development Docker Compose

**File**: `docker-compose.dev.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wise2_core
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass redis-dev
    volumes:
      - redis_dev_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./infrastructure/config/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_dev_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"

volumes:
  postgres_dev_data:
  redis_dev_data:
  prometheus_dev_data:
```

### 4.2 Start Development Stack

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Verify services running
docker-compose -f docker-compose.dev.yml ps

# Expected output:
# NAME                  STATUS
# wise2-core-postgres-1  Up 10 seconds (healthy)
# wise2-core-redis-1     Up 10 seconds (healthy)
# wise2-core-prometheus-1 Up 10 seconds

# View logs
docker-compose -f docker-compose.dev.yml logs -f postgres

# Stop services
docker-compose -f docker-compose.dev.yml down
```

---

## Step 5: Database Setup

### 5.1 Create Database

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres

# Inside psql:
CREATE DATABASE wise2_core;
\c wise2_core
\dt

# Exit
\q
```

### 5.2 Run Migrations

```bash
# From root directory
npm run db:migrate

# Or manually:
cd infrastructure/database
psql postgresql://postgres:postgres@localhost:5432/wise2_core < schema.sql
psql postgresql://postgres:postgres@localhost:5432/wise2_core < migrations/001_initial_schema.sql
```

### 5.3 Seed Data (Optional)

```bash
npm run db:seed

# Or manually insert test data:
psql postgresql://postgres:postgres@localhost:5432/wise2_core << 'EOF'
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@wise2.local', 'hash', 'Admin User', 'admin'),
('operator@wise2.local', 'hash', 'Operator', 'operator'),
('dev@wise2.local', 'hash', 'Developer', 'developer');
EOF
```

---

## Step 6: Start Development Services

### 6.1 Terminal 1: API Service

```bash
cd services/api
npm run dev

# Expected output:
# ✓ Server running on http://localhost:3000
# ✓ Database connected
# ✓ Ready for requests
```

### 6.2 Terminal 2: Dashboard

```bash
cd services/dashboard
npm run dev

# Expected output:
# ▲ Next.js 16.2.7
# - Local: http://localhost:3001
# Ready in 2.3s
```

### 6.3 Terminal 3: Worker

```bash
cd services/worker
npm run dev

# Expected output:
# ✓ Worker started
# ✓ Queue initialized
# ✓ Listening for jobs
```

### 6.4 Access Services

```
API: http://localhost:3000
Dashboard: http://localhost:3001
Admin Dashboard: http://localhost:3002
Prometheus: http://localhost:9090
```

---

## Step 7: Verify Setup

### 7.1 Health Check

```bash
# Check API
curl http://localhost:3000/health

# Expected: {"status":"ok"}

# Check Database
curl http://localhost:3000/api/v1/users

# Expected: {"success":true,"data":[...]}
```

### 7.2 Log Verification

```bash
# View Docker logs
docker-compose -f docker-compose.dev.yml logs

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Check Redis logs
docker-compose -f docker-compose.dev.yml logs redis
```

---

## Development Workflows

### API Development

```bash
cd services/api

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Linting
npm run lint

# Format code
npm run format
```

### Dashboard Development

```bash
cd services/dashboard

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Database Development

```bash
# Create migration
npm run db:create-migration -- add_new_column

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Reset database (development only!)
npm run db:reset
```

---

## Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Service Tests

```bash
cd services/api
npm test

cd services/dashboard
npm test
```

### Run Integration Tests

```bash
npm run test:integration
```

### Test Coverage

```bash
npm run test:cov

# View coverage report
open coverage/index.html
```

---

## Git Workflow

### Create Feature Branch

```bash
# Create new branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push to remote
git push -u origin feature/my-feature
```

### Create Pull Request

```bash
# Push branch
git push origin feature/my-feature

# Create PR via GitHub CLI
gh pr create --title "Add my feature" --body "Description..."

# Or use GitHub web interface
# https://github.com/dwise03-bit/wise2-core/pulls
```

### Update from Main

```bash
# Fetch latest
git fetch origin

# Rebase on main
git rebase origin/main

# Or merge
git merge origin/main

# Resolve conflicts if needed
```

---

## IDE Setup

### VS Code

**Recommended Extensions**:
- ESLint
- Prettier - Code formatter
- Thunder Client (or Postman)
- PostgreSQL Explorer
- Docker

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### WebStorm / IntelliJ

- Built-in Docker support
- Built-in database tools
- Built-in Git integration

---

## Troubleshooting

### Docker Issues

```bash
# Clean Docker environment
docker-compose -f docker-compose.dev.yml down -v

# Rebuild images
docker-compose -f docker-compose.dev.yml build --no-cache

# Start fresh
docker-compose -f docker-compose.dev.yml up -d
```

### Database Connection Issues

```bash
# Test connection
psql postgresql://postgres:postgres@localhost:5432/wise2_core

# Check port
lsof -i :5432

# Reset PostgreSQL
docker-compose -f docker-compose.dev.yml down -v postgres
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5432
lsof -i :6379

# Kill process
kill -9 <PID>

# Or change port in .env
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop → Preferences → Resources → Memory

# Or limit Node memory
export NODE_OPTIONS=--max-old-space-size=1024
npm run dev
```

---

## Performance Tips

### 1. Use Development Mode
```bash
NODE_ENV=development npm run dev
```

### 2. Enable Caching
- Redis for session caching
- Query result caching in services

### 3. Database Optimization
```bash
# Use indexes for queries
# Run ANALYZE after bulk inserts
ANALYZE;

# Check query plans
EXPLAIN ANALYZE SELECT * FROM users;
```

### 4. Monitor Resources
```bash
# Watch Docker resource usage
docker stats

# Watch system resources
top  # macOS/Linux
```

---

## CI/CD Integration

### Pre-Commit Hooks

```bash
# Install Husky
npm install husky --save-dev

# Initialize Husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

### GitHub Actions

Runs automatically on:
- Push to any branch
- Pull requests to main

Verifies:
- ESLint passes
- TypeScript compiles
- Tests pass
- Coverage maintained

---

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Run services locally
3. ✅ Verify health checks
4. ✅ Create your first feature branch
5. ✅ Make a change and test it
6. ✅ Create a pull request

---

**Last Updated**: 2026-07-07  
**Support**: Contact DevOps Lead  
**Issues**: Report in GitHub Issues
