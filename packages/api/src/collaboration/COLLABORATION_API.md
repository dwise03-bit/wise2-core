# WISE² Studio Collaboration System - Complete API Reference

**Version:** 1.0.0  
**Last Updated:** 2026-07-19  
**Status:** Production-Ready

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication](#authentication)
4. [REST API Endpoints](#rest-api-endpoints)
5. [WebSocket Events](#websocket-events)
6. [Permission Model](#permission-model)
7. [Rate Limiting](#rate-limiting)
8. [Error Handling](#error-handling)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The WISE² Collaboration System enables real-time, multi-user project editing with:

- **Real-time synchronization** (< 100ms presence updates, < 500ms edit sync)
- **Role-based access control** (3 roles, 9 permissions)
- **Comment threading** (track-specific, time-based)
- **Version control** (snapshots, rollback)
- **Audit logging** (14+ activity types)
- **Presence tracking** (active users, cursor positions)
- **Conflict detection** (simultaneous edit handling)
- **Rate limiting** (anti-spam protection)

### Key Features

- **3 Collaboration Roles:** OWNER, EDITOR, VIEWER
- **9 Permission Types:** edit_track, edit_mixer, edit_gallery, edit_metadata, manage_collaborators, manage_versions, export_project, delete_project, share_project
- **WebSocket Namespace:** `/collaboration`
- **Transport Protocols:** WebSocket, long-polling fallback
- **Database:** PostgreSQL with Prisma ORM
- **Real-time Engine:** Socket.IO with room-based messaging

---

## Architecture

### Component Structure

```
CollaborationModule
├── CollaborationGateway (WebSocket handling)
├── CollaborationService (Business logic)
├── CollaborationController (REST API)
├── PermissionGuard (Access control)
├── DTOs (Request validation)
└── Interfaces (Type definitions)
```

### Data Flow

**Incoming Edit:**
```
Client → WebSocket → Gateway → Service → Database → Service → Broadcast → All Clients
```

**Permission Check:**
```
Request → Guard → Service.hasPermission() → Database → True/False → Allow/Deny
```

---

## Authentication

### JWT Token

All API requests and WebSocket connections require JWT authentication.

**Request Header:**
```
Authorization: Bearer eyJhbGc...
```

**WebSocket Handshake:**
```javascript
const socket = io('http://api.example.com/collaboration', {
  auth: {
    token: 'eyJhbGc...'
  },
  query: {
    projectId: 'proj-123'
  }
});
```

**Token Payload Structure:**
```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1689000000,
  "exp": 1689086400
}
```

---

## REST API Endpoints

### 1. Get Project Collaborators

```http
GET /api/projects/:id/collaborators
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "owner-user-123",
    "user": {
      "id": "user-123",
      "email": "owner@example.com",
      "name": "Project Owner"
    },
    "role": "OWNER",
    "permissions": [
      "edit_track",
      "edit_mixer",
      "edit_gallery",
      "edit_metadata",
      "manage_collaborators",
      "manage_versions",
      "export_project",
      "delete_project",
      "share_project"
    ],
    "joinedAt": "2026-07-10T10:00:00Z",
    "lastActiveAt": "2026-07-19T15:30:00Z",
    "status": "active"
  },
  {
    "id": "collab-456",
    "user": {
      "id": "user-456",
      "email": "collaborator@example.com",
      "name": "Collaborator"
    },
    "role": "EDITOR",
    "permissions": [
      "edit_track",
      "edit_mixer",
      "edit_gallery",
      "edit_metadata",
      "manage_versions",
      "export_project",
      "share_project"
    ],
    "joinedAt": "2026-07-15T14:00:00Z",
    "lastActiveAt": "2026-07-19T14:00:00Z",
    "status": "active"
  }
]
```

---

### 2. Send Project Invitation

```http
POST /api/projects/:id/invite
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "invitedEmail": "newuser@example.com",
  "role": "EDITOR",
  "expiresAt": "2026-07-26T00:00:00Z",
  "message": "Let's collaborate on this amazing project!"
}
```

**Response (201 Created):**
```json
{
  "id": "invite-789",
  "projectId": "proj-123",
  "invitedEmail": "newuser@example.com",
  "token": "abc123def456...",
  "role": "EDITOR",
  "expiresAt": "2026-07-26T00:00:00Z",
  "acceptedAt": null,
  "acceptedBy": null,
  "createdAt": "2026-07-19T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email or user already collaborating
- `403 Forbidden` - User lacks `share_project` permission
- `404 Not Found` - Project does not exist

---

### 3. Get Project Comments

```http
GET /api/projects/:id/comments?trackId=track-123
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "comment-101",
    "projectId": "proj-123",
    "userId": "user-456",
    "user": {
      "id": "user-456",
      "email": "collaborator@example.com",
      "name": "Collaborator"
    },
    "content": "This section needs more bass",
    "timestamp": 45.5,
    "trackId": "track-1",
    "threadId": null,
    "mentions": ["user-123"],
    "reactions": {
      "👍": 2,
      "👎": 0
    },
    "resolved": false,
    "createdAt": "2026-07-19T14:00:00Z",
    "updatedAt": "2026-07-19T14:00:00Z"
  }
]
```

---

### 4. Create Comment

```http
POST /api/projects/:id/comments
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Let's add more percussion here",
  "timestamp": 60.0,
  "trackId": "track-2",
  "mentions": ["user-456"]
}
```

**Response (201 Created):**
```json
{
  "id": "comment-102",
  "projectId": "proj-123",
  "userId": "user-123",
  "content": "Let's add more percussion here",
  "timestamp": 60.0,
  "trackId": "track-2",
  "createdAt": "2026-07-19T15:00:00Z",
  "updatedAt": "2026-07-19T15:00:00Z"
}
```

---

### 5. Get Activity History

```http
GET /api/projects/:id/activity
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "activity-1",
    "projectId": "proj-123",
    "userId": "user-123",
    "user": {
      "id": "user-123",
      "email": "owner@example.com",
      "name": "Owner"
    },
    "action": "track_volume_changed",
    "entityType": "track",
    "entityId": "track-1",
    "details": {
      "field": "volume",
      "value": 0.8,
      "timestamp": 1689000000
    },
    "createdAt": "2026-07-19T15:00:00Z"
  },
  {
    "id": "activity-2",
    "projectId": "proj-123",
    "userId": "user-456",
    "user": {
      "id": "user-456",
      "email": "collaborator@example.com",
      "name": "Collaborator"
    },
    "action": "comment_added",
    "entityType": "comment",
    "entityId": "comment-101",
    "details": {
      "commentId": "comment-101",
      "trackId": "track-1"
    },
    "createdAt": "2026-07-19T14:30:00Z"
  }
]
```

---

### 6. Get Version History

```http
GET /api/projects/:id/versions
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "version-1",
    "projectId": "proj-123",
    "userId": "user-123",
    "user": {
      "id": "user-123",
      "email": "owner@example.com",
      "name": "Owner"
    },
    "snapshot": {
      "tracks": [
        {
          "id": "track-1",
          "name": "Drums",
          "volume": 0.8,
          "pan": 0
        }
      ],
      "mixer": {
        "masterVolume": 1.0,
        "bpm": 120
      }
    },
    "label": "Final Mix v2",
    "changeLog": "Reduced drum volume, added reverb",
    "createdAt": "2026-07-19T14:00:00Z"
  }
]
```

---

### 7. Rollback to Version

```http
POST /api/projects/:id/rollback/:versionId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "version-1",
  "projectId": "proj-123",
  "label": "Final Mix v2",
  "createdAt": "2026-07-19T14:00:00Z"
}
```

**Error Responses:**
- `403 Forbidden` - User lacks `manage_versions` permission
- `404 Not Found` - Version does not exist

---

### 8. Update Permissions

```http
PUT /api/projects/:id/permissions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "collaboratorId": "collab-456",
  "role": "VIEWER",
  "reason": "Downgrading to view-only access"
}
```

**Response (200 OK):**
```json
{
  "id": "collab-456",
  "projectId": "proj-123",
  "userId": "user-456",
  "role": "VIEWER",
  "permissions": [],
  "joinedAt": "2026-07-15T14:00:00Z",
  "lastActiveAt": "2026-07-19T14:00:00Z",
  "status": "active"
}
```

---

### 9. Get Active Users

```http
GET /api/projects/:id/active-users
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "userId": "user-123",
    "userName": "Owner",
    "userEmail": "owner@example.com",
    "status": "online",
    "cursorPosition": {
      "x": 150,
      "y": 300,
      "track": "track-1",
      "time": 45.5
    },
    "editingTrackId": "track-1",
    "lastHeartbeat": "2026-07-19T15:05:30Z"
  }
]
```

---

## WebSocket Events

### Connection Handshake

**Client connects:**
```javascript
const socket = io('http://api.example.com/collaboration', {
  auth: { token: 'JWT_TOKEN' },
  query: { projectId: 'proj-123' }
});
```

**Server confirms connection:**
```json
{
  "event": "connection:confirmed",
  "socketId": "socket-abc123",
  "projectId": "proj-123",
  "userId": "user-123",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

---

### Presence Events

#### PRESENCE_JOIN
When a user connects to a project

**Event Name:** `presence:join`

**Data:**
```json
{
  "userId": "user-456",
  "userName": "Collaborator",
  "timestamp": "2026-07-19T15:00:00Z",
  "activeUsers": [
    {
      "userId": "user-123",
      "userName": "Owner",
      "status": "online"
    },
    {
      "userId": "user-456",
      "userName": "Collaborator",
      "status": "online"
    }
  ]
}
```

#### PRESENCE_LEAVE
When a user disconnects

**Event Name:** `presence:leave`

**Data:**
```json
{
  "userId": "user-456",
  "timestamp": "2026-07-19T15:05:00Z",
  "activeUsers": [
    {
      "userId": "user-123",
      "userName": "Owner",
      "status": "online"
    }
  ]
}
```

#### CURSOR_MOVE
Real-time cursor tracking (< 100ms latency)

**Client Sends:**
```json
{
  "userId": "user-123",
  "x": 150,
  "y": 300,
  "track": "track-1",
  "time": 45.5,
  "userName": "Owner",
  "userColor": "#FF5733"
}
```

**Server Broadcasts:**
```json
{
  "userId": "user-123",
  "x": 150,
  "y": 300,
  "track": "track-1",
  "time": 45.5,
  "userName": "Owner",
  "userColor": "#FF5733",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

---

### Edit Events

#### TRACK_EDIT
Real-time track editing (< 500ms sync)

**Client Sends:**
```json
{
  "trackId": "track-1",
  "field": "volume",
  "value": 0.8,
  "timestamp": 1689000000000,
  "conflictResolution": "last-write-wins"
}
```

**Server Broadcasts:**
```json
{
  "trackId": "track-1",
  "field": "volume",
  "value": 0.8,
  "timestamp": "2026-07-19T15:00:00Z",
  "userId": "user-123",
  "conflicts": [
    {
      "userId": "user-456",
      "field": "volume",
      "value": 0.5,
      "timestamp": 1689000000000
    }
  ]
}
```

**Error Response:**
```json
{
  "errorId": "ERR_1689000000_abc123",
  "event": "track:edit",
  "message": "Rate limit exceeded",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

---

### Comment Events

#### COMMENT_ADD
New comment created

**Client Sends:**
```json
{
  "content": "This section needs work",
  "timestamp": 45.5,
  "trackId": "track-1",
  "mentions": ["user-456"]
}
```

**Server Broadcasts:**
```json
{
  "id": "comment-101",
  "projectId": "proj-123",
  "userId": "user-123",
  "content": "This section needs work",
  "timestamp": 45.5,
  "trackId": "track-1",
  "mentions": ["user-456"],
  "reactions": {},
  "resolved": false,
  "timestamp": "2026-07-19T15:00:00Z"
}
```

---

### Version Events

#### VERSION_SNAPSHOT
Version snapshot created

**Client Sends:**
```json
{
  "snapshot": {
    "tracks": [...],
    "mixer": {...}
  },
  "label": "Final Mix v1",
  "changeLog": "Added drums and bass"
}
```

**Server Broadcasts:**
```json
{
  "id": "version-1",
  "projectId": "proj-123",
  "userId": "user-123",
  "snapshot": {...},
  "label": "Final Mix v1",
  "changeLog": "Added drums and bass",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

---

### Error Events

**Format:**
```json
{
  "event": "error",
  "errorId": "ERR_1689000000_abc123",
  "message": "Permission denied: edit_track",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

**Common Error Messages:**
- `User not authenticated` - Invalid or missing JWT
- `Permission denied: <permission>` - Insufficient permissions
- `Rate limit exceeded` - Too many edits in short time
- `Project not found` - Invalid project ID

---

### Heartbeat

**Server sends every 30 seconds:**
```json
{
  "event": "heartbeat:ping",
  "timestamp": "2026-07-19T15:00:30Z"
}
```

**Client responds:**
```json
{
  "event": "heartbeat"
}
```

**Server confirms:**
```json
{
  "event": "heartbeat:ack",
  "timestamp": "2026-07-19T15:00:30Z"
}
```

---

## Permission Model

### Role-Based Access Control

| Permission | OWNER | EDITOR | VIEWER |
|---|---|---|---|
| edit_track | ✅ | ✅ | ❌ |
| edit_mixer | ✅ | ✅ | ❌ |
| edit_gallery | ✅ | ✅ | ❌ |
| edit_metadata | ✅ | ✅ | ❌ |
| manage_collaborators | ✅ | ❌ | ❌ |
| manage_versions | ✅ | ✅ | ❌ |
| export_project | ✅ | ✅ | ❌ |
| delete_project | ✅ | ❌ | ❌ |
| share_project | ✅ | ✅ | ❌ |

---

## Rate Limiting

### Edit Rate Limits

- **Window:** 500ms
- **Max edits:** 10 per track per user
- **Enforcement:** Per-track, per-user

**Rate Limit Calculation:**
```
User can make 10 edits on Track A in 500ms
After 10 edits, subsequent edits rejected until window expires
```

**Response when exceeded:**
```json
{
  "errorId": "ERR_...",
  "message": "Rate limit exceeded",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|---|---|---|
| 200 | Success | Permission check passed |
| 201 | Created | Invitation sent successfully |
| 400 | Bad Request | Invalid email format |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Project does not exist |
| 500 | Server Error | Database connection failed |

### Error Response Format

```json
{
  "statusCode": 403,
  "message": "User does not have permission to edit_track",
  "error": "Forbidden",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

### WebSocket Errors

All WebSocket errors include an `errorId` for debugging:

```json
{
  "errorId": "ERR_1689000000_abc123xyz789",
  "message": "Rate limit exceeded",
  "event": "track:edit",
  "timestamp": "2026-07-19T15:00:00Z"
}
```

---

## Examples

### Example 1: Basic Collaboration Flow

**Step 1: Owner invites collaborator**
```bash
curl -X POST http://api.example.com/api/projects/proj-123/invite \
  -H "Authorization: Bearer owner-token" \
  -H "Content-Type: application/json" \
  -d '{
    "invitedEmail": "collaborator@example.com",
    "role": "EDITOR"
  }'
```

**Step 2: Collaborator accepts invite (via email link)**

**Step 3: Collaborator connects to WebSocket**
```javascript
const socket = io('http://api.example.com/collaboration', {
  auth: { token: 'collaborator-jwt' },
  query: { projectId: 'proj-123' }
});

socket.on('connection:confirmed', (data) => {
  console.log('Connected to project', data.projectId);
});
```

**Step 4: Real-time edits synchronize**
```javascript
socket.emit('track:edit', {
  trackId: 'track-1',
  field: 'volume',
  value: 0.75,
  timestamp: Date.now()
});

socket.on('track:edit', (edit) => {
  console.log('Track edited:', edit);
});
```

---

### Example 2: Version Control

**Step 1: Create version snapshot**
```bash
curl -X POST http://api.example.com/api/projects/proj-123/versions \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Final Mix v1",
    "changeLog": "Added drums and bass"
  }'
```

**Step 2: View version history**
```bash
curl http://api.example.com/api/projects/proj-123/versions \
  -H "Authorization: Bearer token"
```

**Step 3: Rollback if needed**
```bash
curl -X POST http://api.example.com/api/projects/proj-123/rollback/version-1 \
  -H "Authorization: Bearer token"
```

---

### Example 3: Comment Threading

**Add comment:**
```javascript
socket.emit('comment:add', {
  content: "This section needs more bass",
  timestamp: 45.5,
  trackId: "track-1",
  mentions: ["user-456"]
});
```

**Get comments:**
```bash
curl http://api.example.com/api/projects/proj-123/comments?trackId=track-1 \
  -H "Authorization: Bearer token"
```

---

## Troubleshooting

### Connection Issues

**Problem:** `Authentication failed`
- **Solution:** Verify JWT token is valid and not expired
- **Check:** `Authorization` header includes valid Bearer token

**Problem:** `Project not found`
- **Solution:** Verify project ID is correct
- **Check:** Project exists and user has access

### WebSocket Disconnections

**Problem:** Connection drops intermittently
- **Solution:** Implement automatic reconnection with exponential backoff
- **Example:**
```javascript
const socket = io('http://api.example.com/collaboration', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

### Permission Errors

**Problem:** `Permission denied: edit_track`
- **Solution:** User role doesn't have required permission
- **Action:** Upgrade user role or grant specific permissions

**Problem:** Rate limit errors
- **Solution:** Reduce frequency of edits
- **Note:** Aggregate multiple edits and send as single update

### Performance Issues

**Problem:** High latency on edits (> 500ms)
- **Investigate:** Database query performance
- **Action:** Check database indexes and query optimization

**Problem:** Memory leaks with long-running connections
- **Investigate:** Stale presence data not being cleaned up
- **Verify:** Background cleanup job is running (every 60 seconds)

---

## Support

For issues or questions:
1. Check error ID in logs: `ERR_1689000000_abc123`
2. Review API documentation for endpoint and event specifications
3. Verify JWT authentication and permissions
4. Check database connection and Prisma migrations

---

**End of API Reference**
