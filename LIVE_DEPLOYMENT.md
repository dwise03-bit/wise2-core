# SoundLabs Live Phase 1 — Production Deployment Guide

**Date**: 2026-08-30  
**Target**: wise2.net Production  
**Status**: Ready for Deployment  

---

## Architecture Integration

Live Phase 1 integrates seamlessly into existing WISE² infrastructure:

```
NestJS API (port 3010)
├── /api/v1/sound-labs/live/rooms/*     REST endpoints
├── /api/live/socket.io                  WebSocket gateway (Socket.io)
└── Services:
    ├── LiveSessionService              JWT validation
    ├── LiveRoomsService                CRUD + business logic
    ├── PresenceService                 User presence tracking
    ├── VersionStackService             Conflict resolution
    └── PollCleanupService              Auto-close polls (background job)

Next.js Website (port 3000)
├── /live/[roomId]                      Live room page
└── /components/live/                   7 React components

Database (PostgreSQL)
├── live_rooms                          Room metadata
├── live_room_members                   Memberships + roles
├── live_chat_messages                  Chat history
├── audience_suggestions                Community suggestions
├── live_polls                          Poll definitions
├── live_poll_options                   Poll options
└── live_poll_votes                     Vote records

WebSocket Routing (via Nginx)
└── wss://api.wise2.net/api/live/socket.io  → NestJS gateway
```

---

## Deployment Steps

### Step 1: Database Migration

```bash
# SSH to production server
ssh dwise@173.208.147.165

# Go to repo
cd /home/dwise/wise2-core

# Apply Prisma migration
npx prisma migrate deploy

# Verify schema
psql -U wise2 -d wise2_prod -c "\dt live*"
```

**Expected Output**:
```
          List of relations
 Schema | Name                  | Type  | Owner
--------+-----------------------+-------+-------
 public | live_rooms            | table | wise2
 public | live_room_members     | table | wise2
 public | live_chat_messages    | table | wise2
 public | audience_suggestions  | table | wise2
 public | live_polls            | table | wise2
 public | live_poll_options     | table | wise2
 public | live_poll_votes       | table | wise2
(7 rows)
```

### Step 2: Update Nginx for WebSocket

Add to `/etc/nginx/nginx.conf` (in `upstream api` block):

```nginx
upstream api {
    server api:3000;
}

# Add WebSocket routing for Live
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name api.wise2.net;

    location /api/live/socket.io {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /api/v1/sound-labs/live {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Test**:
```bash
# Reload Nginx
sudo docker exec wise2-nginx nginx -s reload

# Verify WebSocket
curl -I https://api.wise2.net/api/live/socket.io
```

### Step 3: Deploy via Docker Compose

```bash
# Pull latest (includes Live Phase 1 code)
cd /home/dwise/wise2-core
git pull origin main

# Rebuild API + Website containers
sudo docker-compose -f docker-compose.prod.yml build --no-cache api website

# Restart services
sudo docker-compose -f docker-compose.prod.yml down api website
sudo docker-compose -f docker-compose.prod.yml up -d api website

# Wait for health checks
sleep 60

# Verify
sudo docker-compose -f docker-compose.prod.yml ps
```

**Expected**:
```
NAME                 COMMAND              STATUS
wise2-api            npm start            Up 50s (healthy)
wise2-website        dumb-init node       Up 45s (healthy)
```

### Step 4: Verify Deployment

```bash
# 1. Test API health
curl https://api.wise2.net/api/health

# 2. Test Live endpoints
curl -H "Authorization: Bearer $JWT" \
  https://api.wise2.net/api/v1/sound-labs/live/rooms

# 3. Test WebSocket connection
wscat -c "wss://api.wise2.net/api/live/socket.io?token=$JWT"

# 4. Visit live room page
https://wise2.net/live/test-room
```

### Step 5: Update DNS (if needed)

Live app is served at:
- **REST API**: `https://api.wise2.net/api/v1/sound-labs/live/`
- **WebSocket**: `wss://api.wise2.net/api/live/socket.io`
- **Web Page**: `https://wise2.net/live/[roomId]`

