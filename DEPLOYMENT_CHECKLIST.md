# Browser Cache-Busting Fix - Deployment Checklist

## Pre-Deployment

- [x] Nginx config syntax validated
- [x] Cache headers properly configured
- [x] Backup strategy documented
- [x] Rollback procedure tested
- [x] Zero-downtime deployment confirmed

---

## Deployment Steps

### Option A: Automated (Recommended)

```bash
# From project root
bash scripts/deploy-cache-fix.sh
```

**What this does:**
- ✓ Creates backup on production server
- ✓ Validates config syntax
- ✓ Deploys new config
- ✓ Reloads nginx (zero-downtime)
- ✓ Verifies endpoint is live

**Time:** ~2 minutes  
**Risk:** Very Low (automatic backup + syntax validation)

---

### Option B: Manual (If Script Fails)

```bash
# Step 1: Create backup
ssh dwise@173.208.147.165 "sudo mkdir -p /etc/nginx/backups && \
  sudo cp /etc/nginx/conf.d/default.conf /etc/nginx/backups/default.conf.\$(date +%Y%m%d_%H%M%S).bak"

# Step 2: Copy new config
scp config/nginx.conf dwise@173.208.147.165:/tmp/nginx.conf.new

# Step 3: Validate
ssh dwise@173.208.147.165 "sudo nginx -t -c /tmp/nginx.conf.new"

# Step 4: Deploy
ssh dwise@173.208.147.165 "sudo cp /tmp/nginx.conf.new /etc/nginx/conf.d/default.conf && \
  sudo systemctl reload nginx"

# Step 5: Verify
curl -I https://wise2.net
```

**Time:** ~5 minutes  
**Risk:** Low (manual validation before deployment)

---

## Post-Deployment Verification

### Immediate (Automated)

The deployment script runs these automatically:

```bash
# Check nginx status
sudo systemctl status nginx

# Test endpoint
curl -I https://wise2.net
```

### Manual Browser Verification

1. **Open browser DevTools:**
   ```
   https://wise2.net
   F12 → Network tab
   Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   ```

2. **Check JS chunk cache headers:**
   - Click on any `.js` file
   - Look at "Response Headers"
   - Should see: `Cache-Control: public, max-age=31536000, immutable`

3. **Check HTML cache headers:**
   - Click on document request (the first one, usually "wise2.net")
   - Look at "Response Headers"
   - Should see: `Cache-Control: public, max-age=0, must-revalidate`

### Command Line Verification

```bash
# Quick check - JavaScript chunks
curl -s -I https://wise2.net/_next/static/chunks/*.js | grep -i cache-control | head -1

# Quick check - HTML
curl -s -I https://wise2.net | grep -i cache-control

# Expected output:
# Cache-Control: public, max-age=31536000, immutable
# Cache-Control: public, max-age=0, must-revalidate
```

---

## Success Criteria

All of these should pass post-deployment:

- [ ] `nginx -t` shows "configuration syntax ok"
- [ ] `sudo systemctl status nginx` shows "active (running)"
- [ ] `curl -I https://wise2.net` returns HTTP 200
- [ ] JavaScript chunks have `Cache-Control: immutable`
- [ ] HTML has `Cache-Control: must-revalidate`
- [ ] Website displays "OUR WORKS" section correctly
- [ ] No console errors in browser DevTools
- [ ] No 404s for `.js` or `.css` files

---

## Rollback Procedure

If deployment causes issues, rollback is simple:

```bash
# SSH to production
ssh dwise@173.208.147.165

# Find the most recent backup
ls -lah /etc/nginx/backups | tail -5

# Restore (replace YYYYMMDD_HHMMSS with actual timestamp)
sudo cp /etc/nginx/backups/default.conf.YYYYMMDD_HHMMSS.bak /etc/nginx/conf.d/default.conf

# Reload nginx
sudo systemctl reload nginx

# Verify
sudo systemctl status nginx
curl -I https://wise2.net
```

**Rollback time:** ~1 minute  
**Data loss:** None (read-only operation)

---

## Monitoring Post-Deployment

### Check nginx error log
```bash
ssh dwise@173.208.147.165 "sudo tail -f /var/log/nginx/error.log"
```

### Monitor wise2.net endpoint
```bash
while true; do
  curl -s -I https://wise2.net | head -3
  sleep 5
done
```

### Check proxy to backend
```bash
ssh dwise@173.208.147.165 "sudo netstat -tulnp | grep nginx"
```

---

## Timeline

| Phase | Action | Time | Owner |
|-------|--------|------|-------|
| Pre | Validate config | 2 min | @dev |
| Deploy | Run script or manual steps | 5 min | @ops or @dev |
| Post | Verify cache headers | 3 min | @dev |
| Monitor | Watch logs for 5 min | 5 min | Anyone |
| Document | Update deployment log | 2 min | @dev |
| **Total** | | **~17 min** | |

---

## Files Involved

| File | Status | Purpose |
|------|--------|---------|
| `config/nginx.conf` | Modified | Updated with cache-busting headers |
| `scripts/deploy-cache-fix.sh` | New | Automated deployment script |
| `CACHE_FIX_IMPLEMENTATION.md` | New | Full technical documentation |
| `CACHE_FIX_QUICK_REFERENCE.md` | New | Quick reference guide |
| `NGINX_CONFIG_DIFF.md` | New | Detailed diff and explanation |
| `DEPLOYMENT_CHECKLIST.md` | New | This checklist |

---

## Rollback Triggers

Rollback immediately if any of these occur:

- [ ] Website returns HTTP 5xx errors
- [ ] nginx fails to reload (syntax error)
- [ ] Old design still appears after hard refresh
- [ ] Console shows JavaScript errors about hydration
- [ ] Cache headers are missing or incorrect

---

## Communication

After deployment, confirm with team:

```markdown
✅ Cache-busting fix deployed to https://wise2.net

Changes:
- JavaScript chunks now cached for 1 year (safe - content-addressed)
- HTML pages no longer cached (always fresh)
- Eliminates hydration mismatches after deployments

Verification:
- Cache headers: ✓
- Website functionality: ✓
- No console errors: ✓

Rollback: Ready (auto-backup at /etc/nginx/backups/)
```

---

## Questions & Support

**Issue:** Website still showing old design
**Solution:** 
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear site data: DevTools → Application → Storage → Clear site data
3. Open in new private/incognito window

**Issue:** nginx won't reload
**Solution:**
1. Check syntax: `sudo nginx -t`
2. Check error log: `sudo tail -f /var/log/nginx/error.log`
3. Rollback: Copy backup and reload

**Issue:** Cache headers not being sent
**Solution:**
1. Verify config deployed: `sudo cat /etc/nginx/conf.d/default.conf | grep "Cache-Control"`
2. Reload nginx: `sudo systemctl reload nginx`
3. Wait 10 seconds and test again

---

## Sign-Off

- [ ] Deployment authorized by: ________________
- [ ] Deployment completed at: ________________
- [ ] Verified by: ________________
- [ ] Date: ________________

---

**Next Steps:** After deployment, update production monitoring dashboard to track cache hit rates.
