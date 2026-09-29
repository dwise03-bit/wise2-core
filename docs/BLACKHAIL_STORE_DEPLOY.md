# blackhail.store deployment

Production storefront for **Blakk Hail** (SenCere Creative LLC legacy brand).

## Architecture

```
blackhail.store (nginx :443)
  └── proxy → wise2-website container (127.0.0.1:3000)
        └── Next.js middleware (host-based)
              ├── /              → /sencere/blakkhail
              ├── /products/*    → /sencere/products/*
              └── /checkout      → /sencere/checkout
```

- **Domain:** `blackhail.store` (DNS A → `173.208.147.165`)
- **SSL:** Let's Encrypt at `/etc/letsencrypt/live/blackhail.store/`
- **Nginx:** `infrastructure/nginx/blakkhail.store.conf`
- **App routing:** `apps/website/middleware.ts` sets `x-site-brand: blakkhail`
- **Chrome:** Root layout skips WISE² nav/footer when `x-site-brand=blakkhail`

## One-command deploy (VPS)

```bash
bash scripts/deploy-blackhail-store.sh
```

## Manual setup

### 1. DNS

| Host | Type | Value |
|------|------|-------|
| `blackhail.store` | A | `173.208.147.165` |
| `www.blackhail.store` | A | `173.208.147.165` |

### 2. SSL (first time)

```bash
sudo certbot certonly --nginx -d blackhail.store -d www.blackhail.store
```

### 3. Nginx

```bash
sudo cp infrastructure/nginx/blakkhail.store.conf /etc/nginx/sites-available/blackhail.store.conf
sudo ln -sf /etc/nginx/sites-available/blackhail.store.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Website container

```bash
cd /home/dwise/wise2-core
docker compose -f docker-compose.prod.yml build website
docker compose -f docker-compose.prod.yml up -d website
```

## Smoke tests

```bash
curl -I https://blackhail.store
curl -s https://blackhail.store | grep -i "blakk hail"
curl -s https://blackhail.store/products/chain-gang-black | grep -i "chain gang"
```

Expected:
- Valid Let's Encrypt certificate
- No WISE² Business OS homepage at `/`
- Product pages resolve with Blakk Hail catalog slugs

## Code map

| File | Purpose |
|------|---------|
| `apps/website/middleware.ts` | Host rewrites for blackhail.store |
| `apps/website/lib/site-domains.ts` | Domain helpers |
| `apps/website/app/sencere/blakkhail/` | Storefront pages |
| `apps/website/lib/sencere-products.ts` | Catalog (`brand: 'blakkhail'` items) |
| `components/sencere/blakkhail/config.ts` | Brand contact copy |

## Notes

- Brand spelling: domain is **blackhail** (one k); brand mark is **Blakk Hail** (two k's in "Blakk").
- Checkout uses request-host URLs via `lib/site-url.ts` when Stripe is enabled.
- Contact phone/social in `lib/sencere/config.ts` are placeholders until client verification.
