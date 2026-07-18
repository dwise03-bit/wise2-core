# WISE² Podcast Music - Backend API Endpoints

This document specifies all backend API endpoints required for the Podcast Music frontend.

## Base URL

```
http://localhost:3001/api
```

Or production:
```
https://api.your-domain.com/api
```

## Authentication

All endpoints marked with `[PROTECTED]` require the following header:

```
Authorization: Bearer {JWT_TOKEN}
```

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

---

## Authentication Endpoints

### POST /auth/signup

Create a new user account.

**URL**: `POST /auth/signup`

**Public**: Yes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "podcastName": "My Awesome Podcast"
}
```

**Validation**:
- email: valid email format, unique in database
- password: minimum 8 characters
- podcastName: required, non-empty string

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "podcastName": "My Awesome Podcast",
    "createdAt": "2026-07-18T10:00:00Z"
  }
}
```

**Error Cases**:
- 400: Invalid email format
- 409: Email already registered
- 422: Password too weak

---

### POST /auth/login

Authenticate user and return JWT token.

**URL**: `POST /auth/login`

**Public**: Yes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "createdAt": "2026-07-18T10:00:00Z"
  }
}
```

**Error Cases**:
- 401: Invalid email or password
- 404: User not found

---

### GET /auth/me

[PROTECTED] Get current authenticated user.

**URL**: `GET /auth/me`

**Public**: No

**Headers**:
```
Authorization: Bearer {TOKEN}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "podcastName": "My Awesome Podcast",
    "createdAt": "2026-07-18T10:00:00Z",
    "subscription": {
      "planId": "plan_123",
      "status": "active",
      "expiresAt": "2026-08-18T10:00:00Z"
    }
  }
}
```

**Error Cases**:
- 401: Invalid or expired token
- 401: User not found

---

## Projects Endpoints

### GET /podcast/projects

[PROTECTED] Fetch all user's projects.

**URL**: `GET /podcast/projects`

**Public**: No

**Query Parameters**:
- `sortBy` (optional): "createdAt" | "name" | "status" (default: createdAt)
- `order` (optional): "asc" | "desc" (default: desc)
- `limit` (optional): number (default: 50, max: 100)
- `offset` (optional): number (default: 0)

**Success Response** (200):
```json
[
  {
    "id": "proj_123",
    "name": "Tech Talks Daily",
    "episodeNumber": 5,
    "template": "intro",
    "mood": "upbeat",
    "status": "completed",
    "audioUrl": "https://cdn.example.com/audio/proj_123.mp3",
    "createdAt": "2026-07-18T10:00:00Z",
    "updatedAt": "2026-07-18T10:30:00Z"
  }
]
```

**Error Cases**:
- 401: Unauthorized
- 500: Server error

---

### GET /podcast/projects/:id

[PROTECTED] Fetch single project by ID.

**URL**: `GET /podcast/projects/:id`

**Public**: No

**URL Parameters**:
- `id`: Project ID (e.g., "proj_123")

**Success Response** (200):
```json
{
  "id": "proj_123",
  "name": "Tech Talks Daily",
  "episodeNumber": 5,
  "template": "intro",
  "mood": "upbeat",
  "status": "completed",
  "audioUrl": "https://cdn.example.com/audio/proj_123.mp3",
  "createdAt": "2026-07-18T10:00:00Z",
  "updatedAt": "2026-07-18T10:30:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 404: Project not found
- 403: User doesn't have access to project

---

### POST /podcast/projects

[PROTECTED] Create a new project (draft status).

**URL**: `POST /podcast/projects`

**Public**: No

**Request Body**:
```json
{
  "projectName": "Tech Talks Daily",
  "episodeNumber": 5,
  "template": "intro",
  "mood": "upbeat"
}
```

**Validation**:
- projectName: required, non-empty
- episodeNumber: required, positive integer
- template: required, one of "intro", "outro", "transition"
- mood: required, one of "upbeat", "calm", "dramatic"

**Success Response** (201):
```json
{
  "id": "proj_123",
  "name": "Tech Talks Daily",
  "episodeNumber": 5,
  "template": "intro",
  "mood": "upbeat",
  "status": "draft",
  "audioUrl": null,
  "createdAt": "2026-07-18T10:00:00Z",
  "updatedAt": "2026-07-18T10:00:00Z"
}
```

**Error Cases**:
- 400: Missing required fields
- 401: Unauthorized
- 422: Invalid enum value
- 429: Rate limit exceeded (max projects per day)

---

### PUT /podcast/projects/:id

[PROTECTED] Update project details.

**URL**: `PUT /podcast/projects/:id`

**Public**: No

**URL Parameters**:
- `id`: Project ID

**Request Body** (all fields optional):
```json
{
  "projectName": "Tech Talks Daily",
  "episodeNumber": 5,
  "template": "intro",
  "mood": "upbeat"
}
```

**Success Response** (200):
```json
{
  "id": "proj_123",
  "name": "Tech Talks Daily",
  "episodeNumber": 5,
  "template": "intro",
  "mood": "upbeat",
  "status": "draft",
  "audioUrl": null,
  "createdAt": "2026-07-18T10:00:00Z",
  "updatedAt": "2026-07-18T10:15:00Z"
}
```

**Error Cases**:
- 400: Invalid field values
- 401: Unauthorized
- 403: User can't modify completed projects
- 404: Project not found

---

### DELETE /podcast/projects/:id

[PROTECTED] Delete a project.

**URL**: `DELETE /podcast/projects/:id`

**Public**: No

**URL Parameters**:
- `id`: Project ID

**Success Response** (204): No content

**Error Cases**:
- 401: Unauthorized
- 404: Project not found
- 403: User can't delete other's projects

---

## Generation Endpoints

### POST /podcast/projects/:id/generate

[PROTECTED] Trigger audio generation for project.

**URL**: `POST /podcast/projects/:id/generate`

**Public**: No

**URL Parameters**:
- `id`: Project ID

**Request Body**: Empty or `{}`

**Process**:
1. Check user has generations remaining
2. Create job in queue (async)
3. Update project status to "generating"
4. Return immediately

**Success Response** (202 Accepted):
```json
{
  "status": "generating",
  "jobId": "job_123",
  "message": "Audio generation started"
}
```

**Error Cases**:
- 400: Project already has audio (not draft)
- 401: Unauthorized
- 404: Project not found
- 429: Generations limit exceeded
- 500: Queue error

---

### GET /podcast/projects/:id/status

[PROTECTED] Get generation progress/status.

**URL**: `GET /podcast/projects/:id/status`

**Public**: No

**URL Parameters**:
- `id`: Project ID

**Response** (200):
```json
{
  "status": "generating",
  "progress": 65,
  "jobId": "job_123",
  "eta": 45,
  "message": "Generating music track..."
}
```

When complete:
```json
{
  "status": "completed",
  "progress": 100,
  "audioUrl": "https://cdn.example.com/audio/proj_123.mp3",
  "duration": 30,
  "fileSize": 1024000
}
```

On failure:
```json
{
  "status": "failed",
  "error": "GPU out of memory",
  "message": "Generation failed. Please try again."
}
```

**Possible Statuses**:
- "draft": No generation started
- "generating": In progress
- "completed": Successfully generated
- "failed": Generation failed

**Error Cases**:
- 401: Unauthorized
- 404: Project not found

---

### GET /podcast/projects/:id/download

[PROTECTED] Download generated audio file.

**URL**: `GET /podcast/projects/:id/download`

**Public**: No

**Query Parameters**:
- `format` (optional): "mp3" | "wav" | "m4a" (default: "mp3")

**Response**:
- Content-Type: audio/mpeg (or appropriate format)
- Content-Disposition: attachment; filename="podcast_ep5.mp3"
- Binary audio data

**Error Cases**:
- 400: Audio not generated yet
- 401: Unauthorized
- 404: Project not found
- 410: Audio file deleted/expired

---

## Subscription Endpoints

### GET /podcast/subscription/plans

Fetch available subscription plans (public).

**URL**: `GET /podcast/subscription/plans`

**Public**: Yes

**Response** (200):
```json
[
  {
    "id": "plan_free",
    "name": "Free",
    "price": 0,
    "generationsPerMonth": 5,
    "features": [
      "5 generations per month",
      "Basic templates",
      "7-day file retention"
    ]
  },
  {
    "id": "plan_pro",
    "name": "Pro",
    "price": 29,
    "generationsPerMonth": 100,
    "features": [
      "100 generations per month",
      "All templates",
      "30-day file retention",
      "Priority support"
    ]
  },
  {
    "id": "plan_studio",
    "name": "Studio",
    "price": 99,
    "generationsPerMonth": 500,
    "features": [
      "500 generations per month",
      "All templates + custom moods",
      "Unlimited file retention",
      "24/7 priority support",
      "API access"
    ]
  }
]
```

---

### GET /podcast/subscription/current

[PROTECTED] Get current user's subscription.

**URL**: `GET /podcast/subscription/current`

**Public**: No

**Response** (200):
```json
{
  "planId": "plan_pro",
  "planName": "Pro",
  "status": "active",
  "price": 29,
  "generationsPerMonth": 100,
  "generationsRemaining": 73,
  "startDate": "2026-06-18T10:00:00Z",
  "expiresAt": "2026-07-18T10:00:00Z",
  "renewalDate": "2026-07-18T10:00:00Z",
  "paymentMethod": "visa_****_4242",
  "autoRenew": true
}
```

On free plan or no active subscription:
```json
{
  "planId": "plan_free",
  "planName": "Free",
  "status": "active",
  "price": 0,
  "generationsPerMonth": 5,
  "generationsRemaining": 3,
  "startDate": "2026-07-18T10:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized
- 404: User has no subscription

---

### POST /podcast/subscription/checkout

[PROTECTED] Create checkout session for plan upgrade.

**URL**: `POST /podcast/subscription/checkout`

**Public**: No

**Request Body**:
```json
{
  "planId": "plan_pro"
}
```

**Process**:
1. Validate user's current plan
2. Check if plan change is valid
3. Create Stripe/payment checkout session
4. Return checkout URL

**Success Response** (200):
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_live_...",
  "sessionId": "cs_live_...",
  "expiresAt": "2026-07-18T11:00:00Z"
}
```

**Error Cases**:
- 400: Invalid plan ID
- 400: Already on this plan
- 401: Unauthorized
- 500: Payment processor error

---

### POST /podcast/subscription/cancel

[PROTECTED] Cancel current subscription (optional endpoint).

**URL**: `POST /podcast/subscription/cancel`

**Public**: No

**Success Response** (200):
```json
{
  "message": "Subscription cancelled",
  "expiresAt": "2026-07-18T10:00:00Z",
  "refund": "Your refund will be processed in 3-5 business days"
}
```

---

## User Stats Endpoints

### GET /podcast/stats

[PROTECTED] Get user statistics.

**URL**: `GET /podcast/stats`

**Public**: No

**Response** (200):
```json
{
  "generationsUsed": 27,
  "generationsLimit": 100,
  "storageUsed": 3145728,
  "storageLimit": 5368709120,
  "projectCount": 5,
  "totalAudioDuration": 1800,
  "joinDate": "2026-06-01T10:00:00Z",
  "lastGenerationAt": "2026-07-18T09:00:00Z"
}
```

**Error Cases**:
- 401: Unauthorized

---

## Batch Operations (Optional)

### POST /podcast/projects/batch

[PROTECTED] Batch create projects (convenience endpoint).

**URL**: `POST /podcast/projects/batch`

**Public**: No

**Request Body**:
```json
{
  "projects": [
    {
      "projectName": "Episode 1",
      "episodeNumber": 1,
      "template": "intro",
      "mood": "upbeat"
    },
    {
      "projectName": "Episode 1",
      "episodeNumber": 1,
      "template": "outro",
      "mood": "upbeat"
    }
  ]
}
```

**Response** (201):
```json
{
  "created": 2,
  "projects": [
    { "id": "proj_123", "status": "draft" },
    { "id": "proj_124", "status": "draft" }
  ]
}
```

---

## Rate Limiting

All endpoints should implement rate limiting:

**Headers returned**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1626603600
```

**Limits by Endpoint**:
- Auth endpoints: 10/minute per IP
- Public endpoints: 100/minute per IP
- Protected endpoints: 1000/minute per user
- Generation endpoint: 2/minute per user

---

## HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET/PUT/POST |
| 201 | Created | Resource created (POST) |
| 202 | Accepted | Async operation (generation) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email already registered |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal error |

---

## Webhook Events (Optional)

If implementing async processing, send webhooks:

```json
{
  "event": "generation.completed",
  "timestamp": "2026-07-18T10:30:00Z",
  "data": {
    "projectId": "proj_123",
    "audioUrl": "https://cdn.example.com/audio/proj_123.mp3",
    "duration": 30
  }
}
```

**Events**:
- `generation.started`
- `generation.progress` (every 10%)
- `generation.completed`
- `generation.failed`
- `subscription.renewed`
- `subscription.cancelled`

---

## Database Schema (Reference)

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  podcast_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE podcast_projects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  episode_number INT NOT NULL,
  template ENUM('intro', 'outro', 'transition') NOT NULL,
  mood ENUM('upbeat', 'calm', 'dramatic') NOT NULL,
  status ENUM('draft', 'generating', 'completed', 'failed') DEFAULT 'draft',
  audio_url VARCHAR(2048),
  audio_duration INT,
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id, created_at),
  INDEX (status)
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  generations_used INT DEFAULT 0,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  renewal_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Implementation Checklist

- [ ] Create database tables
- [ ] Implement authentication endpoints
- [ ] Implement project CRUD endpoints
- [ ] Implement generation endpoints
- [ ] Implement subscription endpoints
- [ ] Setup email notifications
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Add error handling
- [ ] Setup logging
- [ ] Add CORS configuration
- [ ] Setup SSL/TLS
- [ ] Test all endpoints
- [ ] Deploy to staging
- [ ] Deploy to production

---

Last Updated: 2026-07-18
