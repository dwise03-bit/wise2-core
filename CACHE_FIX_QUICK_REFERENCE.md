# Cache-Busting Fix - Quick Reference

## TL;DR

Browser caching is causing old JavaScript chunks to load with new HTML, breaking the website. The fix adds proper cache headers in nginx.

---

## Deploy in 1 Command

```bash
bash scripts/deploy-cache-fix.sh
```

Done. Zero-downtime reload. Includes automatic backup.

---

## Manual Deploy (5 steps)

```bash
# 1. Backup current config
ssh dwise@173.208.147.165 "sudo cp /etc/nginx/conf.d/default.conf /etc/nginx/backups/default.conf.\$(date +%Y%m%d_%H%M%S).bak"

# 2. Copy new config to production
scp config/nginx.conf dwise@173.208.147.165:/tmp/nginx.conf.new

# 3. Test syntax
ssh dwise@173.208.147.165 "sudo nginx -t -c /tmp/nginx.conf.new"

# 4. Deploy & reload
ssh dwise@173.208.147.165 "sudo cp /tmp/nginx.conf.new /etc/nginx/conf.d/default.conf && sudo systemctl reload nginx"

# 5. Verify
curl -I https://wise2.net | head -10
```

---

## Verify Fix (Browser)

1. Open https://wise2.net in browser
2. DevTools (F12) → Network tab
3. Hard refresh (Cmd+Shift+R)
4. Check a `.js` file → Response Headers → Cache-Control

**Should see:**
```
Cache-Control: public, max-age=31536000, immutable
```

---

## Verify Fix (Command Line)

```bash
# Check JS chunk cache headers
curl -I https://wise2.net/_next/static/chunks/main.js 2>/dev/null | grep -i cache-control

# Check HTML cache headers
curl -I https://wise2.net 2>/dev/null | grep -i cache-control
```

---

## Rollback (If Needed)

```bash
ssh dwise@173.208.147.165 "
  sudo cp /etc/nginx/backups/default.conf.*.bak /etc/nginx/conf.d/default.conf
  sudo systemctl reload nginx
"
```

---

## What Changed

| File | Location | Change |
|------|----------|--------|
| HTML pages | `/` | Cache-Control: `max-age=0, must-revalidate` |
| JS chunks | `/_next/static/chunks/*` | Cache-Control: `max-age=31536000, immutable` |
| Static assets | `/_next/static/*` | Cache-Control: `max-age=31536000` |

---

## Why This Works

- **HTML is never cached** → Browser always gets fresh version on redeploy
- **JS chunks are cached forever** → Safe because Next.js changes filename when content changes
- **New HTML points to new JS filenames** → No hydration mismatch

---

## Troubleshooting

**Nginx won't reload?**
```bash
ssh dwise@173.208.147.165 "sudo nginx -t"  # Check for errors
sudo systemctl reload nginx                  # Try again
```

**Still seeing old design?**
```bash
# Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
# Clear site data: DevTools → Application → Storage → Clear site data
```

**Check nginx is running:**
```bash
ssh dwise@173.208.147.165 "sudo systemctl status nginx"
```

---

## Files

- **Config:** `config/nginx.conf` (updated)
- **Deploy Script:** `scripts/deploy-cache-fix.sh` (new)
- **Full Docs:** `CACHE_FIX_IMPLEMENTATION.md` (new)
- **Production Server:** 173.208.147.165 (gpu-nmls)
- **Backup Location:** `/etc/nginx/backups/` on production

---
