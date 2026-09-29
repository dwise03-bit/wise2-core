# WISE Defense Deployment Guide

## Deployment Status: 🚀 IN PROGRESS

WISE Defense Safety Radar is being deployed to `wisedefensellc.com` with tenant-scoped incident tracking, mesh telemetry, GMRS/HAM radio integration, and SDR monitoring capabilities.

## Architecture

```
wisedefensellc.com (HTTPS)
    ↓ (nginx reverse proxy)
studio_server:3005 (Dashboard app)
    ├─ /wise-defense/* routes (Safety Radar UI)
    ├─ /api/wise-defense/* (NestJS backend)
    └─ /api/* (shared API routes)
```

## Current Deployment

### Server
- **IP**: 173.208.147.165
- **Domain**: wisedefensellc.com
- **SSL Certificate**: Using wise2.net certificate (temporary — see "TODO" below)
- **Nginx**: Reloaded with new server block for wisedefensellc.com

### Services

| Service | Status | Port | Container |
|---------|--------|------|-----------|
| PostgreSQL | ✅ Running | 5432 | wise2-db |
| Redis | ✅ Running | 6379 | wise2-redis |
| NestJS API | ✅ Running | 3000/3010 | wise2-api |
| Website | ✅ Running | 3001/3000 | wise2-website |
| Studio (Dashboard) | 🔨 Building | 3005 | wise2-studio |
| Nginx | ✅ Running | 80/443 | wise2-nginx |

### Database

- **Database**: wise2_prod (PostgreSQL)
- **Schema**: Includes WISE Defense tables:
  - incidents (incident reports with scoring)
  - zones (watch zones for filtering)
  - mesh_nodes (network topology)
  - mesh_telemetry (bandwidth/latency metrics)
  - radio_logs (GMRS/HAM activity)
  - sdr_detections (spectrum analysis)
  - alerts (real-time notifications)
  - family_members (user roster)
  - resiliency_configs (backup/failover)

## Configuration

### Environment Variables

Add to `.env.production` on the server:

```bash
# WISE Defense
WISE_DEFENSE_ENABLED=true
WISE_DEFENSE_API_KEY=__CONFIGURE_IN_SECURE_VAULT__
WISE_DEFENSE_INCIDENT_PROVIDER=__CONFIGURE_IN_SECURE_VAULT__
WISE_DEFENSE_GATEWAY_TOKEN=__CONFIGURE_IN_SECURE_VAULT__
```

### DNS

For full domain functionality, ensure:
```bash
wisedefensellc.com A 173.208.147.165
www.wisedefensellc.com CNAME wisedefensellc.com
```

## Deployment Steps (Completed/Remaining)

### ✅ Completed

- [x] WISE Defense UI built (NextJS pages at `/apps/dashboard/app/wise-defense/`)
- [x] NestJS API endpoints implemented (`/api/wise-defense/*`)
- [x] PostgreSQL schema with incident/zone/mesh/radio/SDR models
- [x] Nginx routing configured for wisedefensellc.com
- [x] Tenant isolation (JWT-based access control)
- [x] Dashboard server block added to nginx.conf
- [x] Health check endpoint (`/api/health/wise-defense`)

### 🔨 In Progress

- Building studio/dashboard docker image with pnpm

### ⏳ TODO (Blocking Production)

- **SSL Certificate**: Generate proper cert for wisedefensellc.com via Let's Encrypt
  ```bash
  # On server with certbot:
  certbot certonly --standalone -d wisedefensellc.com -d www.wisedefensellc.com
  # Update nginx.conf to point to new certs:
  ssl_certificate /etc/nginx/certs/wisedefensellc.com.crt;
  ssl_certificate_key /etc/nginx/certs/wisedefensellc.com.key;
  docker restart wise2-nginx
  ```

- **Incident Provider Adapter**: Connect to real incident source
  - Helium Hotspot mesh events
  - Zigbee network logs
  - GMRS repeater logs
  - Community radio networks

- **Gateway Authentication**: Set up token-based API access
  - Provider gateway token
  - Client tenant isolation verification

- **Real-Time Events**: Configure WebSocket or SSE for live incident streaming

- **Map Provider**: Integrate mapping service (Mapbox/Google Maps)
  - Display incidents geographically
  - Zone boundaries visualization

- **SDR Hardware Driver**: Connect to RTL-SDR or HackRF devices
  - Spectrum monitoring
  - Signal detection

- **Notification Delivery**: Email/SMS/Discord alerts
  - Per-incident severity routing
  - Quiet hours respect

- **Discord Integration**: Custom commands
  - `/wise-defense-status` — incident summary
  - `/wise-defense-zones` — active watch zones
  - `/wise-defense-alert <type>` — create manual incident

- **Automated Tests**: Full test coverage
  - E2E tests for dashboard navigation
  - API endpoint tests
  - Tenant isolation verification
  - Incident normalization pipeline

## Verification

Once the studio container is running:

```bash
# Check container status
docker ps | grep studio

# Check logs
docker logs wise2-studio

# Test endpoint (from server)
curl -H "Host: wisedefensellc.com" https://localhost/wise-defense/dashboard
```

## Next Steps

1. ✅ Monitor docker build completion
2. Start studio container: `docker-compose -f docker-compose.prod.yml up -d studio`
3. Verify dashboard is accessible at https://wisedefensellc.com/wise-defense/dashboard
4. Test API endpoints at https://api.wisedefensellc.com/api/wise-defense/dashboard
5. Generate proper SSL certificate for wisedefensellc.com
6. Configure incident provider adapter
7. Set up real-time event streaming
8. Enable Discord bot integration

## Troubleshooting

### Studio container won't start
- Check logs: `docker logs wise2-studio`
- Verify dependencies built correctly
- Ensure PORT env var is set to 3005

### nginx routing not working
- Verify config: `docker exec wise2-nginx nginx -t`
- Check logs: `docker exec wise2-nginx tail -f /var/log/nginx/error.log`
- Ensure upstream `studio_server` resolves correctly

### Database connection issues
- Check PostgreSQL: `docker exec wise2-db pg_isready`
- Verify DATABASE_URL in .env.production
- Check migration status

## Support

For issues, check:
- Server logs: `/home/dwise/wise2-core/logs/`
- Docker logs: `docker logs <container_name>`
- Nginx logs: `/var/log/nginx/{access,error}.log`

---

**Last Updated**: 2026-08-18  
**Deployment Status**: 🔨 Studio build in progress
