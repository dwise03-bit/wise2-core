# WISE² API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require the Authorization header:
```
Authorization: Bearer <accessToken>
```

Tokens are obtained from the login endpoint and expire after 24 hours.

---

## Endpoints

### Auth Module (`/v1/auth`)

#### Register User
```
POST /v1/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",  // Min 12 characters
  "firstName": "John",
  "lastName": "Doe"
}

Response: 201 Created
{
  "message": "User registered successfully. Please check your email to verify.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}

Errors:
- 400: Email already registered
- 400: Password must be at least 12 characters
- 422: Validation failed
```

#### Login
```
POST /v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}

Errors:
- 401: Invalid email or password
- 401: Please verify your email before logging in
```

#### Refresh Token
```
POST /v1/auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: 200 OK
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Errors:
- 401: Invalid or expired refresh token
```

#### Forgot Password
```
POST /v1/auth/forgot-password
Content-Type: application/json

Request:
{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Password reset link sent to email"
}
```

#### Reset Password
```
POST /v1/auth/reset-password
Content-Type: application/json

Request:
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}

Errors:
- 401: Invalid or expired reset token
- 400: Password must be at least 12 characters
```

#### Logout
```
POST /v1/auth/logout

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

---

### Projects Module (`/v1/projects`) - Protected

#### List Projects
```
GET /v1/projects
Authorization: Bearer <token>
Query Parameters:
  - limit: 20 (default)
  - offset: 0 (default)

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "My Project",
      "description": "Project description",
      "status": "active",
      "createdAt": "2026-07-11T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}

Errors:
- 401: Unauthorized (missing/invalid token)
```

#### Create Project
```
POST /v1/projects
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "My Project",
  "description": "Project description"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "My Project",
  "description": "Project description",
  "status": "active",
  "createdAt": "2026-07-11T00:00:00Z"
}
```

#### Get Project
```
GET /v1/projects/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "name": "My Project",
  "description": "Project description",
  "status": "active",
  "createdAt": "2026-07-11T00:00:00Z"
}

Errors:
- 404: Project not found
```

#### Update Project
```
PATCH /v1/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "Updated Name",
  "description": "Updated description"
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active",
  "updatedAt": "2026-07-11T00:00:00Z"
}
```

#### Delete Project
```
DELETE /v1/projects/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Project deleted successfully"
}

Errors:
- 404: Project not found
```

---

### Analytics Module (`/v1/analytics`) - Protected

#### Track Event
```
POST /v1/analytics/events
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "eventName": "video_upload",
  "metadata": {
    "duration": 60,
    "quality": "1080p"
  }
}

Response: 200 OK
{
  "message": "Event tracked"
}
```

#### Get User Analytics
```
GET /v1/analytics/user
Authorization: Bearer <token>

Response: 200 OK
{
  "totalEvents": 100,
  "activeTime": "2 hours",
  "engagement": "high"
}
```

---

### Billing Module (`/v1/billing`) - Protected

#### Subscribe to Plan
```
POST /v1/billing/subscribe
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "planId": "pro",
  "billingCycle": "monthly"
}

Response: 200 OK
{
  "subscription": {
    "id": "uuid",
    "plan": "pro",
    "status": "active",
    "nextBillingDate": "2026-08-11"
  }
}
```

#### Get Subscription
```
GET /v1/billing/subscription
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "plan": "pro",
  "status": "active",
  "currentPeriodEnd": "2026-08-11"
}
```

---

### Community Module (`/v1/community`) - Public/Protected

#### Get Leaderboard
```
GET /v1/community/leaderboard
Authorization: Bearer <token> (optional for stats)

Response: 200 OK
[
  {
    "rank": 1,
    "name": "TopCreator",
    "points": 15250
  },
  {
    "rank": 2,
    "name": "Creator2",
    "points": 12840
  }
]
```

#### Vote on Feature
```
POST /v1/community/features/vote
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "featureId": "uuid",
  "vote": "up"  // or "down"
}

Response: 200 OK
{
  "message": "Vote recorded",
  "featureId": "uuid",
  "votes": 125
}
```

---

### Modules Module (`/v1/modules`) - Protected

#### List Modules
```
GET /v1/modules
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "sound-labs",
    "name": "WISE Sound Labs",
    "status": "active",
    "users": 1234
  },
  {
    "id": "design-studio",
    "name": "Design Studio",
    "status": "coming-soon",
    "eta": "Q3 2026"
  }
]
```

#### Get Module Details
```
GET /v1/modules/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "sound-labs",
  "name": "WISE Sound Labs",
  "description": "Professional audio creation",
  "status": "active",
  "features": [...]
}
```

#### Enable Module
```
POST /v1/modules/:id/enable
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Module enabled",
  "moduleId": "sound-labs",
  "enabled": true
}
```

---

## System Endpoints (Public)

#### Health Check
```
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2026-07-11T20:00:00.000Z"
}
```

#### API Documentation
```
GET /docs

Response: 200 OK
{
  "message": "WISE² Enterprise API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request |
| 201 | Created | POST /register |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Invalid email format |
| 500 | Server Error | Database error |

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests per minute per IP
- 1000 requests per day per user

---

## Pagination

Endpoints supporting pagination use:
- `limit`: Items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

Example:
```
GET /v1/projects?limit=50&offset=100
```

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2026-07-11T20:16:41.786Z
```

---

## Content Type

All requests should include:
```
Content-Type: application/json
```

All responses are JSON.

---

## Examples

### Complete Auth Flow
```bash
# 1. Register
REGISTER=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@wise2.com",
    "password":"SecurePass123!",
    "firstName":"New",
    "lastName":"User"
  }')

echo $REGISTER | jq '.user.id'  # Get user ID

# 2. Login
LOGIN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@wise2.com",
    "password":"SecurePass123!"
  }')

TOKEN=$(echo $LOGIN | jq -r '.tokens.accessToken')
echo "Token: $TOKEN"

# 3. Use protected endpoint
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/projects | jq '.'
```

---

Last Updated: 2026-07-11  
API Version: 1.0.0
