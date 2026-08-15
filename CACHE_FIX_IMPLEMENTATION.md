# Browser Cache-Busting Fix for wise2.net

## Problem

After deployment of the new website to https://wise2.net with glassmorphism design, browsers were rendering the old design due to cached JavaScript chunks. The server correctly serves new HTML with the "OUR WORKS" section and "backdrop-blur" effects, but:

- Old JavaScript chunks from the previous build were cached in browsers
- New HTML tried to hydrate using old JavaScript
- Hydration mismatch occurred, breaking interactive functionality

**Root Cause:** Next.js client-side JavaScript bundle filenames changed between builds, but browsers still had the old versions cached.

---

## Solution

The fix implements **cache-busting headers at the nginx level** for Next.js static assets:

### Cache Strategy

```
┌─────────────────────────────────────────────────────────────┐
│ wise2.net (nginx reverse proxy)                              │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ Route: /_next/static/chunks/*                                │
│ Cache: 1 year (immutable) - Files have content hashes        │
│ Why: Next.js embeds content hash in filename                │
│      If content changes, new hash = new filename             │
│      Browser never requests old file again                   │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ Route: /_next/static/*                                       │
│ Cache: 1 year - Other static assets                          │
│ Why: Versioned by Next.js build process                      │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ Route: / (HTML pages)                                        │
│ Cache: No cache (must-revalidate)                            │
│ Why: Ensures browser always fetches fresh HTML on redeploy   │
└─────────────────────────────────────────────────────────────┘
```

### Nginx Configuration Changes

The updated `config/nginx.conf` adds three location blocks:

```nginx
# 1. Next.js chunks - aggressive caching (1 year, immutable)
location ~* ^/_next/static/chunks/ {
    proxy_pass http://dashboard;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}

# 2. Next.js static assets - caching (1 year)
location ~* ^/_next/static/ {
    proxy_pass http://dashboard;
    add_header Cache-Control "public, max-age=31536000" always;
}

# 3. HTML pages - no caching
location / {
    proxy_pass http://dashboard;
    add_header Cache-Control "public, max-age=0, must-revalidate" always;
}
```

---

## Implementation

### Quick Deploy (Recommended)

Run the automated deployment script:

```bash
cd /Users/danielwise/Projects/wise2-core
bash scripts/deploy-cache-fix.sh
```

This script will:
1. Backup current nginx config on production server
2. Copy updated config to production
3. Validate nginx config syntax
4. Reload nginx (zero-downtime)
5. Verify deployment

### Manual Deploy (If Needed)

```bash
# 1. SSH to production server
ssh dwise@173.208.147.165

# 2. Backup current config
sudo mkdir -p /etc/nginx/backups
sudo cp /etc/nginx/conf.d/default.conf /etc/nginx/backups/default.conf.$(date +%Y%m%d_%H%M%S).bak

# 3. Copy new config from local machine (from your dev machine)
scp config/nginx.conf dwise@173.208.147.165:/tmp/nginx.conf.new

# 4. Test nginx config syntax
sudo nginx -t -c /tmp/nginx.conf.new

# 5. Deploy if test passes
sudo cp /tmp/nginx.conf.new /etc/nginx/conf.d/default.conf
sudo systemctl reload nginx

# 6. Verify
sudo systemctl status nginx
curl -I https://wise2.net
```

---

## Verification

After deployment, verify the fix is working:

### Browser DevTools Check

1. Open https://wise2.net in browser
2. Open DevTools (F12) → Network tab
3. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. Check response headers for different file types:

**For JavaScript chunks** (should see):
```
Cache-Control: public, max-age=31536000, immutable
```

**For CSS/images** (should see):
```
Cache-Control: public, max-age=31536000
```

**For HTML** (should see):
```
Cache-Control: public, max-age=0, must-revalidate
```

### Command Line Check

```bash
# Check cache headers for JavaScript chunk
curl -I https://wise2.net/_next/static/chunks/main-*.js | grep -i cache-control

# Check cache headers for HTML
curl -I https://wise2.net | grep -i cache-control
```

### Clear Browser Cache & Reload

To fully verify the fix:

1. Open DevTools → Application tab → Storage → Clear site data
2. Hard refresh the page
3. Verify "OUR WORKS" section and glassmorphism design appear correctly
4. Check Network tab - no 404s for JavaScript files

---

## How It Works

### Before Fix (Problem)

```
Browser First Visit:
  1. Request HTML: https://wise2.net/
  2. Server returns: <script src="_next/static/chunks/main-abc123.js">
  3. Browser downloads & caches main-abc123.js
  4. Browser stores: Cache-Control: max-age=3600 (browser default or no header)

New Deployment (New Build):
  1. Request HTML: https://wise2.net/
  2. Server returns: <script src="_next/static/chunks/main-def456.js"> (NEW HASH)
  3. Browser downloads new chunk

  BUT:
  - Browser doesn't request old main-abc123.js
  - Browser has hydration mismatch (new HTML + old cached JS)
  - Website breaks or shows old design
```

### After Fix (Solution)

```
Browser First Visit:
  1. Request HTML: https://wise2.net/
     Response headers: Cache-Control: public, max-age=0, must-revalidate
     → Browser will re-check on EVERY visit

  2. Request JS chunk: https://wise2.net/_next/static/chunks/main-abc123.js
     Response headers: Cache-Control: public, max-age=31536000, immutable
     → Browser caches for 1 year (safe, filename is immutable)

New Deployment (New Build):
  1. Browser re-checks HTML (no cache)
  2. Server returns: <script src="_next/static/chunks/main-def456.js"> (NEW HASH)
  3. Browser downloads new chunk (different URL = different file)
  4. No hydration mismatch - HTML matches JavaScript

  ✅ Website works correctly with new design
```

---

## Rollback (If Needed)

If deployment causes issues:

```bash
# SSH to production
ssh dwise@173.208.147.165

# Find the most recent backup
ls -lah /etc/nginx/backups | tail -5

# Restore from backup
sudo cp /etc/nginx/backups/default.conf.YYYYMMDD_HHMMSS.bak /etc/nginx/conf.d/default.conf

# Reload nginx
sudo systemctl reload nginx

# Verify
sudo systemctl status nginx
curl -I https://wise2.net
```

---

## Performance Impact

**Positive:**
- Static assets cached locally for 1 year → faster page loads
- Reduced server load (browsers don't re-request chunks)
- Lower bandwidth usage after first visit

**Neutral:**
- HTML pages always re-validated (negligible overhead)
- nginx reload is zero-downtime

---

## Files Modified

- `config/nginx.conf` - Added cache-busting location blocks
- `scripts/deploy-cache-fix.sh` - Automated deployment script (new)

---

## Related Documentation

- Next.js static file handling: https://nextjs.org/docs/app/building-your-application/optimizing/static-assets
- HTTP Cache-Control headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
- Nginx caching best practices: https://nginx.org/en/docs/http/ngx_http_proxy_module.html

---

## Questions?

For issues or rollback needs:
1. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log` on production
2. Verify config: `sudo nginx -t`
3. Monitor startup: `sudo systemctl status nginx`
