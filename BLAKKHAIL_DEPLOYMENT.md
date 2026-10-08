# Blakkhail Admin System - Deployment Guide

This guide explains how to deploy the Blakkhail admin authentication system to production.

## Deployment Architecture

```
blakkhail.com (nginx reverse proxy)
    ↓
    ├─→ :3011 (command-center-ui/dist) - Frontend & Static Files
    │   ├─ /blakkhail-admin-login.html
    │   ├─ /blakkhail-admin-dashboard.html
    │   └─ ... (other static files)
    │
    └─→ :3014 (blakkhail-admin server) - Authentication API
        ├─ /api/auth/login
        ├─ /api/auth/verify
        ├─ /api/auth/logout
        └─ /api/admin/info
```

## Local Development Setup

### 1. Start the Services

```bash
# Terminal 1: Start the frontend server (port 3011)
cd wise2-level-up/command-center-ui
python3 -m http.server 3011 --bind 0.0.0.0 --directory dist

# Terminal 2: Start the admin backend (port 3014)
cd wise2-level-up
./scripts/start-blakkhail-admin.sh
```

### 2. Access the Login Page

```
http://localhost:3011/blakkhail-admin-login.html
```

### 3. Login Credentials

- **Email:** blakkhail@gmail.com
- **Password:** Piffcity

## Production Deployment

### Option 1: Using Systemd (Recommended for Linux)

```bash
# Copy the service file
sudo cp services/blakkhail-admin.service /etc/systemd/system/

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable blakkhail-admin
sudo systemctl start blakkhail-admin

# Check status
sudo systemctl status blakkhail-admin

# View logs
sudo journalctl -u blakkhail-admin -f
```

### Option 2: Using PM2 (Node.js Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start services/blakkhail-admin.js --name "blakkhail-admin"

# Make it auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs blakkhail-admin
```

### Option 3: Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-slim

WORKDIR /app

COPY services/blakkhail-admin.js .

EXPOSE 3014

ENV BLAKKHAIL_ADMIN_PORT=3014

CMD ["node", "blakkhail-admin.js"]
```

Build and run:

```bash
docker build -t blakkhail-admin .
docker run -d -p 3014:3014 \
  -v /tmp:/tmp \
  --name blakkhail-admin \
  blakkhail-admin
```

## Nginx Configuration

Add this to your nginx config to proxy requests:

```nginx
upstream blakkhail_frontend {
    server 127.0.0.1:3011;
}

upstream blakkhail_admin {
    server 127.0.0.1:3014;
}

server {
    listen 80;
    server_name blakkhail.com www.blakkhail.com;

    # Static files and frontend
    location / {
        proxy_pass http://blakkhail_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin API
    location /api/ {
        proxy_pass http://blakkhail_admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Enable CORS headers for API
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # SSL Configuration (if using Let's Encrypt)
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/blakkhail.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blakkhail.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name blakkhail.com www.blakkhail.com;
    return 301 https://$server_name$request_uri;
}
```

## Environment Variables

```bash
# Optional: Set custom admin port (default: 3014)
export BLAKKHAIL_ADMIN_PORT=3014

# Optional: Node environment
export NODE_ENV=production
```

## Database Migration (Optional)

If migrating from file-based storage to a database, update the admin server to use:

- PostgreSQL
- MongoDB
- MySQL
- SQLite

Example PostgreSQL migration:

```javascript
// In blakkhail-admin.js, replace file-based storage:
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Update getAdminAccounts() to query database
// Update saveSessions() to insert into database
```

## Security Hardening for Production

1. **Use bcrypt instead of SHA-256:**
   ```bash
   npm install bcrypt
   ```
   Update password hashing in admin server.

2. **Enable HTTPS/SSL:**
   - Use Let's Encrypt with Certbot
   - Configure in nginx

3. **Add Rate Limiting:**
   ```nginx
   limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
   limit_req zone=login burst=20 nodelay;
   ```

4. **Enable 2FA:**
   ```bash
   npm install speakeasy qrcode
   ```

5. **Add Audit Logging:**
   - Log all login attempts
   - Log admin actions
   - Store in database

6. **Restrict Admin Access:**
   - Only allow from specific IPs
   - Use VPN/bastion host

7. **Update Secrets Management:**
   - Use environment variables
   - Use secrets manager (AWS Secrets Manager, HashiCorp Vault)
   - Never commit credentials to git

## Health Checks

Monitor the admin service:

```bash
# Health check endpoint
curl http://blakkhail.com/api/health

# Expected response:
# {"status":"ok","service":"blakkhail-admin"}
```

Add to monitoring (Prometheus, Datadog, New Relic):

```
GET /api/health every 30 seconds
```

## Troubleshooting Production Issues

### Port Already in Use

```bash
# Find process using port 3014
lsof -i :3014

# Kill the process
kill -9 <PID>

# Restart the service
systemctl restart blakkhail-admin
```

### High Memory Usage

Check logs and increase Node.js memory:

```bash
# In systemd service:
ExecStart=/usr/bin/node --max-old-space-size=512 /path/to/blakkhail-admin.js
```

### Session Store Issues

Clear old sessions:

```bash
# Backup first
cp /tmp/blakkhail-sessions.json /tmp/blakkhail-sessions.json.backup

# Clear sessions
echo '{"sessions":[]}' > /tmp/blakkhail-sessions.json

# Restart service
systemctl restart blakkhail-admin
```

## Rollback Procedure

If issues occur after deployment:

```bash
# Stop the service
systemctl stop blakkhail-admin

# Revert git changes
git revert HEAD

# Rebuild and restart
systemctl start blakkhail-admin
```

## Performance Metrics

Monitor these metrics:

- **Response Time:** Login should complete in <500ms
- **Error Rate:** Should be <0.1% (excluding invalid credentials)
- **Uptime:** Target 99.9% availability
- **Session Count:** Active sessions per hour

## Next Steps

1. ✅ Local development working
2. ⬜ Deploy to staging server
3. ⬜ Run security audit
4. ⬜ Set up monitoring/logging
5. ⬜ Deploy to production
6. ⬜ Monitor for 24 hours
7. ⬜ Optimize performance

## Support

For issues or questions:

```bash
# View service logs
systemctl status blakkhail-admin
journalctl -u blakkhail-admin -f

# Check admin server directly
curl http://localhost:3014/api/health

# Test login
curl -X POST http://localhost:3014/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"blakkhail@gmail.com","password":"Piffcity"}'
```
