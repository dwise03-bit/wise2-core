# Wise² Authentication & Authorization Design

**Version**: 1.0  
**Status**: ACTIVE  
**Owner**: Security Lead  
**Last Updated**: 2026-07-07

---

## Overview

Complete authentication and authorization specification for Wise² platform.

**Authentication**: Verifies user identity (who are you?)  
**Authorization**: Verifies user permissions (what can you do?)

---

## 1. Authentication System

### 1.1 Authentication Flow

```
User Login Request
       ↓
Validate Credentials (email + password)
       ↓
Hash password, compare with stored hash
       ↓
Generate JWT Access Token (24h)
       ↓
Generate Refresh Token (7d)
       ↓
Create session record
       ↓
Return tokens to client
```

### 1.2 Login Endpoint

**Request**:
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400,
    "token_type": "Bearer",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "operator"
    }
  }
}
```

### 1.3 JWT Token Structure

**Access Token** (24 hours):
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "operator",
  "permissions": ["deploy:read", "service:restart"],
  "iat": 1620000000,
  "exp": 1620086400,
  "iss": "https://wise2.io",
  "aud": "wise2-api"
}

Signature: HMACSHA256(base64(header) + "." + base64(payload), secret_key)
```

**Refresh Token** (7 days):
```
Payload: {
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1620000000,
  "exp": 1620604800,
  "session_id": "session-uuid"
}
```

### 1.4 Token Refresh

**Request**:
```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400
  }
}
```

### 1.5 Logout Endpoint

**Request**:
```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Action**: 
- Revoke access token
- Revoke refresh token
- Mark session as revoked

### 1.6 Password Requirements

```
Minimum length: 12 characters
Must contain:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (!@#$%^&*)

Example valid password: Secure@Pass123
```

### 1.7 Password Hashing

```
Algorithm: bcrypt
Rounds: 12
Cost factor: 2^12

Process:
1. Generate salt with bcrypt
2. Hash password with salt (12 rounds)
3. Store hash in database
4. Never store plaintext password

Verification:
1. Retrieve hash from database
2. Hash provided password with stored salt
3. Compare hashes (constant-time comparison)
```

### 1.8 Session Management

**Session Table Fields**:
```
id              → Session UUID
user_id         → User UUID
token_hash      → Hash of access token (for lookup)
expires_at      → Token expiration time
revoked_at      → Revocation time (null if active)
ip_address      → Client IP
user_agent      → Client user agent
created_at      → Session creation time
```

**Session Lifecycle**:
1. Created on login
2. Marked as revoked on logout
3. Expired after 24 hours (access token expiration)
4. Cleaned up after 30 days (retention policy)

---

## 2. Authorization System

### 2.1 Role-Based Access Control (RBAC)

**4 Roles Defined**:

```
ADMIN
├── Full system access
├── User management (create, edit, delete)
├── Permission assignment
├── System configuration
├── Backup & recovery
├── Audit log access
└── All other permissions

OPERATOR
├── Deployment monitoring
├── Service management (restart, stop, start)
├── Log viewing
├── Metrics viewing
├── Job execution
├── Service configuration changes
└── Deployment updates

DEVELOPER
├── API read access
├── Service integration
├── Monitoring dashboard access
├── Deployment read-only
├── Automation job creation (own jobs only)
├── Log viewing (own services only)
└── No system-level changes

VIEWER
├── Dashboard read-only
├── Service status viewing
├── Monitoring dashboard (read-only)
├── Log viewing (read-only)
└── No modification capability
```

### 2.2 Permission Matrix

| Resource | Admin | Operator | Developer | Viewer |
|----------|-------|----------|-----------|--------|
| **Users** | CRUD | Read | Read | - |
| **Deployments** | CRUD | Read/Update | Read | Read |
| **Services** | CRUD | Read/Execute | Read | Read |
| **Automation Jobs** | CRUD | CRUD (own) | CRUD (own) | Read |
| **Audit Logs** | Read | - | - | - |
| **System Settings** | CRUD | - | - | - |
| **User Roles** | Assign | - | - | - |

### 2.3 Fine-Grained Permissions

**Permission Naming Convention**: `resource:action`

```
USER MANAGEMENT
  user:read
  user:create
  user:update
  user:delete
  user:assign_role

DEPLOYMENT MANAGEMENT
  deployment:read
  deployment:create
  deployment:update
  deployment:delete
  deployment:deploy
  deployment:rollback

SERVICE MANAGEMENT
  service:read
  service:restart
  service:stop
  service:start
  service:update_config

AUTOMATION
  automation:read
  automation:create
  automation:update
  automation:delete
  automation:execute

MONITORING
  monitoring:view_metrics
  monitoring:view_logs
  monitoring:view_audit

SYSTEM
  system:configure
  system:manage_users
  system:backup
  system:restore
```

### 2.4 Authorization Middleware

**Endpoint Protection**:

```javascript
// Require authentication
app.get('/api/v1/protected', requireAuth, handler);

// Require specific permission
app.post('/api/v1/deployments', 
  requireAuth, 
  requirePermission('deployment:create'), 
  handler);

// Require specific role
app.delete('/api/v1/users/:id', 
  requireAuth, 
  requireRole('admin'), 
  handler);
```

### 2.5 Resource-Level Authorization

**Example: User can only access own deployments**

```javascript
// User can view their deployments
GET /api/v1/users/:userId/deployments

// User can view others' deployments (if role allows)
GET /api/v1/deployments (if has 'deployment:read' permission)

// User cannot access specific user data
GET /api/v1/users/:userId/email (403 Forbidden if not admin)
```

---

## 3. Token-Based Authentication

### 3.1 Bearer Token Usage

**All API requests** (except `/auth/login`):

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Token Validation Process

```
1. Extract token from Authorization header
   - Remove "Bearer " prefix
   - Get token string

2. Verify token signature
   - Use secret key
   - Verify HMACSHA256 signature

3. Check token expiration
   - Compare exp claim with current time
   - Reject if expired

4. Extract user ID from sub claim
   - Load user from database
   - Verify user is active

5. Load permissions
   - Get role from database
   - Resolve permissions from role
   - Add to request context (req.user)

6. Proceed with authorization checks
```

### 3.3 Error Responses

**Invalid/Missing Token (401)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

**Expired Token (401)**:
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token has expired, please refresh",
    "details": {
      "expired_at": "2026-07-08T10:30:00Z"
    }
  }
}
```

**Insufficient Permissions (403)**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions for this action",
    "details": {
      "required_permission": "deployment:delete",
      "user_role": "viewer"
    }
  }
}
```

---

## 4. Security Measures

### 4.1 HTTPS Only

- All authentication endpoints use HTTPS
- Redirect HTTP to HTTPS
- HSTS header: `Strict-Transport-Security: max-age=31536000`

### 4.2 CORS Configuration

```
Access-Control-Allow-Origin: https://dashboard.wise2.io
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### 4.3 Password Security

