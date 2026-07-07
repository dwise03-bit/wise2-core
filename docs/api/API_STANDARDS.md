# Wise² API Standards & Design Guidelines

**Version**: 1.0  
**Status**: ACTIVE  
**Owner**: CTO  
**Last Updated**: 2026-07-07

---

## Overview

These standards define how all Wise² services communicate via REST APIs. Every service MUST comply with these standards.

---

## 1. Core Principles

### 1.1 REST Conventions
- Use HTTP methods correctly: GET (read), POST (create), PATCH (update), DELETE (delete)
- Use proper HTTP status codes
- Resource-oriented URLs (nouns, not verbs)
- Stateless operations
- Use JSON for all request/response bodies

### 1.2 API Versioning
- Current version: `v1`
- All URLs include version: `/api/v1/...`
- Breaking changes create new major version
- Minor versions backward compatible

### 1.3 Design Philosophy
- **Simple**: Easy to understand and use
- **Consistent**: Same patterns across all services
- **Predictable**: Behavior matches expectations
- **Secure**: Authentication/authorization on every endpoint
- **Observable**: All requests loggable and traceable

---

## 2. URL Structure

### 2.1 Base URL Format
```
https://api.wise2.io/api/v1
http://localhost:3000/api/v1 (development)
```

### 2.2 Resource Paths
```
GET    /users              → List users
POST   /users              → Create user
GET    /users/:id          → Get specific user
PATCH  /users/:id          → Update user
DELETE /users/:id          → Delete user

GET    /users/:id/roles    → Get user's roles
GET    /deployments        → List deployments
POST   /deployments        → Create deployment
GET    /deployments/:id    → Get deployment
```

### 2.3 Query Parameters
```
Pagination
?limit=10&offset=0         → First 10 items
?limit=10&offset=10        → Next 10 items

Filtering
?status=active             → Filter by status
?created_after=2026-01-01  → Filter by date

Sorting
?sort=name                 → Sort by field
?sort=-created_at          → Sort descending (- prefix)

Search
?q=search_term             → Full text search
```

---

## 3. Request Format

### 3.1 Headers Required
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
X-Request-ID: <unique-id>              (optional but recommended)
User-Agent: WiseClient/1.0              (optional)
```

### 3.2 Request Body (POST/PATCH)
```json
{
  "name": "value",
  "description": "value",
  "status": "active"
}
```

### 3.3 Authentication
```
Bearer token format
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Token obtained via POST /auth/login
```

---

## 4. Response Format

### 4.1 Success Response (2xx)
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Example",
    "created_at": "2026-07-07T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-07-07T10:30:00Z",
    "version": "v1"
  }
}
```

### 4.2 List Response with Pagination
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 25,
    "has_more": true
  },
  "meta": {
    "timestamp": "2026-07-07T10:30:00Z",
    "version": "v1"
  }
}
```

### 4.3 Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "User email is required",
    "details": {
      "field": "email",
      "reason": "required"
    }
  },
  "meta": {
    "timestamp": "2026-07-07T10:30:00Z",
    "request_id": "req-123"
  }
}
```

---

## 5. HTTP Status Codes

### 5.1 Success Codes
```
200 OK              → Successful GET, PATCH, DELETE
201 Created         → Successful POST (resource created)
204 No Content      → Successful DELETE (no response body)
```

### 5.2 Redirect Codes
```
301 Moved Permanently → URL changed permanently
302 Found             → Temporary redirect
```

### 5.3 Client Error Codes
```
400 Bad Request     → Invalid request (validation failed)
401 Unauthorized    → Missing/invalid authentication
403 Forbidden       → Authenticated but not authorized
404 Not Found       → Resource doesn't exist
409 Conflict        → Resource conflict (duplicate, etc)
422 Unprocessable   → Validation failed
429 Too Many Requests → Rate limited
```

### 5.4 Server Error Codes
```
500 Internal Server Error → Unexpected server error
502 Bad Gateway           → Service temporarily unavailable
503 Service Unavailable   → Maintenance or overloaded
```

---

## 6. Error Codes

### 6.1 Standard Error Codes
```
INVALID_REQUEST         → Malformed request
VALIDATION_ERROR        → Field validation failed
UNAUTHORIZED            → Authentication required
FORBIDDEN               → Authorization failed
NOT_FOUND               → Resource not found
CONFLICT                → Resource conflict
RATE_LIMITED            → Too many requests
INTERNAL_ERROR          → Server error
SERVICE_UNAVAILABLE     → Service down
```

### 6.2 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## 7. Data Types & Formats

### 7.1 Standard Field Types
```
id              → UUID (e.g., "550e8400-e29b-41d4-a716-446655440000")
email           → Email format (validated)
password        → Plaintext (hashed on server)
url             → Full URL (https://...)
phone           → E.164 format (+1234567890)
timestamp       → ISO 8601 (2026-07-07T10:30:00Z)
status          → Enum value (active|inactive|pending)
uuid            → UUID format
boolean         → true|false
integer         → Whole number
float           → Decimal number
string          → Text
array           → JSON array
object          → JSON object
```

### 7.2 Timestamps
```
Format: ISO 8601 with UTC timezone
Example: 2026-07-07T10:30:00Z

Fields:
- created_at: When record created (immutable)
- updated_at: Last modification time
- deleted_at: Soft delete timestamp (null if not deleted)
- expires_at: When record expires
- scheduled_at: When action will run
```

