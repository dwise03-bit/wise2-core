# WISE² Podcast Music - API Examples

Complete curl examples for testing all endpoints. Run these in order for a full workflow.

## Setup

```bash
# Base URL
BASE_URL="http://localhost:3003"

# Store token for later requests
TOKEN=""
PROJECT_ID=""
AUDIO_GENERATION_ID=""
```

## 1. Authentication Endpoints

### Register New User

```bash
curl -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123"
  }' | jq .
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "testuser@example.com",
      "name": "Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

```bash
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123"
  }' | jq .
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "testuser@example.com",
      "name": "Test User",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "subscription": {
      "plan": "STARTER",
      "status": "TRIALING",
      "currentPeriodEnd": "2024-08-01T12:34:56.000Z"
    }
  }
}
```

**Save token for next requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 2. Project Management Endpoints

### Create Podcast Project

```bash
curl -X POST $BASE_URL/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Talk Episode 1 - Intro Music",
    "description": "Background music for the intro segment",
    "podcastName": "Tech Talk Daily",
    "podcastCategory": "Technology",
    "episodeNumber": 1,
    "releaseDate": "2024-07-20",
    "mood": "upbeat",
    "duration": 300,
    "genre": "electronic"
  }' | jq .
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "userId": "clx...",
    "title": "Tech Talk Episode 1 - Intro Music",
    "podcastName": "Tech Talk Daily",
    "mood": "upbeat",
    "status": "DRAFT",
    "createdAt": "2024-07-18T10:00:00.000Z",
    "updatedAt": "2024-07-18T10:00:00.000Z"
  }
}
```

**Save project ID:**
```bash
PROJECT_ID="clx..."
```

### List All Projects

```bash
curl -X GET "$BASE_URL/api/projects?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "clx...",
        "title": "Tech Talk Episode 1 - Intro Music",
        "status": "DRAFT",
        "createdAt": "2024-07-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 10,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### List Projects by Status

```bash
curl -X GET "$BASE_URL/api/projects?status=DRAFT&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Get Project Details

```bash
curl -X GET "$BASE_URL/api/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Response includes music generations:
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "title": "Tech Talk Episode 1 - Intro Music",
    "podcastName": "Tech Talk Daily",
    "musicGenerations": [
      {
        "id": "aud...",
        "status": "COMPLETED",
        "progress": 100
      }
    ]
  }
}
```

### Update Project

```bash
curl -X PUT "$BASE_URL/api/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Talk Episode 1 - Intro Music (Updated)",
    "mood": "calm",
    "description": "Updated description"
  }' | jq .
```

### Delete Project

```bash
curl -X DELETE "$BASE_URL/api/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

## 3. Audio Generation Endpoints

### Start Audio Generation Job

```bash
curl -X POST "$BASE_URL/api/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "podcastProjectId": "'$PROJECT_ID'",
    "prompt": "Create upbeat electronic music for a technology podcast intro. Should be energetic, modern, and professional.",
    "aiModel": "default",
    "seed": 42
  }' | jq .
```

Response (202 Accepted):
```json
{
  "success": true,
  "data": {
    "audioGeneration": {
      "id": "aud...",
      "jobId": "job_1721309400_abc123",
      "status": "QUEUED",
      "progress": 0,
      "prompt": "Create upbeat electronic music...",
      "aiModel": "default",
      "createdAt": "2024-07-18T10:00:00.000Z"
    },
    "message": "Audio generation job submitted successfully"
  }
}
```

**Save audio generation ID and job ID:**
```bash
AUDIO_GENERATION_ID="aud..."
JOB_ID="job_1721309400_abc123"
```

### Check Generation Job Status

```bash
curl -X GET "$BASE_URL/api/generate?jobId=$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "aud...",
    "jobId": "job_1721309400_abc123",
    "status": "PROCESSING",
    "progress": 45,
    "prompt": "Create upbeat electronic music...",
    "createdAt": "2024-07-18T10:00:00.000Z",
    "updatedAt": "2024-07-18T10:00:30.000Z"
  }
}
```

### Poll for Completion (Shell Script)

```bash
#!/bin/bash

JOB_ID="$1"
TOKEN="$2"
MAX_WAIT=300  # 5 minutes
POLL_INTERVAL=2

start_time=$(date +%s)

while true; do
  response=$(curl -s -X GET "$BASE_URL/api/generate?jobId=$JOB_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  status=$(echo "$response" | jq -r '.data.status')
  progress=$(echo "$response" | jq -r '.data.progress')
  
  echo "[$progress%] Status: $status"
  
  if [[ "$status" == "COMPLETED" ]]; then
    echo "Generation complete!"
    break
  fi
  
  if [[ "$status" == "FAILED" ]]; then
    echo "Generation failed!"
    echo "$response" | jq .
    exit 1
  fi
  
  current_time=$(date +%s)
  elapsed=$((current_time - start_time))
  
  if [[ $elapsed -gt $MAX_WAIT ]]; then
    echo "Timeout waiting for generation"
    exit 1
  fi
  
  sleep $POLL_INTERVAL
done
```

