# Manual Nginx Cache-Fix Deployment

If the automated script fails due to sudo password requirements, follow these manual steps:

## Step 1: SSH to Server

```bash
ssh -i ~/.ssh/id_ed25519 dwise@173.208.147.165
```

## Step 2: Create Backup Directory

```bash
mkdir -p ~/nginx-backups
```

## Step 3: Backup Current Config

```bash
sudo cp /etc/nginx/sites-enabled/wise2.net ~/nginx-backups/wise2.net.backup.bak
```

(This will prompt for your sudo password)

## Step 4: Copy New Config

```bash
# First, exit SSH and copy the file locally:
exit
```

Then from your local machine:

```bash
scp -i ~/.ssh/id_ed25519 ./config/nginx.conf dwise@173.208.147.165:/tmp/nginx.conf.new
```

## Step 5: SSH Back and Deploy

```bash
ssh -i ~/.ssh/id_ed25519 dwise@173.208.147.165
```

Inside the SSH session:

```bash
# Test the new config
sudo nginx -t -c /tmp/nginx.conf.new

# If OK, deploy it
sudo cp /tmp/nginx.conf.new /etc/nginx/sites-enabled/wise2.net

# Reload nginx (zero-downtime)
sudo systemctl reload nginx

# Verify
sudo systemctl status nginx --no-pager | head -10
curl -I https://wise2.net | head -5
```

## Step 6: Verify Cache Headers

Once deployed, check that the cache headers are applied:

```bash
# Should show "immutable" and "max-age=31536000" for JS chunks
curl -I https://wise2.net/_next/static/chunks/main-app-*.js | grep Cache-Control

# Should show "max-age=0, must-revalidate" for HTML pages  
curl -I https://wise2.net | grep Cache-Control
```

## Rollback (if needed)

If something goes wrong:

```bash
sudo cp ~/nginx-backups/wise2.net.backup.bak /etc/nginx/sites-enabled/wise2.net
sudo systemctl reload nginx
```

## What Gets Fixed

This deployment adds cache-busting headers to nginx:
- **JS chunks** (`/_next/static/chunks/*`): Cache 1 year with immutable flag
- **Static assets** (`/_next/static/*`): Cache 1 year
- **HTML pages** (`/`): Never cache (must-revalidate)

**Result:** Browsers will no longer serve stale JavaScript, fixing the hydration mismatch that causes the old design to render.
