# WISE² Raspberry Pi - Quick Reference

## Essential Commands

### Service Management

```bash
# Start all services
docker-compose -f docker-compose.pi.yml up -d

# Stop all services
docker-compose -f docker-compose.pi.yml down

# Restart specific service
docker-compose -f docker-compose.pi.yml restart api

# View running services
docker-compose -f docker-compose.pi.yml ps

# View logs
docker-compose -f docker-compose.pi.yml logs -f api

# Pull latest images
docker-compose -f docker-compose.pi.yml pull
```

### Health Checks

```bash
# Test API
curl http://localhost:3000/health

# Test Website
curl http://localhost:3001

# Test Database
docker-compose -f docker-compose.pi.yml exec postgres \
    psql -U wise2 -d wise2_prod -c "SELECT 1;"

# Test Redis
docker-compose -f docker-compose.pi.yml exec redis \
    redis-cli PING
```

### Resource Monitoring

```bash
# Real-time resource usage
docker stats

# Memory usage summary
free -h

# Disk usage
df -h

# Pi temperature
vcgencmd measure_temp

# CPU/Memory per service
docker stats --no-stream --format \
    "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
```

### Database Operations

```bash
# Open database console
docker-compose -f docker-compose.pi.yml exec postgres \
    psql -U wise2 -d wise2_prod

# Backup database
docker-compose -f docker-compose.pi.yml exec postgres \
    pg_dump -U wise2 wise2_prod | gzip > backup.sql.gz

# Restore database
docker-compose -f docker-compose.pi.yml exec -T postgres \
    psql -U wise2 -d wise2_prod < backup.sql

# List tables
docker-compose -f docker-compose.pi.yml exec postgres \
    psql -U wise2 -d wise2_prod -c "\dt"
```

### Network

```bash
# Get Pi IP address
hostname -I

# Get specific interface
ip addr show | grep inet

# Test internet connectivity
ping -c 4 8.8.8.8

# Test DNS
nslookup google.com

# Network interface info
ip link show
```

### Log Management

```bash
# View API logs (last 100 lines)
docker-compose -f docker-compose.pi.yml logs --tail=100 api

# Follow API logs in real-time
docker-compose -f docker-compose.pi.yml logs -f api

# View all logs from specific time
docker-compose -f docker-compose.pi.yml logs --since 2024-01-15 api

# Get logs from all services
docker-compose -f docker-compose.pi.yml logs --tail=50
```

### Docker Cleanup

```bash
# Remove unused containers
docker container prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused images
docker image prune -f

# Full cleanup (reclaim disk space)
docker system prune -a -f
```

---

## Troubleshooting Commands

### Identify Problems

```bash
# Check service status
docker-compose -f docker-compose.pi.yml ps

# View recent errors
docker-compose -f docker-compose.pi.yml logs --tail=50

# Check docker daemon logs
journalctl -u docker.service -n 50

# Inspect service config
docker-compose -f docker-compose.pi.yml config

# Check network connectivity
docker network inspect wise2
```

### Restart Services

```bash
# Restart single service
docker-compose -f docker-compose.pi.yml restart api

# Hard restart (kill + restart)
docker-compose -f docker-compose.pi.yml kill api
docker-compose -f docker-compose.pi.yml up -d api

# Restart all services
docker-compose -f docker-compose.pi.yml down
docker-compose -f docker-compose.pi.yml up -d
```

### Clear Cache/Data

```bash
# Remove container (keeps volume)
docker-compose -f docker-compose.pi.yml rm api

# Remove volume (deletes data!)
docker volume rm wise2_postgres_data
docker volume rm wise2_redis_data

# Clear Redis cache
docker-compose -f docker-compose.pi.yml exec redis \
    redis-cli FLUSHALL
```

---

## Environment Tuning

### Edit Configuration

```bash
# Edit environment variables
nano .env.pi

# Edit docker-compose
nano docker-compose.pi.yml

# Reload environment
docker-compose -f docker-compose.pi.yml down
docker-compose -f docker-compose.pi.yml up -d
```

### Adjust Resource Limits

Edit `docker-compose.pi.yml`, look for `deploy:` sections:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'      # Reduce to 0.3 if constrained
      memory: 256M     # Reduce to 128M if constrained
```

### Change Log Verbosity

Edit `.env.pi`:
```bash
LOG_LEVEL=debug    # Verbose (uses more disk)
LOG_LEVEL=info     # Default
LOG_LEVEL=warn     # Less verbose
LOG_LEVEL=error    # Errors only
```

---

## Common Issues - Quick Fixes

| Issue | Command |
|-------|---------|
| API not responding | `docker-compose -f docker-compose.pi.yml restart api` |
| Database connection error | `docker-compose -f docker-compose.pi.yml logs postgres` |
| Out of memory | Check `docker stats`, then reduce limits in compose file |
| Disk full | Run `docker system prune -a -f` and check log rotation |
| No internet access | `ping 8.8.8.8` and check `ip link show` |
| High CPU usage | `docker stats` to identify service, may need to optimize queries |
| Disk I/O bottleneck | Check `iostat -x 1`, consider moving to external USB |
| Need secure password | `openssl rand -base64 32` |

---

## File Locations

```
/home/pi/wise2-core/
├── docker-compose.pi.yml         # Main configuration (edit resource limits here)
├── .env.pi                        # Environment variables (CREATE from .env.pi.example)
├── .env.pi.example                # Template (reference only)
├── RASPBERRY_PI_DEPLOYMENT_GUIDE.md  # Full guide
├── PI_QUICK_REFERENCE.md          # This file
├── Dockerfile.api                 # API build
├── Dockerfile.website             # Website build
├── packages/db/schema.sql         # Database schema
└── ...