### 7.3 Enums
```
Status values
  active      → Currently active
  inactive    → Disabled
  pending     → Awaiting action
  failed      → Operation failed
  completed   → Operation complete

User roles
  admin       → Full system access
  operator    → Service management
  developer   → API access
  viewer      → Read-only access
```

---

## 8. Authentication & Authorization

### 8.1 JWT Token Structure
```
Header
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["operator", "developer"],
  "permissions": ["deploy:read", "service:restart"],
  "iat": 1620000000,
  "exp": 1620086400
}

Signature
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### 8.2 Token Expiration
```
Access Token: 24 hours
Refresh Token: 7 days
Session Token: 30 days
```

### 8.3 Authorization Headers
```
All requests (except /auth/login, /health) require:
Authorization: Bearer <access_token>

If token invalid/expired → 401 Unauthorized
If insufficient permissions → 403 Forbidden
```

---

## 9. Rate Limiting

### 9.1 Rate Limit Headers
```
X-RateLimit-Limit: 100      → Requests allowed per window
X-RateLimit-Remaining: 42   → Requests remaining
X-RateLimit-Reset: 1620086400 → When limit resets (Unix timestamp)
```

### 9.2 Rate Limit Policy
```
Public endpoints: 60 requests/minute
Authenticated: 300 requests/minute
Admin: 1000 requests/minute

Per IP address for public endpoints
Per user for authenticated endpoints
```

### 9.3 Rate Limit Response (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

---

## 10. Pagination

### 10.1 Pagination Query Parameters
```
limit=10    → Items per page (max 100, default 20)
offset=0    → Pagination offset (default 0)
```

### 10.2 Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 250,
    "has_more": true,
    "pages": 25
  }
}
```

### 10.3 Cursor-based Pagination (for large datasets)
```
?cursor=abc123&limit=10

Response includes next_cursor for fetching next page
```

---

## 11. Filtering & Searching

### 11.1 Standard Filters
```
?status=active                    → Exact match
?status=active&type=deployment    → Multiple filters
?created_after=2026-01-01         → Date range
?created_before=2026-12-31        → Date range
?id[]=1&id[]=2&id[]=3             → Multiple IDs
```

### 11.2 Full-Text Search
```
?q=search+term                    → Search across indexed fields
```

### 11.3 Sorting
```
?sort=name                        → Sort ascending
?sort=-created_at                 → Sort descending (- prefix)
?sort=status,name                 → Multiple sorts
```

---

## 12. Versioning Strategy

### 12.1 API Versions
```
v1 (current)
v2 (future)

All new development uses v1
v1 supported for minimum 2 years
Breaking changes → new major version
```

### 12.2 Deprecation Policy
```
1. Announce deprecation (3 months advance notice)
2. Add Deprecation header to responses
3. Support deprecated version for 6 months
4. Remove in next major version
```

### 12.3 Deprecation Header
```
Deprecation: true
Sunset: 2027-01-01T00:00:00Z
Link: <https://docs.wise2.io/v2>; rel="successor-version"
```

---

## 13. Request/Response Examples

### 13.1 Create User (POST)
**Request**:
```
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer token

{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "operator"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "operator",
    "created_at": "2026-07-07T10:30:00Z",
    "updated_at": "2026-07-07T10:30:00Z"
  }
}
```

### 13.2 List Users with Pagination
**Request**:
```
GET /api/v1/users?limit=10&offset=0&sort=name
Authorization: Bearer token
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "email": "user1@example.com",
      "name": "Alice",
      "role": "operator",
      "created_at": "2026-07-01T10:00:00Z"
    },
    {
      "id": "uuid-2",
      "email": "user2@example.com",
      "name": "Bob",
      "role": "developer",
      "created_at": "2026-07-02T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 25,
    "has_more": true,
    "pages": 3
  }
}
```

### 13.3 Error Response
**Request**:
```
POST /api/v1/users
{
  "email": "invalid-email",
  "name": "John"
}
```

**Response (422)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 14. Security Best Practices

### 14.1 HTTPS Only
- All production APIs use HTTPS
- Redirect HTTP to HTTPS
- HSTS header: `Strict-Transport-Security: max-age=31536000`

### 14.2 CORS Configuration
```
Access-Control-Allow-Origin: https://dashboard.wise2.io
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### 14.3 Input Validation
- Validate all input on server side
- Sanitize inputs to prevent injection
- Enforce maximum lengths
- Type checking on all fields

### 14.4 Output Encoding
- Encode JSON responses
- Prevent XSS attacks
- No sensitive data in logs

---

## 15. Monitoring & Observability

### 15.1 Request Logging
```
Log format:
timestamp | method | path | status | duration_ms | user_id | ip_address

Example:
2026-07-07T10:30:00Z | POST | /api/v1/users | 201 | 45 | user-123 | 192.168.1.1
```

### 15.2 Metrics
- Request count by endpoint
- Response time percentiles (p50, p95, p99)
- Error rate by status code
- Rate limit violations

### 15.3 Tracing
- All requests assigned unique ID (X-Request-ID)
- Request ID included in logs
- Request ID returned in response headers

---

## Compliance & Enforcement

This document is MANDATORY for all Wise² API services.

**Violations**:
- Code reviews will reject non-compliant changes
- CI/CD checks will validate API compliance
- Production deployments will fail if standards not met

**Questions?** Contact CTO

---

**Last Updated**: 2026-07-07  
**Next Review**: 2026-10-07
