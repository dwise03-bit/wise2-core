# Fergie's Table — Deployment

**Website:** https://wise2.net/fergies-table  
**Command (owner):** https://wise2.net/fergies-table/business  
**Guest table:** https://wise2.net/fergies-table/home  
**Health:** https://wise2.net/fergies-table/api/health

## Architecture

```
Internet → nginx (wise2.net) → 127.0.0.1:3021 → PM2 (fergies-table)
```

- **PM2 process:** `fergies-table` on port `3021`
- **App path:** `/home/dwise/wise2-apps/fergies-table`
- **basePath:** `/fergies-table`

## Deploy

From repo root:

```bash
./scripts/deploy-fergies-table.sh
```

## iOS

Point Capacitor at the live Command URL, then `pnpm ios:sync` from `apps/fergies-table`. See [`IOS.md`](./IOS.md).