/var/lib/docker/volumes/
├── wise2_postgres_data/           # Database data (50-500MB)
└── wise2_redis_data/              # Cache data (1-50MB)

/mnt/external-usb/ (if mounted)
├── postgres/                      # Database backup location
├── redis/                         # Redis backup location
└── backups/                       # Daily database backups
```

---

## Performance Targets

| Metric | Target | Warning |
|--------|--------|---------|
| API response time | <200ms | >1000ms |
| Database query time | <50ms | >200ms |
| Memory usage | <80% RAM | >90% RAM |
| Disk usage | <70% | >85% |
| Pi temperature | <65°C | >75°C |
| Swap usage | <50MB | >500MB |

**Monitor with**:
```bash
watch -n 2 'docker stats --no-stream && vcgencmd measure_temp && free -h'
```

---

## Upgrade Path

### Pi 3B → Pi 4 Migration

```bash
# On Pi 3B: Backup database
docker-compose -f docker-compose.pi.yml exec postgres \
    pg_dump -U wise2 wise2_prod | gzip > backup.sql.gz
scp backup.sql.gz user@pi4:~/

# On Pi 4: Install fresh OS and Docker (see deployment guide)

# Restore database
gunzip < backup.sql.gz | \
docker-compose -f docker-compose.pi.yml exec -T postgres \
    psql -U wise2 -d wise2_prod

# Restart services
docker-compose -f docker-compose.pi.yml up -d
```

---

## Network Access

### From Same Network
```bash
# Get Pi IP
hostname -I

# Access from another computer
curl http://192.168.1.100:3000/health
```

### From Internet (VPN recommended)

```bash
# Option 1: Tailscale (easiest)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# Then access via Tailscale IP

# Option 2: WireGuard (more secure)
sudo apt install wireguard wireguard-tools

# Option 3: SSH port forwarding
ssh -L 3000:localhost:3000 pi@192.168.1.100
# Then access http://localhost:3000
```

---

## Autostart on Boot

```bash
# Create systemd service
sudo tee /etc/systemd/system/wise2.service > /dev/null << 'EOF'
[Unit]
Description=WISE² Services
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/wise2-core
ExecStart=/usr/local/bin/docker-compose -f docker-compose.pi.yml up
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable
sudo systemctl enable wise2.service
sudo systemctl start wise2.service

# Check status
sudo systemctl status wise2.service
```

---

## Scheduled Tasks (Cron)

### Daily Database Backup

```bash
# Create script
cat > ~/backup-wise2.sh << 'EOF'
#!/bin/bash
cd ~/wise2-core
docker-compose -f docker-compose.pi.yml exec postgres \
    pg_dump -U wise2 wise2_prod | \
    gzip > ~/backups/wise2-$(date +%Y%m%d).sql.gz
# Keep only 7 days
find ~/backups -name "wise2-*.sql.gz" -mtime +7 -delete
EOF

chmod +x ~/backup-wise2.sh

# Schedule (daily at 2 AM)
crontab -e
# Add: 0 2 * * * ~/backup-wise2.sh
```

### Health Check Monitoring

```bash
# Create check script
cat > ~/check-wise2.sh << 'EOF'
#!/bin/bash
if ! curl -sf http://localhost:3000/health > /dev/null; then
    echo "Alert: API down at $(date)" >> ~/wise2-alerts.log
    # Send email, Slack notification, etc.
fi
EOF

chmod +x ~/check-wise2.sh

# Schedule (every 5 minutes)
crontab -e
# Add: */5 * * * * ~/check-wise2.sh
```

---

## Useful Links

- **Raspberry Pi**: https://www.raspberrypi.com/
- **Docker**: https://www.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/documentation
- **Pi Forum**: https://forums.raspberrypi.com/
- **Docker Hub**: https://hub.docker.com/ (find images)

---

## Need Help?

1. Check logs: `docker-compose -f docker-compose.pi.yml logs`
2. Read guide: `RASPBERRY_PI_DEPLOYMENT_GUIDE.md`
3. Monitor resources: `docker stats`
4. Search GitHub issues: https://github.com/yourusername/wise2-core/issues
5. Ask on Pi Forum: https://forums.raspberrypi.com/

---

**Last Updated**: 2024-07-23  
**For issues or updates**: See RASPBERRY_PI_DEPLOYMENT_GUIDE.md
