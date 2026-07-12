# Worker Service

Background job processing for Wise² Core

## Overview

Long-running background worker for:
- Scheduled jobs
- Asynchronous task processing
- Batch operations
- Data processing
- External service integrations

## Technology Stack

- **Job Queue**: BullMQ (Redis-backed)
- **Runtime**: Node.js 18+
- **Language**: JavaScript

## Getting Started

```bash
npm install
npm start
```

## Environment Variables

```bash
REDIS_URL=redis://:password@redis:6379
DATABASE_URL=postgresql://user:pass@postgres:5432/wise2_core
```

## Jobs

Jobs are defined in `src/jobs/` and enqueued via API.

---

**Service Version**: 1.0
**Owner**: Backend Team
