# API Documentation — Wise² Core

Complete API reference for Wise² Core backend services.

---

## Overview

The Wise² Core API is a RESTful service built with Express.js that handles:
- Authentication and authorization
- Data persistence
- Business logic operations
- Integration with external services
- Background job queuing

**Base URL**: `http://localhost:3000` (development)
**Production**: `https://api.wise2.net` (to be configured)
**API Version**: 1.0

---

## Authentication

### JWT Bearer Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting a Token

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Token Expiration

- Default: 24 hours (configurable via `JWT_EXPIRATION`)
- Token refresh: Use the refresh endpoint (if available)
- Revocation: Logout endpoint invalidates token

---

## Core Endpoints

### Health & Status

#### GET /health
Health check endpoint for monitoring.

**Request**:
```bash
GET /health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "service": "api",
  "uptime": 12345.67,
  "timestamp": "2026-07-07T13:40:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

**Use Cases**:
- Docker health checks
- Load balancer probes
- Monitoring systems
- Status pages

---

#### GET /status
Detailed service status including dependencies.

**Request**:
```bash
GET /status
Authorization: Bearer YOUR_TOKEN
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "connected",
    "external_api": "connected"
  },
  "metrics": {
    "uptime": 12345,
    "requests_total": 5432,
    "errors_total": 12,
    "response_time_ms": 45.2
  }
}
```

---

### Authentication Endpoints

#### POST /auth/login
User login with email and password.

**Request**:
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "created_at": "2026-07-07T00:00:00Z"
  }
}
```

**Errors**:
- 400: Invalid email or password format
- 401: Invalid credentials
- 429: Too many login attempts (rate limited)

---

#### POST /auth/logout
Invalidate current session.

**Request**:
```bash
POST /auth/logout
Authorization: Bearer YOUR_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /auth/signup
Create a new user account.

**Request**:
```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "secure_password",
  "name": "New User",
  "role": "user"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 400: Invalid email format or weak password
- 409: Email already registered

---

### User Endpoints

#### GET /users/me
Get current authenticated user profile.

**Request**:
```bash
GET /users/me
Authorization: Bearer YOUR_TOKEN
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "created_at": "2026-07-07T00:00:00Z",
  "updated_at": "2026-07-07T13:40:00Z",
  "last_login": "2026-07-07T13:40:00Z"
}
```

---

#### PUT /users/me
Update current user profile.

**Request**:
```bash
PUT /users/me
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newemail@example.com",
    "name": "Updated Name",
    "updated_at": "2026-07-07T13:45:00Z"
  }
}
```

---

### Deployment Endpoints

#### POST /deploy
Trigger deployment of new version.

**Request**:
```bash
POST /deploy
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "version": "1.0.0",
  "environment": "staging",
  "services": ["api", "dashboard"]
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "deployment_id": "deploy-550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "Deployment queued",
  "estimated_duration_seconds": 300
}
```

**Errors**:
- 401: Not authenticated
- 403: Not authorized for deployment
- 400: Invalid deployment parameters

---

#### GET /deploy/:deployment_id
Get deployment status.

**Request**:
```bash
GET /deploy/deploy-550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer ADMIN_TOKEN
```

**Response** (200 OK):
```json
{
  "deployment_id": "deploy-550e8400-e29b-41d4-a716-446655440000",
  "status": "in_progress",
  "services": {
    "api": {
      "status": "deployed",
      "version": "1.0.0"
    },
    "dashboard": {
      "status": "deploying",
      "progress": 65
    }
  },
  "started_at": "2026-07-07T13:40:00Z",
  "estimated_completion": "2026-07-07T13:45:00Z"
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context if applicable"
    }
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| INVALID_REQUEST | 400 | Malformed request |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily down |

### Example Error Response

```bash
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {
      "token": "JWT token validation failed"
    }
  }
}
```

---

## Rate Limiting

### Limits per Endpoint

- Authentication endpoints: 5 requests/minute per IP
- Standard endpoints: 60 requests/minute per user
- Admin endpoints: 20 requests/minute per user

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1625862000
```

### Rate Limit Response

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Retry-After: 30

{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retry_after": 30
  }
}
```

---

## Pagination

### Paginated Endpoints

List endpoints support pagination:

**Request**:
```bash
GET /resources?page=2&limit=20&sort=created_at&order=desc
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sort`: Sort field (default: created_at)
- `order`: Sort order - asc or desc (default: desc)

**Response**:
```json
{
  "data": [
    { /* resource 1 */ },
    { /* resource 2 */ }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## Webhooks

### Webhook Events

The API sends webhooks for important events:

- `deployment.started`
- `deployment.completed`
- `deployment.failed`
- `user.created`
- `user.deleted`

### Webhook Configuration

```bash
POST /webhooks
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "event": "deployment.completed",
  "url": "https://your-server.com/webhook",
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "deployment.completed",
  "timestamp": "2026-07-07T13:45:00Z",
  "data": {
    "deployment_id": "deploy-550e8400-e29b-41d4-a716-446655440000",
    "status": "success",
    "version": "1.0.0"
  },
  "signature": "sha256=abcd1234..."
}
```

---

## Versioning

### API Versions

Current: **v1** (default)
Older versions: Deprecated endpoints show `Deprecated: true` in response headers

### Version Migration

New versions will be announced 3 months in advance with migration guide.

Current endpoints: `/api/v1/*`
Deprecated: `/api/v0/*` (to be removed 2026-12-31)

---

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  }
}
```

### List Response

```json
{
  "success": true,
  "data": [
    /* array of items */
  ],
  "pagination": {
    /* pagination info */
  }
}
```

---

## Testing

### Test with curl

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get profile (replace TOKEN)
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer TOKEN"
```

### Test with Postman

1. Import Postman collection (to be created)
2. Configure base URL: `http://localhost:3000`
3. Set token in Auth tab
4. Run collection tests

### API Documentation

Full Swagger/OpenAPI documentation available at:
- Development: `http://localhost:3000/docs`
- Production: `https://api.wise2.net/docs`

---

## Performance

### Response Time Goals

- Health check: <10ms
- Authentication: <100ms
- Standard queries: <200ms
- Complex queries: <500ms

### Caching

- Health endpoint: Not cached (real-time status)
- User profile: Cached 5 minutes
- List endpoints: Cached 1 minute
- Deployment status: Not cached

### Compression

All responses are gzip compressed if client supports it.

---

## Support & Issues

### Getting Help

- Documentation: See `/docs` directory
- Issues: Report on GitHub with API endpoint and error
- Rate limits: Check headers in response
- Status: Check `/health` endpoint

### Contact

- Technical issues: tech-support@wise2.net
- API design questions: api@wise2.net
- Security concerns: security@wise2.net

---

**API Documentation Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: Backend Team

*Note: This documentation represents planned API structure. Actual endpoints may differ based on implementation.*
