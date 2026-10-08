# Blakkhail Admin Authentication System

This document explains the Blakkhail admin authentication system that handles owner/admin login and session management.

## Overview

The Blakkhail admin system consists of:
- **Admin Server** (`services/blakkhail-admin.js`) - Node.js service running on port 3014
- **Login Page** (`command-center-ui/dist/blakkhail-admin-login.html`) - Web interface for authentication
- **Admin Dashboard** (`command-center-ui/dist/blakkhail-admin-dashboard.html`) - Post-login dashboard

## Owner Account

**Email:** `blakkhail@gmail.com`
**Password:** `Piffcity`

## Getting Started

### 1. Start the Admin Server

```bash
# Using the startup script
./scripts/start-blakkhail-admin.sh

# Or manually
node services/blakkhail-admin.js
```

The server runs on `http://127.0.0.1:3014`

### 2. Access the Login Page

Navigate to the login page served by the command-center HTTP server:
```
http://localhost:3011/blakkhail-admin-login.html
```

### 3. Login with Owner Credentials

- **Email:** `blakkhail@gmail.com`
- **Password:** `Piffcity`

After successful login, you'll be redirected to the admin dashboard.

## API Endpoints

### Health Check
```bash
curl http://localhost:3014/api/health
```

### Login
```bash
curl -X POST http://localhost:3014/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"blakkhail@gmail.com","password":"Piffcity"}'
```

Response:
```json
{
  "success": true,
  "token": "c6f5c9ec07273e04d18a310ca3377afe2d08032781580d0cfd8087b6feee0678",
  "expiresAt": "2026-10-09T02:48:53.500Z",
  "user": {
    "email": "blakkhail@gmail.com",
    "role": "owner",
    "id": "f5c4411a01befb084d5d2081e2517685"
  }
}
```

### Verify Session
```bash
curl -X POST http://localhost:3014/api/auth/verify \
  -H "Authorization: Bearer {token}"
```

### Get Admin Info
```bash
curl http://localhost:3014/api/admin/info \
  -H "Authorization: Bearer {token}"
```

### Logout
```bash
curl -X POST http://localhost:3014/api/auth/logout \
  -H "Authorization: Bearer {token}"
```

## Session Management

- Sessions are stored in `/tmp/blakkhail-sessions.json`
- Tokens are valid for 24 hours
- Sessions are validated on every request
- Expired sessions are automatically marked as invalid

## Admin Account Storage

Admin accounts are stored in `/tmp/blakkhail-admin.json` with SHA-256 hashed passwords:

```json
{
  "accounts": [
    {
      "id": "f5c4411a01befb084d5d2081e2517685",
      "email": "blakkhail@gmail.com",
      "passwordHash": "...",
      "role": "owner",
      "createdAt": "2026-10-07T02:48:53.500Z",
      "active": true
    }
  ]
}
```

## Security Features

- **Password Hashing:** SHA-256 hashing (production should use bcrypt)
- **Session Tokens:** Cryptographically secure random tokens
- **Expiration:** 24-hour session expiration
- **CORS:** Enabled for local development (can be restricted in production)
- **Localhost Binding:** Server binds to 127.0.0.1 only (not exposed to network)

## Adding New Admin Accounts

To add a new admin account, edit `/tmp/blakkhail-admin.json` and add a new entry to the `accounts` array:

```json
{
  "id": "unique-id-here",
  "email": "admin@example.com",
  "passwordHash": "sha256-hash-of-password",
  "role": "admin",
  "createdAt": "2026-10-07T02:48:53.500Z",
  "active": true
}
```

Generate the password hash using Node.js:
```javascript
const crypto = require('crypto');
const password = 'your-password';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log(hash);
```

## Development Mode

The login page includes demo credentials that auto-fill when accessed from localhost:
- When you load the login page on `localhost` or `127.0.0.1`, the email field is pre-filled
- This is only active in development mode

## Troubleshooting

### Port 3014 Already in Use
```bash
# Find what's using the port
lsof -i :3014

# Kill the process
kill -9 <PID>

# Then restart the server
./scripts/start-blakkhail-admin.sh
```

### Login Not Working
1. Verify the admin server is running: `curl http://localhost:3014/api/health`
2. Check the logs: `tail -f /tmp/blakkhail-admin.log`
3. Verify credentials in `/tmp/blakkhail-admin.json`

### Session Token Expired
Session tokens expire after 24 hours. Users need to log in again.

## Files Modified/Created

- `services/blakkhail-admin.js` - Admin authentication server
- `command-center-ui/dist/blakkhail-admin-login.html` - Login page
- `command-center-ui/dist/blakkhail-admin-dashboard.html` - Admin dashboard
- `scripts/start-blakkhail-admin.sh` - Startup script
- `/tmp/blakkhail-admin.json` - Admin accounts (created on first run)
- `/tmp/blakkhail-sessions.json` - Active sessions (created on first login)

## Next Steps

1. ✅ Basic authentication working
2. ⬜ Database integration for persistent storage
3. ⬜ Password reset functionality
4. ⬜ Admin user management UI
5. ⬜ Audit logging
6. ⬜ 2FA support
7. ⬜ Production security hardening (bcrypt, HTTPS, etc.)