- Minimum 12 characters
- Complexity requirements (upper, lower, number, special)
- Stored as bcrypt hash (never plaintext)
- No password hints in error messages
- Force password reset on account compromise

### 4.4 Token Security

- Tokens signed with HMACSHA256
- Secret key stored securely (environment variable)
- Tokens never logged
- Token expiration enforced
- Refresh tokens separate from access tokens

### 4.5 Session Security

- Sessions invalidated on logout
- Sessions expire after 24 hours (access token lifetime)
- IP address and user agent tracked
- Unusual activity detection

### 4.6 Rate Limiting

On `/auth/login` endpoint:
- 5 attempts per minute per IP
- Exponential backoff on failure
- Account lockout after 10 failures in 1 hour

### 4.7 Audit Logging

All authentication/authorization events logged:
```
- Login attempts (success/failure)
- Token refresh operations
- Permission changes
- Role assignments
- Failed authorization attempts
- Suspicious activity patterns
```

---

## 5. OAuth2 / Social Login (Future)

**Planned for v2**:
- Google OAuth2
- GitHub OAuth2
- Microsoft Azure AD

**Flow**:
1. User clicks "Login with Google"
2. Redirect to Google authorization endpoint
3. User authorizes Wise²
4. Google redirects back with authorization code
5. Exchange code for ID token
6. Create/update user in Wise²
7. Generate Wise² JWT tokens

---

## 6. Multi-Factor Authentication (Future)

**Planned for v2**:
- TOTP (Time-based One-Time Password)
- SMS verification
- Hardware security keys

---

## 7. Implementation Checklist

### Phase 1A (By July 11)
- [ ] User table schema created
- [ ] Sessions table schema created
- [ ] Password hashing setup (bcrypt)
- [ ] JWT token generation
- [ ] Token validation middleware
- [ ] Login endpoint implemented
- [ ] Logout endpoint implemented
- [ ] Permission matrix defined
- [ ] Role-based access control
- [ ] Authorization middleware

### Phase 2 (By September 1)
- [ ] Refresh token endpoint
- [ ] Password reset functionality
- [ ] Account lockout protection
- [ ] Rate limiting on login
- [ ] Audit logging

### Phase 3+ (Future)
- [ ] OAuth2 integration
- [ ] Multi-factor authentication
- [ ] Session analytics

---

## 8. Testing Requirements

### Unit Tests
- Password hashing and verification
- JWT token generation and validation
- Permission checking logic
- Role resolution

### Integration Tests
- Complete login flow
- Token refresh flow
- Logout flow
- Authorization on protected endpoints
- Rate limiting

### Security Tests
- Expired token rejection
- Invalid token rejection
- Permission boundary tests
- Role-based access tests
- Rate limiting verification

---

## Configuration

### Environment Variables

```
JWT_SECRET=<very-long-random-string>
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400
REFRESH_TOKEN_EXPIRATION=604800
PASSWORD_HASH_ROUNDS=12
SESSION_RETENTION_DAYS=30
LOGIN_RATE_LIMIT_ATTEMPTS=5
LOGIN_RATE_LIMIT_MINUTES=1
ACCOUNT_LOCKOUT_THRESHOLD=10
ACCOUNT_LOCKOUT_DURATION_MINUTES=60
```

---

**Last Updated**: 2026-07-07  
**Review Date**: 2026-10-07  
**Owner**: Security Lead / CTO
