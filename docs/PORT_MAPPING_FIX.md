# Port Mapping Fix — Permanent Prevention

**Status**: ✅ RESOLVED 2026-09-14  
**Root Cause**: Inconsistent port configuration between docker-compose files and nginx configs  
**Impact**: Recurrent 502 errors on blakkhail.com and wise2.net

## The Problem

Multiple configuration sources had mismatched port mappings:

| Service | Component | Wrong Port | Correct Port | File |
|---------|-----------|------------|--------------|------|
| Website | docker-compose.production.yml | 3011 | 3001 | ❌ |
| Website | docker-compose.prod.yml | — | 3001 | ✅ |
| Website | nginx: blakkhail.com.conf | 3011 | 3001 | ❌ |
| Website | nginx: wise2.net.conf | 3011 | 3001 | ❌ |

**Result**: When nginx tried to proxy traffic to port 3011, it failed because the website container was bound to port 3001, causing 502 errors.

---

## Fixed Files (Commit e7a46b06)

### 1. **docker-compose.production.yml**
```diff
- ports:
-   - "127.0.0.1:3011:3000"
+ ports:
+   - "0.0.0.0:3001:3000"
```

### 2. **infrastructure/nginx/blakkhail.com.conf**
```diff
  upstream blakkhail_website {
-     server 127.0.0.1:3011;
+     server 127.0.0.1:3001;
  }
```
Also updated SSL cert paths to match actual location:
```diff
- ssl_certificate /etc/letsencrypt/live/blakkhail.com/fullchain.pem;
- ssl_certificate_key /etc/letsencrypt/live/blakkhail.com/privkey.pem;
- ssl_trusted_certificate /etc/letsencrypt/live/blakkhail.com/chain.pem;
+ ssl_certificate /etc/nginx/ssl/blakkhail.com/fullchain.pem;
+ ssl_certificate_key /etc/nginx/ssl/blakkhail.com/privkey.key;
+ ssl_trusted_certificate /etc/nginx/ssl/blakkhail.com/fullchain.pem;
```

### 3. **infrastructure/nginx/wise2.net.conf**
```diff
  upstream website_backend {
-     server 127.0.0.1:3011;
+     server 127.0.0.1:3001;
  }
```

---

## Permanent Prevention Rules

1. **Single Source of Truth**: Website container always binds to port **3001** on the host
   - Defined in: `docker-compose.prod.yml` (line 137)
   - Defined in: `docker-compose.production.yml` (updated to match)

2. **All nginx Upstreams Must Use 3001**: Any nginx config routing to the website must use:
   ```nginx
   upstream website_backend {
       server 127.0.0.1:3001;
   }
   ```

3. **Deployment Checklist** (before any docker-compose update):
   - [ ] Verify website port in compose file matches 3001
   - [ ] Verify all nginx configs use 3001
   - [ ] Run `nginx -t` after config change
   - [ ] Test endpoint: `curl -I https://blakkhail.com` → HTTP/2 200

4. **SSL Certificates**: Use actual paths, not Let's Encrypt templates
   - Certificates stored at: `/etc/nginx/ssl/{domain}/`
   - Do NOT assume Let's Encrypt paths exist

---

## Verification (2026-09-14)

✅ blakkhail.com: HTTP/2 200  
✅ wise2.net: HTTP/2 200  
✅ nginx config: `syntax ok, test successful`  
✅ Commit: e7a46b06 (deployed to repo)

---

## Future Work

- [ ] Consolidate compose files (merge production.yml into prod.yml)
- [ ] Create port inventory document (DONE: `docker-compose.prod.yml` lines 92-362)
- [ ] Add pre-deployment validation script to verify port consistency