Usage:
```bash
./poll_generation.sh "$JOB_ID" "$TOKEN"
```

## 4. Download Endpoints

### Get Audio File Metadata

```bash
curl -I "$BASE_URL/api/download?audioGenerationId=$AUDIO_GENERATION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Response headers:
```
Content-Type: audio/mpeg
Content-Length: 524288
X-Audio-Duration: 300
X-Audio-Status: COMPLETED
```

### Download Audio File

```bash
curl -X GET "$BASE_URL/api/download?audioGenerationId=$AUDIO_GENERATION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  --output podcast_music.mp3
```

Verify download:
```bash
ls -lh podcast_music.mp3
file podcast_music.mp3
```

### Download with Progress Bar

```bash
curl -# -X GET "$BASE_URL/api/download?audioGenerationId=$AUDIO_GENERATION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -o podcast_music.mp3
```

## 5. Subscription Endpoints

### Get Current Subscription

```bash
curl -X GET "$BASE_URL/api/subscription" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "sub...",
    "userId": "clx...",
    "stripeCustomerId": "cus_...",
    "stripeSubscriptionId": null,
    "status": "TRIALING",
    "plan": "STARTER",
    "currentPeriodStart": "2024-07-18T00:00:00.000Z",
    "currentPeriodEnd": "2024-08-01T00:00:00.000Z",
    "createdAt": "2024-07-18T10:00:00.000Z"
  }
}
```

### Create Subscription

```bash
curl -X POST "$BASE_URL/api/subscription" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethodId": "pm_test_123456",
    "priceId": "price_1234567890"
  }' | jq .
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub...",
      "status": "ACTIVE",
      "plan": "PRO",
      "currentPeriodEnd": "2024-08-18T00:00:00.000Z"
    },
    "message": "Subscription created successfully"
  }
}
```

### Cancel Subscription

```bash
curl -X DELETE "$BASE_URL/api/subscription" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "No longer needed"
  }' | jq .
```

Response:
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub...",
      "status": "CANCELED",
      "canceledAt": "2024-07-18T10:05:00.000Z"
    },
    "message": "Subscription cancelled successfully"
  }
}
```

## 6. Health Check (No Auth)

```bash
curl -X GET "$BASE_URL/api/health" | jq .
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-07-18T10:00:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

## Error Handling Examples

### Invalid Token

```bash
curl -X GET "$BASE_URL/api/projects" \
  -H "Authorization: Bearer invalid_token"
```

Response (401):
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

### Validation Error

```bash
curl -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "short"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "code": "invalid_string",
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```

### Forbidden Access

```bash
# Create project with one user
PROJECT_ID_1=$(curl -s -X POST "$BASE_URL/api/projects" \
  -H "Authorization: Bearer $TOKEN_1" \
  -H "Content-Type: application/json" \
  -d '{"title": "Project 1", "podcastName": "Podcast 1"}' \
  | jq -r '.data.id')

# Try to access with different user
curl -X GET "$BASE_URL/api/projects/$PROJECT_ID_1" \
  -H "Authorization: Bearer $TOKEN_2"
```

Response (403):
```json
{
  "success": false,
  "error": "You do not have access to this project",
  "code": "FORBIDDEN"
}
```

## Batch Testing Script

```bash
#!/bin/bash

set -e

BASE_URL="http://localhost:3003"

echo "=== WISE² Podcast Music API Test Suite ==="

# Test 1: Health check
echo "1. Health Check..."
curl -X GET "$BASE_URL/api/health"
echo -e "\n\n"

# Test 2: Signup
echo "2. Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "name": "Test User",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }')

TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.token')
echo "Token: $TOKEN"
echo -e "\n\n"

# Test 3: Create project
echo "3. Create Project..."
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "podcastName": "Test Podcast",
    "mood": "upbeat"
  }')

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.data.id')
echo "Project ID: $PROJECT_ID"
echo -e "\n\n"

# Test 4: List projects
echo "4. List Projects..."
curl -s -X GET "$BASE_URL/api/projects" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n\n"

# Test 5: Get subscription
echo "5. Get Subscription..."
curl -s -X GET "$BASE_URL/api/subscription" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n\n=== All tests passed! ==="
```

Run it:
```bash
chmod +x test_api.sh
./test_api.sh
```

## Load Testing with Apache Bench

```bash
# Test health endpoint
ab -n 100 -c 10 http://localhost:3003/api/health

# Test authenticated endpoint (replace TOKEN)
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  http://localhost:3003/api/projects
```

## Postman Collection

Import into Postman for interactive testing:

```json
{
  "info": {
    "name": "WISE² Podcast Music API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/signup",
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"test@example.com\", \"name\": \"Test\", \"password\": \"Pass123\", \"confirmPassword\": \"Pass123\"}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3003"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```
