# API Service

REST API backend for Wise² Core

## Overview

The API service is the core backend for Wise² Core, providing REST endpoints for:
- Authentication and authorization
- Business logic and data operations
- Integration with external services
- Data persistence to PostgreSQL
- Caching via Redis
- Queue jobs via Message Queue

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Language**: TypeScript/JavaScript
- **Authentication**: JWT

## Directory Structure

```
api/
├── src/
│   ├── server.js              # Main entry point
│   ├── app.js                 # Express app setup
│   ├── routes/                # API route handlers
│   ├── controllers/           # Business logic
│   ├── models/                # Database models
│   ├── middleware/            # Express middleware
│   ├── services/              # External service integrations
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration
│   └── types/                 # TypeScript types
├── Dockerfile
├── package.json
└── README.md
```

## Getting Started (Development)

```bash
npm install
npm run dev          # Start with hot reload
npm run test         # Run tests
npm run lint         # Run linting
```

## Production Deployment

```bash
npm run build
npm start
```

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/wise2_core
REDIS_URL=redis://:password@redis:6379
JWT_SECRET=your-secret-key
CLAUDE_API_KEY=sk-...
```

## Health Check

```bash
curl http://localhost:3000/health
```

## Documentation

- API Spec: See `docs/API.md`
- Database: See `docs/DATABASE.md`
- Deployment: See `infrastructure/README.md`
- Troubleshooting: See `docs/runbooks/troubleshooting.md`

---

**Service Version**: 1.0
**Owner**: Backend Team
