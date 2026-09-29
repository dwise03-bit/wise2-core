# WISE Imp Desktop — Deployment

**Live service:** https://wise2.net/imp/  
**Health:** https://wise2.net/imp/health.json  
**Downloads:** https://wise2.net/imp/downloads/

## Architecture

```
Internet → nginx (wise2.net/imp/) → /var/www/html/wise-imp
```

Static Vite build. No PM2 process. The browser runtime is the hosted service; the Tauri Windows pet is the installable SKU.

## Deploy

From repo root:

```bash
./scripts/deploy-wise-imp.sh
```

## Windows installer

Build on Windows 10/11 with Rust, then copy the NSIS exe into `apps/wise-imp-desktop/public/downloads/` and redeploy, or rsync it straight to `/var/www/html/wise-imp/downloads/`.
