# Command Center Dashboard - Deployment Guide

Complete guide for deploying the Command Center Dashboard to production.

## 📋 Pre-Deployment Checklist

- [ ] All code committed to git
- [ ] Tests passing locally
- [ ] Build succeeding (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates ready
- [ ] Server access verified
- [ ] Backup plan documented

## 🚀 Deployment Methods

### Method 1: Automated Script (Recommended)

**Fastest and safest way to deploy.**

```bash
# Make script executable
chmod +x scripts/deploy-command-center.sh

# Run deployment
./scripts/deploy-command-center.sh
```

**What it does:**
1. Builds backend API
2. Builds frontend
3. Creates deployment package
4. Uploads to production server
5. Starts services
6. Verifies deployment
7. Updates nginx
8. Cleans up temporary files

**Time**: ~5-10 minutes

---

### Method 2: Manual Deployment

**For more control or debugging.**

#### Step 1: Build

```bash
# Build API
cd packages/api
npm run build
npm ci --production
cd ../..

# Build frontend
cd apps/dashboard
npm run build
cd ../..
```

#### Step 2: Create Package

```bash
mkdir -p /tmp/cc-deploy
cp -r packages/api/dist /tmp/cc-deploy/api
cp -r apps/dashboard/.next /tmp/cc-deploy/dashboard
cp packages/api/package.json /tmp/cc-deploy/
```

#### Step 3: Upload to Server

```bash
SERVER="173.208.147.165"
USER="dwise"
DEPLOY_PATH="/opt/wise2/command-center"

# Create directory
ssh $USER@$SERVER "mkdir -p $DEPLOY_PATH"

# Upload files
scp -r /tmp/cc-deploy/api $USER@$SERVER:$DEPLOY_PATH/
scp -r /tmp/cc-deploy/dashboard $USER@$SERVER:$DEPLOY_PATH/
```

#### Step 4: Start Services

```bash
ssh $USER@$SERVER << 'EOF'
  # Stop old services
  pkill -f "node.*api" || true
  pkill -f "next" || true
  sleep 2

  # Start API
  cd /opt/wise2/command-center/api
  NODE_ENV=production npm start > /var/log/cc-api.log 2>&1 &

  # Start frontend
  cd /opt/wise2/command-center/dashboard
  NODE_ENV=production npm start > /var/log/cc-web.log 2>&1 &

  sleep 5
  curl http://localhost:3000/api/status
  curl http://localhost:3001/command-center
EOF
```

---

### Method 3: Docker Deployment

**For containerized environments.**

#### Build Docker Image

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built files
COPY packages/api/dist ./api
COPY apps/dashboard/.next ./dashboard

# Expose ports
EXPOSE 3000 3001

# Start services
CMD ["npm", "start"]
```

**Build and push:**

```bash
docker build -t wise2/command-center:latest .
docker push wise2/command-center:latest
docker run -p 3000:3000 -p 3001:3001 wise2/command-center:latest
```

---

## ⚙️ Environment Variables

Create `.env.production` on the server:

```bash
# API Configuration
NODE_ENV=production
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wise2

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h

# Frontend
NEXT_PUBLIC_API_URL=http://173.208.147.165:3000

# Optional
LOG_LEVEL=info
DEBUG=false
```

---

## 🔐 Security Checklist

- [ ] JWT secrets configured
- [ ] Database credentials secured
- [ ] SSL/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error messages sanitized
- [ ] Logging configured (no sensitive data)
- [ ] Backup strategy in place
- [ ] Monitoring/alerting set up

---

## 📊 Nginx Configuration

Add to nginx site config (`/etc/nginx/sites-available/wise2-dashboard`):

```nginx
upstream api_backend {
    server localhost:3000;
}

upstream web_frontend {
    server localhost:3001;
}

server {
    listen 80;
    server_name 173.208.147.165;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 173.208.147.165;
    
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    
    # API routes
    location /command-center/api {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend routes
    location /command-center {
        proxy_pass http://web_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static assets (with caching)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://web_frontend;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/wise2-dashboard \
           /etc/nginx/sites-enabled/

sudo systemctl reload nginx
```

---

## 🔄 PM2 Process Manager

For production process management:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'cc-api',
      script: './packages/api/dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/cc-api-error.log',
      out_file: '/var/log/cc-api-out.log',
    },
    {
      name: 'cc-web',
      script: './node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: './apps/dashboard',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/cc-web-error.log',
      out_file: '/var/log/cc-web-out.log',
    },
  ],
};
```

Deploy with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
pm2 logs
```

---

## ✅ Post-Deployment Verification

### 1. API Health Check

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://173.208.147.165:3000/command-center/dashboard
```

**Expected response**: Full dashboard data JSON

### 2. Frontend Health Check

```bash
curl http://173.208.147.165:3001/command-center
```

**Expected response**: HTML page (status 200)

### 3. Check Logs

```bash
# API logs
tail -f /var/log/cc-api.log

# Frontend logs
tail -f /var/log/cc-web.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 4. Monitor Processes

```bash
# Check if services running
ps aux | grep "node\|next"

# Check ports
netstat -tlnp | grep 3000
netstat -tlnp | grep 3001
```

---

## 🔙 Rollback Procedure

If deployment fails:

### Quick Rollback

```bash
# Stop current services
ssh dwise@173.208.147.165 "pkill -f node; pkill -f next"

# Revert to previous build
ssh dwise@173.208.147.165 "cd /opt/wise2/command-center && git revert HEAD"

# Restart services
ssh dwise@173.208.147.165 "/opt/wise2/command-center/start.sh"
```

### Full Rollback

```bash
# Restore from backup
ssh dwise@173.208.147.165 << 'EOF'
  cd /opt/wise2/command-center
  git reset --hard HEAD~1
  npm install --production
  npm run build
  pm2 restart all
EOF
```

---

## 📈 Monitoring & Alerts

### Key Metrics to Monitor

- **API Response Time**: Target < 500ms
- **Frontend Load Time**: Target < 2s
- **Error Rate**: Target < 0.1%
- **Uptime**: Target 99.9%
- **Database Connection Pool**: Monitor usage

### Setup Monitoring

```bash
# Install monitoring tools
npm install pm2-monitoring pm2-logrotate

# Configure logrotate
pm2 install pm2-logrotate

# Configure monitoring
pm2 monitor
```

### Health Check Endpoint

The API provides a health check:

```bash
curl http://localhost:3000/api/status
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-09-01T12:00:00Z",
  "uptime": 3600,
  "memory": {
    "used": 128,
    "total": 512
  }
}
```

---

## 🔐 Security Hardening

### 1. Enable HTTPS

```bash
# Generate SSL certificate (Let's Encrypt)
sudo certbot certonly --standalone -d 173.208.147.165

# Configure in nginx
ssl_certificate /etc/letsencrypt/live/173.208.147.165/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/173.208.147.165/privkey.pem;

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 2. Configure Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 3. Setup Rate Limiting

In nginx:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=web_limit:10m rate=1000r/m;

location /command-center/api {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://api_backend;
}
```

### 4. Enable CORS Properly

In API code:

```typescript
app.enableCors({
  origin: ['https://173.208.147.165'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## 🐛 Troubleshooting

### API Not Starting

```bash
# Check logs
tail -f /var/log/cc-api.log

# Check port availability
lsof -i :3000

# Kill existing process
pkill -9 node

# Start manually to see errors
cd /opt/wise2/command-center/api && npm start
```

### Frontend Not Loading

```bash
# Check logs
tail -f /var/log/cc-web.log

# Test nextjs directly
cd /opt/wise2/command-center/dashboard && npm start

# Check port
curl http://localhost:3001/command-center
```

### High Memory Usage

```bash
# Check memory usage
ps aux | grep node

# Increase node memory
NODE_OPTIONS=--max-old-space-size=2048 npm start

# Use clustering
npm install pm2
pm2 start --instances max --exec-mode cluster
```

### Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
# (add debug logging to see pool stats)

# Increase pool size
DATABASE_POOL_SIZE=20 npm start
```

---

## 📋 Deployment Checklist

Before deploying:

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Builds successfully locally
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificate ready
- [ ] Nginx config validated
- [ ] Monitoring set up
- [ ] Rollback plan documented
- [ ] Team notified

After deploying:

- [ ] API responding
- [ ] Frontend loading
- [ ] Dashboard data displaying
- [ ] No error logs
- [ ] Monitoring active
- [ ] Performance acceptable
- [ ] SSL certificate valid
- [ ] Backups created
- [ ] Team notified

---

## 🎯 Deployment Summary

| Component | Method | Time | Risk |
|-----------|--------|------|------|
| Backend API | npm build + scp | ~3 min | Low |
| Frontend | npm build + scp | ~3 min | Low |
| Nginx | Config reload | ~30 sec | Low |
| Database | No migration | N/A | N/A |
| DNS | No change | N/A | N/A |

**Total deployment time**: 5-10 minutes  
**Downtime**: < 1 minute  
**Rollback time**: < 5 minutes  

---

## 📞 Support

For deployment issues:
- Check logs: `/var/log/cc-*.log`
- Verify ports: `netstat -tlnp`
- Test connectivity: `curl http://localhost:PORT`
- Monitor processes: `pm2 monit`
- Review nginx: `sudo nginx -t`

**Emergency contact**: Your operations team or deployment lead

---

**Last updated**: September 1, 2026  
**Status**: ✅ Ready for production deployment
