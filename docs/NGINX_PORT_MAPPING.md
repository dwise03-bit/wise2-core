# Nginx Port Mapping Reference

## Production Deployment

All Nginx configuration files route to internal container ports via docker-compose.prod.yml port mappings.

### WISE² Main Domain (wise2.net)

**Nginx Configuration**: `/etc/nginx/sites-enabled/wise2.net`

```nginx
location / {
    proxy_pass http://127.0.0.1:3004;  # ← Points to command-center container port 3000
}
```

**Docker Compose Mapping**:
```yaml
command-center:
  ports:
    - "127.0.0.1:3004:3000"  # Host port 3004 → Container port 3000
```

**Routes Served**:
- `/` → Landing page
- `/rayban` → Ray-Ban Intelligence Platform landing
- `/hermes-control` → Hermes AI Control Dashboard
- `/dashboard` → Analytics dashboard
- `/studio` → Creative studio apps

### Critical Fix (2026-09-14)

**Problem**: Nginx was misconfigured to point to port 3011 (non-existent service)
**Solution**: Updated upstream to port 3004 (correct command-center mapping)
**Deployment Command**:
```bash
sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:3011;/proxy_pass http:\/\/127.0.0.1:3004;/g' /etc/nginx/sites-enabled/wise2.net
sudo nginx -t && sudo systemctl reload nginx
```

### Other Domains

- **api.wise2.net** → 127.0.0.1:3010 (API service on port 3000)
- **command.wise2.net** → 127.0.0.1:3004 (command-center)
- **dashboard.wise2.net** → 127.0.0.1:3004 (command-center)
- **admin.wise2.net** → TBD
- **studio.wise2.net** → TBD

### Deployment Checklist

After Docker Compose changes:
1. Update docker-compose.prod.yml port mappings
2. Verify Nginx upstream points to correct host port
3. Run `sudo nginx -t` to validate config
4. Run `sudo systemctl reload nginx` to apply changes
5. Test endpoints: `curl -I https://wise2.net/rayban` should return HTTP 200

### Memory Note

Port 3011 was a legacy port; do not reuse or reference in new deployments.