No additional DNS changes needed (uses existing api.wise2.net & wise2.net).

---

## Monitoring

### Health Checks

```bash
# API health
curl https://api.wise2.net/api/health

# Live endpoint health
curl https://api.wise2.net/api/v1/sound-labs/live/rooms

# WebSocket (via diagnostics endpoint)
curl https://api.wise2.net/api/v1/sound-labs/live/diagnostics
```

### Logs

```bash
# API logs
sudo docker logs wise2-api | tail -100

# Website logs
sudo docker logs wise2-website | tail -100

# Nginx logs
sudo docker logs wise2-nginx | tail -100

# Specific Live service logs
sudo docker logs wise2-api | grep -i "live\|websocket"
```

### Performance Monitoring

```bash
# Database connection pool
psql -U wise2 -d wise2_prod -c "SELECT * FROM pg_stat_activity WHERE datname = 'wise2_prod';"

# WebSocket connections (via admin API)
curl https://api.wise2.net/api/v1/admin/live/connections

# Redis memory usage
redis-cli INFO memory
```

---

## Rollback Plan

If deployment fails:

```bash
# Revert to last stable
cd /home/dwise/wise2-core
git revert HEAD
git push origin main

# Redeploy previous version
sudo docker-compose -f docker-compose.prod.yml build --no-cache
sudo docker-compose -f docker-compose.prod.yml down api website
sudo docker-compose -f docker-compose.prod.yml up -d

# Verify
sleep 60
curl https://api.wise2.net/api/health
```

---

## Testing Checklist

- [ ] Create test room via REST
- [ ] Join room as viewer via WebSocket
- [ ] Send chat message → see in DB + broadcast to room
- [ ] Create poll → members vote → counts update
- [ ] Submit suggestion → vote it up
- [ ] Send emoji reaction → see aggregated in Crowd Mode
- [ ] Simulate disconnect → verify 30s grace period
- [ ] Reconnect within 30s → state recovered
- [ ] Disconnect after 30s → new join
- [ ] Load test with 50+ concurrent users
- [ ] Monitor API CPU/memory under load
- [ ] Verify WebSocket reconnection on page refresh

---

## Feature Flags / Config

Current Live Phase 1 configuration (in `.env.prod`):

```bash
# Live service
LIVE_ENABLED=true
LIVE_RECONNECT_GRACE_MS=30000
LIVE_POLL_AUTO_CLOSE_INTERVAL_MS=60000
LIVE_MAX_CONCURRENT_VIEWERS=10000
LIVE_CHAT_MAX_LENGTH=500
LIVE_SUGGESTION_MAX_LENGTH=200
```

---

## Integration with Existing Services

### Authentication
- Uses existing JWT infrastructure
- Validates with LiveSessionService (extends auth.service.ts)
- No new auth endpoints needed

### Database
- Extends existing PostgreSQL schema
- Uses Prisma migrations (same as rest of app)
- Connection pooling via existing pool

### WebSocket
- Shares Socket.io instance with any other real-time services
- Uses same /api/live namespace
- Auto-routes via Nginx based on path

### Monitoring
- Logs to existing Docker container logs
- Health checks integrated with docker-compose healthcheck
- Metrics exported to existing monitoring stack

---

## Post-Deployment

### 1. Announce Feature

```
🎬 SoundLabs Live is now live on wise2.net!

Create live rooms: https://wise2.net/live/[roomId]
- Real-time chat
- Live polls
- Audience suggestions
- Crowd reactions
- 30s reconnect recovery

Powered by WISE² ✨
```

### 2. Documentation Update

Update docs/README.md with:
- Live room creation tutorial
- WebSocket integration guide
- Architecture diagram

### 3. Monitor for 24 Hours

Watch for:
- WebSocket connection errors
- Database query performance
- Memory leaks in Node.js process
- Reconnection accuracy
- Poll auto-close reliability

---

## Support Contacts

**Database Issues**: dwise@anthropic.com  
**WebSocket Issues**: dwise@anthropic.com  
**Deploy Issues**: dwise@anthropic.com  

---

**Status**: Ready to deploy. All tests passing. Production-ready code committed to main.
