# API SPECIFICATION

**WISE² Enterprise**  
**Version**: 10.0  
**Date**: 2026-07-11

---

## API OVERVIEW

- **Base URL**: `https://api.wise2.com` (production)
- **Version**: v1
- **Authentication**: JWT Bearer Token
- **Rate Limit**: 1000 requests/hour per user
- **Response Format**: JSON
- **Response Time Target**: < 200ms (p95)

---

## AUTHENTICATION

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### OAuth2
```http
GET /api/v1/auth/oauth/:provider/callback?code=CODE&state=STATE
```

---

## CORE ENDPOINTS

### Projects

**List Projects**
```http
GET /api/v1/projects?page=1&limit=10&status=active
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "Summer Campaign",
      "status": "active",
      "created_at": "2026-07-11T10:00:00Z"
    }
  ],
  "meta": {"total": 42, "page": 1, "limit": 10}
}
```

**Create Project**
```http
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "project_type": "sound_labs"
}

Response (201):
{
  "id": "uuid",
  "name": "New Project",
  "status": "draft",
  "created_at": "2026-07-11T10:00:00Z"
}
```

**Get Project**
```http
GET /api/v1/projects/{project_id}
Authorization: Bearer {token}

Response (200): {project object}
```

**Update Project**
```http
PATCH /api/v1/projects/{project_id}
Authorization: Bearer {token}

Response (200): {updated project}
```

**Delete Project**
```http
DELETE /api/v1/projects/{project_id}
Authorization: Bearer {token}

Response (204): No Content
```

---

### Tracks

**Upload Audio**
```http
POST /api/v1/projects/{project_id}/tracks
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <audio file>
name: "Track Name"

Response (201):
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Track Name",
  "audio_url": "https://s3.../track.mp3",
  "duration": 180
}
```

**Get Tracks**
```http
GET /api/v1/projects/{project_id}/tracks
Authorization: Bearer {token}

Response (200): [{track objects}]
```

---

### Billing

**Get Subscription**
```http
GET /api/v1/billing/subscription
Authorization: Bearer {token}

Response (200):
{
  "id": "uuid",
  "plan_id": "pro",
  "status": "active",
  "current_period_end": "2026-08-11T00:00:00Z"
}
```

**Create Subscription**
```http
POST /api/v1/billing/subscribe
Authorization: Bearer {token}

{
  "plan_id": "pro"
}

Response (201): {subscription}
```

---

### Webhooks

**Discord Integration**
```http
POST /webhooks/discord/{guild_id}
Content-Type: application/json

{
  "event": "project_created",
  "data": {
    "project_id": "uuid",
    "project_name": "New Project",
    "user_id": "uuid"
  }
}
```

---

## ERROR RESPONSES

### Standard Error Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Email is required",
    "status": 400
  }
}
```

### Common Error Codes
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `429` Rate Limited
- `500` Internal Server Error

---

## RATE LIMITING

- 1000 requests/hour per user
- 10000 requests/hour per API key
- Rate limit headers in response

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1626086400
```

---

## VERSIONING

- Current API version: v1
- Path-based versioning: `/api/v1/`, `/api/v2/`
- Deprecated endpoints return 301 with new URL

---

**Owner**: Wise Defense LLC  
**Last Updated**: 2026-07-11
